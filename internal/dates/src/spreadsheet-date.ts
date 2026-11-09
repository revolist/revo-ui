import { DAY_IN_MS, HOUR_IN_MS, MINUTE_IN_MS } from './date-math';

const EXCEL_EPOCH_UTC_MS = Date.UTC(1899, 11, 31);
const LOCAL_DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const SPREADSHEET_DATE_DISPLAY_PATTERN =
  /^(\d{1,4})[\/.-](\d{1,2})[\/.-](\d{1,4})$/;
const SPREADSHEET_MONTH_NAME_CACHE_LIMIT = 32;
const spreadsheetMonthNameCache = new Map<string, readonly string[][]>();

export type SpreadsheetDateOrder = 'mdy' | 'dmy' | 'ymd';

/** Resolve the conventional spreadsheet date order for a BCP 47 locale. */
export function resolveSpreadsheetDateOrder(
  locale: string,
): SpreadsheetDateOrder {
  try {
    const order = new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      timeZone: 'UTC',
    })
      .formatToParts(new Date(Date.UTC(2001, 10, 22)))
      .map((part) => part.type)
      .filter(
        (part): part is 'year' | 'month' | 'day' =>
          part === 'year' || part === 'month' || part === 'day',
      )
      .map((part) => part[0])
      .join('');
    if (order === 'mdy' || order === 'dmy' || order === 'ymd') return order;
  } catch {
    // Invalid or unsupported locales use the deterministic spreadsheet fallback.
  }
  return 'dmy';
}

/** Resolve whether a locale conventionally displays spreadsheet times in 12-hour form. */
export function usesSpreadsheetTwelveHourClock(locale: string): boolean {
  try {
    const hourCycle = new Intl.DateTimeFormat(locale, {
      hour: 'numeric',
    }).resolvedOptions().hourCycle;
    return hourCycle === 'h11' || hourCycle === 'h12';
  } catch {
    return false;
  }
}

export interface SpreadsheetDateParts {
  readonly year: number;
  /** One-based calendar month. */
  readonly month: number;
  readonly day: number;
  /** Sunday is zero, matching `Date#getDay`. */
  readonly weekday: number;
  readonly hour: number;
  readonly minute: number;
  readonly second: number;
  readonly millisecond: number;
  readonly elapsedHours: number;
  readonly elapsedMinutes: number;
  readonly elapsedSeconds: number;
  /** Excel's intentionally fictional 1900-02-29. */
  readonly fictionalLeapDay: boolean;
}

export interface SpreadsheetDisplayDateTimeOptions {
  readonly dateOrder?: SpreadsheetDateOrder;
  readonly locale?: string;
  readonly hasDate?: boolean;
  readonly hasTime?: boolean;
  /** Leading elapsed unit for formats such as `[h]:mm:ss`. */
  readonly elapsedUnit?: 'h' | 'm' | 's';
}

/**
 * Coerces spreadsheet date values into local calendar fields.
 * Numeric values use Excel's 1900 date system, including its skipped serial 60.
 */
export function coerceSpreadsheetDate(value: unknown): Date | undefined {
  if (value instanceof Date) {
    return cloneValidDate(value);
  }
  if (typeof value === 'number') {
    return excelSerialToSpreadsheetDate(value);
  }
  if (typeof value !== 'string') {
    return undefined;
  }

  const dateOnly = LOCAL_DATE_ONLY_PATTERN.exec(value);
  if (dateOnly) {
    return createLocalCalendarDate(
      Number(dateOnly[1]),
      Number(dateOnly[2]) - 1,
      Number(dateOnly[3]),
    );
  }

  try {
    return cloneValidDate(new Date(value));
  } catch {
    return undefined;
  }
}

