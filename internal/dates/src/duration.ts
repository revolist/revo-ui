/** Generic duration text parsing and formatting for standalone input controls. */

/** Unit selected by a standalone duration input. */
export type DurationUnit =
  | 'minute'
  | 'hour'
  | 'day'
  | 'week'
  | 'month'
  | 'quarter'
  | 'year';

export interface ParsedDuration {
  readonly value: number;
  readonly unit: DurationUnit;
  readonly elapsed: boolean;
}

export interface ParseDurationOptions {
  readonly defaultUnit?: DurationUnit;
  readonly allowElapsed?: boolean;
}

export interface FormatDurationValueOptions {
  readonly elapsed?: boolean;
  /** Maximum digits shown after the decimal separator. Defaults to 1. */
  readonly maximumFractionDigits?: number;
}

const UNIT_ALIASES: Readonly<Record<string, DurationUnit>> = {
  m: 'minute',
  min: 'minute',
  mins: 'minute',
  minute: 'minute',
  minutes: 'minute',
  h: 'hour',
  hr: 'hour',
  hrs: 'hour',
  hour: 'hour',
  hours: 'hour',
  d: 'day',
  day: 'day',
  days: 'day',
  w: 'week',
  wk: 'week',
  wks: 'week',
  week: 'week',
  weeks: 'week',
  mo: 'month',
  mon: 'month',
  mons: 'month',
  month: 'month',
  months: 'month',
  q: 'quarter',
  qr: 'quarter',
  qtr: 'quarter',
  qtrs: 'quarter',
  quarter: 'quarter',
  quarters: 'quarter',
  y: 'year',
  yr: 'year',
  yrs: 'year',
  year: 'year',
  years: 'year',
};

const UNIT_LABELS: Record<DurationUnit, readonly [string, string]> = {
  minute: ['minute', 'minutes'],
  hour: ['hour', 'hours'],
  day: ['day', 'days'],
  week: ['week', 'weeks'],
  month: ['month', 'months'],
  quarter: ['quarter', 'quarters'],
  year: ['year', 'years'],
};

function resolveMaximumFractionDigits(value: number | undefined): number {
  return typeof value === 'number' && Number.isFinite(value)
    ? Math.min(20, Math.max(0, Math.floor(value)))
    : 1;
}

export function parseDuration(
  input: unknown,
  options?: ParseDurationOptions,
): ParsedDuration | null {
  const defaultUnit = options?.defaultUnit ?? 'day';
  if (typeof input === 'number') {
    return Number.isFinite(input) && input >= 0
      ? { value: input, unit: defaultUnit, elapsed: false }
      : null;
  }
  if (typeof input !== 'string') return null;

  const text = input.trim().toLowerCase();
  if (!text) return null;
  const match = text.match(/^([+]?(?:\d+(?:\.\d+)?|\.\d+))\s*(.*)$/);
  if (!match) return null;

  const value = Number(match[1]);
  if (!Number.isFinite(value) || value < 0) return null;

  let suffix = match[2].trim().replace(/\s+/g, ' ');
  let elapsed = false;
  if (suffix.startsWith('elapsed ')) {
    elapsed = true;
    suffix = suffix.slice('elapsed '.length).trim();
  } else if (
    suffix.startsWith('e') &&
    suffix.length > 1 &&
    UNIT_ALIASES[suffix.slice(1)]
  ) {
    elapsed = true;
    suffix = suffix.slice(1);
  }

  if (elapsed && options?.allowElapsed === false) return null;
  const unit = suffix ? UNIT_ALIASES[suffix] : defaultUnit;
  return unit ? { value, unit, elapsed } : null;
}

/** Returns true when text explicitly contains a unit rather than a bare number. */
export function hasDurationUnitToken(input: unknown): boolean {
  return (
    typeof input === 'string' &&
    !/^\s*[+]?(?:\d+(?:\.\d+)?|\.\d+)\s*$/.test(input)
  );
}

function roundedDuration(value: number, maximumFractionDigits: number): number {
  return Number(
    value.toFixed(resolveMaximumFractionDigits(maximumFractionDigits)),
  );
}

export function formatDurationValue(
  value: number,
  unit: DurationUnit,
  options?: FormatDurationValueOptions,
): string {
  const normalized = roundedDuration(
    value,
    options?.maximumFractionDigits ?? 1,
  );
  const labels = UNIT_LABELS[unit];
  const label =
    Math.abs(Math.abs(normalized) - 1) < 1e-9 ? labels[0] : labels[1];
  return `${normalized} ${options?.elapsed ? 'elapsed ' : ''}${label}`;
}
