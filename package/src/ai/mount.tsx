import { AiTranscript } from './transcript';
import {
  AiResultView,
  type AiResultContent,
  type AiTableRenderer,
} from './results';
import {
  AiChat,
  AiChatContent,
  AiChatComposer,
  AiChatEmptyState,
  type AiChatEmptyStateProps,
  AiMessage,
  AiMessageContent,
  AiTask,
} from './chat';
import { HistoryControls } from '../history-controls';
import { translateAiText, type AiUiTranslations } from './translations';
import { Fragment, h, render } from 'preact';
import { createPortal } from 'preact/compat';
import { useEffect, useLayoutEffect, useRef, useState } from 'preact/hooks';
import { Button, IconButton } from '../controls';
import newConversationIcon from '@fortawesome/fontawesome-free/svgs/solid/pen-to-square.svg?raw';
import {
  StatusFeedbackPanel,
  type StatusFeedbackItem,
} from '../status-feedback';
import {
  AiAssistant,
  AiSuggestions,
  AiChangePreview,
  type AiActionPhase,
  type AiPromptInputProps,
  type AiPreviewChange,
  type AiSuggestionChoice,
} from './components';
import {
  AiRequestTrail,
  type AiRequestTrailItem,
  type AiRequestTrailProps,
} from './request-trail';
import {
  boundAiPromptHistory,
  type AiPromptHistoryOptions,
} from './prompt-history';

export interface AiAssistantMountState {
  phase: AiActionPhase;
  /** Accepted public user request only; never an internal model prompt. */
  request?: { id: string; prompt: string };
  /** Increment to clear the local chat transcript and composer. */
  chatKey?: number;
  message: string;
  /** Plain text from a bounded host-owned action result. */
  resultDetails?: string;
  result?: AiResultContent;
  pendingAction?: {
    summary: string;
    details?: string;
    changes?: readonly AiPreviewChange[];
    notice?: string;
  };
  canUndoData?: boolean;
  canRedoData?: boolean;
  matchedRows?: number;
  canRestore?: boolean;
  suggestions?: readonly string[];
  choices?: readonly AiSuggestionChoice[];
  steps?: readonly AiRequestTrailItem[];
  canEditSteps?: boolean;
  /** Host-owned chart view can return to the record grid. */
  canClearChart?: boolean;
  viewSwitching?: boolean;
}
export interface AiAssistantMountOptions {
  /** Trusted host renderer for tabular results; never supplied by model output. */
  renderTable?: AiTableRenderer;
  mode?: 'toolbar' | 'chat';
  layout?: 'flow' | 'fill';
  /** Optional host for reactive undo/redo and view controls. Cleaned up on destroy. */
  controlsMountTo?: HTMLElement;
  /** Show the separate New conversation icon. Defaults to true. */
  showNewConversation?: boolean;
  /** @deprecated Use showNewConversation. */
  showClearChat?: boolean;
  /** Request-history popup: hidden by default in chat, visible in toolbar mode. */
  showRequestHistory?: boolean;
  /** Hide native data Undo/Redo controls. Workspace reset belongs to the application. */
  showHistoryControls?: boolean;
  /** Optional welcome content shown only while the local chat transcript is empty. */
  emptyState?: AiChatEmptyStateProps | false;
  onClearChat?(): void;
  /** Return to the grid while retaining the chart configuration. */
  onClearChart?(): void;
  /** Local input recall and optional host persistence; never sent to the model automatically. */
  promptHistory?: AiPromptHistoryOptions;
  /** Auto-dismiss settled activity messages; disabled unless configured. */
  activityDurationMs?: number;
  translations?: AiUiTranslations;
  onApplyAction?(): void;
  onCancelAction?(): void;
  onUndoData?(): void;
  onRedoData?(): void;
  onSubmit(prompt: string): void;
  onStop(): void;
  onRemoveStep?(id: string): void;
  suggestions?: readonly string[];
  /** Inline choice count; additional choices remain under More. Default: 2. */
  maxVisibleSuggestions?: number;
  label?: string;
  footer?: string;
  /** Format the matched-row count in command activity, independently of request history. */
  countLabel?: (count: number) => string;
  trail?: Pick<
    AiRequestTrailProps,
    'label' | 'triggerLabel' | 'removeLabel' | 'countLabel' | 'changedMessage'
  >;
  prompt?: Pick<
    AiPromptInputProps,
    | 'label'
    | 'placeholder'
    | 'submitLabel'
    | 'stopLabel'
    | 'hint'
    | 'textareaProps'
  >;
}

