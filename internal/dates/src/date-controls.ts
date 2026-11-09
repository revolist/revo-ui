import { coerceValidDate } from './coercion';
export { coerceValidDate } from './coercion';
import { formatLocalIsoDate } from './iso';

export type LocalDateControlKind = 'date' | 'datetime' | 'time';

const LOCAL_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const LOCAL_DATETIME_PATTERN =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?$/;
const LOCAL_TIME_PATTERN = /^(\d{2}):(\d{2})(?::(\d{2}))?$/;

/** Formats local `Date` fields for native date, datetime-local, and time controls. */
export function formatLocalDateControlValue(
  kind: LocalDateControlKind,
  date: Date,
  precision: 'minute' | 'second' = 'minute',
): string {
  if (Number.isNaN(date.getTime())) return '';
  const time = `${pad(date.getHours())}:${pad(date.getMinutes())}${precision === 'second' ? `:${pad(date.getSeconds())}` : ''}`;
  if (kind === 'time') return time;
  const localDate = formatLocalIsoDate(date);
  return kind === 'date' ? localDate : `${localDate}T${time}`;
}

/**
 * Parses native date, datetime-local, and time control values as local time.
 * Returns `undefined` when the syntax or calendar value is invalid.
 */
export function parseLocalDateControlValue(
  kind: LocalDateControlKind,
  value: string,
  baseDate: Date = new Date(),
): Date | undefined {
  if (kind === 'time') {
    const match = LOCAL_TIME_PATTERN.exec(value);
    if (!match) return;
    const hours = Number(match[1]);
    const minutes = Number(match[2]);
    const seconds = Number(match[3] ?? 0);
    if (
      hours > 23 ||
      minutes > 59 ||
      seconds > 59 ||
      Number.isNaN(baseDate.getTime())
    ) {
      return;
    }
    const date = new Date(baseDate.getTime());
    date.setHours(hours, minutes, seconds, 0);
    return date;
  }

  const match =
    kind === 'date'
      ? LOCAL_DATE_PATTERN.exec(value)
      : LOCAL_DATETIME_PATTERN.exec(value);
  if (!match) return;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const hours = Number(match[4] ?? 0);
  const minutes = Number(match[5] ?? 0);
  const seconds = Number(match[6] ?? 0);
  const milliseconds = Number((match[7] ?? '').padEnd(3, '0'));
  const date = new Date(0);
  date.setFullYear(year, month - 1, day);
  date.setHours(hours, minutes, seconds, milliseconds);
  if (
    month < 1 ||
    month > 12 ||
    day < 1 ||
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day ||
    date.getHours() !== hours ||
    date.getMinutes() !== minutes ||
    date.getSeconds() !== seconds ||
    date.getMilliseconds() !== milliseconds
  ) {
    return;
  }
  return date;
}

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

/** Legacy temporal filter coercion accepts only offset-qualified datetime strings. */
export function parseOffsetDateTimeValue(value: unknown): Date | undefined {
  if (
    typeof value === 'string' &&
    !/^\d{4}-\d{2}-\d{2}T.+(?:Z|[+-]\d{2}:\d{2})$/i.test(value.trim())
  )
    return;
  return coerceValidDate(value);
}
