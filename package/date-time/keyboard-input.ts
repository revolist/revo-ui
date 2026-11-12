import {
  formatDateEntry,
  parseDateEntry,
  todayIsoDate,
  type TemporalControlValue,
} from '@revolist/ui-dates';
import {
  handleMaskedBeforeInput,
  handleMaskedHistory,
  handleMaskedPaste,
  normalizeMaskedInput,
  parseMaskedDraft,
} from '../masked-input/edit';
import { validateTemporalSelection } from './validation';
import type { DateInputOptions, TemporalPickerOptions } from './types';

/** Reuse the same fixed-slot editing, caret, paste and undo behavior as MaskedDraft. */
export function attachDateInputMask(
  input: HTMLInputElement,
  options: DateInputOptions = {},
): () => void {
  if (!options.inputMask) return () => {};
  const mask = { mask: '0000-00-00', store: 'formatted' as const };
  let composing = false;
  const editable = () => !input.disabled && !input.readOnly;
  const publish = () =>
    input.dispatchEvent(new Event('input', { bubbles: true }));
  const beforeInput = (event: InputEvent) => {
    if (
      editable() &&
      !composing &&
      !event.isComposing &&
      handleMaskedBeforeInput(input, event, mask)
    )
      publish();
  };
  const paste = (event: ClipboardEvent) => {
    if (editable() && !composing && handleMaskedPaste(input, event, mask))
      publish();
  };
  const keydown = (event: KeyboardEvent) => {
    if (editable() && !composing && handleMaskedHistory(input, event))
      publish();
  };
  const normalize = (event: Event) => {
    if (editable() && !composing && !(event as InputEvent).isComposing)
      normalizeMaskedInput(input, mask);
  };
  const start = () => {
    composing = true;
  };
  const end = () => {
    composing = false;
    if (editable()) {
      normalizeMaskedInput(input, mask);
      publish();
    }
  };
  input.addEventListener('beforeinput', beforeInput, true);
  input.addEventListener('paste', paste, true);
  input.addEventListener('keydown', keydown, true);
  input.addEventListener('input', normalize, true);
  input.addEventListener('compositionstart', start);
  input.addEventListener('compositionend', end);
  return () => {
    input.removeEventListener('beforeinput', beforeInput, true);
    input.removeEventListener('paste', paste, true);
    input.removeEventListener('keydown', keydown, true);
    input.removeEventListener('input', normalize, true);
    input.removeEventListener('compositionstart', start);
    input.removeEventListener('compositionend', end);
  };
}

/** Parse masks as drafts so blank slots clear optional fields, while partial dates stay invalid. */
export function parseDateInput(
  text: string,
  options: DateInputOptions = {},
): string | undefined {
  let value = text.trim();
  if (options.inputMask) {
    const masked = parseMaskedDraft(value, {
      mask: '0000-00-00',
      store: 'formatted',
    });
    if (!masked.valid) return;
    value = masked.value ?? '';
  }
  return !value
    ? ''
    : parseDateEntry(value, options.inputMask ? { format: 'iso' } : options);
}

function dateOptions(options: TemporalPickerOptions): DateInputOptions {
  return {
    locale: options.calendar?.locale,
    ...(typeof options.dateInput === 'object' ? options.dateInput : {}),
  };
}
export function formatTemporalInput(
  value: string,
  options: TemporalPickerOptions,
): string {
  const date = dateOptions(options);
  return (options.kind ?? 'date') === 'date'
    ? formatDateEntry(value, date.inputMask ? { format: 'iso' } : date)
    : value;
}
/** Preserve incomplete drafts when opening a picker; validation belongs to commit. */
export function temporalInputDraft(
  text: string,
  options: TemporalPickerOptions,
): string | null {
  const value = text.trim();
  return (
    ((options.kind ?? 'date') === 'date'
      ? (parseDateInput(value, dateOptions(options)) ?? value)
      : value) || null
  );
}
/** Single-value native entry uses exactly the picker's date/time validation policy. */
export function parseTemporalInput(
  text: string,
  options: TemporalPickerOptions,
):
  | { value: TemporalControlValue; error?: never }
  | { error: string; value?: never } {
  const parsed = temporalInputDraft(text, options);
  const result = validateTemporalSelection(
    { ...options, value: parsed, onChange: () => {} },
    todayIsoDate(),
  );
  return result.valid ? { value: parsed } : { error: result.errorMessage };
}
