import { addDays, DAY_IN_MS, diffInDays, subtractDays } from './date-math';
import {
  formatIsoDate,
  formatIsoDateTime,
  isIsoDateTimeInput,
  parseIsoDate,
  type ISODateString,
} from './iso';
import {
  CALENDAR_WORKING_DATE_SEARCH_LIMIT,
  getCalendarDateSchedule,
  type CalendarScheduleSource,
  type CalendarWorkingTimeRange,
  type CalendarResolvedWorkingTimeRange,
} from './calendars';

const MINUTE_IN_MS = 60 * 1000;

export type WorkingTimeRange = CalendarWorkingTimeRange;
type ResolvedWorkingTimeRange = CalendarResolvedWorkingTimeRange;

export interface WorkingCalendar extends CalendarScheduleSource {
  readonly holidays: readonly string[];
  readonly hoursPerDay?: number;
}

export interface WorkingDayOptions {
  readonly excludeHolidaysFromDuration: boolean;
}

export interface LagCalendarOptions {
  readonly lagCalendar: 'calendar-days' | 'working-days';
}

/** Checks a date against calendar working weekdays and holiday exclusions. */
export function isWorkingDate(
  date: ISODateString,
  calendar: WorkingCalendar | null | undefined,
): boolean {
  if (!calendar) {
    return true;
  }

  return getCalendarDateSchedule(date, calendar).isWorking;
}

/**
 * Moves forward until a working date is found.
 * Returns the original date when no working date is found before `iterationLimit`.
 */
export function moveToNextWorkingDate(
  date: ISODateString,
  calendar: WorkingCalendar | null | undefined,
  iterationLimit = CALENDAR_WORKING_DATE_SEARCH_LIMIT,
): ISODateString {
  if (!calendar) {
    return date;
  }

  let nextDate = date;

  for (let i = 0; i < iterationLimit; i += 1) {
    if (isWorkingDate(nextDate, calendar)) {
      return nextDate;
    }

    nextDate = addDays(nextDate, 1);
  }

  return date;
}

function hasWorkingTimeWindows(
  calendar: WorkingCalendar | null | undefined,
): boolean {
  return (
    !!calendar &&
    ((!!calendar.workingHours &&
      (!Array.isArray(calendar.workingHours) ||
        calendar.workingHours.length > 0)) ||
      calendar.weekdayWorkingHours !== undefined ||
      !!calendar.exceptions?.length)
  );
}

function getDateWorkingHours(
  date: ISODateString,
  calendar: WorkingCalendar,
): readonly ResolvedWorkingTimeRange[] {
  const schedule = getCalendarDateSchedule(date, calendar);
  if (!schedule.isWorking) return [];
  return schedule.workingHours.length
    ? schedule.workingHours
    : [{ startMinutes: 0, endMinutes: 1440 }];
}

