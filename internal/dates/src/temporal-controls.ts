import {
  coerceValidDate,
  formatLocalDateControlValue,
  parseLocalDateControlValue,
  type LocalDateControlKind,
} from './date-controls';
import {
  formatIsoDateInTimeZone,
  formatLocalIsoDateTimeInTimeZone,
  isValidIsoDate,
} from './iso';
import {
  getBrowserTimeZone,
  parseIsoLocalCivilDateTime,
  parseZonedDateTimeControlValue,
} from './civil-time';
import {
  coerceSpreadsheetDate,
  spreadsheetDateToExcelSerial,
} from './spreadsheet-date';

export type TemporalControlValue =
  | string
  | string[]
  | { from: string; to?: string }
  | null;
export function temporalDatePart(value: string): string {
  return value.split('T')[0];
}
export function temporalTimePart(value: string): string {
  return value.includes('T') ? value.split('T')[1] : value;
}
export function withTemporalDate(
  date: string,
  previous: string,
  kind: LocalDateControlKind,
): string {
  return kind === 'datetime'
    ? `${date}T${previous.includes('T') ? temporalTimePart(previous) : '00:00'}`
    : date;
}
export function withTemporalTime(
  value: string,
  time: string,
  kind: LocalDateControlKind,
): string {
  return kind === 'datetime' ? `${temporalDatePart(value)}T${time}` : time;
}
export function isValidTemporalControl(
  kind: LocalDateControlKind,
  value: string,
): boolean {
  return kind === 'date'
    ? isValidIsoDate(value)
    : kind === 'datetime'
      ? !!parseIsoLocalCivilDateTime(
          value.replace(/(\d{2}:\d{2}:\d{2})\.\d{1,3}$/, '$1'),
        )
      : !!parseLocalDateControlValue(kind, value);
}
/** Date-only values never shift zones. Other stored representations are projected for editing. */
export function temporalToControl(
  kind: LocalDateControlKind,
  value: unknown,
  timeZone?: string,
): string {
  if (
    typeof value === 'string' &&
    isValidTemporalControl(kind, value) &&
    (kind !== 'datetime' || !/[zZ]|[+-]\d\d:\d\d$/.test(value))
  )
    return value;
  const date =
    typeof value === 'number'
      ? coerceSpreadsheetDate(value)
      : coerceValidDate(value);
  if (!date) return '';
  if (!timeZone) return formatLocalDateControlValue(kind, date, 'second');
  if (kind === 'date') return formatIsoDateInTimeZone(date, timeZone);
  const local = formatLocalIsoDateTimeInTimeZone(date, timeZone);
  return kind === 'time' ? temporalTimePart(local) : local;
}
/** Shared representation-preserving commit boundary. Undefined means invalid; null means cleared. */
export function temporalFromControl(
  kind: LocalDateControlKind,
  draft: string,
  original?: unknown,
  timeZone?: string,
): unknown {
  if (!draft) return null;
  if (!isValidTemporalControl(kind, draft)) return undefined;
  const compatible =
    typeof original !== 'string' ||
    kind === 'date' ||
    (kind === 'time' && isValidTemporalControl('time', original)) ||
    (kind === 'datetime' && !isValidIsoDate(original));
  if (compatible && temporalToControl(kind, original, timeZone) === draft)
    return original;
  const previousDate =
    typeof original === 'number'
      ? coerceSpreadsheetDate(original)
      : coerceValidDate(original);
  const instantOriginal =
    previousDate &&
    (original instanceof Date ||
      typeof original === 'number' ||
      (typeof original === 'string' &&
        !isValidTemporalControl(kind, original)));
  const clock = instantOriginal
    ? temporalToControl('datetime', original, timeZone)
    : undefined;
  const date =
    kind === 'datetime'
      ? parseZonedDateTimeControlValue(
          draft,
          timeZone ?? getBrowserTimeZone(),
          previousDate,
        )
      : clock && kind === 'date'
        ? parseZonedDateTimeControlValue(
            `${draft}T${temporalTimePart(clock)}`,
            timeZone ?? getBrowserTimeZone(),
            previousDate,
          )
        : clock && kind === 'time'
          ? parseZonedDateTimeControlValue(
              `${temporalDatePart(clock)}T${draft}`,
              timeZone ?? getBrowserTimeZone(),
              previousDate,
            )
          : parseLocalDateControlValue(kind, draft, previousDate);
  if (!date) return undefined;
  if (original instanceof Date) return date;
  if (typeof original === 'number') return spreadsheetDateToExcelSerial(date);
  if (kind === 'date' && instantOriginal) return date.toISOString();
  if (kind === 'datetime') return date.toISOString();
  return draft;
}

