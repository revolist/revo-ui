import {
  type MaskedInputOptions,
  type MaskedParseResult,
  maskParts,
  acceptsMaskToken,
  parseMaskedInput,
} from './model';

type Part = NonNullable<ReturnType<typeof maskParts>>[number];
export interface MaskedEditResult {
  value: string;
  caret: number;
  accepted: boolean;
}
const emptySlot = '_';

/** Read either a fixed-slot draft, raw tokens, or a formatted prefix. */
function slotsFor(value: string, parts: Part[]): string[] | undefined {
  const tokens = parts.filter((part) => 'token' in part);
  const chars = Array.from(value);
  const slots = tokens.map(() => '');
  if (!chars.length) return slots;
  if (chars.length === parts.length) {
    let index = 0;
    const valid = parts.every((part, position) => {
      const char = chars[position];
      if ('literal' in part) return char === part.literal;
      if (char !== emptySlot && !acceptsMaskToken(part.token, char))
        return false;
      slots[index++] = char === emptySlot ? '' : char;
      return true;
    });
    if (valid) return slots;
  }
  if (
    chars.length <= tokens.length &&
    chars.every(
      (char, index) =>
        'token' in tokens[index] && acceptsMaskToken(tokens[index].token, char),
    )
  ) {
    return slots.map((_, index) => chars[index] ?? '');
  }
  let slot = 0;
  for (let position = 0; position < chars.length; position++) {
    const part = parts[position],
      char = chars[position];
    if (!part) return undefined;
    if ('literal' in part) {
      if (char !== part.literal) return undefined;
    } else {
      if (char !== emptySlot && !acceptsMaskToken(part.token, char))
        return undefined;
      slots[slot++] = char === emptySlot ? '' : char;
    }
  }
  return slots;
}

function layout(slots: string[], parts: Part[]) {
  let value = '',
    index = 0;
  const starts: number[] = [],
    ends: number[] = [];
  for (const part of parts) {
    if ('literal' in part) value += part.literal;
    else {
      starts.push(value.length);
      value += slots[index++] || emptySlot;
      ends.push(value.length);
    }
  }
  return { value, starts, ends };
}

/** Keep the entire pattern visible, including empty slots and fixed separators. */
export function formatMaskedDraft(
  value: string,
  options: MaskedInputOptions,
): string {
  const parts = maskParts(options.mask);
  if (!parts) return value;
  const slots = slotsFor(value, parts);
  return slots ? layout(slots, parts).value : value;
}

export function maskedDraftCaret(
  value: string,
  options: MaskedInputOptions,
): number {
  const parts = maskParts(options.mask);
  const slots = parts && slotsFor(value, parts);
  if (!parts || !slots) return value.length;
  const current = layout(slots, parts);
  const index = slots.indexOf('');
  return current.starts[index] ?? current.value.length;
}

/** Placeholders are draft state only; they never enter the saved identifier. */
export function parseMaskedDraft(
  value: string,
  options: MaskedInputOptions,
): MaskedParseResult {
  const blank = parseMaskedInput('', options);
  if (blank.error === 'configuration') return blank;
  const parts = maskParts(options.mask)!;
  const slots = slotsFor(value, parts);
  if (!slots) return parseMaskedInput(value, options);
  if (slots.every((slot) => !slot)) return blank;
  if (slots.some((slot) => !slot))
    return {
      valid: false,
      value: null,
      raw: null,
      formatted: null,
      error: 'incomplete',
    };
  return parseMaskedInput(layout(slots, parts).value, options);
}

/** Edit fixed slots without moving later characters into different positions. */
export function editMaskedInput(
  value: string,
  start: number,
  end: number,
  inputType: string,
  data: string | null,
  options: MaskedInputOptions,
): MaskedEditResult {
  const rejected = { value, caret: start, accepted: false };
  const parts = maskParts(options.mask);
  if (!parts) return rejected;
  let slots = slotsFor(value, parts);
  if (!slots) {
    if (start !== 0 || end !== value.length) return rejected;
    slots = parts.filter((part) => 'token' in part).map(() => '');
  }
  const current = layout(slots, parts);
  const from = current.ends.filter((position) => position <= start).length;
  const to = current.starts.filter((position) => position < end).length;
  const next = [...slots];
  for (let index = from; index < to; index++) next[index] = '';
  let caretIndex = from;
  if (
    ['deleteContentBackward', 'deleteContentForward', 'deleteByCut'].includes(
      inputType,
    )
  ) {
    if (start === end && inputType !== 'deleteByCut') {
      caretIndex =
        inputType === 'deleteContentBackward' ? Math.max(0, from - 1) : from;
      if (caretIndex < next.length) next[caretIndex] = '';
    }
  } else if (inputType.startsWith('insert') && data !== null) {
    const tokenParts = parts.flatMap((part, index) =>
      'token' in part ? [index] : [],
    );
    const firstPart = tokenParts[from] ?? parts.length;
    const remaining = parts.slice(from === 0 ? 0 : firstPart);
    const tokens = remaining.filter((part) => 'token' in part);
    const characters = Array.from(data);
    let inserted: string[] | undefined;
    if (
      characters.length <= tokens.length &&
      characters.every(
        (char, index) =>
          'token' in tokens[index] &&
          acceptsMaskToken(tokens[index].token, char),
      )
    )
      inserted = characters;
    else {
      // Explicitly typed separators advance across their immutable positions.
      const preceding = parts.slice(
        from ? tokenParts[from - 1] + 1 : 0,
        firstPart,
      );
      const separator = preceding
        .map((part) => ('literal' in part ? part.literal : ''))
        .join('');
      if (start === end && data && separator.includes(data))
        return {
          value: current.value,
          caret: current.starts[from] ?? current.value.length,
          accepted: true,
        };
      const candidate = slotsFor(data, remaining);
      // Paste may supply a prefix, but may not introduce placeholder holes.
      if (candidate) {
        const filledEnd = candidate.findLastIndex(Boolean) + 1;
        if (candidate.slice(0, filledEnd).every(Boolean))
          inserted = candidate.slice(0, filledEnd);
      }
    }
    if (!inserted || from + inserted.length > next.length) return rejected;
    inserted.forEach((char, index) => {
      next[from + index] = char;
    });
    caretIndex = from + inserted.length;
  } else return rejected;
  const result = layout(next, parts);
  return {
    value: result.value,
    caret: result.starts[caretIndex] ?? result.value.length,
    accepted: true,
  };
}

