import { DAY_IN_MS } from './date-math';
import { isValidIsoDate, parseIsoDate } from './iso';
import { parseTimelineInstantValue } from './timeline';
export const UTC_CALENDAR_PRESETS = ['1M', '3M', 'YTD', '1Y', 'all'] as const;
export type UtcCalendarPreset = (typeof UTC_CALENDAR_PRESETS)[number];
export interface UtcCalendarRange {
  min: number;
  max: number;
}
/** UTC calendar arithmetic preserves time-of-day and clamps month-end, including years below 100. */
export function shiftUtcCalendarMonths(
  instant: number,
  months: number,
): number | undefined {
  const original = parseTimelineInstantValue(instant);
  if (!original || !Number.isInteger(months)) return;
  const first = new Date(original.getTime());
  first.setUTCFullYear(
    original.getUTCFullYear(),
    original.getUTCMonth() + months,
    1,
  );
  const last = new Date(first.getTime());
  last.setUTCMonth(last.getUTCMonth() + 1, 0);
  first.setUTCDate(Math.min(original.getUTCDate(), last.getUTCDate()));
  return Number.isFinite(first.getTime()) ? first.getTime() : undefined;
}
function validDomain(domain: UtcCalendarRange): boolean {
  return (
    Number.isFinite(domain.min) &&
    Number.isFinite(domain.max) &&
    domain.min < domain.max &&
    !!parseTimelineInstantValue(domain.min) &&
    !!parseTimelineInstantValue(domain.max)
  );
}
function intersect(
  min: number,
  max: number,
  domain: UtcCalendarRange,
): UtcCalendarRange | undefined {
  min = Math.max(min, domain.min);
  max = Math.min(max, domain.max);
  return Number.isFinite(min) && Number.isFinite(max) && min < max
    ? { min, max }
    : undefined;
}
export type UtcCalendarWindowUnit = 'day' | 'week' | 'month' | 'year';
/** Exact trailing UTC windows preserve the anchor instant and clamp calendar month ends. */
export function resolveUtcCalendarWindow(
  window: { unit: UtcCalendarWindowUnit; count: number },
  domain: UtcCalendarRange,
): UtcCalendarRange | undefined {
  if (
    !validDomain(domain) ||
    !window ||
    !Number.isSafeInteger(window.count) ||
    window.count <= 0
  )
    return;
  const max = domain.max;
  let min: number | undefined;
  if (window.unit === 'month' || window.unit === 'year')
    min = shiftUtcCalendarMonths(
      max,
      -window.count * (window.unit === 'year' ? 12 : 1),
    );
  else if (window.unit === 'day' || window.unit === 'week') {
    const date = new Date(max);
    date.setUTCDate(
      date.getUTCDate() - window.count * (window.unit === 'week' ? 7 : 1),
    );
    if (Number.isFinite(date.getTime())) min = date.getTime();
  }
  return min === undefined ? undefined : intersect(min, max, domain);
}
/** Presets anchor to the latest available instant, never wall-clock time or loaded page size. */
export function resolveUtcCalendarPreset(
  preset: UtcCalendarPreset,
  domain: UtcCalendarRange,
): UtcCalendarRange | undefined {
  if (!validDomain(domain)) return;
  const max = domain.max;
  if (preset === 'all') return { ...domain };
  const anchor = new Date(max);
  let min: number | undefined;
  if (preset === 'YTD') {
    const year = new Date(anchor.getTime());
    year.setUTCFullYear(anchor.getUTCFullYear(), 0, 1);
    year.setUTCHours(0, 0, 0, 0);
    min = year.getTime();
  } else if (preset === '1M' || preset === '3M' || preset === '1Y')
    return resolveUtcCalendarWindow(
      { unit: 'month', count: preset === '1M' ? 1 : preset === '3M' ? 3 : 12 },
      domain,
    );
  return min === undefined ? undefined : intersect(min, max, domain);
}
/** Inclusive UTC date inputs become inclusive millisecond viewport bounds. */
export function resolveUtcCustomCalendarRange(
  from: string,
  to: string,
  domain: UtcCalendarRange,
): UtcCalendarRange | undefined {
  if (!validDomain(domain) || !isValidIsoDate(from) || !isValidIsoDate(to))
    return;
  const min = parseIsoDate(from).getTime(),
    day = parseIsoDate(to).getTime();
  if (min > day) return;
  return intersect(min, day + DAY_IN_MS - 1, domain);
}
