import { DAY_IN_MS, HOUR_IN_MS, MINUTE_IN_MS, WEEK_IN_MS } from './date-math';
import { parseTimelineInstantValue } from './timeline';
export type UtcCalendarTickUnit =
  | 'second'
  | 'minute'
  | 'hour'
  | 'day'
  | 'week'
  | 'month'
  | 'quarter'
  | 'year';
const intervals: readonly [UtcCalendarTickUnit, number, number][] = [
  ['second', 1, 1000],
  ['second', 5, 5000],
  ['second', 15, 15000],
  ['second', 30, 30000],
  ['minute', 1, MINUTE_IN_MS],
  ['minute', 5, 5 * MINUTE_IN_MS],
  ['minute', 15, 15 * MINUTE_IN_MS],
  ['minute', 30, 30 * MINUTE_IN_MS],
  ['hour', 1, HOUR_IN_MS],
  ['hour', 3, 3 * HOUR_IN_MS],
  ['hour', 6, 6 * HOUR_IN_MS],
  ['hour', 12, 12 * HOUR_IN_MS],
  ['day', 1, DAY_IN_MS],
  ['day', 2, 2 * DAY_IN_MS],
  ['week', 1, WEEK_IN_MS],
  ['week', 2, 2 * WEEK_IN_MS],
  ['month', 1, 30.44 * DAY_IN_MS],
  ['quarter', 1, 91.32 * DAY_IN_MS],
  ['year', 1, 365.25 * DAY_IN_MS],
];
/** UTC period increment, preserving calendar boundaries instead of assuming month lengths. */
export function incrementUtcCalendar(
  value: number,
  unit: UtcCalendarTickUnit,
  step = 1,
): number {
  const date = parseTimelineInstantValue(value);
  if (!date) return NaN;
  if (unit === 'month' || unit === 'quarter' || unit === 'year') {
    const day = date.getUTCDate();
    date.setUTCDate(1);
    date.setUTCMonth(
      date.getUTCMonth() +
        step * (unit === 'year' ? 12 : unit === 'quarter' ? 3 : 1),
    );
    const end = new Date(date.getTime());
    end.setUTCMonth(end.getUTCMonth() + 1, 0);
    date.setUTCDate(Math.min(day, end.getUTCDate()));
  } else
    date.setTime(
      value +
        step *
          (unit === 'week'
            ? WEEK_IN_MS
            : unit === 'day'
              ? DAY_IN_MS
              : unit === 'hour'
                ? HOUR_IN_MS
                : unit === 'minute'
                  ? MINUTE_IN_MS
                  : 1000),
    );
  return date.getTime();
}
/** Calendar boundaries within the observed domain; never adds observations or fills missing values. */
export function utcCalendarTicks(
  min: number,
  max: number,
  target = 5,
  minimumUnit?: UtcCalendarTickUnit,
) {
  if (
    !parseTimelineInstantValue(min) ||
    !parseTimelineInstantValue(max) ||
    max < min
  )
    return { unit: 'day' as UtcCalendarTickUnit, values: [] as number[] };
  target = Math.max(1, Math.min(12, Math.floor(target) || 1));
  if (min === max)
    return { unit: 'second' as UtcCalendarTickUnit, values: [min] };
  const spacing = (max - min) / target;
  const order: UtcCalendarTickUnit[] = [
    'second',
    'minute',
    'hour',
    'day',
    'week',
    'month',
    'quarter',
    'year',
  ];
  const candidates = minimumUnit
    ? intervals.filter(
        ([unit]) => order.indexOf(unit) >= order.indexOf(minimumUnit),
      )
    : intervals;
  let [unit, step] = candidates.reduce((best, entry) =>
    Math.abs(Math.log(entry[2] / spacing)) <
    Math.abs(Math.log(best[2] / spacing))
      ? entry
      : best,
  );
  if (spacing > 365.25 * DAY_IN_MS) {
    unit = 'year';
    const years = spacing / (365.25 * DAY_IN_MS);
    const power = 10 ** Math.floor(Math.log10(years));
    step = Math.ceil(years / power) * power;
  }
  const date = new Date(min);
  if (unit === 'year') {
    date.setUTCFullYear(Math.floor(date.getUTCFullYear() / step) * step, 0, 1);
    date.setUTCHours(0, 0, 0, 0);
  } else if (unit === 'month' || unit === 'quarter') {
    date.setUTCDate(1);
    date.setUTCMonth(
      Math.floor(date.getUTCMonth() / (unit === 'quarter' ? 3 : step)) *
        (unit === 'quarter' ? 3 : step),
    );
    date.setUTCHours(0, 0, 0, 0);
  } else if (unit === 'week') {
    date.setUTCDate(date.getUTCDate() - ((date.getUTCDay() + 6) % 7));
    date.setUTCHours(0, 0, 0, 0);
  } else if (unit === 'day') date.setUTCHours(0, 0, 0, 0);
  else if (unit === 'hour')
    date.setUTCHours(Math.floor(date.getUTCHours() / step) * step, 0, 0, 0);
  else if (unit === 'minute')
    date.setUTCMinutes(Math.floor(date.getUTCMinutes() / step) * step, 0, 0);
  else date.setUTCSeconds(Math.floor(date.getUTCSeconds() / step) * step, 0);
  let value = date.getTime();
  if (value < min) value = incrementUtcCalendar(value, unit, step);
  const values: number[] = [];
  for (
    let index = 0;
    index < 20 && Number.isFinite(value) && value <= max;
    index++
  ) {
    values.push(value);
    const next = incrementUtcCalendar(value, unit, step);
    if (!(next > value)) break;
    value = next;
  }
  return { unit, values: values.length ? values : [min + (max - min) / 2] };
}

/** Missing means an absent calendar bucket, never a time-of-day change within adjacent buckets. */
export function hasMissingUtcCalendarPeriod(
  previous: number,
  next: number,
  unit: 'day' | 'week' | 'month' | 'quarter' | 'year',
): boolean {
  const ordinal = (value: number) => {
    const date = parseTimelineInstantValue(value);
    if (!date) return NaN;
    if (unit === 'year') return date.getUTCFullYear();
    if (unit === 'month' || unit === 'quarter') {
      const month = date.getUTCFullYear() * 12 + date.getUTCMonth();
      return unit === 'quarter' ? Math.floor(month / 3) : month;
    }
    return unit === 'week'
      ? Math.floor((value + 3 * DAY_IN_MS) / WEEK_IN_MS)
      : Math.floor(value / DAY_IN_MS);
  };
  return ordinal(next) - ordinal(previous) > 1;
}
