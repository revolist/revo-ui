import { coerceValidDate } from './coercion';
export type ISODateString =
  | `${number}-${number}-${number}`
  | `${number}-${number}-${number}T${string}`;
export type ISODateTimeString = `${number}-${number}-${number}T${string}`;

export const ISO_DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
export const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}(T.+Z)?$/;
export const ISO_DATE_PREFIX_PATTERN = /^\d{4}-\d{2}-\d{2}/;
export const ISO_DATETIME_PATTERN = /^\d{4}-\d{2}-\d{2}T.+Z$/;
export const ISO_DATETIME_INPUT_PATTERN = /^\d{4}-\d{2}-\d{2}T/;
export const ISO_LOCAL_DATETIME_INPUT_PATTERN =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/;
export const ISO_UTC_DATETIME_WITHOUT_ZONE_PATTERN =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?$/;

/**
 * Parses date-only strings at UTC midnight instead of local midnight.
 * Datetime strings are delegated to the JavaScript `Date` parser.
 */
export function parseIsoDate(date: string): Date {
  return ISO_DATE_ONLY_PATTERN.test(date)
    ? new Date(`${date}T00:00:00Z`)
    : new Date(date);
}

/**
 * Parses grid-facing date values while preserving local calendar semantics for
 * date-only strings. JSON-quoted strings cover normalized selection keys for
 * Date-valued cells.
 */
