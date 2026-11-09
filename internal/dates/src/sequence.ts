/**
 * Parsed date value with the visible input format needed for output.
 */
export type ParsedDateValue = {
  /** Parsed date normalized to a Date object. */
  date: Date;

  /** Original visible input format. */
  format: 'date-object' | 'yyyy-mm-dd' | 'yyyy/mm/dd' | 'mm/dd/yyyy';
};

/**
 * Parses a Date object or supported date string.
 *
 * @param value Value to parse.
 * @returns Parsed date and original format, or `null` for unsupported values.
 */
export function parseDateValue(value: unknown): ParsedDateValue | null {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return { date: new Date(value.getTime()), format: 'date-object' };
  }
  if (typeof value !== 'string') {
    return null;
  }

  let match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (match) {
    return createParsedDate(
      Number(match[1]),
      Number(match[2]),
      Number(match[3]),
      'yyyy-mm-dd',
    );
  }

  match = value.match(/^(\d{4})\/(\d{2})\/(\d{2})$/);
  if (match) {
    return createParsedDate(
      Number(match[1]),
      Number(match[2]),
      Number(match[3]),
      'yyyy/mm/dd',
    );
  }

  match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (match) {
    return createParsedDate(
      Number(match[3]),
      Number(match[1]),
      Number(match[2]),
      'mm/dd/yyyy',
    );
  }

  return null;
}

function createParsedDate(
  year: number,
  month: number,
  day: number,
  format: ParsedDateValue['format'],
): ParsedDateValue | null {
  const date = new Date(0);
  date.setUTCFullYear(year, month - 1, day);
  date.setUTCHours(0, 0, 0, 0);
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }
  return { date, format };
}

/**
 * Formats a date using the preserved input format.
 *
 * @param date Date to format.
 * @param format Output format captured from the selected source value.
 * @returns Date object copy or formatted date string.
 */
export function formatDateValue(date: Date, format: ParsedDateValue['format']) {
  if (format === 'date-object') {
    return new Date(date.getTime());
  }
  const year = String(date.getUTCFullYear()).padStart(4, '0');
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  if (format === 'yyyy/mm/dd') {
    return `${year}/${month}/${day}`;
  }
  if (format === 'mm/dd/yyyy') {
    return `${month}/${day}/${year}`;
  }
  return `${year}-${month}-${day}`;
}

/**
 * Adds a number of days using UTC date math.
 *
 * @param date Source date.
 * @param days Number of days to add.
 * @returns New Date instance.
 */
export function addUtcDays(date: Date, days: number) {
  const next = new Date(date.getTime());
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

/**
 * Adds a number of months using UTC date math.
 *
 * @param date Source date.
 * @param months Number of months to add.
 * @returns New Date instance.
 */
export function addUtcMonths(date: Date, months: number) {
  const next = new Date(date.getTime());
  next.setUTCMonth(next.getUTCMonth() + months);
  return next;
}

/**
 * Calculates whole-month distance between two UTC dates.
 *
 * @param a Start date.
 * @param b End date.
 * @returns Number of calendar months from `a` to `b`.
 */
export function monthDiff(a: Date, b: Date) {
  return (
    (b.getUTCFullYear() - a.getUTCFullYear()) * 12 +
    (b.getUTCMonth() - a.getUTCMonth())
  );
}

/**
 * Parsed clock-time value with the visible input format needed for output.
 */
export type ParsedTimeValue = {
  /** Seconds elapsed since midnight. */
  seconds: number;

  /** Original visible input format. */
  format: 'hh:mm' | 'hh:mm:ss';
};

/**
 * Parses a supported clock-time string.
 *
 * @param value Value to parse.
 * @returns Parsed seconds and original format, or `null` for unsupported values.
 */
export function parseTimeValue(value: unknown): ParsedTimeValue | null {
  if (typeof value !== 'string') {
    return null;
  }
  const match = value.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (!match) {
    return null;
  }
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  const seconds = match[3] ? Number(match[3]) : 0;
  if (hours > 23 || minutes > 59 || seconds > 59) {
    return null;
  }
  return {
    seconds: hours * 3600 + minutes * 60 + seconds,
    format: match[3] ? 'hh:mm:ss' : 'hh:mm',
  };
}

/**
 * Formats seconds since midnight as a clock-time string.
 *
 * @param totalSeconds Seconds since midnight. Values wrap around 24 hours.
 * @param format Output format captured from the selected source value.
 * @returns Formatted clock-time string.
 */
export function formatTimeValue(
  totalSeconds: number,
  format: ParsedTimeValue['format'],
) {
  const daySeconds = 24 * 3600;
  totalSeconds = ((totalSeconds % daySeconds) + daySeconds) % daySeconds;
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const base = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  return format === 'hh:mm:ss'
    ? `${base}:${String(seconds).padStart(2, '0')}`
    : base;
}