/** Converts an Excel 1900-system serial into a local spreadsheet date. */
export function excelSerialToSpreadsheetDate(serial: number): Date | undefined {
  if (!Number.isFinite(serial) || serial < 0) {
    return undefined;
  }
  const wholeDays = Math.floor(serial);
  const fractionMilliseconds = Math.round((serial - wholeDays) * DAY_IN_MS);
  const dayCarry = Math.floor(fractionMilliseconds / DAY_IN_MS);
  const timeMilliseconds = fractionMilliseconds % DAY_IN_MS;
  // Excel preserves Lotus 1-2-3's fictional 1900-02-29 at serial 60. Since
  // JavaScript cannot represent it, serial 60 shares 1900-02-28 with serial 59.
  const adjustedDays = wholeDays >= 60 ? wholeDays - 1 : wholeDays;
  const calendar = new Date(
    EXCEL_EPOCH_UTC_MS + (adjustedDays + dayCarry) * DAY_IN_MS,
  );
  if (Number.isNaN(calendar.getTime())) {
    return undefined;
  }

  const date = createLocalCalendarDate(
    calendar.getUTCFullYear(),
    calendar.getUTCMonth(),
    calendar.getUTCDate(),
  );
  if (!date) {
    return undefined;
  }
  date.setHours(
    Math.floor(timeMilliseconds / HOUR_IN_MS),
    Math.floor((timeMilliseconds % HOUR_IN_MS) / MINUTE_IN_MS),
    Math.floor((timeMilliseconds % MINUTE_IN_MS) / 1_000),
    timeMilliseconds % 1_000,
  );
  return date;
}

/**
 * Resolves Excel 1900-system serial fields without losing serial 60. This is
 * intended for spreadsheet number-format evaluation where 1900-02-29 must be
 * displayed exactly even though JavaScript `Date` cannot represent it.
 */
export function excelSerialToSpreadsheetDateParts(
  serial: number,
): SpreadsheetDateParts | undefined {
  if (!Number.isFinite(serial) || serial < 0) return;
  const wholeDays = Math.floor(serial);
  const roundedMilliseconds = Math.round((serial - wholeDays) * DAY_IN_MS);
  const dayCarry = Math.floor(roundedMilliseconds / DAY_IN_MS);
  const timeMilliseconds = roundedMilliseconds % DAY_IN_MS;
  const serialDay = wholeDays + dayCarry;
  const fictionalLeapDay = serialDay === 60;
  const adjustedDays = serialDay >= 60 ? serialDay - 1 : serialDay;
  const calendar = new Date(EXCEL_EPOCH_UTC_MS + adjustedDays * DAY_IN_MS);
  if (Number.isNaN(calendar.getTime())) return;
  return {
    year: fictionalLeapDay ? 1900 : calendar.getUTCFullYear(),
    month: fictionalLeapDay ? 2 : calendar.getUTCMonth() + 1,
    day: fictionalLeapDay ? 29 : calendar.getUTCDate(),
    weekday: fictionalLeapDay ? 4 : calendar.getUTCDay(),
    hour: Math.floor(timeMilliseconds / HOUR_IN_MS),
    minute: Math.floor((timeMilliseconds % HOUR_IN_MS) / MINUTE_IN_MS),
    second: Math.floor((timeMilliseconds % MINUTE_IN_MS) / 1_000),
    millisecond: timeMilliseconds % 1_000,
    elapsedHours: Math.floor(serial * 24),
    elapsedMinutes: Math.floor(serial * 24 * 60),
    elapsedSeconds: Math.floor(serial * 24 * 60 * 60),
    fictionalLeapDay,
  };
}

/** Converts local spreadsheet calendar fields into an Excel 1900-system serial. */
export function spreadsheetDateToExcelSerial(value: Date): number | undefined {
  if (Number.isNaN(value.getTime())) {
    return undefined;
  }
  return spreadsheetDateFieldsToExcelSerial({
    year: value.getFullYear(),
    month: value.getMonth() + 1,
    day: value.getDate(),
    hour: value.getHours(),
    minute: value.getMinutes(),
    second: value.getSeconds(),
    millisecond: value.getMilliseconds(),
  });
}

/** Converts the calendar fields displayed in a timezone into an Excel serial. */
export function spreadsheetDateToExcelSerialInTimeZone(
  value: Date,
  timeZone: string,
): number | undefined {
  if (Number.isNaN(value.getTime())) return;
  try {
    const fields = Object.fromEntries(
      new Intl.DateTimeFormat('en-US-u-ca-gregory-nu-latn', {
        timeZone,
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hourCycle: 'h23',
      })
        .formatToParts(value)
        .filter((part) => part.type !== 'literal')
        .map((part) => [part.type, Number(part.value)]),
    );
    return spreadsheetDateFieldsToExcelSerial({
      year: fields.year,
      month: fields.month,
      day: fields.day,
      hour: fields.hour,
      minute: fields.minute,
      second: fields.second,
      millisecond: value.getMilliseconds(),
    });
  } catch {
    return undefined;
  }
}

