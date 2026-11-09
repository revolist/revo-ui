import { addDays, diffInDays } from './date-math';
import { parseIsoDate, getUtcWeekday, type ISODateString } from './iso';

/** Display systems with twelve months. Values always remain Gregorian ISO civil dates. */
export type DisplayCalendarSystem = 'gregory' | 'persian' | 'islamic-umalqura';
const formatters = new Map<string, Intl.DateTimeFormat>();
function formatter(
  locale: string,
  system: DisplayCalendarSystem,
  options: Intl.DateTimeFormatOptions,
) {
  const key = JSON.stringify([locale, system, options]);
  let value = formatters.get(key);
  if (!value) {
    value = new Intl.DateTimeFormat(locale, {
      ...options,
      calendar: system,
      timeZone: 'UTC',
    });
    if (value.resolvedOptions().calendar !== system)
      throw new RangeError(`Unsupported calendar: ${system}`);
    formatters.set(key, value);
  }
  return value;
}
export function formatDisplayCalendarDate(
  date: ISODateString,
  locale: string,
  options: Intl.DateTimeFormatOptions,
  system: DisplayCalendarSystem = 'gregory',
): string {
  return formatter(locale, system, options).format(parseIsoDate(date));
}
export function getDisplayCalendarParts(
  date: ISODateString,
  system: DisplayCalendarSystem = 'gregory',
) {
  if (system === 'gregory') {
    const value = parseIsoDate(date);
    return {
      year: value.getUTCFullYear(),
      month: value.getUTCMonth() + 1,
      day: value.getUTCDate(),
    };
  }
  const parts = formatter('en-US-u-nu-latn', system, {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  }).formatToParts(parseIsoDate(date));
  const part = (type: string) =>
    Number(parts.find((value) => value.type === type)?.value);
  return { year: part('year'), month: part('month'), day: part('day') };
}
export function startOfDisplayMonth(
  date: ISODateString,
  system: DisplayCalendarSystem = 'gregory',
): ISODateString {
  return addDays(date, 1 - getDisplayCalendarParts(date, system).day);
}
export function addDisplayMonths(
  date: ISODateString,
  count: number,
  system: DisplayCalendarSystem = 'gregory',
  preserveDay = false,
): ISODateString {
  if (!Number.isInteger(count) || Math.abs(count) > 12000)
    throw new RangeError(
      'Month offset must be an integer within 12000 months.',
    );
  let start = startOfDisplayMonth(date, system);
  for (let index = 0; index < Math.abs(count); index++) {
    start = startOfDisplayMonth(addDays(start, count > 0 ? 32 : -1), system);
  }
  if (!preserveDay) return start;
  const days = diffInDays(
    start,
    startOfDisplayMonth(addDays(start, 32), system),
  );
  return addDays(
    start,
    Math.min(getDisplayCalendarParts(date, system).day, days) - 1,
  );
}
export function endOfDisplayMonth(
  date: ISODateString,
  system: DisplayCalendarSystem = 'gregory',
) {
  return addDays(addDisplayMonths(date, 1, system), -1);
}
export function displayYearMonths(
  date: ISODateString,
  system: DisplayCalendarSystem = 'gregory',
): readonly ISODateString[] {
  const start = addDisplayMonths(
    date,
    1 - getDisplayCalendarParts(date, system).month,
    system,
  );
  return Array.from({ length: 12 }, (_, index) =>
    addDisplayMonths(start, index, system),
  );
}
/** Week numbers can follow ISO rules or a locale's configured first week. */
export function displayWeekNumber(
  date: ISODateString,
  weekStartsOn = 1,
  firstWeekContainsDate = 4,
  system: DisplayCalendarSystem = 'gregory',
): number {
  const firstWeek = (year: ISODateString) => {
    const anchor = addDays(year, firstWeekContainsDate - 1);
    return addDays(anchor, -((getUtcWeekday(anchor) - weekStartsOn + 7) % 7));
  };
  let year = displayYearMonths(date, system)[0];
  if (date < firstWeek(year)) year = addDisplayMonths(year, -12, system);
  else if (date >= firstWeek(addDisplayMonths(year, 12, system)))
    year = addDisplayMonths(year, 12, system);
  return Math.floor(diffInDays(firstWeek(year), date) / 7) + 1;
}
