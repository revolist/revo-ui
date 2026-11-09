import { isValidIsoDate, type ISODateString } from './iso';
import { formatDisplayCalendarDate } from './display-calendar';
export interface DateEntryOptions {
  /** Numeric Gregorian input; ISO is accepted in every mode. */
  format?: 'iso' | 'eu' | 'us' | 'locale';
  locale?: string;
  parse?: (text: string) => string | undefined;
  formatValue?: (date: ISODateString) => string;
}
function localeFor(options: DateEntryOptions) {
  return options.format === 'eu'
    ? 'en-GB'
    : options.format === 'us'
      ? 'en-US'
      : options.locale;
}
function parts(options: DateEntryOptions) {
  return new Intl.DateTimeFormat(localeFor(options), {
    calendar: 'gregory',
    timeZone: 'UTC',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).formatToParts(new Date('2006-11-22T00:00:00Z'));
}
export function dateEntryPlaceholder(options: DateEntryOptions = {}): string {
  if (!options.format || options.format === 'iso') return 'YYYY-MM-DD';
  return parts(options)
    .map((part) =>
      part.type === 'year'
        ? 'YYYY'
        : part.type === 'month'
          ? 'MM'
          : part.type === 'day'
            ? 'DD'
            : part.value,
    )
    .join('');
}
export function formatDateEntry(
  date: string,
  options: DateEntryOptions = {},
): string {
  if (!isValidIsoDate(date)) return date;
  if (options.formatValue) return options.formatValue(date);
  if (!options.format || options.format === 'iso') return date;
  return formatDisplayCalendarDate(
    date,
    localeFor(options) ?? new Intl.DateTimeFormat().resolvedOptions().locale,
    {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    },
  );
}
/** Strict civil parsing; never rely on Date's rollover or ambiguous string parser. */
export function parseDateEntry(
  text: string,
  options: DateEntryOptions = {},
): ISODateString | undefined {
  const value = text.trim();
  if (isValidIsoDate(value)) return value;
  if (options.parse) {
    const parsed = options.parse(value);
    return isValidIsoDate(parsed) ? parsed : undefined;
  }
  if (!options.format || options.format === 'iso') return;
  let normalized = value.normalize('NFKC').replace(/[\u200e\u200f\u061c]/g, '');
  const numbers = new Intl.NumberFormat(localeFor(options), {
    useGrouping: false,
  });
  for (let digit = 0; digit < 10; digit++)
    normalized = normalized.split(numbers.format(digit)).join(String(digit));
  const values = normalized.split(/[./\-\s]+/);
  const order = parts(options).filter((part) =>
    ['year', 'month', 'day'].includes(part.type),
  );
  if (values.length !== 3 || values.some((value) => !/^\d{1,4}$/.test(value)))
    return;
  const fields = Object.fromEntries(
    order.map((part, index) => [part.type, values[index]]),
  );
  if (fields.year.length !== 4) return;
  const iso = `${fields.year}-${fields.month.padStart(2, '0')}-${fields.day.padStart(2, '0')}`;
  return isValidIsoDate(iso) ? iso : undefined;
}