function spreadsheetDateFieldsToExcelSerial(fields: {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  millisecond: number;
}): number | undefined {
  if (Object.values(fields).some((field) => !Number.isFinite(field))) return;
  const calendarDays =
    (Date.UTC(fields.year, fields.month - 1, fields.day) - EXCEL_EPOCH_UTC_MS) /
    DAY_IN_MS;
  if (calendarDays < 0) {
    return undefined;
  }
  const excelDays = calendarDays >= 60 ? calendarDays + 1 : calendarDays;
  const timeMilliseconds =
    fields.hour * HOUR_IN_MS +
    fields.minute * MINUTE_IN_MS +
    fields.second * 1_000 +
    fields.millisecond;
  return excelDays + timeMilliseconds / DAY_IN_MS;
}

/**
 * Parses a locale-displayed spreadsheet date without relying on JavaScript's
 * implementation-defined non-ISO string parser.
 */
export function parseSpreadsheetDateDisplay(
  value: string,
  order: SpreadsheetDateOrder,
  locale?: string,
): Date | undefined {
  const text = value.trim();
  const numeric = SPREADSHEET_DATE_DISPLAY_PATTERN.exec(text);
  if (numeric) {
    const fields = numeric.slice(1).map(Number);
    const positions = order.split('') as ('m' | 'd' | 'y')[];
    const parts = Object.fromEntries(
      positions.map((part, index) => [part, fields[index]]),
    ) as {
      m: number;
      d: number;
      y: number;
    };
    return createDisplayDate(parts.y, parts.m, parts.d);
  }
  return parseMonthNameDate(text, order, locale);
}

/** Parse browser-visible spreadsheet date/time text into an Excel day serial. */
export function parseSpreadsheetDateTimeDisplay(
  value: string,
  options: SpreadsheetDisplayDateTimeOptions,
): number | undefined {
  const text = value.trim();
  if (!text) return;
  if (options.elapsedUnit)
    return parseElapsedSpreadsheetTime(text, options.elapsedUnit);

  const time = options.hasTime ? extractSpreadsheetTime(text) : undefined;
  if (options.hasTime && !time) return;
  const timeSerial = time ? time.seconds / 86400 : 0;
  if (!options.hasDate) return timeSerial;
  if (!options.dateOrder) return;

  const dateText = time
    ? text
        .slice(0, time.index)
        .trim()
        .replace(/[\s,]+$/, '')
    : text;
  const date = parseSpreadsheetDateDisplay(
    dateText,
    options.dateOrder,
    options.locale,
  );
  const dateSerial = date ? spreadsheetDateToExcelSerial(date) : undefined;
  return dateSerial === undefined ? undefined : dateSerial + timeSerial;
}

function createDisplayDate(
  year: number,
  month: number,
  day: number,
): Date | undefined {
  const normalizedYear = year < 100 ? (year <= 29 ? 2000 : 1900) + year : year;
  return createLocalCalendarDate(normalizedYear, month - 1, day);
}

function parseMonthNameDate(
  value: string,
  order: SpreadsheetDateOrder,
  locale = 'en-US',
): Date | undefined {
  const normalized = normalizeDateWord(value);
  const month =
    spreadsheetMonthNames(locale).findIndex((names) =>
      names.some((name) => hasCompleteDateToken(normalized, name)),
    ) + 1;
  if (!month) return;
  const withoutMonth = spreadsheetMonthNames(locale)[month - 1].reduce(
    (text, name) => replaceCompleteDateToken(text, name),
    normalized,
  );
  const numbers = withoutMonth.match(/\d{1,4}/g)?.map(Number) ?? [];
  const year =
    numbers.find((number) => number > 31 || String(number).length >= 3) ??
    numbers.at(-1);
  const day = numbers.find(
    (number) => number !== year && number >= 1 && number <= 31,
  );
  if (year === undefined || day === undefined) return;
  // Month-name displays are unambiguous; order is retained as a guard against
  // accepting a format that does not describe a complete calendar date.
  if (!order.includes('m') || !order.includes('d') || !order.includes('y'))
    return;
  return createDisplayDate(year, month, day);
}

