import {
  getCivilParts,
  getPossibleInstants,
  resolveCivilBoundary,
} from './civil-time';
import {
  addDays,
  addMinutes,
  diffInCalendarDays,
  diffInMinutes,
  MINUTE_IN_MS,
} from './date-math';
import {
  formatIsoDateTime,
  formatLocalIsoDate,
  normalizeIsoDate,
  parseDateTime,
  toISODate,
  type ISODateTimeString,
} from './iso';

/**
 * Parses `HH:mm` or `h:mm AM/PM` into minutes from midnight.
 * `24:00` is accepted only when `allowEndOfDay` is enabled.
 */
export function parseTimeOfDay(
  value: string,
  options: { allowEndOfDay?: boolean } = {},
): number {
  const normalized = value.trim();
  const time24Match = /^(\d{1,2}):(\d{2})$/.exec(normalized);
  if (time24Match) {
    const hours = Number(time24Match[1]);
    const minutes = Number(time24Match[2]);
    return validateTimeOfDay(value, hours, minutes, options);
  }

  const time12Match = /^(\d{1,2})(?::(\d{2}))?\s*([ap])\.?m\.?$/i.exec(
    normalized,
  );
  if (time12Match) {
    const hours = Number(time12Match[1]);
    const minutes = time12Match[2] === undefined ? 0 : Number(time12Match[2]);
    if (!Number.isInteger(hours) || hours < 1 || hours > 12) {
      throw new Error(`Invalid time "${value}".`);
    }
    const period = time12Match[3].toLowerCase();
    const normalizedHours = (hours % 12) + (period === 'p' ? 12 : 0);
    return validateTimeOfDay(value, normalizedHours, minutes, options);
  }

  throw new Error(`Invalid time "${value}". Expected HH:mm or h:mm AM/PM.`);
}

function validateTimeOfDay(
  value: string,
  hours: number,
  minutes: number,
  options: { allowEndOfDay?: boolean },
): number {
  if (
    !Number.isInteger(hours) ||
    !Number.isInteger(minutes) ||
    minutes < 0 ||
    minutes > 59
  ) {
    throw new Error(`Invalid time "${value}".`);
  }
  if (hours === 24 && minutes === 0 && options.allowEndOfDay) {
    return 24 * 60;
  }
  if (hours < 0 || hours > 23) {
    throw new Error(`Invalid time "${value}".`);
  }
  return hours * 60 + minutes;
}

export function formatTimeOfDay(totalMinutes: number): string {
  const minutes = Math.max(0, Math.min(24 * 60, totalMinutes));
  const hoursPart = Math.floor(minutes / 60);
  const minutesPart = minutes % 60;
  return `${String(hoursPart).padStart(2, '0')}:${String(minutesPart).padStart(2, '0')}`;
}

export function formatCompactTimeOfDay(totalMinutes: number): string {
  const minutes = Math.max(0, Math.min(24 * 60, totalMinutes));
  const hoursPart = Math.floor(minutes / 60) % 24;
  const minutesPart = minutes % 60;
  const period = hoursPart < 12 ? 'a' : 'p';
  const hour12 = hoursPart % 12 || 12;
  return `${hour12}:${String(minutesPart).padStart(2, '0')}${period}`;
}

export function formatAmPmTimeOfDay(totalMinutes: number): string {
  const minutes = Math.max(0, Math.min(24 * 60, totalMinutes));
  const hoursPart = Math.floor(minutes / 60) % 24;
  const minutesPart = minutes % 60;
  const suffix = hoursPart < 12 ? 'AM' : 'PM';
  const hour12 = hoursPart % 12 || 12;
  return minutesPart === 0
    ? `${hour12} ${suffix}`
    : `${hour12}:${String(minutesPart).padStart(2, '0')} ${suffix}`;
}

export function formatDisplayTimeOfDay(
  totalMinutes: number,
  options: {
    readonly timeLabelFormatter?: (
      minutes: number,
      slotIndex: number,
    ) => string;
    readonly slotIndex?: number;
    readonly useAmPm?: boolean;
  } = {},
): string {
  if (options.timeLabelFormatter) {
    return options.timeLabelFormatter(totalMinutes, options.slotIndex ?? 0);
  }
  return options.useAmPm
    ? formatAmPmTimeOfDay(totalMinutes)
    : formatTimeOfDay(totalMinutes);
}

