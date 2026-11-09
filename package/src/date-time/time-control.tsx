/** @jsxRuntime automatic */
/** @jsxImportSource preact */
import { useState } from 'preact/hooks';
import { Input } from '../native-control';
import {
  formatClockControl,
  parseClockControl,
  isTimeControlAllowed,
} from '@revolist/dates';
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
  if (format === 'locale')
    return (
      <Input
        type="time"
        aria-label={label}
        value={value}
        min={min}
        max={max}
        step={step ?? (precision === 'second' ? 1 : 60)}
        onInput={(event) => onChange(event.currentTarget.value)}
      />
    );
  const display = formatClockControl(value, format, precision, locale);
  return (
    <Input
      type="text"
      aria-label={label}
      value={editing ? draft : display}
      aria-invalid={!!value && !isTimeControlAllowed(value, { min, max, step })}
      placeholder={format === '12h' ? '09:00 AM' : '09:00'}
      onFocus={() => {
        setEditing(true);
        setDraft(display);
      }}
      onBlur={() => setEditing(false)}
      onInput={(event) => {
        const text = event.currentTarget.value;
        setDraft(text);
        onChange(
          text ? (parseClockControl(text, precision, locale) ?? text) : '',
        );
      }}
    />
  );
}