type DraftSnapshot = { value: string; start: number; end: number };
const histories = new WeakMap<
  HTMLInputElement,
  { current: string; past: DraftSnapshot[]; future: DraftSnapshot[] }
>();
const snapshot = (input: HTMLInputElement): DraftSnapshot => ({
  value: input.value,
  start: input.selectionStart ?? 0,
  end: input.selectionEnd ?? 0,
});

/** Native input bridge shared by grid adapters and standalone fields. */
export function applyMaskedEdit(
  input: HTMLInputElement,
  inputType: string,
  data: string | null,
  options: MaskedInputOptions,
): boolean {
  const next = editMaskedInput(
    input.value,
    input.selectionStart ?? 0,
    input.selectionEnd ?? input.value.length,
    inputType,
    data,
    options,
  );
  if (next.accepted) {
    if (next.value !== input.value) {
      let history = histories.get(input);
      if (!history || history.current !== input.value) {
        history = { current: input.value, past: [], future: [] };
        histories.set(input, history);
      }
      history.past.push(snapshot(input));
      if (history.past.length > 100) history.past.shift();
      history.future = [];
      history.current = next.value;
    }
    input.value = next.value;
    input.setSelectionRange(next.caret, next.caret);
  }
  return next.accepted;
}

/** Autofill/composition fallback: format compatible input without discarding characters. */
export function normalizeMaskedInput(
  input: HTMLInputElement,
  options: MaskedInputOptions,
): void {
  const value = formatMaskedDraft(input.value, options);
  if (value === input.value) return;
  const parts = maskParts(options.mask)!;
  const slots = slotsFor(input.value, parts);
  if (!slots) return;
  const current = layout(slots, parts);
  const caretFor = (position: number) => {
    const prefix = slotsFor(input.value.slice(0, position), parts);
    const filled = prefix?.filter(Boolean).length ?? 0;
    return current.starts[filled] ?? value.length;
  };
  const start = caretFor(input.selectionStart ?? input.value.length);
  const end = caretFor(input.selectionEnd ?? input.value.length);
  input.value = value;
  input.setSelectionRange(start, end);
}

/** Handle supported native edits while leaving composition and platform operations intact. */
export function handleMaskedBeforeInput(
  input: HTMLInputElement,
  event: InputEvent,
  options: MaskedInputOptions,
): boolean {
  if (
    event.isComposing ||
    !event.cancelable ||
    ![
      'insertText',
      'insertReplacementText',
      'insertFromPaste',
      'deleteContentBackward',
      'deleteContentForward',
      'deleteByCut',
    ].includes(event.inputType) ||
    (event.inputType.startsWith('insert') && event.data === null)
  )
    return false;
  event.preventDefault();
  applyMaskedEdit(input, event.inputType, event.data, options);
  return true;
}

export function handleMaskedPaste(
  input: HTMLInputElement,
  event: ClipboardEvent,
  options: MaskedInputOptions,
): boolean {
  if (!event.clipboardData) return false;
  event.preventDefault();
  applyMaskedEdit(
    input,
    'insertFromPaste',
    event.clipboardData.getData('text/plain'),
    options,
  );
  return true;
}

/** Preserve draft undo/redo when generated separators require programmatic text edits. */
export function handleMaskedHistory(
  input: HTMLInputElement,
  event: KeyboardEvent,
): boolean {
  if (event.isComposing || !(event.ctrlKey || event.metaKey) || event.altKey)
    return false;
  const key = event.key.toLowerCase();
  if (key !== 'z' && key !== 'y') return false;
  event.preventDefault();
  event.stopPropagation();
  const history = histories.get(input);
  if (!history || history.current !== input.value) return true;
  const redo = key === 'y' || event.shiftKey;
  const next = (redo ? history.future : history.past).pop();
  if (next) {
    (redo ? history.past : history.future).push(snapshot(input));
    history.current = input.value = next.value;
    input.setSelectionRange(next.start, next.end);
  }
  return true;
}