export function formatDurationMinutes(totalMinutes: number): string {
  const minutes = Math.max(0, Math.round(totalMinutes));
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;

  if (hours <= 0) {
    return `${remainder}m`;
  }
  if (remainder === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${remainder}m`;
}

export function formatDuration(
  duration: number | undefined | null,
  options: { readonly hoursPerDay?: number } = {},
): string {
  if (typeof duration !== 'number' || !Number.isFinite(duration)) {
    return '';
  }

  const safeDuration = Math.max(0, duration);
  const wholeDays = Math.floor(safeDuration);
  const minutesPerDay = Math.max(
    1,
    Math.round((options.hoursPerDay ?? 24) * 60),
  );
  const remainingMinutes = Math.round(
    (safeDuration - wholeDays) * minutesPerDay,
  );
  const normalizedDays =
    wholeDays + Math.floor(remainingMinutes / minutesPerDay);
  const normalizedMinutes = remainingMinutes % minutesPerDay;
  const parts: string[] = [];

  if (normalizedDays > 0 || normalizedMinutes === 0) {
    parts.push(`${normalizedDays} day${normalizedDays === 1 ? '' : 's'}`);
  }
  if (normalizedMinutes > 0) {
    parts.push(formatDurationMinutes(normalizedMinutes));
  }

  return parts.join(' ');
}

export function hasAmPmMarker(value: string): boolean {
  return /\b(?:am|pm)\b/i.test(value);
}

export function getDateMinutes(date: Date, timeZone = 'UTC'): number {
  if (timeZone !== 'UTC') {
    const civil = getCivilParts(date, timeZone);
    return civil.hour * 60 + civil.minute;
  }
  return date.getUTCHours() * 60 + date.getUTCMinutes();
}

/** Clock minutes including seconds and milliseconds, independent of the machine timezone. */
export function getPreciseDateMinutes(date: Date, timeZone = 'UTC'): number {
  if (timeZone === 'UTC')
    return (
      getDateMinutes(date) +
      date.getUTCSeconds() / 60 +
      date.getUTCMilliseconds() / 60000
    );
  const civil = getCivilParts(date, timeZone);
  return (
    civil.hour * 60 +
    civil.minute +
    civil.second / 60 +
    date.getUTCMilliseconds() / 60000
  );
}

export interface TimeZoneWeekdayHour {
  /** Sunday is 0 and Saturday is 6, matching `Date#getUTCDay`. */
  readonly weekday: number;
  readonly hour: number;
}

export type TimeZoneWeekdayHourReader = (
  instant: Date,
) => TimeZoneWeekdayHour | undefined;

const UTC_TIME_ZONES = new Set(['UTC', 'Etc/UTC', 'Etc/GMT', 'GMT']);
const GREGORIAN_MONTH_WEEKDAY_OFFSETS = [
  0, 3, 2, 5, 0, 3, 5, 1, 4, 6, 2, 4,
] as const;
const weekdayHourReaders = new Map<string, TimeZoneWeekdayHourReader>();
const timeZoneValidity = new Map<string, boolean>();

/** Compiles timezone projection once and keeps a bounded minute-level result cache. */
export function createTimeZoneWeekdayHourReader(
  timeZone: string,
): TimeZoneWeekdayHourReader {
  if (UTC_TIME_ZONES.has(timeZone)) {
    return (instant) =>
      Number.isFinite(instant.getTime())
        ? { weekday: instant.getUTCDay(), hour: instant.getUTCHours() }
        : undefined;
  }
  const formatter = new Intl.DateTimeFormat('en-US-u-ca-gregory', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    hourCycle: 'h23',
  });
  const cache = new Map<number, TimeZoneWeekdayHour | undefined>();
  return (instant) => {
    if (!Number.isFinite(instant.getTime())) return;
    const epochMinute = Math.floor(instant.getTime() / MINUTE_IN_MS);
    if (cache.has(epochMinute)) return cache.get(epochMinute);
    let year: number | undefined;
    let month: number | undefined;
    let day: number | undefined;
    let hour: number | undefined;
    for (const part of formatter.formatToParts(instant)) {
      if (part.type === 'year') year = Number(part.value);
      else if (part.type === 'month') month = Number(part.value);
      else if (part.type === 'day') day = Number(part.value);
      else if (part.type === 'hour') hour = Number(part.value);
    }
    const result =
      [year, month, day, hour].every(Number.isInteger) &&
      month! >= 1 &&
      month! <= 12 &&
      day! >= 1 &&
      day! <= 31 &&
      hour! >= 0 &&
      hour! <= 23
        ? { weekday: gregorianWeekday(year!, month!, day!), hour: hour! }
        : undefined;
    if (cache.size >= 4096) cache.clear();
    cache.set(epochMinute, result);
    return result;
  };
}

/** Gregorian weekday where Sunday is 0, without allocating a `Date`. */
function gregorianWeekday(year: number, month: number, day: number): number {
  const adjustedYear = month < 3 ? year - 1 : year;
  return (
    (adjustedYear +
      Math.floor(adjustedYear / 4) -
      Math.floor(adjustedYear / 100) +
      Math.floor(adjustedYear / 400) +
      GREGORIAN_MONTH_WEEKDAY_OFFSETS[month - 1] +
      day) %
    7
  );
}

