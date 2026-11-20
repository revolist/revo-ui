import {
  compareIsoDates,
  formatIsoDateInTimeZone,
  isValidIsoDate,
  startOfDisplayMonth,
  todayIsoDate,
  type ISODateString,
} from '@revolist/ui-dates';
import type { CalendarProps } from './types';

export const MIN_CALENDAR_DATE: ISODateString = '0000-01-01';
export const MAX_CALENDAR_DATE: ISODateString = '9999-12-31';

type CalendarReferenceOptions = Pick<
  CalendarProps,
  'referenceDate' | 'referenceInstant' | 'timeZone'
>;

export function resolveCalendarReferenceDate(
  options: CalendarReferenceOptions,
): ISODateString | undefined {
  const { referenceDate, referenceInstant, timeZone } = options;
  if (referenceDate !== undefined) return referenceDate;
  if (referenceInstant || timeZone !== undefined)
    return formatIsoDateInTimeZone(
      referenceInstant ?? new Date(),
      timeZone ?? 'UTC',
    );
}

export function getCalendarInitialDate(
  options: CalendarReferenceOptions &
    Pick<
      CalendarProps,
      'minDate' | 'maxDate' | 'startMonth' | 'endMonth' | 'calendarSystem'
    >,
  selected?: ISODateString,
): ISODateString {
  if (isValidIsoDate(selected)) return selected;
  const { minDate, maxDate, startMonth, endMonth, calendarSystem } = options;
  const reference = resolveCalendarReferenceDate(options);
  let date = isValidIsoDate(reference) ? reference : todayIsoDate();
  const month = startOfDisplayMonth(date, calendarSystem);
  if (
    isValidIsoDate(startMonth) &&
    compareIsoDates(month, startOfDisplayMonth(startMonth, calendarSystem)) < 0
  )
    date = startMonth;
  if (
    isValidIsoDate(endMonth) &&
    compareIsoDates(month, startOfDisplayMonth(endMonth, calendarSystem)) > 0
  )
    date = endMonth;
  if (minDate && date < minDate) return minDate;
  if (maxDate && date > maxDate) return maxDate;
  return date;
}