export function timeControlSeconds(value: string): number | undefined {
  const date = parseLocalDateControlValue('time', value);
  return date
    ? date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds()
    : undefined;
}
export function isTimeControlAllowed(
  value: string,
  options: { min?: string; max?: string; step?: number },
): boolean {
  const seconds = timeControlSeconds(value);
  if (seconds === undefined) return false;
  const min = options.min ? timeControlSeconds(options.min) : undefined;
  const max = options.max ? timeControlSeconds(options.max) : undefined;
  return (
    (min === undefined || seconds >= min) &&
    (max === undefined || seconds <= max) &&
    (options.step === undefined ||
      (options.step > 0 && (seconds - (min ?? 0)) % options.step === 0))
  );
}

/** Explicit clock presentation without relying on the browser/OS native time-input locale. */
export function formatClockControl(
  value: string,
  format: '12h' | '24h',
  precision: 'minute' | 'second' = 'minute',
  locale?: string,
): string {
  const date = parseLocalDateControlValue('time', value);
  if (!date) return value;
  return new Intl.DateTimeFormat(
    locale ?? (format === '12h' ? 'en-US' : 'en-GB'),
    {
      hour: '2-digit',
      minute: '2-digit',
      ...(precision === 'second' ? { second: '2-digit' } : {}),
      hourCycle: format === '12h' ? 'h12' : 'h23',
    },
  ).format(date);
}
export function parseClockControl(
  value: string,
  precision: 'minute' | 'second' = 'minute',
  locale?: string,
): string | undefined {
  // Match the digits and day periods emitted by formatClockControl, including RTL locales.
  value = value.replace(/[\u200e\u200f\u061c]/g, '').trim();
  if (locale) {
    const numbers = new Intl.NumberFormat(locale, { useGrouping: false });
    for (let digit = 0; digit < 10; digit++)
      value = value.split(numbers.format(digit)).join(String(digit));
    const periods = new Intl.DateTimeFormat(locale, {
      hour: 'numeric',
      hourCycle: 'h12',
    });
    for (const [hour, period] of [
      [1, 'AM'],
      [13, 'PM'],
    ] as const) {
      const localized = periods
        .formatToParts(new Date(2000, 0, 1, hour))
        .find((part) => part.type === 'dayPeriod')?.value;
      if (localized) value = value.replace(localized, period);
    }
    const separators = new Intl.DateTimeFormat(locale, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hourCycle: 'h23',
    }).formatToParts(new Date(2000, 0, 1, 13, 45, 20));
    for (const part of separators)
      if (part.type === 'literal' && part.value.trim())
        value = value.split(part.value).join(':');
    value = value.replace(/^\s*(AM|PM)\s*(.*)$/i, '$2 $1');
  }
  const direct = parseLocalDateControlValue('time', value.trim());
  if (direct) return formatLocalDateControlValue('time', direct, precision);
  const match = /^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*([ap])\.?m\.?$/i.exec(
    value.trim(),
  );
  if (!match) return;
  const hour = Number(match[1]);
  if (hour < 1 || hour > 12) return;
  const clock = `${String((hour % 12) + (match[4].toLowerCase() === 'p' ? 12 : 0)).padStart(2, '0')}:${match[2]}:${match[3] ?? '00'}`;
  const parsed = parseLocalDateControlValue('time', clock);
  return parsed
    ? formatLocalDateControlValue('time', parsed, precision)
    : undefined;
}
