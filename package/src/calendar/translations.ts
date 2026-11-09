import type { CalendarTranslations } from './types';

/** Complete English fallback used when a consumer does not override independent calendar text. */
export const DEFAULT_CALENDAR_TRANSLATIONS: Readonly<
  Required<CalendarTranslations>
> = Object.freeze({
  previousMonth: 'Previous month',
  nextMonth: 'Next month',
  previousYear: 'Previous year',
  nextYear: 'Next year',
  chooseMonth: 'Choose month',
  chooseYear: 'Choose year',
  weekNumber: 'Week number',
  calendar: 'Calendar',
  today: 'Today',
  invalidSelection: 'This date cannot be selected.',
});
