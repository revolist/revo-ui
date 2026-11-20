/** @jsxRuntime automatic */
/** @jsxImportSource preact */
import { useState } from 'preact/hooks';
import { Input } from '../native-control';
import {
  formatClockControl,
  parseClockControl,
  isTimeControlAllowed,
  clockUses12Hours,
} from '@revolist/ui-dates';
export function TimeControl({
  value,
  label,
  format = 'locale',
  precision = 'minute',
  locale,
  min,
  max,
  step,
  onChange,
}: {
  value: string;
  label: string;
  format?: 'locale' | '12h' | '24h';
  precision?: 'minute' | 'second';
  locale?: string;
  min?: string;
  max?: string;
  step?: number;
  onChange: (value: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const effectiveLocale =
    locale ?? new Intl.DateTimeFormat().resolvedOptions().locale;
  const resolvedFormat = clockUses12Hours(format, effectiveLocale)
    ? '12h'
    : '24h';
  const display = formatClockControl(
    value,
    resolvedFormat,
    precision,
    effectiveLocale,
  );
  return (
    <Input
      type="text"
      aria-label={label}
      value={editing ? draft : display}
      aria-invalid={!!value && !isTimeControlAllowed(value, { min, max, step })}
      placeholder={resolvedFormat === '12h' ? '09:00 AM' : '09:00'}
      onFocus={() => {
        setEditing(true);
        setDraft(display);
      }}
      onBlur={() => setEditing(false)}
      onInput={(event) => {
        const text = event.currentTarget.value;
        setDraft(text);
        onChange(
          text
            ? (parseClockControl(text, precision, effectiveLocale) ?? text)
            : '',
        );
      }}
    />
  );
}
