/** @jsxRuntime automatic */
/** @jsxImportSource preact */
import { useState } from 'preact/hooks';
import { Input } from '../native-control';
import {
  parseDateEntry,
  formatDateEntry,
  dateEntryPlaceholder,
  type DateEntryOptions,
} from '@revolist/dates';
export interface DateInputOptions extends DateEntryOptions {
  placeholder?: string;
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
  const [editing, setEditing] = useState(false),
    [draft, setDraft] = useState('');
  const separator = options.multipleSeparator?.trim() || ';';
  const display = Array.isArray(value)
    ? value.map((date) => formatDateEntry(date, options)).join(`${separator} `)
    : formatDateEntry(value, options);
  const current = editing ? draft : display;
  const entered = multiple ? current.split(separator) : [current];
  const invalidEntry = entered.some((text) => {
    if (!text.trim()) return false;
    const parsed = parseDateEntry(text, options);
    return (
      !parsed ||
      !!(minDate && parsed < minDate) ||
      !!(maxDate && parsed > maxDate)
    );
  });
  return (
    <Input
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
          parseDateEntry(text, options) ?? text.trim();
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