/** Framework-independent mount of the same TSX used by the public components. */
export function mountAiAssistant(
  host: HTMLElement,
  options: AiAssistantMountOptions,
) {
  const t = (text: string) => translateAiText(text, options.translations);
  let disposed = false;
  let suggestions = options.suggestions ?? [];
  let currentState: AiAssistantMountState | undefined;
  let promptHistory = boundAiPromptHistory(options.promptHistory?.items ?? []);
  const transcript = new AiTranscript();
  const chat = options.mode === 'chat';
  let activities: StatusFeedbackItem[] = [];
  let activityId = 0;
  let activityBusy = false;
  let activityKey = '';
  function recordActivity(state: AiAssistantMountState) {
    if (state.phase === 'idle' || !state.message || state.pendingAction) return;
    const busy = state.phase === 'understanding' || state.phase === 'applying';
    const key = JSON.stringify([
      state.phase,
      state.message,
      state.matchedRows,
      state.resultDetails,
    ]);
    if (key === activityKey) return;
    const previous = activities.at(-1);
    const item: StatusFeedbackItem = {
      id: activityBusy && previous ? previous.id : String(++activityId),
      title: state.message,
      busy,
      tone:
        state.phase === 'error'
          ? 'danger'
          : state.phase === 'completed'
            ? 'success'
            : 'neutral',
      description:
        state.phase === 'completed' && state.matchedRows !== undefined
          ? (options.countLabel?.(state.matchedRows) ??
            t('{count} matching rows').replace(
              '{count}',
              state.matchedRows.toLocaleString(),
            ))
          : undefined,
      detail:
        state.phase === 'completed' && !state.result
          ? state.resultDetails
          : undefined,
    };
    activities = [
      ...(activityBusy && previous ? activities.slice(0, -1) : activities),
      item,
    ].slice(-50);
    activityBusy = busy;
    activityKey = key;
  }
  function View({ state }: { state: AiAssistantMountState }) {
    const [value, setValue] = useState('');
    const [recallItems, setRecallItems] = useState(promptHistory);
    const [activityCollapsed, setActivityCollapsed] = useState(false);
    const submitted = useRef<string>();
    useLayoutEffect(() => {
      setValue('');
      submitted.current = undefined;
    }, [state.chatKey]);

    const busy = state.phase === 'understanding' || state.phase === 'applying';
    const pending = !!state.pendingAction;
    const steps = state.steps ?? [];
    const showRequestHistory = options.showRequestHistory ?? !chat;
    const wasPending = useRef(false);
    useEffect(() => {
      if (wasPending.current && !pending && !busy)
        host.querySelector('textarea')?.focus();
      wasPending.current = pending || (busy && wasPending.current);
    }, [pending, busy]);
    useEffect(() => {
      if (
        busy ||
        pending ||
        state.phase === 'idle' ||
        submitted.current === undefined
      )
        return;
      const sent = submitted.current;
      submitted.current = undefined;
      if (state.phase === 'completed')
        setValue((draft) => (draft.trim() === sent ? '' : draft));
    }, [state]);
    const submit = (prompt: string) => {
      submitted.current = prompt.trim();
      if (options.promptHistory) {
        promptHistory = boundAiPromptHistory([...promptHistory, prompt]);
        setRecallItems(promptHistory);
        options.promptHistory.onChange?.([...promptHistory]);
      }
      options.onSubmit(prompt);
    };
    const suggestionsView = (
      <AiSuggestions
        maxVisible={options.maxVisibleSuggestions}
        items={
          state.choices?.length
            ? state.choices
            : state.suggestions?.length
              ? state.suggestions
              : suggestions
        }
        onSelect={(prompt) => {
          if (busy || pending) return;
          setValue(prompt);
          submit(prompt);
        }}
        disabled={busy || pending}
      />
    );
    const hasConversation =
      !!value ||
      !!state.request ||
      !!state.message ||
      steps.length > 0 ||
      transcript.messages.length > 0 ||
      activities.length > 0;
    const newConversation = hasConversation &&
      (options.showNewConversation ?? options.showClearChat ?? true) &&
      options.onClearChat && (
        <IconButton
          label={t('New conversation')}
          icon={newConversationIcon}
          size="compact"
          disabled={busy || pending}
          onClick={() => {
            options.onClearChat?.();
            host.querySelector('textarea')?.focus();
          }}
        />
      );
    const clearChart = chat && state.canClearChart && options.onClearChart && (
      <Button
        size="compact"
        variant="ghost"
        disabled={busy || pending || state.viewSwitching}
        onClick={() => {
          options.onClearChart?.();
          host.querySelector('textarea')?.focus();
        }}
      >
        {t('Clear chart')}
      </Button>
    );
    const conversationActions = (
      <>
        {clearChart}
        {newConversation}
      </>
    );
    const composer = (
      <AiChatComposer
        label={options.prompt?.label ?? 'Ask AI to change this view'}
        {...options.prompt}
        value={value}
        onValueChange={setValue}
        onSubmit={submit}
        onStop={options.onStop}
        busy={busy}
        promptHistory={options.promptHistory ? recallItems : undefined}
        disabled={pending}
        hint={showRequestHistory && steps.length ? '' : options.prompt?.hint}
        footer={suggestionsView}
        actions={
          showRequestHistory ? (
            <AiRequestTrail
              {...options.trail}
              items={steps}
              showClear={false}
              onRemove={(id) => options.onRemoveStep?.(id)}
              onEmpty={() => host.querySelector('textarea')?.focus()}
              disabled={busy || pending}
              removalsDisabled={
                !options.onRemoveStep || state.canEditSteps === false
              }
              changedMessage={
                !busy &&
                steps.some((step) => step.removable !== false) &&
                state.canEditSteps === false
                  ? (options.trail?.changedMessage ??
                    'The view changed manually. Start a new request to continue.')
                  : undefined
              }
            />
          ) : undefined
        }
      />
    );
    const preview = state.pendingAction && (
      <AiChangePreview
        {...state.pendingAction}
        disabled={busy || !options.onApplyAction}
        onApply={() => options.onApplyAction?.()}
        onCancel={() => options.onCancelAction?.()}
      />
    );
    const historyControls = (
      <div class="rv-ai-result-actions">
        {(options.onUndoData || options.onRedoData) && (
          <HistoryControls
            onUndo={options.onUndoData}
            onRedo={options.onRedoData}
            canUndo={!busy && !pending && !!state.canUndoData}
            canRedo={!busy && !pending && !!state.canRedoData}
            undoLabel={t('Undo data change')}
            redoLabel={t('Redo data change')}
            label={t('Data history')}
          />
        )}
      </div>
    );
    const history =
      options.showHistoryControls === false ||
      (!options.onUndoData && !options.onRedoData)
        ? null
        : options.controlsMountTo
          ? createPortal(historyControls, options.controlsMountTo)
          : historyControls;
    return (
      <AiAssistant
        layout={options.layout}
        translations={options.translations}
        label={options.label}
        busy={busy}
        footer={options.footer}
      >
        {chat ? (
          <AiChat className="rv-ai-mounted-chat">
            {(clearChart || newConversation) && (
              <div class="rv-ai-chat-actions">{conversationActions}</div>
            )}
            <AiChatContent busy={busy}>
              {!transcript.messages.length && options.emptyState && (
                <AiChatEmptyState {...options.emptyState} />
              )}
              {transcript.messages.map((message) => (
                <AiMessage
                  key={message.id}
                  from={message.from}
                  isStreaming={
                    message.phase === 'understanding' ||
                    message.phase === 'applying'
                  }
                >
                  {message.from === 'user' ? (
                    <AiMessageContent>{message.text}</AiMessageContent>
                  ) : message.phase === 'preview' &&
                    message.pending &&
                    message.id === transcript.messages.at(-1)?.id &&
                    state.pendingAction ? null : (
                    <AiMessageContent>
                      {message.phase === 'understanding' ||
                      message.phase === 'applying' ||
                      message.phase === 'error' ||
                      message.phase === 'cancelled' ? (
                        <AiTask
                          title={message.text}
                          status={
                            message.phase === 'understanding' ||
                            message.phase === 'applying'
                              ? 'running'
                              : message.phase === 'error'
                                ? 'error'
                                : 'cancelled'
                          }
                        />
                      ) : (
                        message.text
                      )}
                    </AiMessageContent>
                  )}
                  {message.result ? (
                    <AiResultView
                      result={message.result}
                      renderTable={options.renderTable}
                    />
                  ) : (
                    message.details && (
                      <pre class="rv-ai-chat-result">{message.details}</pre>
                    )
                  )}
                  {message.id === transcript.messages.at(-1)?.id &&
                    message.pending &&
                    preview}
                </AiMessage>
              ))}
            </AiChatContent>
            {composer}
            {history}
          </AiChat>
        ) : (
          <>
            {(clearChart || newConversation) && (
              <div class="rv-ai-chat-actions">{conversationActions}</div>
            )}
            {composer}
            {preview}
            {state.phase === 'completed' && state.result && (
              <AiResultView
                result={state.result}
                renderTable={options.renderTable}
              />
            )}
            {!!activities.length && (
              <StatusFeedbackPanel
                className="rv-ai-activity"
                title={t('Activity')}
                compact
                autoDismissMs={options.activityDurationMs}
                onDismissItem={(id) => {
                  activities = activities.filter((item) => item.id !== id);
                  draw();
                }}
                collapsed={activityCollapsed}
                onCollapsedChange={setActivityCollapsed}
                collapseLabel={t('Collapse activity')}
                expandLabel={t('Expand activity')}
                items={activities}
              />
            )}

            {history}
          </>
        )}
      </AiAssistant>
    );
  }
  const draw = () => {
    if (!disposed && currentState) render(<View state={currentState} />, host);
  };
  return {
    update(state: AiAssistantMountState) {
      if (currentState && currentState.chatKey !== state.chatKey) {
        activities = [];
        activityKey = '';
        activityBusy = false;
      }
      if (chat) transcript.update(state);
      else recordActivity(state);
      currentState = state;
      draw();
    },
    /** Update example choices without remounting the composer or losing its draft. */
    setSuggestions(items: readonly string[]) {
      suggestions = [...items];
      draw();
    },
    destroy() {
      if (!disposed) {
        disposed = true;
        promptHistory = [];
        transcript.clear();
        render(null, host);
      }
    },
  };
}
