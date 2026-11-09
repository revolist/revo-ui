import { getCivilParts, parseIsoCivilDate } from './civil-time';
import { getUtcWeekday } from './iso';
import {
  parseTimelineInstantValue,
  startOfTimelineUnit,
  type TimelineUnit,
  type TimelineWeekStartsOn,
} from './timeline';
import { assertIanaTimeZone } from './time-of-day';

export type DateBucketInput =
  | { kind: 'civil-date' }
  | { kind: 'instant'; timeZone: string };
type DateBucketBase = {
  version: 1;
  input: DateBucketInput;
  calendar: 'gregory';
  invalid?: 'error' | 'blank';
};
/** Portable Gregorian wall-clock semantics. No implicit process timezone. */
export type DateBucketOperation = DateBucketBase &
  (
    | {
        type: 'truncate';
        grain: Exclude<TimelineUnit, 'week'>;
        weekStartsOn?: never;
      }
    | { type: 'truncate'; grain: 'week'; weekStartsOn: TimelineWeekStartsOn }
    | { type: 'weekday'; grain?: never; weekStartsOn?: never }
  );
export type DateBucketResult =
  | { kind: 'value'; value: string | number }
  | { kind: 'missing' }
  | { kind: 'invalid'; reason: string };
export type DateBucketClassifier = (value: unknown) => DateBucketResult;

function record(value: unknown, label: string): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new Error(`Expected ${label} object.`);
  const output: Record<string, unknown> = Object.create(null);
  for (const key of Reflect.ownKeys(value)) {
    if (typeof key !== 'string')
      throw new Error(`${label} does not support symbol keys.`);
    const descriptor = Object.getOwnPropertyDescriptor(value, key)!;
    if (!Object.hasOwn(descriptor, 'value'))
      throw new Error(`${label}.${key} must be a data property.`);
    output[key] = descriptor.value;
  }
  return output;
}
function yearSupported(year: number): boolean {
  return Number.isInteger(year) && year >= 100 && year <= 9999;
}
const pad = (value: number, digits = 2) => String(value).padStart(digits, '0');

/** Compiles a reusable classifier without reading facts or changing existing date helper semantics. */
export function compileDateBucketClassifier(
  inputPolicy: DateBucketOperation,
): DateBucketClassifier {
  const policy = record(inputPolicy, 'operation');
  const input = record(policy.input, 'operation.input');
  const allowed = new Set([
    'version',
    'type',
    'input',
    'calendar',
    'invalid',
    ...(policy.type === 'truncate'
      ? ['grain', ...(policy.grain === 'week' ? ['weekStartsOn'] : [])]
      : []),
  ]);
  for (const key of Object.keys(policy))
    if (!allowed.has(key)) throw new Error(`Unsupported operation.${key}.`);
  if (
    policy.version !== 1 ||
    policy.calendar !== 'gregory' ||
    (policy.type !== 'truncate' && policy.type !== 'weekday')
  )
    throw new Error('Unsupported date operation version, calendar or type.');
  if (
    policy.invalid !== undefined &&
    policy.invalid !== 'error' &&
    policy.invalid !== 'blank'
  )
    throw new Error('Unsupported invalid date policy.');
  if (input.kind !== 'civil-date' && input.kind !== 'instant')
    throw new Error('Unsupported date input kind.');
  for (const key of Object.keys(input))
    if (
      !['kind', ...(input.kind === 'instant' ? ['timeZone'] : [])].includes(key)
    )
      throw new Error(`Unsupported operation.input.${key}.`);
  const timeZone = input.kind === 'instant' ? input.timeZone : undefined;
  if (input.kind === 'instant') {
    if (typeof timeZone !== 'string' || !timeZone)
      throw new Error('Instant date input requires an explicit timeZone.');
    assertIanaTimeZone(timeZone);
  }
  const grain = policy.grain as TimelineUnit;
  const weekStartsOn = policy.weekStartsOn as TimelineWeekStartsOn;
  if (policy.type === 'truncate') {
    if (
      !['minute', 'hour', 'day', 'week', 'month', 'quarter', 'year'].includes(
        grain,
      )
    )
      throw new Error('Unsupported date grain.');
    if (input.kind === 'civil-date' && (grain === 'minute' || grain === 'hour'))
      throw new Error('Civil-date input does not contain an intraday clock.');
    if (
      grain === 'week' &&
      (!Number.isInteger(weekStartsOn) || weekStartsOn < 0 || weekStartsOn > 6)
    )
      throw new Error('Week requires weekStartsOn from 0 through 6.');
  }
  const operationType = policy.type;
  const inputKind = input.kind;
  return (value: unknown): DateBucketResult => {
    if (value === null || value === undefined) return { kind: 'missing' };
    const invalid = (reason: string): DateBucketResult => ({
      kind: 'invalid',
      reason,
    });
    let year: number,
      month: number,
      day: number,
      hour = 0,
      minute = 0;
    if (inputKind === 'civil-date') {
      const civil =
        typeof value === 'string' ? parseIsoCivilDate(value) : undefined;
      if (!civil || !yearSupported(civil.year))
        return invalid(
          'Expected a valid civil ISO date in years 0100 through 9999.',
        );
      ({ year, month, day } = civil);
    } else {
      let instant: Date | undefined;
      try {
        // Intrinsic read accepts native Date authority without invoking an overridden getTime.
        instant = parseTimelineInstantValue(
          typeof value === 'object'
            ? Date.prototype.getTime.call(value)
            : value,
        );
      } catch {
        return invalid('Expected a valid instant value.');
      }
      if (!instant || !yearSupported(instant.getUTCFullYear()))
        return invalid(
          'Expected a valid instant in UTC years 0100 through 9999.',
        );
      const civil = getCivilParts(instant, timeZone as string);
      if (!yearSupported(civil.year))
        return invalid('Projected civil year is outside 0100 through 9999.');
      ({ year, month, day, hour, minute } = civil);
    }
    const date = `${pad(year, 4)}-${pad(month)}-${pad(day)}`;
    if (operationType === 'weekday')
      return { kind: 'value', value: getUtcWeekday(date) };
    const civil =
      grain === 'minute' || grain === 'hour'
        ? `${date}T${pad(hour)}:${pad(minute)}:00Z`
        : date;
    const start = startOfTimelineUnit(grain, civil, weekStartsOn);
    const bucketYear = Number(start.slice(0, 4));
    if (!yearSupported(bucketYear))
      return invalid('Truncated bucket year is outside 0100 through 9999.');
    return {
      kind: 'value',
      value:
        grain === 'hour'
          ? start.slice(0, 13)
          : grain === 'minute'
            ? start.slice(0, 16)
            : start,
    };
  };
}