/** Returns whether a string names an Intl-supported IANA timezone. */
export function isIanaTimeZone(timeZone: string): boolean {
  const cached = timeZoneValidity.get(timeZone);
  if (cached !== undefined) return cached;
  try {
    const valid = getTimeZoneWeekdayHour(new Date(0), timeZone) !== undefined;
    timeZoneValidity.set(timeZone, valid);
    return valid;
  } catch {
    timeZoneValidity.set(timeZone, false);
    return false;
  }
}

/** Validates an IANA timezone at the shared date boundary. */
export function assertIanaTimeZone(timeZone: string, label = 'timeZone'): void {
  if (!isIanaTimeZone(timeZone)) {
    throw new Error(`Invalid ${label} IANA timezone "${timeZone}".`);
  }
}

/** Extracts the civil weekday/hour containing an instant in an IANA timezone. */
export function getTimeZoneWeekdayHour(
  instant: Date,
  timeZone: string,
): TimeZoneWeekdayHour | undefined {
  if (!Number.isFinite(instant.getTime())) return;
  let reader = weekdayHourReaders.get(timeZone);
  if (!reader) {
    reader = createTimeZoneWeekdayHourReader(timeZone);
    weekdayHourReaders.set(timeZone, reader);
  }
  return reader(instant);
}

/** Creates an instant from a civil date and clock minutes (UTC by default).
 * Gaps advance to the first valid minute; repeated times use the earlier instant. */
export function createDateTime(
  date: string,
  minutes: number,
  timeZone = 'UTC',
): ISODateTimeString {
  if (timeZone === 'UTC')
    return addElapsedMinutes(normalizeIsoDate(date), minutes);
  const local = new Date(
    parseDateTime(normalizeIsoDate(date)).getTime() + minutes * MINUTE_IN_MS,
  );
  const civil = getCivilParts(local, 'UTC');
  return new Date(
    resolveCivilBoundary(civil, timeZone).getTime() +
      local.getUTCMilliseconds(),
  ).toISOString() as ISODateTimeString;
}

export function createDateTimeFromTimeOfDay(
  date: string,
  time: string,
  dayOffset = 0,
): ISODateTimeString {
  const targetDate = addDays(normalizeIsoDate(date), dayOffset);
  const minutes = parseTimeOfDay(time);
  return createDateTime(targetDate, minutes);
}

/**
 * Serializes a local `Date` clock value as a UTC ISO datetime.
 * This preserves the user's local wall-clock fields for scheduler form inputs.
 */
