import { parseIsoCivilDate, resolveCivilBoundary } from './civil-time';
import {
  formatIsoDate,
  formatIsoDateTime,
  getIsoWeekdayUtc,
  isIsoDateTimeInput,
  normalizeIsoDate,
  isValidIsoDate,
  parseDateTime,
  parseIsoDate,
  toISODate,
  type ISODateString,
  type ISODateTimeString,
} from './iso';

export const MINUTE_IN_MS = 60 * 1000;
export const HOUR_IN_MS = 60 * MINUTE_IN_MS;
export const DAY_IN_MS = 24 * HOUR_IN_MS;
export const WEEK_IN_MS = 7 * DAY_IN_MS;
export const MINUTE_IN_DAYS = 1 / (24 * 60);

/**
 * Adds calendar days using UTC math.
 * Datetime inputs preserve datetime output; date-only inputs return date-only output.
 */
export function addDays(date: string, days: number): ISODateString {
  const nextDate = parseIsoDate(date);
  nextDate.setTime(nextDate.getTime() + days * DAY_IN_MS);
  return isIsoDateTimeInput(date)
    ? formatIsoDateTime(nextDate)
    : formatIsoDate(nextDate);
}

export function subtractDays(date: string, days: number): ISODateString {
  return addDays(date, days * -1);
}

export function addHours(date: string, hours: number): ISODateTimeString {
  const nextDate = parseIsoDate(date);
  nextDate.setUTCHours(nextDate.getUTCHours() + hours);
  return formatIsoDateTime(nextDate);
}

export function addMinutes(date: string, minutes: number): ISODateTimeString {
  const nextDate = parseIsoDate(date);
  nextDate.setUTCMinutes(nextDate.getUTCMinutes() + minutes);
  return formatIsoDateTime(nextDate);
}

export function addMonths(date: string, months: number): ISODateString {
  const [year, month] = normalizeIsoDate(date).split('-').map(Number);
  return toISODate(new Date(Date.UTC(year, month - 1 + months, 1)));
}

/** Adds calendar months while preserving the day-of-month, clamped to the target month. */
export function addCalendarMonths(date: string, months: number): ISODateString {
  const current = parseIsoDate(normalizeIsoDate(date));
  const targetFirst = new Date(
    Date.UTC(current.getUTCFullYear(), current.getUTCMonth() + months, 1),
  );
  const lastDay = new Date(
    Date.UTC(targetFirst.getUTCFullYear(), targetFirst.getUTCMonth() + 1, 0),
  ).getUTCDate();
  targetFirst.setUTCDate(Math.min(current.getUTCDate(), lastDay));
  return formatIsoDate(targetFirst);
}

export function diffInDays(startDate: string, endDate: string): number {
  return Math.round(
    (parseIsoDate(endDate).getTime() - parseIsoDate(startDate).getTime()) /
      DAY_IN_MS,
  );
}

export function diffInCalendarDays(startDate: string, endDate: string): number {
  const start = Date.UTC(...toUtcDateParts(startDate));
  const end = Date.UTC(...toUtcDateParts(endDate));
  return Math.round((end - start) / DAY_IN_MS);
}

/**
 * Returns the Gantt duration between two task dates.
 * Date-only ranges are inclusive; datetime ranges use elapsed days and keep a
 * non-zero positive duration at one minute minimum.
 */
export function diffInTaskDuration(startDate: string, endDate: string): number {
  if (isIsoDateTimeInput(startDate) || isIsoDateTimeInput(endDate)) {
    const elapsedDays =
      (parseIsoDate(endDate).getTime() - parseIsoDate(startDate).getTime()) /
      DAY_IN_MS;
    return elapsedDays < 0
      ? elapsedDays
      : Math.max(MINUTE_IN_DAYS, elapsedDays);
  }

  return diffInDays(startDate, endDate) + 1;
}

export function diffInHours(startDate: string, endDate: string): number {
  return Math.round(
    (parseIsoDate(endDate).getTime() - parseIsoDate(startDate).getTime()) /
      HOUR_IN_MS,
  );
}

export function diffInMinutes(startDate: string, endDate: string): number {
  return Math.round(
    (parseIsoDate(endDate).getTime() - parseIsoDate(startDate).getTime()) /
      MINUTE_IN_MS,
  );
}

