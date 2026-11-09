import { ISO_DATE_ONLY_PATTERN } from './iso';

/** Calendar and clock fields interpreted in a specific IANA timezone. */
export interface CivilDateTime {
  readonly year: number;
  readonly month: number;
  readonly day: number;
  readonly hour: number;
  readonly minute: number;
  readonly second: number;
}

export type CivilDate = Pick<CivilDateTime, 'year' | 'month' | 'day'>;

const ISO_LOCAL_CIVIL_DATETIME_PATTERN =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/;

const formatterCache = new Map<string, Intl.DateTimeFormat>();

function civilFormatter(timeZone: string) {
  let value = formatterCache.get(timeZone);
  if (!value) {
    value = new Intl.DateTimeFormat('en-CA-u-ca-gregory', {
      timeZone,
      era: 'short',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hourCycle: 'h23',
    });
    formatterCache.set(timeZone, value);
  }
  return value;
}

export function getBrowserTimeZone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
}

/** Projects an instant into Gregorian civil fields in an IANA timezone. */
export function getCivilParts(instant: Date, timeZone: string): CivilDateTime {
  const parts = new Map(
    civilFormatter(timeZone)
      .formatToParts(instant)
      .map((part) => [part.type, part.value]),
  );
  return {
    year:
      parts.get('era') === 'BC'
        ? 1 - Number(parts.get('year'))
        : Number(parts.get('year')),
    month: Number(parts.get('month')),
    day: Number(parts.get('day')),
    hour: Number(parts.get('hour')),
    minute: Number(parts.get('minute')),
    second: Number(parts.get('second')),
  };
}

function civilEpoch(value: CivilDateTime) {
  // Date.UTC maps years 0–99 to 1900–1999; full-year setters preserve civil years.
  const date = new Date(0);
  date.setUTCFullYear(value.year, value.month - 1, value.day);
  date.setUTCHours(value.hour, value.minute, value.second, 0);
  return date.getTime();
}

function sameCivil(left: CivilDateTime, right: CivilDateTime) {
  return civilEpoch(left) === civilEpoch(right);
}

/** Parses a valid ISO date-only string into timezone-independent civil fields. */
export function parseIsoCivilDate(value: string): CivilDate | undefined {
  if (!ISO_DATE_ONLY_PATTERN.test(value)) return;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(
    civilEpoch({ year, month, day, hour: 0, minute: 0, second: 0 }),
  );
  return date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
    ? { year, month, day }
    : undefined;
}

/** Parses a `datetime-local` value into civil fields without applying a timezone. */
export function parseIsoLocalCivilDateTime(
  value: string,
): CivilDateTime | undefined {
  const match = ISO_LOCAL_CIVIL_DATETIME_PATTERN.exec(value);
  if (!match) return;
  const civil = {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
    hour: Number(match[4]),
    minute: Number(match[5]),
    second: Number(match[6] ?? 0),
  };
  const date = new Date(civilEpoch(civil));
  const roundTrip: CivilDateTime = {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
    hour: date.getUTCHours(),
    minute: date.getUTCMinutes(),
    second: date.getUTCSeconds(),
  };
  return (Object.keys(civil) as (keyof CivilDateTime)[]).every(
    (key) => civil[key] === roundTrip[key],
  )
    ? civil
    : undefined;
}

/** Returns every instant represented by a civil second in an IANA timezone. */
export function getPossibleInstants(
  value: CivilDateTime,
  timeZone: string,
): Date[] {
  const approximate = civilEpoch(value);
  if (!Number.isFinite(approximate)) return [];
  const offsets = new Set<number>();
  for (let delta = -48; delta <= 48; delta += 6) {
    const sampled = approximate + delta * 60 * 60 * 1000;
    if (Number.isFinite(new Date(sampled).getTime()))
      offsets.add(
        civilEpoch(getCivilParts(new Date(sampled), timeZone)) - sampled,
      );
  }
  return [...offsets]
    .map((offset) => new Date(approximate - offset))
    .filter(
      (candidate) =>
        Number.isFinite(candidate.getTime()) &&
        sameCivil(getCivilParts(candidate, timeZone), value),
    )
    .sort((left, right) => left.getTime() - right.getTime())
    .filter(
      (candidate, index, values) =>
        !index || candidate.getTime() !== values[index - 1].getTime(),
    );
}

export function resolveExactCivilInstant(
  value: CivilDateTime,
  timeZone: string,
): Date | undefined {
  const possible = getPossibleInstants(value, timeZone);
  return possible.length === 1 ? possible[0] : undefined;
}

function addCivilSeconds(value: CivilDateTime, seconds: number): CivilDateTime {
  const date = new Date(civilEpoch(value) + seconds * 1000);
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
    hour: date.getUTCHours(),
    minute: date.getUTCMinutes(),
    second: date.getUTCSeconds(),
  };
}

const civilBoundaryCache = new Map<string, number>();

/** Period boundaries advance through a timezone gap to its first valid civil instant. */
export function resolveCivilBoundary(
  value: CivilDateTime,
  timeZone: string,
): Date {
  const key = `${timeZone}:${civilEpoch(value)}`;
  const cached = civilBoundaryCache.get(key);
  if (cached !== undefined) return new Date(cached);
  let candidate = value;
  for (let minute = 0; minute <= 36 * 60; minute++) {
    const possible = getPossibleInstants(candidate, timeZone);
    if (possible.length) {
      if (civilBoundaryCache.size >= 4096) civilBoundaryCache.clear();
      civilBoundaryCache.set(key, possible[0].getTime());
      return possible[0];
    }
    candidate = addCivilSeconds(candidate, 60);
  }
  throw new Error(`Unable to resolve civil boundary in ${timeZone}.`);
}

