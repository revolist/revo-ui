import {
  addDisplayMonths,
  startOfDisplayMonth,
  endOfDisplayMonth,
  type DisplayCalendarSystem,
  addDays,
  compareIsoDates,
  diffInDays,
  getUtcWeekday,
  isValidIsoDate,
  type ISODateString,
} from '@revolist/ui-dates';

import { MAX_CALENDAR_DATE, MIN_CALENDAR_DATE } from './reference-date';
import type {
  CalendarDateRange,
  CalendarWeekStart,
  MoveCalendarFocusOptions,
} from './types';

export function createCalendarMonth(
  month: ISODateString,
  weekStartsOn: CalendarWeekStart,
  fixedWeeks = true,
  system: DisplayCalendarSystem = 'gregory',
): readonly ISODateString[] {
  const start = startOfDisplayMonth(month, system);
  const first = addDays(
    start,
    -((getUtcWeekday(start) - weekStartsOn + 7) % 7),
  );
  const last = endOfDisplayMonth(start, system);
  const weeks = Math.ceil((diffInDays(first, last) + 1) / 7);
  return Array.from({ length: (fixedWeeks ? Math.max(6, weeks) : weeks) * 7 },
    (_, index) => addDays(first, index));
}

export function orderCalendarRange(
  from: ISODateString,
  to: ISODateString,
): CalendarDateRange {
  return compareIsoDates(from, to) <= 0 ? { from, to } : { from: to, to: from };
}

export function isDateInCalendarRange(
  date: ISODateString,
  range?: CalendarDateRange,
): boolean {
  return (
    !!range &&
    compareIsoDates(date, range.from) >= 0 &&
    compareIsoDates(date, range.to) <= 0
  );
}

export function isCalendarDateDisabled(
  date: ISODateString,
  options: Pick<MoveCalendarFocusOptions, 'minDate' | 'maxDate' | 'isDisabled'>,
): boolean {
  return !!(
    (options.minDate && compareIsoDates(date, options.minDate) < 0) ||
    (options.maxDate && compareIsoDates(date, options.maxDate) > 0) ||
    options.isDisabled?.(date)
  );
}

export function isCalendarMonthDisabled(
  month: ISODateString,
  options: Pick<MoveCalendarFocusOptions, 'minDate' | 'maxDate'> & {
    readonly isMonthDisabled?: (month: ISODateString) => boolean;
    readonly calendarSystem?: DisplayCalendarSystem;
  },
): boolean {
  const start = startOfDisplayMonth(month, options.calendarSystem);
  return !!(
    (options.minDate &&
      compareIsoDates(
        endOfDisplayMonth(start, options.calendarSystem),
        options.minDate,
      ) < 0) ||
    (options.maxDate && compareIsoDates(start, options.maxDate) > 0) ||
    options.isMonthDisabled?.(start)
  );
}

export function moveCalendarFocus(
  options: MoveCalendarFocusOptions,
): ISODateString | undefined {
  const { date, key, shiftKey, weekStartsOn } = options;
  const weekdayOffset = (getUtcWeekday(date) - weekStartsOn + 7) % 7;
  let next: ISODateString | undefined;
  let step = 0;

  if (key === 'ArrowLeft')
    [next, step] =
      options.dir === 'rtl' ? [addDays(date, 1), 1] : [addDays(date, -1), -1];
  if (key === 'ArrowRight')
    [next, step] =
      options.dir === 'rtl' ? [addDays(date, -1), -1] : [addDays(date, 1), 1];
  if (key === 'ArrowUp') [next, step] = [addDays(date, -7), -7];
  if (key === 'ArrowDown') [next, step] = [addDays(date, 7), 7];
  if (key === 'Home') [next, step] = [addDays(date, -weekdayOffset), 1];
  if (key === 'End') [next, step] = [addDays(date, 6 - weekdayOffset), -1];
  if (key === 'PageUp')
    [next, step] = [
      addDisplayMonths(date, shiftKey ? -12 : -1, options.calendarSystem, true),
      -1,
    ];
  if (key === 'PageDown')
    [next, step] = [
      addDisplayMonths(date, shiftKey ? 12 : 1, options.calendarSystem, true),
      1,
    ];
  if (!next) return;
  if (!isValidIsoDate(next)) {
    if (key === 'Home') next = MIN_CALENDAR_DATE;
    else if (key === 'End') next = MAX_CALENDAR_DATE;
  }

  const isAvailable = (candidate: ISODateString) =>
    isValidIsoDate(candidate) && !isCalendarDateDisabled(candidate, options);
  if (isAvailable(next)) return next;
  if (key === 'PageDown' || key === 'PageUp') {
    const start = startOfDisplayMonth(next, options.calendarSystem);
    const end = endOfDisplayMonth(next, options.calendarSystem);
    // Prefer the nearest enabled day in the requested month, including
    // when the original day has already clamped to that month's last day.
    for (let offset = 1; offset < 31; offset++) {
      const candidates = [
        addDays(next, offset * step),
        addDays(next, -offset * step),
      ];
      const available = candidates.find(
        (date) =>
          compareIsoDates(date, start) >= 0 &&
          compareIsoDates(date, end) <= 0 &&
          isAvailable(date),
      );
      if (available) return available;
    }
  }
  for (let attempts = 0; attempts < 3660 && isValidIsoDate(next); attempts++) {
    if (
      (step < 0 && options.minDate && compareIsoDates(next, options.minDate) < 0) ||
      (step > 0 && options.maxDate && compareIsoDates(next, options.maxDate) > 0)
    )
      return;
    next = addDays(next, step);
    if (isAvailable(next)) return next;
  }
}
