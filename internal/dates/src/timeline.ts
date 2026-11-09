import { coerceValidDate } from './coercion';
import {
  addDays,
  addHours,
  addMinutes,
  addMonths,
  startOfMonth,
  startOfQuarter,
  startOfYear,
} from './date-math';
import {
  formatIsoDate,
  formatIsoDateTime,
  isIsoDateTimeInput,
  parseIsoDate,
  type ISODateString,
  type ISODateTimeString,
} from './iso';

const timelineDateFormatters = new Map<string, Intl.DateTimeFormat>();

export type TimelineUnit =
  | 'minute'
  | 'hour'
  | 'day'
  | 'week'
  | 'month'
  | 'quarter'
  | 'year';
export type TimelineWeekStartsOn = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export function normalizeTimelineWeekStartsOn(
  value: unknown,
): TimelineWeekStartsOn {
  return typeof value === 'number' &&
    Number.isInteger(value) &&
    value >= 0 &&
    value <= 6
    ? (value as TimelineWeekStartsOn)
    : 0;
}

const TIMELINE_OFFSET_DATETIME_PATTERN =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?(?:Z|[+-]\d{2}:\d{2})$/i;

/** Parses a timeline row value only when it identifies one unambiguous instant. */
export function parseTimelineInstantValue(value: unknown): Date | undefined {
  if (value instanceof Date || typeof value === 'number')
    return coerceValidDate(value);
  if (typeof value !== 'string') return;
  const candidate = value.trim();
  const match = TIMELINE_OFFSET_DATETIME_PATTERN.exec(candidate);
  if (!match) return;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const hour = Number(match[4]);
  const minute = Number(match[5]);
  const second = Number(match[6] ?? 0);
  const civil = new Date(0);
  civil.setUTCFullYear(year, month - 1, day);
  civil.setUTCHours(hour, minute, second, 0);
  if (
    civil.getUTCFullYear() !== year ||
    civil.getUTCMonth() !== month - 1 ||
    civil.getUTCDate() !== day ||
    civil.getUTCHours() !== hour ||
    civil.getUTCMinutes() !== minute ||
    civil.getUTCSeconds() !== second
  )
    return;
  const date = new Date(candidate);
  return Number.isFinite(date.getTime()) ? date : undefined;
}

export function startOfTimelineWeek(
  date: string,
  weekStartsOn: TimelineWeekStartsOn,
): ISODateString {
  const nextDate = parseIsoDate(date);
  const day = nextDate.getUTCDay();
  const offset = (day - weekStartsOn + 7) % 7;
  nextDate.setUTCDate(nextDate.getUTCDate() - offset);
  return formatIsoDate(nextDate);
}

/** Parses a timeline boundary as UTC for deterministic scale math. */
export function parseTimelineDateValue(date: string): Date {
  return parseIsoDate(date);
}

/**
 * Returns the UTC-aligned start for a timeline unit.
 * Intraday units preserve datetime precision; day and larger units return date-only values.
 */
export function startOfTimelineUnit(
  unit: TimelineUnit,
  date: string,
  weekStartsOn: TimelineWeekStartsOn = 0,
): ISODateString | ISODateTimeString {
  if (unit === 'hour') {
    return startOfHour(date);
  }

  if (unit === 'minute') {
    return startOfMinute(date);
  }

  const dateOnly = formatIsoDate(parseTimelineDateValue(date));
  switch (unit) {
    case 'week':
      return startOfTimelineWeek(
        dateOnly,
        normalizeTimelineWeekStartsOn(weekStartsOn),
      );
    case 'month':
      return startOfMonth(dateOnly);
    case 'quarter':
      return startOfQuarter(dateOnly);
    case 'year':
      return startOfYear(dateOnly);
    case 'day':
    default:
      return dateOnly;
  }
}

/** Adds a timeline unit while preserving the timeline's UTC normalization rules. */
export function addTimelineUnit(
  unit: TimelineUnit,
  date: string,
  amount: number,
): ISODateString | ISODateTimeString {
  if (unit === 'minute') {
    return addMinutes(date, amount);
  }
  if (unit === 'hour') {
    return addHours(date, amount);
  }

  const dateOnly = formatIsoDate(parseTimelineDateValue(date));
  switch (unit) {
    case 'week':
      return addDays(dateOnly, amount * 7);
    case 'month':
      return addMonths(dateOnly, amount);
    case 'quarter':
      return addMonths(dateOnly, amount * 3);
    case 'year':
      return addTimelineYears(dateOnly, amount);
    case 'day':
    default:
      return addDays(dateOnly, amount);
  }
}

/**
 * Converts an inclusive Gantt date boundary to an exclusive timeline boundary.
 * Datetime values already represent instants and are returned unchanged.
 */
export function getTimelineEndExclusiveDate(
  date: string,
): ISODateString | ISODateTimeString {
  return isIsoDateTimeInput(date)
    ? formatIsoDateTime(parseTimelineDateValue(date))
    : addDays(date, 1);
}

export function getTimelineQuarter(date: string): number {
  return Math.floor(parseTimelineDateValue(date).getUTCMonth() / 3) + 1;
}

/** Formats timeline labels with a cached formatter; UTC remains the default timezone. */
export function formatTimelineDateLabel(
  date: string | Date,
  locale: string,
  options: Intl.DateTimeFormatOptions,
  timeZone = 'UTC',
): string {
  const resolvedOptions = {
    ...options,
    timeZone,
  };
  const formatterKey = `${locale}:${JSON.stringify(resolvedOptions)}`;
  let formatter = timelineDateFormatters.get(formatterKey);

  if (!formatter) {
    formatter = new Intl.DateTimeFormat(locale, resolvedOptions);
    timelineDateFormatters.set(formatterKey, formatter);
  }

  return formatter.format(
    typeof date === 'string' ? parseTimelineDateValue(date) : date,
  );
}

/** Formats the compact weekday/day tier used below an enclosing month label. */
export function formatTimelineCompactWeekdayDayLabel(
  date: string | Date,
  locale: string,
  timeZone = 'UTC',
): string {
  const weekday = formatTimelineDateLabel(
    date,
    locale,
    { weekday: 'short' },
    timeZone,
  );
  const day = formatTimelineDateLabel(
    date,
    locale,
    { day: 'numeric' },
    timeZone,
  );
  return `${weekday} ${day}`;
}

export function startOfHour(date: string): ISODateTimeString {
  const nextDate = parseIsoDate(date);
  nextDate.setUTCMinutes(0, 0, 0);
  return formatIsoDateTime(nextDate);
}

export function startOfMinute(date: string): ISODateTimeString {
  const nextDate = parseIsoDate(date);
  nextDate.setUTCSeconds(0, 0);
  return formatIsoDateTime(nextDate);
}

function addTimelineYears(date: string, years: number): ISODateString {
  const nextDate = parseIsoDate(date);
  nextDate.setUTCFullYear(nextDate.getUTCFullYear() + years, 0, 1);
  return formatIsoDate(nextDate);
}