/** Adds civil days independently of the machine timezone and DST. */
export function addCivilDays(value: CivilDate, days: number): CivilDate {
  const next = new Date(
    civilEpoch({
      ...value,
      day: value.day + days,
      hour: 0,
      minute: 0,
      second: 0,
    }),
  );
  return {
    year: next.getUTCFullYear(),
    month: next.getUTCMonth() + 1,
    day: next.getUTCDate(),
  };
}

/** Adds civil months, clamping the authored day to the target month's last day. */
export function addCivilMonths(value: CivilDate, months: number): CivilDate {
  const first = new Date(
    civilEpoch({
      year: value.year,
      month: value.month + months,
      day: 1,
      hour: 0,
      minute: 0,
      second: 0,
    }),
  );
  const last = new Date(first.getTime());
  last.setUTCMonth(last.getUTCMonth() + 1, 0);
  return {
    year: first.getUTCFullYear(),
    month: first.getUTCMonth() + 1,
    day: Math.min(value.day, last.getUTCDate()),
  };
}

/** Signed civil-day distance in milliseconds, without timezone offsets. */
export function compareCivilDates(left: CivilDate, right: CivilDate): number {
  return (
    civilEpoch({ ...left, hour: 0, minute: 0, second: 0 }) -
    civilEpoch({ ...right, hour: 0, minute: 0, second: 0 })
  );
}

/** JavaScript weekday index of a civil date: Sunday is zero. */
export function getCivilWeekday(value: CivilDate): number {
  return new Date(
    civilEpoch({ ...value, hour: 0, minute: 0, second: 0 }),
  ).getUTCDay();
}

/** Parses a native datetime-local value in a schedule timezone. Gaps are invalid;
 * new repeated times use the earlier instant. An unchanged original keeps its fold and precision. */
export function parseZonedDateTimeControlValue(
  value: string,
  timeZone = 'UTC',
  original?: Date,
): Date | undefined {
  const civil = parseIsoLocalCivilDateTime(value);
  if (!civil) return;
  if (original) {
    const fields = getCivilParts(original, timeZone);
    if (
      fields.year === civil.year &&
      fields.month === civil.month &&
      fields.day === civil.day &&
      fields.hour === civil.hour &&
      fields.minute === civil.minute &&
      (value.length === 16 || fields.second === civil.second)
    )
      return new Date(original);
  }
  return getPossibleInstants(civil, timeZone)[0];
}

export interface TimeZoneOffsetRange {
  readonly startMs: number;
  readonly endMs: number;
  readonly offsetMs: number;
}

/** Splits an instant range at offset transitions, including repeated and skipped hours. */
export function splitTimeZoneOffsetRanges(
  startMs: number,
  endMs: number,
  timeZone = 'UTC',
): TimeZoneOffsetRange[] {
  if (endMs <= startMs) return [];
  if (timeZone === 'UTC') return [{ startMs, endMs, offsetMs: 0 }];
  const offsetAt = (time: number) =>
    civilEpoch(getCivilParts(new Date(time), timeZone)) -
    Math.floor(time / 1000) * 1000;
  const result: TimeZoneOffsetRange[] = [];
  let start = startMs;
  let offsetMs = offsetAt(start);
  for (let sample = startMs; sample < endMs; ) {
    const next = Math.min(endMs, sample + 6 * 60 * 60 * 1000);
    const last = next === endMs ? next - 1 : next;
    if (offsetAt(last) !== offsetMs) {
      let low = sample;
      let high = last;
      while (high - low > 1) {
        const middle = Math.floor((low + high) / 2);
        if (offsetAt(middle) === offsetMs) low = middle;
        else high = middle;
      }
      result.push({ startMs: start, endMs: high, offsetMs });
      start = high;
      offsetMs = offsetAt(high);
    }
    sample = next;
  }
  result.push({ startMs: start, endMs, offsetMs });
  return result;
}

/** Projects an instant interval onto one civil day's clock, retaining DST splits. */
export function projectCivilDayRange(
  date: string,
  startMs: number,
  endMs: number,
  timeZone = 'UTC',
  rangeStart = 0,
  rangeEnd = 1440,
): (TimeZoneOffsetRange & {
  readonly startMinutes: number;
  readonly endMinutes: number;
})[] {
  const civil = parseIsoCivilDate(date);
  if (!civil) throw new Error(`Invalid civil date "${date}".`);
  const midnight = civilEpoch({ ...civil, hour: 0, minute: 0, second: 0 });
  return splitTimeZoneOffsetRanges(startMs, endMs, timeZone).flatMap(
    (interval) => {
      const start = Math.max(
        interval.startMs,
        midnight + rangeStart * 60000 - interval.offsetMs,
      );
      const end = Math.min(
        interval.endMs,
        midnight + rangeEnd * 60000 - interval.offsetMs,
      );
      return end <= start
        ? []
        : [
            {
              startMs: start,
              endMs: end,
              offsetMs: interval.offsetMs,
              startMinutes: (start + interval.offsetMs - midnight) / 60000,
              endMinutes: (end + interval.offsetMs - midnight) / 60000,
            },
          ];
    },
  );
}
