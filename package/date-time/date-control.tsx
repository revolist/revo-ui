/** @jsxRuntime automatic */
/** @jsxImportSource preact */
import { useLayoutEffect, useRef, useState } from 'preact/hooks';
import { attachDateInputMask, parseDateInput } from './keyboard-input';
import { Input } from '../native-control';
import {
  formatDateEntry,
  dateEntryPlaceholder,
  type DateEntryOptions,
} from '@revolist/dates';
export interface DateInputOptions extends DateEntryOptions {
  placeholder?: string;
  /** ISO fixed-slot date entry with automatic separators; single dates only. */
  inputMask?: 'YYYY-MM-DD';
  /** Date-only multiple selection uses a semicolon-separated list by default. */
  multipleSeparator?: string;
}
export function DateControl({
  value,
  label,
  options = {},
  multiple,
  invalid,
  errorId,
  disabled,
  readOnly,
  minDate,
  maxDate,
  onChange,
  onFocus,
}: {
  value: string | string[];
  label: string;
  options?: DateInputOptions;
  multiple?: boolean;
  invalid?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  minDate?: string;
  maxDate?: string;
  errorId?: string;
  onFocus?: () => void;
  onChange: (date: string | string[]) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  useLayoutEffect(
    () =>
      input.current && !multiple
        ? attachDateInputMask(input.current, options)
        : undefined,
    [options.inputMask, multiple],
  );
  if (options.inputMask && !multiple)
    options = {
      ...options,
      format: 'iso',
      parse: undefined,
      formatValue: undefined,
    };
  const [editing, setEditing] = useState(false),
    [draft, setDraft] = useState('');
  if (multiple && options.inputMask)
    options = { ...options, inputMask: undefined };
  const separator = options.multipleSeparator?.trim() || ';';
  const display = Array.isArray(value)
    ? value.map((date) => formatDateEntry(date, options)).join(`${separator} `)
    : formatDateEntry(value, options);
  const current = editing ? draft : display;
  const entered = multiple ? current.split(separator) : [current];
  const invalidEntry = entered.some((text) => {
    if (!text.trim()) return false;
    const parsed = parseDateInput(text, options);
    return (
      parsed === undefined ||
      !!(parsed && minDate && parsed < minDate) ||
      !!(parsed && maxDate && parsed > maxDate)
    );
  });
  return (
    <Input
      ref={input}
      type="text"
      disabled={disabled}
      readOnly={readOnly}
      autoComplete="off"
      spellcheck={false}
      aria-label={label}
      aria-invalid={invalid || invalidEntry}
      aria-describedby={invalid ? errorId : undefined}
      placeholder={options.placeholder ?? dateEntryPlaceholder(options)}
      value={editing ? draft : display}
      onFocus={() => {
        setEditing(true);
        setDraft(display);
        onFocus?.();
      }}
      onBlur={() => setEditing(false)}
      onInput={(event) => {
        if (disabled || readOnly) return;
        const text = event.currentTarget.value;
        setDraft(text);
        const parse = (text: string) =>
          parseDateInput(text, options) ?? text.trim();
        onChange(
          multiple
            ? text.trim()
              ? text.split(separator).map(parse)
              : []
            : parse(text),
        );
      }}
    />
  );
}
