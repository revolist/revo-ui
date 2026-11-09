import type { AiAssistantMountState } from './mount';
import type { AiResultContent } from './results';

export interface AiTranscriptMessage {
  id: string;
  group: string;
  from: 'user' | 'assistant' | 'system';
  text: string;
  phase?: AiAssistantMountState['phase'];
  details?: string;
  result?: AiResultContent;
  pending?: boolean;
}
const bytes = (value: unknown) =>
  new TextEncoder().encode(JSON.stringify(value)).byteLength;
// Bound serialized text, including JSON escaping, so the newest complete turn fits.
const text = (value: string | undefined) => {
  if (!value) return '';
  if (bytes(value) <= 16_384) return value;
  let low = 0;
  let high = Math.min(value.length, 16_384);
  while (low < high) {
    const middle = Math.ceil((low + high) / 2);
    if (bytes(value.slice(0, middle) + '…') <= 16_384) low = middle;
    else high = middle - 1;
  }
  if (/[\uD800-\uDBFF]/.test(value.charAt(low - 1))) low--;
  return value.slice(0, low) + '…';
};

/** Local presentation state only. Never supplies model context or persists values. */
export class AiTranscript {
  messages: readonly AiTranscriptMessage[] = [];
  private epoch = 0;
  private initialized = false;
  private requestId?: string;
  private ignoredRequest?: string;
  private currentId?: string;
  private active = false;
  private lastPhase?: AiAssistantMountState['phase'];
  private key = '';
  private sequence = 0;

  update(state: AiAssistantMountState): void {
    if (!this.initialized) {
      this.epoch = state.chatKey ?? 0;
      this.initialized = true;
    }
    if ((state.chatKey ?? 0) !== this.epoch) {
      this.epoch = state.chatKey ?? 0;
      this.messages = [];
      this.requestId = undefined;
      this.ignoredRequest = state.request?.id;
      this.currentId = undefined;
      this.active = false;
      this.key = '';
      this.lastPhase = undefined;
      return;
    }
    if (
      state.phase === 'idle' ||
      (state.request?.id === this.ignoredRequest &&
        this.ignoredRequest !== undefined)
    )
      return;
    const request = state.request;
    const accepted = !!request && request.id !== this.requestId;
    const result =
      state.phase === 'completed' &&
      state.result &&
      bytes(state.result) <= 16_384
        ? structuredClone(state.result)
        : undefined;
    const content = {
      text: text(state.message),
      phase: state.phase,
      details:
        state.phase === 'completed' && !result && state.resultDetails
          ? text(state.resultDetails)
          : undefined,
      pending: !!state.pendingAction,
      result,
    };
    const key = JSON.stringify([request?.id, content]);
    if (!accepted && key === this.key) return;
    if (!accepted && !content.text && !content.pending) return;
    const last = this.messages.find((message) => message.id === this.currentId);
    const continuation =
      this.lastPhase === 'completed' &&
      state.phase === 'understanding' &&
      last?.from === 'assistant';
    // Consecutive view-history operations are one evolving status notice.
    // Keep their latest view summary without filling the chat with near copies.
    const historyUpdate =
      last?.from === 'system' &&
      last.phase === 'completed' &&
      (state.phase === 'applying' || state.phase === 'completed');
    if (accepted) {
      this.requestId = request.id;
      this.ignoredRequest = undefined;
      const group = 'turn:' + ++this.sequence;
      this.currentId = group + ':assistant';
      this.messages = [
        ...this.messages,
        {
          id: group + ':user',
          group,
          from: 'user',
          text: text(request.prompt),
        },
        { id: this.currentId, group, from: 'assistant', ...content },
      ];
    } else if ((this.active || continuation || historyUpdate) && last) {
      this.messages = this.messages.map((message) =>
        message.id === this.currentId ? { ...message, ...content } : message,
      );
    } else {
      const group = 'system:' + ++this.sequence;
      this.currentId = group;
      this.messages = [
        ...this.messages,
        { id: group, group, from: 'system', ...content },
      ];
    }
    this.active =
      state.phase === 'understanding' ||
      state.phase === 'applying' ||
      !!state.pendingAction;
    this.lastPhase = state.phase;
    this.key = key;
    // Prune complete earlier turns; never leave an orphaned reply.
    while (this.messages.length > 50 || bytes(this.messages) > 65_536) {
      const oldest = this.messages[0].group;
      this.messages = this.messages.filter(
        (message) => message.group !== oldest,
      );
    }
  }

  clear(): void {
    this.messages = [];
    this.requestId = undefined;
    this.currentId = undefined;
    this.active = false;
    this.key = '';
  }
}
