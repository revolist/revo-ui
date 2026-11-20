import { isValidIsoDate, parseIsoDate, type ISODateString } from './iso';
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
function parts(options: DateEntryOptions, date = '2006-11-22') {
  const fields = new Intl.DateTimeFormat(localeFor(options), {
    calendar: 'gregory',
    timeZone: 'UTC',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).formatToParts(parseIsoDate(date));
  // Keep ISO unambiguous where the locale uses the same dash pattern with day first.
  if (
    fields
      .map((part) => (part.type === 'literal' ? part.value : part.type))
      .join('') === 'year-day-month'
  )
    return fields.map((part) =>
      part.type === 'literal' ? { ...part, value: '/' } : part,
    );
  return fields;
}
function normalizeEntry(value: string): string {
  return value.normalize('NFKC').replace(/[\u200e\u200f\u061c]/g, '');
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
  const fields = parts(options, date);
  if (!date.startsWith('0')) return fields.map((part) => part.value).join('');
  const year = new Intl.NumberFormat(localeFor(options), {
    useGrouping: false,
    minimumIntegerDigits: 4,
  }).format(Number(date.slice(0, 4)));
  return fields
    .map((part) => (part.type === 'year' ? year : part.value))
    .join('');
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
  let normalized = normalizeEntry(value).trim();
  const numbers = new Intl.NumberFormat(localeFor(options), {
    useGrouping: false,
  });
  for (let digit = 0; digit < 10; digit++)
    normalized = normalized
      .split(normalizeEntry(numbers.format(digit)))
      .join(String(digit));
  const pattern = parts(options);
  const localizedPattern = pattern
    .map((part) => {
      if (part.type !== 'literal') return '(\\d{1,4})';
      return normalizeEntry(part.value)
        .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        .replace(/\s+/g, '\\s*');
    })
    .join('');
  const values =
    new RegExp(`^${localizedPattern}$`).exec(normalized)?.slice(1) ??
    normalized.split(/[./\-\s]+/);
  const order = pattern.filter((part) =>
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
