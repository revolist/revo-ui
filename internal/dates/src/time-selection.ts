import { timeControlSeconds } from './temporal-controls';

export type TimeColumn = 'hour' | 'minute' | 'second' | 'period';
export interface TimeChoiceOptions {
  min?: string;
  max?: string;
  step?: number;
  precision?: 'minute' | 'second';
}
/** Bounded to one day; generated once per constraint change, not per rendered option. */
export function timeSelectionChoices(options: TimeChoiceOptions): number[] {
  const minimum = options.min ? timeControlSeconds(options.min) : undefined;
  const maximum = options.max ? timeControlSeconds(options.max) : undefined;
  const step = options.step ?? (options.precision === 'second' ? 1 : 60);
  if (!Number.isFinite(step) || step <= 0) return [];
  const quantum = options.precision === 'second' ? 1 : 60;
  const result: number[] = [];
  for (let seconds = 0; seconds < 86400; seconds += quantum)
    if (
      (minimum === undefined || seconds >= minimum) &&
      (maximum === undefined || seconds <= maximum) &&
      (seconds - (minimum ?? 0)) % step === 0
    )
      result.push(seconds);
  return result;
}
export function timeSelectionValue(
  seconds: number,
  precision: 'minute' | 'second' = 'minute',
): string {
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${pad(Math.floor(seconds / 3600))}:${pad(Math.floor(seconds / 60) % 60)}${precision === 'second' ? `:${pad(seconds % 60)}` : ''}`;
}
export function clockUses12Hours(
  format: 'locale' | '12h' | '24h',
  locale?: string,
) {
  return (
    format === '12h' ||
    (format === 'locale' &&
      !!new Intl.DateTimeFormat(locale, { hour: 'numeric' }).resolvedOptions()
        .hour12)
  );
}
export function clockPeriodLabel(period: number, locale?: string) {
  return (
    new Intl.DateTimeFormat(locale, { hour: 'numeric', hourCycle: 'h12' })
      .formatToParts(new Date(2000, 0, 1, period ? 13 : 1))
      .find((part) => part.type === 'dayPeriod')?.value ??
    (period ? 'PM' : 'AM')
  );
}
/** Select the closest valid value in a chosen column, including restrictive/unaligned steps. */
export function timeSelectionColumns(
  choices: readonly number[],
  value: string,
  twelveHours: boolean,
) {
  const parsed = timeControlSeconds(value);
  const base = parsed ?? choices[0] ?? 0;
  const hour = Math.floor(base / 3600),
    minute = Math.floor(base / 60) % 60,
    second = base % 60;
  const columns: Record<TimeColumn, Map<number, number>> = {
    hour: new Map(),
    minute: new Map(),
    second: new Map(),
    period: new Map(),
  };
  const keep = (
    column: TimeColumn,
    key: number,
    candidate: number,
    target: number,
  ) => {
    const previous = columns[column].get(key);
    if (
      previous === undefined ||
      Math.abs(candidate - target) < Math.abs(previous - target)
    )
      columns[column].set(key, candidate);
  };
  for (const candidate of choices) {
    const h = Math.floor(candidate / 3600),
      m = Math.floor(candidate / 60) % 60,
      s = candidate % 60;
    if (!twelveHours || Math.floor(h / 12) === Math.floor(hour / 12))
      keep('hour', h, candidate, h * 3600 + minute * 60 + second);
    if (h === hour) keep('minute', m, candidate, hour * 3600 + m * 60 + second);
    if (h === hour && m === minute)
      keep('second', s, candidate, hour * 3600 + minute * 60 + s);
    const period = Math.floor(h / 12);
    keep(
      'period',
      period,
      candidate,
      ((hour % 12) + period * 12) * 3600 + minute * 60 + second,
    );
  }
  return {
    columns,
    hour,
    minute,
    second,
    period: Math.floor(hour / 12),
    hasValue: parsed !== undefined,
  };
}