function spreadsheetMonthNames(locale: string): readonly string[][] {
  const cached = spreadsheetMonthNameCache.get(locale);
  if (cached) return cached;
  const names = Array.from({ length: 12 }, (_, month) => {
    const date = new Date(Date.UTC(2000, month, 1));
    // A one-letter (`mmmmm`) month is inherently ambiguous and must not be
    // guessed during display-only clipboard import.
    return [
      ...new Set(
        ['long', 'short']
          .flatMap((width) => {
            try {
              const options = {
                month: width as 'long' | 'short',
                timeZone: 'UTC',
              } as const;
              const standalone = new Intl.DateTimeFormat(
                locale,
                options,
              ).format(date);
              const contextual = new Intl.DateTimeFormat(locale, {
                ...options,
                day: 'numeric',
                year: 'numeric',
              })
                .formatToParts(date)
                .find((part) => part.type === 'month')?.value;
              return [standalone, contextual]
                .filter((value): value is string => !!value)
                .map(normalizeDateWord);
            } catch {
              return [];
            }
          })
          .filter(Boolean),
      ),
    ];
  });
  spreadsheetMonthNameCache.set(locale, names);
  if (spreadsheetMonthNameCache.size > SPREADSHEET_MONTH_NAME_CACHE_LIMIT) {
    spreadsheetMonthNameCache.delete(
      spreadsheetMonthNameCache.keys().next().value!,
    );
  }
  return names;
}

function normalizeDateWord(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase()
    .replace(/\./g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function hasCompleteDateToken(value: string, token: string): boolean {
  return completeDateTokenPattern(token).test(value);
}

function replaceCompleteDateToken(value: string, token: string): string {
  return value.replace(completeDateTokenPattern(token), '$1 ');
}

function completeDateTokenPattern(token: string): RegExp {
  const escaped = token
    .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    .replace(/\s+/g, '\\s+');
  return new RegExp(`(^|[^\\p{L}\\p{N}])${escaped}(?=$|[^\\p{L}\\p{N}])`, 'u');
}

function extractSpreadsheetTime(
  value: string,
): { readonly index: number; readonly seconds: number } | undefined {
  const match =
    /(\d{1,2}):(\d{2})(?::(\d{2})([.,]\d+)?)?\s*([ap](?:\.?m\.?)?)?\s*$/i.exec(
      value,
    );
  if (!match) return;
  let hour = Number(match[1]);
  const minute = Number(match[2]);
  const second =
    Number(match[3] ?? 0) + Number(`0${match[4]?.replace(',', '.') ?? ''}`);
  if (minute > 59 || second >= 60) return;
  if (match[5]) {
    if (hour < 1 || hour > 12) return;
    hour = (hour % 12) + (/^p/i.test(match[5]) ? 12 : 0);
  } else if (hour > 23) return;
  return { index: match.index, seconds: hour * 3600 + minute * 60 + second };
}

function parseElapsedSpreadsheetTime(
  value: string,
  unit: 'h' | 'm' | 's',
): number | undefined {
  const match = /^(\d+)(?::(\d{1,2}))?(?::(\d{1,2}))?(?:[.,](\d+))?$/.exec(
    value.trim(),
  );
  if (!match) return;
  const first = Number(match[1]);
  const second = Number(match[2] ?? 0);
  const third = Number(match[3] ?? 0);
  const fraction = match[4] ? Number(`0.${match[4]}`) : 0;
  let seconds: number;
  if (unit === 'h') {
    if (second > 59 || third > 59) return;
    seconds = first * 3600 + second * 60 + third + fraction;
  } else if (unit === 'm') {
    if (second > 59 || match[3]) return;
    seconds = first * 60 + second + fraction;
  } else {
    if (match[2] || match[3]) return;
    seconds = first + fraction;
  }
  return seconds / 86400;
}

function createLocalCalendarDate(
  year: number,
  monthIndex: number,
  day: number,
): Date | undefined {
  const date = new Date(0);
  date.setFullYear(year, monthIndex, day);
  date.setHours(0, 0, 0, 0);
  return date.getFullYear() === year &&
    date.getMonth() === monthIndex &&
    date.getDate() === day
    ? date
    : undefined;
}

function cloneValidDate(value: Date): Date | undefined {
  const date = new Date(value.getTime());
  return Number.isNaN(date.getTime()) ? undefined : date;
}