export function getLocalDateTimeAsUtcIsoDateTime(
  date: Date,
): ISODateTimeString {
  const localDate = formatLocalIsoDate(date);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${localDate}T${hours}:${minutes}:${seconds}.000Z` as ISODateTimeString;
}

/** Shifts an absolute instant by elapsed minutes without truncating fractions. */
export function addElapsedMinutes(
  value: string,
  minutes: number,
): ISODateTimeString {
  if (!Number.isFinite(minutes))
    throw new Error('Elapsed minutes must be finite.');
  return formatIsoDateTime(
    new Date(parseDateTime(value).getTime() + minutes * MINUTE_IN_MS),
  );
}

/** Exact elapsed duration, including seconds and milliseconds. Legacy rounded helpers are unchanged. */
export function getElapsedDurationMinutes(event: {
  readonly startDateTime: string;
  readonly endDateTime: string;
}): number {
  return (
    (parseDateTime(event.endDateTime).getTime() -
      parseDateTime(event.startDateTime).getTime()) /
    MINUTE_IN_MS
  );
}

export function shiftDateTime(
  value: string,
  deltaMinutes: number,
): ISODateTimeString {
  return addMinutes(value, deltaMinutes);
}

/** Replaces the calendar date, preserving clock fields in the requested timezone (UTC by default). */
export function replaceDateTimeDate(
  value: string,
  date: string,
  timeZone = 'UTC',
): ISODateTimeString {
  if (timeZone !== 'UTC') {
    const source = parseDateTime(value);
    if (toISODate(source, timeZone) === date)
      return source.toISOString() as ISODateTimeString;
    const civil = getCivilParts(source, timeZone);
    return createDateTime(
      date,
      civil.hour * 60 +
        civil.minute +
        civil.second / 60 +
        source.getUTCMilliseconds() / 60000,
      timeZone,
    );
  }
  const source = parseDateTime(value);
  const target = parseDateTime(normalizeIsoDate(date));
  target.setUTCHours(
    source.getUTCHours(),
    source.getUTCMinutes(),
    source.getUTCSeconds(),
    source.getUTCMilliseconds(),
  );
  return formatIsoDateTime(target);
}

/** Advances whole schedule-local days. Fractional offsets retain legacy elapsed-day behavior. */
export function shiftDateTimeByCalendarDays(
  value: string,
  days: number,
  timeZone = 'UTC',
): ISODateTimeString {
  if (!Number.isInteger(days))
    return addDays(
      parseDateTime(value).toISOString(),
      days,
    ) as ISODateTimeString;
  const date = addDays(toISODate(parseDateTime(value), timeZone), days);
  return replaceDateTimeDate(value, date, timeZone);
}

export type DateTimeDurationMode = 'elapsed' | 'calendarDays';

export interface MoveDateTimeRangeOptions {
  /** Defaults to exact elapsed duration; calendarDays preserves civil date/clock duration. */
  readonly durationMode?: DateTimeDurationMode;
  /** Timezone for calendarDays arithmetic. Defaults to UTC. */
  readonly timeZone?: string;
}

/** Moves a range preserving elapsed duration by default, or schedule-local civil duration. */
export function moveDateTimeRange(
  start: string,
  end: string,
  nextStart: string,
  options: MoveDateTimeRangeOptions = {},
): {
  readonly startDateTime: ISODateTimeString;
  readonly endDateTime: ISODateTimeString;
} {
  const instant = parseDateTime(nextStart);
  const source = parseDateTime(start);
  const finish = parseDateTime(end);
  if (
    options.durationMode === 'calendarDays' &&
    instant.getTime() !== source.getTime()
  ) {
    const timeZone = options.timeZone ?? 'UTC';
    const dayOffset = diffInCalendarDays(
      toISODate(source, timeZone),
      toISODate(finish, timeZone),
    );
    const clockMinutes =
      getPreciseDateMinutes(instant, timeZone) +
      getPreciseDateMinutes(finish, timeZone) -
      getPreciseDateMinutes(source, timeZone);
    return {
      startDateTime: formatIsoDateTime(instant),
      endDateTime: createDateTime(
        addDays(toISODate(instant, timeZone), dayOffset),
        clockMinutes,
        timeZone,
      ),
    };
  }
  const duration = finish.getTime() - source.getTime();
  return {
    startDateTime: formatIsoDateTime(instant),
    endDateTime: formatIsoDateTime(new Date(instant.getTime() + duration)),
  };
}

export function isMidnightDateTime(value: string, timeZone = 'UTC'): boolean {
  const date = parseDateTime(value);
  if (timeZone !== 'UTC') {
    const civil = getCivilParts(date, timeZone);
    return (
      civil.hour === 0 &&
      civil.minute === 0 &&
      civil.second === 0 &&
      date.getUTCMilliseconds() === 0
    );
  }
  return (
    date.getUTCHours() === 0 &&
    date.getUTCMinutes() === 0 &&
    date.getUTCSeconds() === 0 &&
    date.getUTCMilliseconds() === 0
  );
}

export function getDateTimeDurationMinutes(
  startDateTime: string,
  endDateTime: string,
): number {
  return diffInMinutes(startDateTime, endDateTime);
}

export function getDurationMinutes(event: {
  readonly startDateTime: ISODateTimeString | string;
  readonly endDateTime: ISODateTimeString | string;
}): number {
  return diffInMinutes(
    event.startDateTime as ISODateTimeString,
    event.endDateTime as ISODateTimeString,
  );
}

/** Returns an event duration in minutes, clamped to zero for inverted ranges. */
export function getClampedDateTimeDurationMinutes(
  startDateTime: string,
  endDateTime: string,
): number {
  return Math.max(
    0,
    Math.round(
      (parseDateTime(endDateTime).getTime() -
        parseDateTime(startDateTime).getTime()) /
        MINUTE_IN_MS,
    ),
  );
}

export function snapMinutes(minutes: number, snap: number): number {
  return Math.round(minutes / snap) * snap;
}

/** Snaps clock minutes in the requested timezone; repeated times retain the nearest original fold. */
export function snapDateTime(
  value: string,
  snap: number,
  timeZone = 'UTC',
): ISODateTimeString {
  const date = parseDateTime(value);
  if (timeZone !== 'UTC') {
    const minutes = snapMinutes(
      Math.round(getPreciseDateMinutes(date, timeZone)),
      snap,
    );
    const target = createDateTime(toISODate(date, timeZone), minutes, timeZone);
    const civil = getCivilParts(parseDateTime(target), timeZone);
    const candidates = getPossibleInstants(civil, timeZone);
    return (
      candidates.sort(
        (a, b) =>
          Math.abs(a.getTime() - date.getTime()) -
          Math.abs(b.getTime() - date.getTime()),
      )[0] ?? parseDateTime(target)
    ).toISOString() as ISODateTimeString;
  }
  const dayStart = Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
  );
  const minutes = Math.round((date.getTime() - dayStart) / MINUTE_IN_MS);
  return createDateTime(toISODate(date), snapMinutes(minutes, snap));
}
