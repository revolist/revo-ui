/**
 * Shared duration parsing, canonical-hour conversion, and display formatting.
 * Gantt, scheduler, and import/export adapters consume this dates-layer module.
 */
import type { CalendarEntity } from './calendars';

/** Unit retained with an authored task duration. */
export type DurationUnit =
  | 'minute'
  | 'hour'
  | 'day'
  | 'week'
  | 'month'
  | 'quarter'
  | 'year';

/** Project-level duration display and working-time conversion settings. */
export interface DurationSettings {
  /** Unit used for bare input and display. `auto` chooses minutes, hours, or days by magnitude. */
  readonly defaultUnit?: DurationUnit | 'auto';
  /** Unit used for bare Work input and display. Defaults to `auto`, independently from task Duration. */
  readonly defaultWorkUnit?: DurationUnit | 'auto';
  /** Working hours represented by one duration day. Defaults to the effective calendar, then 8. */
  readonly hoursPerDay?: number;
  /** Working hours represented by one duration week. Defaults to the effective workweek, then 40. */
  readonly hoursPerWeek?: number;
  /** Working days represented by one duration month. Defaults to 20. */
  readonly daysPerMonth?: number;
  /** Maximum digits shown after the decimal separator. Defaults to 1. */
  readonly maximumFractionDigits?: number;
}

export interface ResolvedDurationSettings {
  readonly defaultUnit: DurationUnit | 'auto';
  readonly defaultWorkUnit: DurationUnit | 'auto';
  readonly hoursPerDay: number;
  readonly hoursPerWeek: number;
  readonly daysPerMonth: number;
  readonly maximumFractionDigits: number;
}

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

export interface FormatWorkingDurationOptions extends FormatDurationValueOptions {
  readonly unit?: DurationUnit;
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

function positiveOr(value: number | undefined, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0
    ? value
    : fallback;
}

function resolveMaximumFractionDigits(value: number | undefined): number {
  return typeof value === 'number' && Number.isFinite(value)
    ? Math.min(20, Math.max(0, Math.floor(value)))
    : 1;
}

export function resolveDurationSettings(
  settings: DurationSettings | undefined,
  calendar?: Pick<CalendarEntity, 'hoursPerDay' | 'workingDays'> | null,
): ResolvedDurationSettings {
  const hoursPerDay = positiveOr(
    settings?.hoursPerDay,
    positiveOr(calendar?.hoursPerDay, 8),
  );
  const workingDaysPerWeek = Math.max(1, calendar?.workingDays.length ?? 5);

  return {
    defaultUnit: settings?.defaultUnit ?? 'auto',
    defaultWorkUnit: settings?.defaultWorkUnit ?? 'auto',
    hoursPerDay,
    hoursPerWeek: positiveOr(
      settings?.hoursPerWeek,
      hoursPerDay * workingDaysPerWeek,
    ),
    daysPerMonth: positiveOr(settings?.daysPerMonth, 20),
    maximumFractionDigits: resolveMaximumFractionDigits(
      settings?.maximumFractionDigits,
    ),
  };
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

export function durationToWorkingDays(
  value: number,
  unit: DurationUnit,
  settings: ResolvedDurationSettings,
): number {
  return durationToHours(value, unit, settings) / settings.hoursPerDay;
}

/** Converts a displayed duration magnitude into canonical stored working hours. */
export function durationToHours(
  value: number,
  unit: DurationUnit,
  settings: ResolvedDurationSettings,
): number {
  switch (unit) {
    case 'minute':
      return value / 60;
    case 'hour':
      return value;
    case 'day':
      return value * settings.hoursPerDay;
    case 'week':
      return value * settings.hoursPerWeek;
    case 'month':
      return value * settings.daysPerMonth * settings.hoursPerDay;
    case 'quarter':
      return value * settings.daysPerMonth * settings.hoursPerDay * 3;
    case 'year':
      return value * settings.daysPerMonth * settings.hoursPerDay * 12;
  }
}

export function workingDaysToDuration(
  workingDays: number,
  unit: DurationUnit,
  settings: ResolvedDurationSettings,
): number {
  return hoursToDuration(workingDays * settings.hoursPerDay, unit, settings);
}

/** Converts canonical stored working hours into a display magnitude. */
export function hoursToDuration(
  hours: number,
  unit: DurationUnit,
  settings: ResolvedDurationSettings,
): number {
  switch (unit) {
    case 'minute':
      return hours * 60;
    case 'hour':
      return hours;
    case 'day':
      return hours / settings.hoursPerDay;
    case 'week':
      return hours / settings.hoursPerWeek;
    case 'month':
      return hours / (settings.daysPerMonth * settings.hoursPerDay);
    case 'quarter':
      return hours / (settings.daysPerMonth * settings.hoursPerDay * 3);
    case 'year':
      return hours / (settings.daysPerMonth * settings.hoursPerDay * 12);
  }
}

/** Converts an elapsed duration to continuous 24-hour calendar days. */
export function durationToElapsedDays(
  value: number,
  unit: DurationUnit,
): number {
  switch (unit) {
    case 'minute':
      return value / (24 * 60);
    case 'hour':
      return value / 24;
    case 'day':
      return value;
    case 'week':
      return value * 7;
    case 'month':
      return value * 30;
    case 'quarter':
      return value * 90;
    case 'year':
      return value * 360;
  }
}

/** Converts an elapsed display magnitude into canonical stored continuous hours. */
export function durationToElapsedHours(
  value: number,
  unit: DurationUnit,
): number {
  return durationToElapsedDays(value, unit) * 24;
}

export function elapsedDaysToDuration(
  elapsedDays: number,
  unit: DurationUnit,
): number {
  switch (unit) {
    case 'minute':
      return elapsedDays * 24 * 60;
    case 'hour':
      return elapsedDays * 24;
    case 'day':
      return elapsedDays;
    case 'week':
      return elapsedDays / 7;
    case 'month':
      return elapsedDays / 30;
    case 'quarter':
      return elapsedDays / 90;
    case 'year':
      return elapsedDays / 360;
  }
}

/** Converts canonical stored continuous hours into an elapsed display magnitude. */
export function elapsedHoursToDuration(
  elapsedHours: number,
  unit: DurationUnit,
): number {
  return elapsedDaysToDuration(elapsedHours / 24, unit);
}

export function resolveAutomaticDurationUnit(
  workingDays: number,
  settings: ResolvedDurationSettings,
): DurationUnit {
  const workingMinutes = Math.abs(workingDays) * settings.hoursPerDay * 60;
  if (workingMinutes < 60) return 'minute';
  if (workingMinutes < settings.hoursPerDay * 60) return 'hour';
  return 'day';
}

/** Selects the automatic display unit for a canonical working-hour value. */
export function resolveAutomaticDurationUnitFromHours(
  hours: number,
  settings: ResolvedDurationSettings,
): DurationUnit {
  return resolveAutomaticDurationUnit(hours / settings.hoursPerDay, settings);
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

export function formatWorkingDuration(
  workingDays: number,
  settings: ResolvedDurationSettings,
  options?: FormatWorkingDurationOptions,
): string {
  const unit =
    options?.unit ??
    (settings.defaultUnit === 'auto'
      ? resolveAutomaticDurationUnit(workingDays, settings)
      : settings.defaultUnit);
  const value = options?.elapsed
    ? elapsedDaysToDuration(workingDays, unit)
    : workingDaysToDuration(workingDays, unit, settings);
  return formatDurationValue(value, unit, {
    elapsed: options?.elapsed,
    maximumFractionDigits: settings.maximumFractionDigits,
  });
}
