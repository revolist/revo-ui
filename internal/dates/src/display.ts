import { getBrowserTimeZone } from './civil-time';
import { coerceValidDate } from './date-controls';
import {
  formatIsoDateInTimeZone,
  ISO_DATE_ONLY_PATTERN,
  isValidIsoDate,
} from './iso';

export type DateDisplayFormat = 'locale' | 'eu' | 'us' | 'iso' | 'long';
export type TimeDisplayFormat = 'locale' | '12h' | '24h';

export type DateTimeDisplayOptions = {
  locale?: string | string[];
  dateFormat?: DateDisplayFormat;
  timeFormat?: TimeDisplayFormat;
  timeZone?: string;
};

/** Formats an instant for UI display without changing its stored representation. */
export function formatDateTimeDisplay(
  value: unknown,
  options: DateTimeDisplayOptions & { mode: 'date' | 'time' | 'dateTime' },
): string | undefined {
  const date = coerceValidDate(value);
  if (!date) return;
  const { dateFormat = 'locale', timeFormat, timeZone, mode } = options;
  const locale =
    options.locale ??
    (dateFormat === 'us'
      ? 'en-US'
      : dateFormat === 'eu' || dateFormat === 'iso'
        ? 'en-GB'
        : undefined);
  const zone = timeZone ? { timeZone } : {};
  const clock =
    timeFormat ??
    (dateFormat === 'us'
      ? '12h'
      : dateFormat === 'eu' || dateFormat === 'iso'
        ? '24h'
        : 'locale');
  const timeOptions: Intl.DateTimeFormatOptions = {
    ...zone,
    hour: '2-digit',
    minute: '2-digit',
    ...(clock === '12h'
      ? { hourCycle: 'h12' }
      : clock === '24h'
        ? { hourCycle: 'h23' }
        : {}),
  };
  if (mode === 'time')
    return new Intl.DateTimeFormat(locale, timeOptions).format(date);
  let dateText: string;
  if (dateFormat === 'iso') {
    dateText = formatIsoDateInTimeZone(date, timeZone ?? getBrowserTimeZone());
  } else if (dateFormat === 'eu' || dateFormat === 'us') {
    dateText = new Intl.DateTimeFormat(
      dateFormat === 'eu' ? 'en-GB' : 'en-US',
      {
        ...zone,
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      },
    ).format(date);
  } else {
    dateText = new Intl.DateTimeFormat(locale, {
      ...zone,
      ...(dateFormat === 'long'
        ? { day: 'numeric', month: 'long', year: 'numeric' }
        : { weekday: 'short', month: 'short', day: 'numeric' }),
    } as Intl.DateTimeFormatOptions).format(date);
  }
  return mode === 'date'
    ? dateText
    : `${dateText} ${new Intl.DateTimeFormat(locale, timeOptions).format(date)}`;
}

/** Formats a civil date without applying a timezone; instant values use the requested zone. */
export function formatCalendarDateDisplay(
  value: unknown,
  locale?: string,
  timeZone?: string,
): string | undefined {
  const dateOnly =
    typeof value === 'string' && ISO_DATE_ONLY_PATTERN.test(value);
  if (dateOnly && !isValidIsoDate(value)) return;
  const date = coerceValidDate(value);
  if (!date) return;
  return new Intl.DateTimeFormat(locale, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: dateOnly ? 'UTC' : timeZone,
  }).format(date);
}

/** Compact civil/instant range caption for constrained controls; retains years across years. */
export function formatCompactDateRangeDisplay(
  from: Date,
  to: Date,
  locale: string | string[] = 'en-US',
  timeZone?: string,
): string {
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) return '';
  const years = new Intl.DateTimeFormat('en-US', { year: 'numeric', timeZone });
  const formatter = new Intl.DateTimeFormat(locale, {
    timeZone,
    month: 'short',
    day: 'numeric',
    ...(years.format(from) !== years.format(to) ? { year: 'numeric' } : {}),
  });
  return from <= to
    ? formatter.formatRange(from, to)
    : `${formatter.format(from)} – ${formatter.format(to)}`;
}