export function parseLocalDateValue(value: unknown): Date | undefined {
  if (value instanceof Date || typeof value === 'number')
    return coerceValidDate(value);
  if (typeof value !== 'string') {
    return undefined;
  }

  let candidate = value.trim();
  if (!candidate) {
    return undefined;
  }
  if (candidate.startsWith('"') && candidate.endsWith('"')) {
    try {
      const parsed = JSON.parse(candidate);
      if (typeof parsed === 'string') {
        candidate = parsed;
      }
    } catch {
      return undefined;
    }
  }

  if (ISO_DATE_ONLY_PATTERN.test(candidate)) {
    const [year, month, day] = candidate.split('-').map(Number);
    const date = new Date(0);
    date.setFullYear(year, month - 1, day);
    date.setHours(0, 0, 0, 0);
    return date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day
      ? date
      : undefined;
  }

  const date = new Date(candidate);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

/** Parses the `YYYY-MM-DD` prefix of a date or datetime at UTC midnight. */
export function parseIsoDateOnly(value: string): Date {
  return parseIsoDate(value.slice(0, 10));
}

export function isIsoDateTimeInput(value: string): boolean {
  return ISO_DATETIME_INPUT_PATTERN.test(value);
}

export function getIsoWeekdayUtc(date: Date): number {
  const day = date.getUTCDay();
  return day === 0 ? 7 : day;
}

export function getUtcWeekday(value: string | Date): number {
  return (typeof value === 'string' ? parseIsoDate(value) : value).getUTCDay();
}

export function getIsoWeekday(value: string | Date): number {
  const day = getUtcWeekday(value);
  return day === 0 ? 7 : day;
}

export function isValidIsoWeekday(value: number): boolean {
  return Number.isInteger(value) && value >= 1 && value <= 7;
}

export function formatIsoDate(date: Date): ISODateString {
  return date.toISOString().slice(0, 10) as ISODateString;
}

const isoDateTimeZoneFormatters = new Map<string, Intl.DateTimeFormat>();
const isoLocalDateTimeZoneFormatters = new Map<string, Intl.DateTimeFormat>();

/** Serializes the calendar date containing an instant in the requested IANA timezone. */
export function formatIsoDateInTimeZone(
  date: Date,
  timeZone: string,
): ISODateString {
  let formatter = isoDateTimeZoneFormatters.get(timeZone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat('en-US', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    isoDateTimeZoneFormatters.set(timeZone, formatter);
  }
  const parts = new Map(
    formatter.formatToParts(date).map((part) => [part.type, part.value]),
  );
  return `${parts.get('year')!.padStart(4, '0')}-${parts.get('month')}-${parts.get('day')}` as ISODateString;
}

/** Serializes an instant as a timezone-local value accepted by `datetime-local` controls. */
export function formatLocalIsoDateTimeInTimeZone(
  date: Date,
  timeZone: string,
): string {
  let formatter = isoLocalDateTimeZoneFormatters.get(timeZone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat('en-US-u-ca-gregory', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hourCycle: 'h23',
    });
    isoLocalDateTimeZoneFormatters.set(timeZone, formatter);
  }
  const parts = new Map(
    formatter.formatToParts(date).map((part) => [part.type, part.value]),
  );
  return `${parts.get('year')!.padStart(4, '0')}-${parts.get('month')}-${parts.get('day')}T${parts.get('hour')}:${parts.get('minute')}:${parts.get('second')}`;
}

/** Serializes the local calendar fields of a valid `Date` as `YYYY-MM-DD`. */
export function formatLocalIsoDate(value: Date): ISODateString {
  const date = new Date(0);
  date.setUTCFullYear(value.getFullYear(), value.getMonth(), value.getDate());
  date.setUTCHours(0, 0, 0, 0);
  return formatIsoDate(date);
}

/** Returns local calendar fields as `YYYY-MM-DD`, or `null` for a missing/invalid date. */
export function toLocalIsoDate(value: Date | undefined): ISODateString | null {
  if (!value || Number.isNaN(value.getTime())) {
    return null;
  }

  return formatLocalIsoDate(value);
}

export function formatIsoDateTime(date: Date): ISODateTimeString {
  return date.toISOString() as ISODateTimeString;
}

export function isValidIsoDate(
  value: string | undefined,
): value is ISODateString {
  if (!value || !ISO_DATE_ONLY_PATTERN.test(value)) {
    return false;
  }

  const date = parseIsoDate(value);
  return Number.isFinite(date.getTime()) && formatIsoDate(date) === value;
}

export function isValidIsoDateTime(
  value: string | undefined,
): value is ISODateTimeString {
  if (!value || !ISO_DATETIME_PATTERN.test(value)) {
    return false;
  }

  const date = parseIsoDate(value);
  return Number.isFinite(date.getTime()) && date.toISOString() === value;
}

/**
 * Validates either a date-only ISO value or a UTC datetime value.
 * Date-only values must round-trip as `YYYY-MM-DD`; datetimes must round-trip
 * exactly through `toISOString()`.
 */
export function isValidIsoDateValue(
  value: string | undefined,
): value is ISODateString {
  if (!value || !ISO_DATE_PATTERN.test(value)) {
    return false;
  }

  const date = parseIsoDate(value);
  if (!Number.isFinite(date.getTime())) {
    return false;
  }

  return value.includes('T')
    ? date.toISOString() === value
    : formatIsoDate(date) === value;
}

/** Returns a valid `YYYY-MM-DD` value or throws with a user-facing message. */
export function normalizeIsoDate(value: string): ISODateString {
  if (!isValidIsoDate(value)) {
    throw new Error(`Invalid date "${value}". Expected YYYY-MM-DD.`);
  }
  return value as ISODateString;
}

/**
 * Parses scheduler datetime input as UTC.
 * Values without a trailing `Z` are treated as UTC, not local time.
 */
export function parseDateTime(value: string): Date {
  const date = parseIsoDate(
    normalizeUtcDateTimeInput(value) as ISODateString | ISODateTimeString,
  );
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid datetime "${value}".`);
  }
  return date;
}

function normalizeUtcDateTimeInput(value: string): string {
  if (ISO_UTC_DATETIME_WITHOUT_ZONE_PATTERN.test(value)) {
    return `${value}Z`;
  }
  return value;
}

export function toISODate(date: Date, timeZone = 'UTC'): ISODateString {
  return timeZone === 'UTC'
    ? formatIsoDate(date)
    : formatIsoDateInTimeZone(date, timeZone);
}

export function toIsoDate(date: Date): ISODateString {
  return toISODate(date);
}

/** Syntax and native-parser acceptance for legacy ISO date-only sequences; allows day overflow. */
export function isParseableIsoDateOnly(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    ISO_DATE_ONLY_PATTERN.test(value) &&
    Number.isFinite(parseIsoDate(value).getTime())
  );
}

/** Recognizes parseable ISO-looking chart/category values; preserves native day overflow. */
export function isParseableIsoDateValue(value: string): boolean {
  const candidate = value.trim();
  return (
    /^\d{4}-\d{2}-\d{2}(?:[T\s].*)?$/.test(candidate) &&
    Number.isFinite(Date.parse(value))
  );
}

/** Legacy UTC operand syntax requires seconds, with optional fractional precision. */
export function isParseableUtcDateTime(value: string): boolean {
  return (
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/.test(value) &&
    Number.isFinite(Date.parse(value))
  );
}
