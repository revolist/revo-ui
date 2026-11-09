import {
  addCivilDays,
  addCivilMonths,
  getCivilParts,
  getPossibleInstants,
  resolveCivilBoundary,
  parseIsoCivilDate,
  type CivilDateTime,
} from './civil-time';
import { assertIanaTimeZone } from './time-of-day';
import {
  resolveUtcCalendarPreset,
  resolveUtcCalendarWindow,
  resolveUtcCustomCalendarRange,
  type UtcCalendarPreset,
  type UtcCalendarRange,
  type UtcCalendarWindowUnit,
} from './calendar-range';

const LIMIT = 8640000000000000;
function valid(domain: UtcCalendarRange) {
  return (
    Number.isFinite(domain.min) &&
    Number.isFinite(domain.max) &&
    domain.min < domain.max &&
    domain.min >= -LIMIT &&
    domain.max <= LIMIT
  );
}
function intersect(min: number | undefined, domain: UtcCalendarRange) {
  if (min === undefined || !Number.isFinite(min)) return;
  min = Math.max(min, domain.min);
  return min < domain.max ? { min, max: domain.max } : undefined;
}
function boundary(civil: CivilDateTime, timeZone: string): number | undefined {
  if (Object.values(civil).some((value) => !Number.isFinite(value))) return;
  const probe = new Date(0);
  probe.setUTCFullYear(civil.year, civil.month - 1, civil.day);
  probe.setUTCHours(civil.hour, civil.minute, civil.second, 0);
  if (!Number.isFinite(probe.getTime())) return;
  try {
    const exact = getPossibleInstants(civil, timeZone)[0];
    return (
      exact ?? resolveCivilBoundary({ ...civil, second: 0 }, timeZone)
    ).getTime();
  } catch (error) {
    if (error instanceof RangeError) return;
    throw error;
  }
}
/** Civil trailing windows; folds use the earlier instant, gaps advance to the first valid minute. */
export function resolveCalendarWindow(
  window: { unit: UtcCalendarWindowUnit; count: number },
  domain: UtcCalendarRange,
  timeZone = 'UTC',
): UtcCalendarRange | undefined {
  assertIanaTimeZone(timeZone);
  if (timeZone === 'UTC') return resolveUtcCalendarWindow(window, domain);
  if (
    !valid(domain) ||
    !Number.isSafeInteger(window.count) ||
    window.count <= 0
  )
    return;
  const anchor = getCivilParts(new Date(domain.max), timeZone);
  let date;
  if (window.unit === 'day' || window.unit === 'week')
    date = addCivilDays(
      anchor,
      -window.count * (window.unit === 'week' ? 7 : 1),
    );
  else if (window.unit === 'month' || window.unit === 'year')
    date = addCivilMonths(
      anchor,
      -window.count * (window.unit === 'year' ? 12 : 1),
    );
  else return;
  const target = { ...anchor, ...date };
  let min = boundary(target, timeZone);
  if (min !== undefined) {
    const resolved = getCivilParts(new Date(min), timeZone);
    if (
      Object.keys(target).every(
        (key) =>
          target[key as keyof CivilDateTime] ===
          resolved[key as keyof CivilDateTime],
      )
    )
      min += ((domain.max % 1000) + 1000) % 1000;
  }
  return intersect(min, domain);
}
/** Full-domain anchoring and millisecond storage are independent of the display zone. */
export function resolveCalendarPreset(
  preset: UtcCalendarPreset,
  domain: UtcCalendarRange,
  timeZone = 'UTC',
): UtcCalendarRange | undefined {
  assertIanaTimeZone(timeZone);
  if (timeZone === 'UTC') return resolveUtcCalendarPreset(preset, domain);
  if (!valid(domain)) return;
  if (preset === 'all') return { ...domain };
  if (preset === 'YTD') {
    const anchor = getCivilParts(new Date(domain.max), timeZone);
    return intersect(
      boundary(
        { year: anchor.year, month: 1, day: 1, hour: 0, minute: 0, second: 0 },
        timeZone,
      ),
      domain,
    );
  }
  if (preset === '1M' || preset === '3M' || preset === '1Y')
    return resolveCalendarWindow(
      { unit: 'month', count: preset === '1M' ? 1 : preset === '3M' ? 3 : 12 },
      domain,
      timeZone,
    );
}
/** Inclusive civil dates; skipped authored dates are rejected, never silently relabelled. */
export function resolveCustomCalendarRange(
  from: string,
  to: string,
  domain: UtcCalendarRange,
  timeZone = 'UTC',
): UtcCalendarRange | undefined {
  assertIanaTimeZone(timeZone);
  if (timeZone === 'UTC')
    return resolveUtcCustomCalendarRange(from, to, domain);
  if (!valid(domain)) return;
  const start = parseIsoCivilDate(from),
    end = parseIsoCivilDate(to);
  if (!start || !end || from > to) return;
  const midnight = { hour: 0, minute: 0, second: 0 };
  const min = boundary({ ...start, ...midnight }, timeZone);
  const endStart = boundary({ ...end, ...midnight }, timeZone);
  const sameDay = (instant: number | undefined, day: typeof start) => {
    if (instant === undefined) return false;
    const projected = getCivilParts(new Date(instant), timeZone);
    return (
      projected.year === day.year &&
      projected.month === day.month &&
      projected.day === day.day
    );
  };
  if (!sameDay(min, start) || !sameDay(endStart, end)) return;
  const exclusive = boundary(
    { ...addCivilDays(end, 1), ...midnight },
    timeZone,
  );
  if (exclusive === undefined) return;
  const range = {
    min: Math.max(min!, domain.min),
    max: Math.min(exclusive - 1, domain.max),
  };
  return range.min < range.max ? range : undefined;
}

/** Calendar inputs accept positive four-digit civil years; other domains keep presets available. */
export function formatCalendarInputDate(
  instant: number,
  timeZone = 'UTC',
): string {
  if (!Number.isFinite(new Date(instant).getTime())) return '';
  const civil = getCivilParts(new Date(instant), timeZone);
  if (civil.year < 1 || civil.year > 9999) return '';
  return `${String(civil.year).padStart(4, '0')}-${String(civil.month).padStart(2, '0')}-${String(civil.day).padStart(2, '0')}`;
}