function getUtcDayStartMs(date: Date): number {
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

function getUtcMinutes(date: Date): number {
  return (
    date.getUTCHours() * 60 +
    date.getUTCMinutes() +
    date.getUTCSeconds() / 60 +
    date.getUTCMilliseconds() / MINUTE_IN_MS
  );
}

function toDateTime(ms: number): ISODateString {
  return formatIsoDateTime(new Date(ms));
}

export function moveToNextWorkingDateTime(
  date: ISODateString,
  calendar: WorkingCalendar | null | undefined,
  iterationLimit = CALENDAR_WORKING_DATE_SEARCH_LIMIT,
): ISODateString {
  if (!calendar || !hasWorkingTimeWindows(calendar)) {
    return moveToNextWorkingDate(date, calendar, iterationLimit);
  }

  let current = parseIsoDate(date);

  for (let i = 0; i < iterationLimit; i += 1) {
    const dayDate = formatIsoDate(current);

    const workingHours = getDateWorkingHours(dayDate, calendar);
    if (workingHours.length) {
      const currentMinutes = getUtcMinutes(current);
      const dayStartMs = getUtcDayStartMs(current);

      for (const range of workingHours) {
        if (currentMinutes < range.endMinutes) {
          const rangeStartMs = dayStartMs + range.startMinutes * MINUTE_IN_MS;
          const startMs = Math.max(current.getTime(), rangeStartMs);
          return toDateTime(startMs);
        }
      }
    }

    current = new Date(getUtcDayStartMs(current) + DAY_IN_MS);
  }

  return date;
}

/**
 * Moves backward until a working date is found.
 * Returns the original date when no working date is found before `iterationLimit`.
 */
export function moveToPreviousWorkingDate(
  date: ISODateString,
  calendar: WorkingCalendar | null | undefined,
  iterationLimit = CALENDAR_WORKING_DATE_SEARCH_LIMIT,
): ISODateString {
  if (!calendar) {
    return date;
  }

  let previousDate = date;

  for (let i = 0; i < iterationLimit; i += 1) {
    if (isWorkingDate(previousDate, calendar)) {
      return previousDate;
    }

    previousDate = subtractDays(previousDate, 1);
  }

  return date;
}

/** Adds working days, excluding the start date from the counted offset. */
export function addWorkingDays(
  startDate: ISODateString,
  days: number,
  calendar: WorkingCalendar | null | undefined,
): ISODateString {
  if (days <= 0) {
    return startDate;
  }

  if (!calendar) {
    return addDays(startDate, days);
  }

  let nextDate = startDate;
  let remaining = days;

  for (let i = 0; i < 36600 && remaining > 0; i += 1) {
    nextDate = addDays(nextDate, 1);

    if (isWorkingDate(nextDate, calendar)) {
      remaining -= 1;
    }
  }

  return nextDate;
}

/** Subtracts working days, excluding the start date from the counted offset. */
export function subtractWorkingDays(
  startDate: ISODateString,
  days: number,
  calendar: WorkingCalendar | null | undefined,
): ISODateString {
  if (days <= 0) {
    return startDate;
  }

  if (!calendar) {
    return subtractDays(startDate, days);
  }

  let previousDate = startDate;
  let remaining = days;

  for (let i = 0; i < 36600 && remaining > 0; i += 1) {
    previousDate = subtractDays(previousDate, 1);

    if (isWorkingDate(previousDate, calendar)) {
      remaining -= 1;
    }
  }

  return previousDate;
}

/** Applies dependency lag using either calendar days or working days. */
export function offsetByLagCalendar(
  date: ISODateString,
  days: number,
  calendar: WorkingCalendar | null | undefined,
  options: LagCalendarOptions,
): ISODateString {
  if (days === 0) {
    return date;
  }

  if (options.lagCalendar === 'working-days') {
    return days > 0
      ? addWorkingDays(date, days, calendar)
      : subtractWorkingDays(date, Math.abs(days), calendar);
  }

  return addDays(date, days);
}

/**
 * Resolves a task end date from start and duration.
 * Date-only durations are inclusive; datetime durations support fractional days.
 */
export function resolveTaskEndDate(
  startDate: ISODateString,
  duration: number,
  calendar: WorkingCalendar | null | undefined,
  options: WorkingDayOptions,
): ISODateString {
  if (duration === 0) {
    return startDate;
  }

  if (isIsoDateTimeInput(startDate)) {
    const durationForDateTime = Math.max(duration, 0);
    if (
      options.excludeHolidaysFromDuration &&
      hasWorkingTimeWindows(calendar)
    ) {
      return addWorkingDateTimeDuration(
        startDate,
        durationForDateTime,
        calendar,
      );
    }
    if (options.excludeHolidaysFromDuration) {
      const workingDate = addWorkingDays(
        startDate,
        Math.max(Math.ceil(durationForDateTime) - 1, 0),
        calendar,
      );
      const fractionalDays = durationForDateTime % 1;
      return fractionalDays > 0
        ? addDays(workingDate, fractionalDays)
        : workingDate;
    }
    return addDays(startDate, durationForDateTime);
  }

  if (options.excludeHolidaysFromDuration && !Number.isInteger(duration)) {
    if (calendar && hasWorkingTimeWindows(calendar)) {
      const date = parseIsoDate(moveToNextWorkingDate(startDate, calendar));
      const workingHours = getDateWorkingHours(formatIsoDate(date), calendar);
      if (!workingHours.length) return startDate;
      date.setUTCHours(0, workingHours[0].startMinutes, 0, 0);
      return addWorkingDateTimeDuration(
        formatIsoDateTime(date),
        Math.max(duration, 0),
        calendar,
      );
    }
  }

  return options.excludeHolidaysFromDuration
    ? addWorkingDays(startDate, Math.max(duration - 1, 0), calendar)
    : addDays(startDate, Math.max(duration - 1, 0));
}

function addWorkingDateTimeDuration(
  startDate: ISODateString,
  duration: number,
  calendar: WorkingCalendar | null | undefined,
): ISODateString {
  if (!calendar || duration <= 0) {
    return startDate;
  }

  const hoursPerDay =
    Number.isFinite(calendar.hoursPerDay) && (calendar.hoursPerDay ?? 0) > 0
      ? calendar.hoursPerDay!
      : 24;
  let remainingMs = duration * hoursPerDay * 60 * MINUTE_IN_MS;
  let current = parseIsoDate(startDate);

  for (let i = 0; i < 36600 && remainingMs > 0; i += 1) {
    const dayStartMs = getUtcDayStartMs(current);
    const workingHours = getDateWorkingHours(formatIsoDate(current), calendar);

    for (const range of workingHours) {
      const rangeStartMs = dayStartMs + range.startMinutes * MINUTE_IN_MS;
      const rangeEndMs = dayStartMs + range.endMinutes * MINUTE_IN_MS;
      const cursorMs = Math.max(current.getTime(), rangeStartMs);

      if (cursorMs >= rangeEndMs) {
        continue;
      }

      const availableMs = rangeEndMs - cursorMs;
      if (remainingMs <= availableMs) {
        return toDateTime(cursorMs + remainingMs);
      }

      remainingMs -= availableMs;
      current = new Date(rangeEndMs);
    }

    current = new Date(dayStartMs + DAY_IN_MS);
  }

  return toDateTime(current.getTime());
}

function subtractWorkingDateTimeDuration(
  endDate: ISODateString,
  duration: number,
  calendar: WorkingCalendar | null | undefined,
): ISODateString {
  if (!calendar || duration <= 0) {
    return endDate;
  }

  const hoursPerDay =
    Number.isFinite(calendar.hoursPerDay) && (calendar.hoursPerDay ?? 0) > 0
      ? calendar.hoursPerDay!
      : 24;
  let remainingMs = duration * hoursPerDay * 60 * MINUTE_IN_MS;
  let dayStartMs = getUtcDayStartMs(parseIsoDate(endDate));
  let limitMs = parseIsoDate(endDate).getTime();

  for (let i = 0; i < 36600 && remainingMs > 0; i += 1) {
    const dayDate = formatIsoDate(new Date(dayStartMs));

    const workingHours = getDateWorkingHours(dayDate, calendar);
    if (workingHours.length) {
      for (
        let rangeIndex = workingHours.length - 1;
        rangeIndex >= 0;
        rangeIndex -= 1
      ) {
        const range = workingHours[rangeIndex];
        const rangeStartMs = dayStartMs + range.startMinutes * MINUTE_IN_MS;
        const rangeEndMs = dayStartMs + range.endMinutes * MINUTE_IN_MS;
        const cursorMs = Math.min(limitMs, rangeEndMs);

        if (cursorMs <= rangeStartMs) {
          continue;
        }

        const availableMs = cursorMs - rangeStartMs;
        if (remainingMs <= availableMs) {
          return toDateTime(cursorMs - remainingMs);
        }

        remainingMs -= availableMs;
      }
    }

    dayStartMs -= DAY_IN_MS;
    limitMs = dayStartMs + DAY_IN_MS;
  }

  return toDateTime(limitMs);
}

/**
 * Resolves a task start date from end and duration.
 * Date-only durations are inclusive; datetime durations support fractional days.
 */
export function resolveTaskStartDateFromEnd(
  endDate: ISODateString,
  duration: number,
  calendar: WorkingCalendar | null | undefined,
  options: WorkingDayOptions,
): ISODateString {
  if (duration === 0) {
    return endDate;
  }

  if (isIsoDateTimeInput(endDate)) {
    const durationForDateTime = Math.max(duration, 0);
    if (
      options.excludeHolidaysFromDuration &&
      hasWorkingTimeWindows(calendar)
    ) {
      return subtractWorkingDateTimeDuration(
        endDate,
        durationForDateTime,
        calendar,
      );
    }
    if (options.excludeHolidaysFromDuration) {
      const workingDate = subtractWorkingDays(
        endDate,
        Math.max(Math.ceil(durationForDateTime) - 1, 0),
        calendar,
      );
      const fractionalDays = durationForDateTime % 1;
      return fractionalDays > 0
        ? subtractDays(workingDate, fractionalDays)
        : workingDate;
    }
    return subtractDays(endDate, durationForDateTime);
  }

  if (
    options.excludeHolidaysFromDuration &&
    !Number.isInteger(duration) &&
    calendar &&
    hasWorkingTimeWindows(calendar)
  ) {
    const date = parseIsoDate(moveToPreviousWorkingDate(endDate, calendar));
    const workingHours = getDateWorkingHours(formatIsoDate(date), calendar);
    if (!workingHours.length) return endDate;
    date.setUTCHours(0, workingHours[workingHours.length - 1].endMinutes, 0, 0);
    return subtractWorkingDateTimeDuration(
      formatIsoDateTime(date),
      Math.max(duration, 0),
      calendar,
    );
  }

  return options.excludeHolidaysFromDuration
    ? subtractWorkingDays(endDate, Math.max(duration - 1, 0), calendar)
    : subtractDays(endDate, Math.max(duration - 1, 0));
}

/** Counts working dates inclusively between start and end. */
export function countWorkingDaysInclusive(
  startDate: ISODateString,
  endDate: ISODateString,
  calendar: WorkingCalendar | null | undefined,
): number {
  const startDay = formatIsoDate(parseIsoDate(startDate));
  const endDay = formatIsoDate(parseIsoDate(endDate));

  if (diffInDays(startDay, endDay) < 0) {
    return 0;
  }

  let currentDate = startDay;
  let days = 0;

  for (let i = 0; i < 36600; i += 1) {
    if (isWorkingDate(currentDate, calendar)) {
      days += 1;
    }
    if (currentDate === endDay) {
      break;
    }
    currentDate = addDays(currentDate, 1);
  }

  return days;
}

export function countWorkingDuration(
  startDate: ISODateString,
  endDate: ISODateString,
  calendar: WorkingCalendar | null | undefined,
): number {
  if (
    !isIsoDateTimeInput(startDate) ||
    !isIsoDateTimeInput(endDate) ||
    !calendar ||
    !hasWorkingTimeWindows(calendar)
  ) {
    return countWorkingDaysInclusive(startDate, endDate, calendar);
  }

  const start = parseIsoDate(startDate).getTime();
  const end = parseIsoDate(endDate).getTime();

  if (end <= start) {
    return 0;
  }

  let totalMs = 0;
  let currentDayStart = getUtcDayStartMs(parseIsoDate(startDate));
  const endDayStart = getUtcDayStartMs(parseIsoDate(endDate));

  for (let i = 0; i < 36600 && currentDayStart <= endDayStart; i += 1) {
    const dayDate = formatIsoDate(new Date(currentDayStart));

    const workingHours = getDateWorkingHours(dayDate, calendar);
    if (workingHours.length) {
      for (const range of workingHours) {
        const rangeStart = currentDayStart + range.startMinutes * MINUTE_IN_MS;
        const rangeEnd = currentDayStart + range.endMinutes * MINUTE_IN_MS;
        const overlapStart = Math.max(start, rangeStart);
        const overlapEnd = Math.min(end, rangeEnd);

        if (overlapEnd > overlapStart) {
          totalMs += overlapEnd - overlapStart;
        }
      }
    }

    currentDayStart += DAY_IN_MS;
  }

  return totalMs / DAY_IN_MS;
}

/**
 * Snaps a date to the nearest working date in the requested direction.
 * Returns the original date when no working date is found before `iterationLimit`.
 */
export function snapToWorkingDate(
  date: ISODateString,
  calendar: WorkingCalendar | null | undefined,
  direction: 'forward' | 'back' = 'forward',
  iterationLimit = 366,
): ISODateString {
  if (!calendar) {
    return date;
  }

  const step = direction === 'forward' ? 1 : -1;
  let current = date;

  for (let i = 0; i < iterationLimit; i += 1) {
    if (isWorkingDate(current, calendar)) {
      return current;
    }
    current = addDays(current, step);
  }

  return date;
}

/** Counts ISO weekdays inclusively with no holidays, without iterating over the full range. */
export function countWeekdaysInclusive(
  startDate: string,
  endDate: string,
): number {
  const start = parseIsoDate(startDate);
  const end = parseIsoDate(endDate);
  if (!Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime()))
    return 0;
  const first = parseIsoDate(formatIsoDate(start));
  const last = parseIsoDate(formatIsoDate(end));
  const total = Math.round((last.getTime() - first.getTime()) / DAY_IN_MS) + 1;
  if (total <= 0) return 0;
  let count = Math.floor(total / 7) * 5;
  for (let offset = 0; offset < total % 7; offset++) {
    const day = (first.getUTCDay() + offset) % 7;
    if (day !== 0 && day !== 6) count++;
  }
  return count;
}

/** Advances by a finite count of UTC Monday-Friday dates, excluding the start date; no holiday exclusions. */
export function addUtcWeekdays(value: Date, days: number): Date {
  if (!Number.isFinite(days) || days < 0)
    throw new RangeError('Weekday offset must be finite and non-negative.');
  const date = new Date(value.getTime());
  if (!Number.isFinite(date.getTime()))
    throw new RangeError('Weekday start must be a valid Date.');
  let remaining = days;
  while (remaining > 0) {
    date.setUTCDate(date.getUTCDate() + 1);
    if (!Number.isFinite(date.getTime()))
      throw new RangeError('Weekday offset exceeds the Date range.');
    const weekday = date.getUTCDay();
    if (weekday !== 0 && weekday !== 6) remaining -= 1;
  }
  return date;
}