export function compareIsoDates(left: string, right: string): number {
  return parseIsoDate(left).getTime() - parseIsoDate(right).getTime();
}

export function isBefore(left: string, right: string): boolean {
  return compareIsoDates(left, right) < 0;
}

export function isAfter(left: string, right: string): boolean {
  return compareIsoDates(left, right) > 0;
}

export function minDate(left: string, right: string): ISODateString {
  return (compareIsoDates(left, right) <= 0 ? left : right) as ISODateString;
}

export function maxDate(left: string, right: string): ISODateString {
  return (compareIsoDates(left, right) >= 0 ? left : right) as ISODateString;
}

export interface ISODateRange {
  readonly startDate: ISODateString;
  readonly endDate: ISODateString;
}

/**
 * Resolves the calendar dates occupied by a half-open datetime range
 * `[startDateTime, endDateTime)`. A zero or inverted range remains on the
 * start date so callers can handle invalid duration separately.
 */
export function getOccupiedDateRange(
  startDateTime: string,
  endDateTime: string,
  timeZone = 'UTC',
): ISODateRange {
  const start = parseDateTime(startDateTime);
  const end = parseDateTime(endDateTime);
  const occupiedEnd = new Date(Math.max(start.getTime(), end.getTime() - 1));
  return {
    startDate: toISODate(start, timeZone),
    endDate: toISODate(occupiedEnd, timeZone),
  };
}

export function shiftDate(date: string, deltaDays: number): ISODateString {
  return deltaDays === 0 ? (date as ISODateString) : addDays(date, deltaDays);
}

export function shiftDateRange<T extends ISODateRange>(
  range: T,
  deltaDays: number,
): T {
  if (deltaDays === 0) {
    return range;
  }

  return {
    ...range,
    startDate: shiftDate(range.startDate, deltaDays),
    endDate: shiftDate(range.endDate, deltaDays),
  };
}

export function shiftDateRanges<T extends ISODateRange>(
  ranges: readonly T[] | undefined,
  deltaDays: number,
): readonly T[] | undefined {
  if (!ranges || deltaDays === 0) {
    return ranges;
  }

  return ranges.map((range) => shiftDateRange(range, deltaDays));
}

export function startOfWeek(date: string): ISODateString {
  const nextDate = parseIsoDate(date);
  const day = getIsoWeekdayUtc(nextDate);
  nextDate.setUTCDate(nextDate.getUTCDate() - day + 1);
  return formatIsoDate(nextDate);
}

export function startOfMonth(date: string): ISODateString {
  const nextDate = parseIsoDate(date);
  nextDate.setUTCDate(1);
  return formatIsoDate(nextDate);
}

/** Returns the final UTC calendar date in the month containing `date`. */
export function endOfMonth(date: string): ISODateString {
  return subtractDays(addMonths(startOfMonth(date), 1), 1);
}

/**
 * Returns every date needed to render a natural four-to-six-week month grid,
 * including the leading and trailing dates from adjacent months.
 */
export function createCompletedMonthDateList(
  date: string,
  weekStartsOn: number,
): readonly ISODateString[] {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  const normalizedWeekStart = ((Math.trunc(weekStartsOn) % 7) + 7) % 7;
  const leading =
    (parseIsoDate(monthStart).getUTCDay() - normalizedWeekStart + 7) % 7;
  const trailing =
    (normalizedWeekStart + 6 - parseIsoDate(monthEnd).getUTCDay() + 7) % 7;
  return createDateList(
    subtractDays(monthStart, leading),
    addDays(monthEnd, trailing),
  );
}

export function startOfQuarter(date: string): ISODateString {
  const nextDate = parseIsoDate(date);
  const quarterStartMonth = Math.floor(nextDate.getUTCMonth() / 3) * 3;
  nextDate.setUTCMonth(quarterStartMonth, 1);
  return formatIsoDate(nextDate);
}

export function startOfYear(date: string): ISODateString {
  const nextDate = parseIsoDate(date);
  nextDate.setUTCMonth(0, 1);
  return formatIsoDate(nextDate);
}

export function endOfYear(date: string): ISODateString {
  return subtractDays(addMonths(startOfYear(date), 12), 1);
}

