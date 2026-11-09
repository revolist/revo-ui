import {
  addDays,
  addCalendarMonths,
  addMonths,
  startOfMonth,
  subtractDays,
} from './date-math';
import {
  formatIsoDate,
  isValidIsoDate,
  parseIsoDate,
  type ISODateString,
} from './iso';

export type RelativeDateWindowPreset =
  | 'last7Days'
  | 'today'
  | 'thisMonth'
  | 'thisQuarter'
  | 'yearToDate'
  | 'overdue';
export type RelativeDateWindowDirection = 'last' | 'next';
export type RelativeDateWindowUnit =
  | 'day'
  | 'week'
  | 'month'
  | 'quarter'
  | 'year';

export type RelativeDateWindowExpression = Readonly<
  | {
      version: 1;
      mode: 'preset';
      preset: RelativeDateWindowPreset;
    }
  | {
      version: 1;
      mode: 'custom';
      direction: RelativeDateWindowDirection;
      amount: number;
      unit: RelativeDateWindowUnit;
      rolling: boolean;
    }
>;

export interface RelativeDateWindowSettings {
  /** Sunday is 0 and Saturday is 6. */
  readonly weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  readonly fiscalYearStart: { readonly month: number; readonly day: number };
}

export interface RelativeDateWindowRange {
  /** Inclusive lower calendar date. */
  readonly from?: ISODateString;
  /** Inclusive upper calendar date. */
  readonly to?: ISODateString;
}

const PRESETS = new Set<RelativeDateWindowPreset>([
  'last7Days',
  'today',
  'thisMonth',
  'thisQuarter',
  'yearToDate',
  'overdue',
]);
const DIRECTIONS = new Set<RelativeDateWindowDirection>(['last', 'next']);
const UNITS = new Set<RelativeDateWindowUnit>([
  'day',
  'week',
  'month',
  'quarter',
  'year',
]);
const MAX_RELATIVE_WINDOW_AMOUNT = 10_000;

export function isRelativeDateWindowExpression(
  value: unknown,
): value is RelativeDateWindowExpression {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Record<string, unknown>;
  if (candidate.version !== 1) return false;
  if (candidate.mode === 'preset')
    return PRESETS.has(candidate.preset as RelativeDateWindowPreset);
  return (
    candidate.mode === 'custom' &&
    DIRECTIONS.has(candidate.direction as RelativeDateWindowDirection) &&
    Number.isSafeInteger(candidate.amount) &&
    Number(candidate.amount) > 0 &&
    Number(candidate.amount) <= MAX_RELATIVE_WINDOW_AMOUNT &&
    UNITS.has(candidate.unit as RelativeDateWindowUnit) &&
    typeof candidate.rolling === 'boolean'
  );
}

