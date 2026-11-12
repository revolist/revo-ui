import {
  addDisplayMonths,
  startOfDisplayMonth,
  endOfDisplayMonth,
  type DisplayCalendarSystem,
  addDays,
  compareIsoDates,
  getUtcWeekday,
  type ISODateString,
} from '@revolist/ui-dates';

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
  const dates: ISODateString[] = [];
  for (
    let next = first;
    next <= last || dates.length % 7;
    next = addDays(next, 1)
  )
    dates.push(next);
  if (!fixedWeeks || dates.length >= 42) return dates;
  const result = [...dates];
  while (result.length < 42) result.push(addDays(result[result.length - 1], 1));
  return result;
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

  for (
    let attempts = 0;
    attempts < 3660 && isCalendarDateDisabled(next, options);
    attempts++
  ) {
    next = addDays(next, step);
  }
  return isCalendarDateDisabled(next, options) ? undefined : next;
}