/** Returns the UTC Monday for the week containing `date`. */
export function getWeekStartIsoDate(date: Date): ISODateString {
  const utcMidnight = Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
  );
  const day = date.getUTCDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  return toISODate(new Date(utcMidnight + mondayOffset * DAY_IN_MS));
}

export function getMonthStartIsoDate(date: Date): ISODateString {
  return toISODate(
    new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1)),
  );
}

export function getIsoWeekNumber(date: Date): number {
  const utc = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
  const day = utc.getUTCDay() || 7;
  utc.setUTCDate(utc.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(utc.getUTCFullYear(), 0, 1));
  return Math.ceil(((utc.getTime() - yearStart.getTime()) / DAY_IN_MS + 1) / 7);
}

export function todayIsoDate(): ISODateString {
  return formatIsoDate(new Date());
}

/** Returns an inclusive date list and throws when the range is invalid. */
export function createDateList(
  startDate: string,
  endDate: string,
  options: { readonly maxDays?: number; readonly rangeLabel?: string } = {},
): readonly ISODateString[] {
  const start = normalizeIsoDate(startDate);
  const end = normalizeIsoDate(endDate);
  const dayCount = diffInCalendarDays(start, end);
  if (dayCount < 0) {
    throw new Error(
      `${options.rangeLabel ?? 'Date range'} end must be on or after start.`,
    );
  }
  if (options.maxDays !== undefined && dayCount + 1 > options.maxDays) {
    throw new Error(
      `${options.rangeLabel ?? 'Date range'} cannot exceed ${options.maxDays} visible days.`,
    );
  }
  return Array.from({ length: dayCount + 1 }, (_, index) =>
    addDays(start, index),
  );
}

/**
 * Returns an inclusive date list or `[]` for invalid input.
 * Use this when remote/user data should not throw during projection.
 */
export function createSafeDateList(
  startDate: string,
  endDate: string,
): readonly ISODateString[] {
  if (!isValidIsoDate(startDate) || !isValidIsoDate(endDate)) {
    return [];
  }

  const start = Date.parse(`${startDate}T00:00:00Z`);
  const end = Date.parse(`${endDate}T00:00:00Z`);
  if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) {
    return [];
  }

  return createDateList(startDate, endDate);
}

/** Tests overlap for half-open numeric ranges: `[start, end)` and `[rangeStart, rangeEnd)`. */
export function rangesOverlap(
  start: number,
  end: number,
  rangeStart: number,
  rangeEnd: number,
): boolean {
  return start < rangeEnd && end > rangeStart;
}

export interface ISODateBoundsRange {
  readonly start: string;
  readonly end: string;
}

/** Returns the UTC midnight timestamp for the date containing `value`. */
export function startOfUtcDayMs(value: string | number | Date): number {
  const date =
    typeof value === 'number'
      ? new Date(value)
      : typeof value === 'string'
        ? parseIsoDate(value)
        : value;
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

/** Returns half-open instant bounds for a civil date (UTC by default). */
export function getDateDayBounds(
  date: string,
  timeZone = 'UTC',
): {
  readonly startMs: number;
  readonly endMs: number;
} {
  if (timeZone !== 'UTC') {
    const start = parseIsoCivilDate(normalizeIsoDate(date))!;
    const end = parseIsoCivilDate(addDays(date, 1))!;
    return {
      startMs: resolveCivilBoundary(
        { ...start, hour: 0, minute: 0, second: 0 },
        timeZone,
      ).getTime(),
      endMs: resolveCivilBoundary(
        { ...end, hour: 0, minute: 0, second: 0 },
        timeZone,
      ).getTime(),
    };
  }
  const startMs = startOfUtcDayMs(date);
  return { startMs, endMs: startMs + DAY_IN_MS };
}

/** Returns half-open instant bounds for an inclusive civil date range (UTC by default). */
export function getDateRangeBounds(
  range: ISODateBoundsRange,
  timeZone = 'UTC',
): {
  readonly startMs: number;
  readonly endMs: number;
} {
  return {
    startMs: getDateDayBounds(range.start, timeZone).startMs,
    endMs: getDateDayBounds(addDays(range.end, 1), timeZone).startMs,
  };
}

function toUtcDateParts(date: string): [number, number, number] {
  const normalized = formatIsoDate(parseIsoDate(date));
  const [year, month, day] = normalized.split('-').map(Number);
  return [year, month - 1, day];
}
