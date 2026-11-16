/** Framework-independent date utilities. Validate untrusted strings before date math. */
export {
  type ISODateString,
  type ISODateTimeString,
  isValidIsoDate,
  isValidIsoDateTime,
  parseIsoDate,
  formatIsoDate,
  formatIsoDateTime,
} from '@revolist/ui-dates/iso';
export {
  addDays,
  subtractDays,
  diffInCalendarDays,
  startOfMonth,
  endOfMonth,
  compareIsoDates,
} from '@revolist/ui-dates/date-math';
export { formatCalendarDateDisplay } from '@revolist/ui-dates/display';
