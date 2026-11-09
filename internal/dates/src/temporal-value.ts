import { isValidIsoDate, parseIsoDate, isIsoDateTimeInput } from './iso';
import { formatCompactDateRangeDisplay } from './display';
import {
  formatDisplayCalendarDate,
  type DisplayCalendarSystem,
} from './display-calendar';
import { formatDateEntry, type DateEntryOptions } from './date-entry';
import {
  formatClockControl,
  temporalDatePart,
  temporalTimePart,
  temporalToControl,
  isValidTemporalControl,
} from './temporal-controls';
import { coerceValidDate, type LocalDateControlKind } from './date-controls';

export interface TemporalValueFormatOptions {
  kind?: LocalDateControlKind;
  locale?: string;
  calendarSystem?: DisplayCalendarSystem;
  dateInput?: DateEntryOptions;
  timeFormat?: 'locale' | '12h' | '24h';
  precision?: 'minute' | 'second';
  formatValue?: (value: string) => string;
}
/** Input is already projected into the user's civil date/time by the owning adapter. */
export function formatTemporalValue(
  value: string,
  options: TemporalValueFormatOptions = {},
  full = false,
): string {
  if (!full && options.formatValue) return options.formatValue(value);
  const locale = options.locale ?? options.dateInput?.locale ?? 'en-US';
  const kind = options.kind ?? 'date';
  const date = temporalDatePart(value);
  const clock = () =>
    formatClockControl(
      temporalTimePart(value),
      options.timeFormat === 'locale' || !options.timeFormat
        ? new Intl.DateTimeFormat(locale, { hour: 'numeric' }).resolvedOptions()
            .hour12
          ? '12h'
          : '24h'
        : options.timeFormat,
      options.precision,
      locale,
    );
  if (kind === 'time') return clock();
  if (!isValidIsoDate(date)) return value;
  const caption =
    !full && (options.dateInput?.format || options.dateInput?.formatValue)
      ? formatDateEntry(date, { ...options.dateInput, locale })
      : formatDisplayCalendarDate(
          date,
          locale,
          {
            month: 'short',
            day: 'numeric',
            ...(full ? { year: 'numeric' } : {}),
          },
          options.calendarSystem,
        );
  return kind === 'datetime' ? `${caption}, ${clock()}` : caption;
}
export function formatTemporalRange(
  from: string,
  to: string,
  options: TemporalValueFormatOptions = {},
): string {
  if (
    (options.kind ?? 'date') === 'date' &&
    !options.formatValue &&
    !options.dateInput?.format &&
    !options.dateInput?.formatValue &&
    (!options.calendarSystem || options.calendarSystem === 'gregory') &&
    isValidIsoDate(from) &&
    isValidIsoDate(to)
  )
    return formatCompactDateRangeDisplay(
      parseIsoDate(from),
      parseIsoDate(to),
      options.locale ?? 'en-US',
      'UTC',
    );
  return [from, to]
    .filter(Boolean)
    .map((value) => formatTemporalValue(value, options))
    .join(' – ');
}

/** Preserve invalid stored text instead of guessing dates from partial numeric strings. */
export function temporalDisplayControl(
  value: unknown,
  kind: LocalDateControlKind,
  timeZone?: string,
): string {
  if (value === null || value === undefined || value === '') return '';
  if (
    typeof value === 'string' &&
    !isValidTemporalControl(kind, value) &&
    !(
      isIsoDateTimeInput(value) &&
      isValidIsoDate(temporalDatePart(value)) &&
      coerceValidDate(value)
    )
  )
    return value;
  return temporalToControl(kind, value, timeZone) || String(value);
}