function isRelativeDateWindowSettings(
  settings: RelativeDateWindowSettings,
): boolean {
  if (!settings || typeof settings !== 'object' || !settings.fiscalYearStart)
    return false;
  if (
    !Number.isInteger(settings.weekStartsOn) ||
    settings.weekStartsOn < 0 ||
    settings.weekStartsOn > 6
  ) {
    return false;
  }
  const { month, day } = settings.fiscalYearStart;
  if (!Number.isInteger(month) || !Number.isInteger(day)) return false;
  const recurringAnchor = `${2025}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  return isValidIsoDate(recurringAnchor);
}

function isRelativeDateWindowRange(value: RelativeDateWindowRange): boolean {
  if (!value.from && !value.to) return false;
  if (value.from && !isValidIsoDate(value.from)) return false;
  if (value.to && !isValidIsoDate(value.to)) return false;
  return !value.from || !value.to || value.from <= value.to;
}

function startOfConfiguredWeek(
  date: ISODateString,
  weekStartsOn: number,
): ISODateString {
  const weekday = parseIsoDate(date).getUTCDay();
  return addDays(date, -((weekday - weekStartsOn + 7) % 7));
}

/** Returns the start of the fiscal year containing a civil date. */
export function startOfFiscalYear(
  date: ISODateString,
  settings: Pick<RelativeDateWindowSettings, 'fiscalYearStart'>,
): ISODateString {
  const current = parseIsoDate(date);
  const currentYearAnchor = formatIsoDate(
    new Date(
      Date.UTC(
        current.getUTCFullYear(),
        settings.fiscalYearStart.month - 1,
        settings.fiscalYearStart.day,
      ),
    ),
  );
  return date >= currentYearAnchor
    ? currentYearAnchor
    : formatIsoDate(
        new Date(
          Date.UTC(
            current.getUTCFullYear() - 1,
            settings.fiscalYearStart.month - 1,
            settings.fiscalYearStart.day,
          ),
        ),
      );
}

function fiscalQuarterStart(
  date: ISODateString,
  settings: RelativeDateWindowSettings,
): ISODateString {
  const yearStart = startOfFiscalYear(date, settings);
  for (let quarter = 3; quarter > 0; quarter--) {
    const candidate = addCalendarMonths(yearStart, quarter * 3);
    if (candidate <= date) return candidate;
  }
  return yearStart;
}

function addUnit(
  date: ISODateString,
  amount: number,
  unit: RelativeDateWindowUnit,
): ISODateString {
  if (unit === 'day') return addDays(date, amount);
  if (unit === 'week') return addDays(date, amount * 7);
  if (unit === 'month') return addCalendarMonths(date, amount);
  if (unit === 'quarter') return addCalendarMonths(date, amount * 3);
  return addCalendarMonths(date, amount * 12);
}

function alignedStart(
  date: ISODateString,
  unit: RelativeDateWindowUnit,
  settings: RelativeDateWindowSettings,
): ISODateString {
  if (unit === 'day') return date;
  if (unit === 'week')
    return startOfConfiguredWeek(date, settings.weekStartsOn);
  if (unit === 'month') return startOfMonth(date);
  if (unit === 'quarter') return fiscalQuarterStart(date, settings);
  return startOfFiscalYear(date, settings);
}

/** Resolves a relative expression to inclusive civil-date boundaries. */
export function resolveRelativeDateWindow(
  today: string,
  expression: RelativeDateWindowExpression,
  settings: RelativeDateWindowSettings,
): RelativeDateWindowRange | undefined {
  if (
    !isValidIsoDate(today) ||
    !isRelativeDateWindowExpression(expression) ||
    !isRelativeDateWindowSettings(settings)
  )
    return;
  try {
    let range: RelativeDateWindowRange;
    if (expression.mode === 'preset') {
      if (expression.preset === 'last7Days')
        range = { from: addDays(today, -6), to: today };
      else if (expression.preset === 'today')
        range = { from: today, to: today };
      else if (expression.preset === 'thisMonth') {
        const from = startOfMonth(today);
        range = { from, to: subtractDays(addMonths(from, 1), 1) };
      } else if (expression.preset === 'thisQuarter') {
        const from = fiscalQuarterStart(today, settings);
        range = { from, to: subtractDays(addCalendarMonths(from, 3), 1) };
      } else if (expression.preset === 'yearToDate') {
        range = { from: startOfFiscalYear(today, settings), to: today };
      } else {
        range = { to: addDays(today, -1) };
      }
    } else {
      const units =
        expression.amount * (expression.direction === 'last' ? -1 : 1);
      if (expression.rolling) {
        range =
          expression.direction === 'last'
            ? {
                from: addDays(addUnit(today, units, expression.unit), 1),
                to: today,
              }
            : {
                from: today,
                to: addDays(addUnit(today, units, expression.unit), -1),
              };
      } else {
        const currentStart = alignedStart(today, expression.unit, settings);
        range =
          expression.direction === 'last'
            ? {
                from: addUnit(
                  currentStart,
                  -(expression.amount - 1),
                  expression.unit,
                ),
                to: subtractDays(addUnit(currentStart, 1, expression.unit), 1),
              }
            : {
                from: currentStart,
                to: subtractDays(
                  addUnit(currentStart, expression.amount, expression.unit),
                  1,
                ),
              };
      }
    }
    return isRelativeDateWindowRange(range) ? range : undefined;
  } catch {
    return undefined;
  }
}
