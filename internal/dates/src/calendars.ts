import type { ISODateString } from './iso';
import {
  formatIsoDate,
  getIsoWeekdayUtc,
  normalizeIsoDate,
  parseIsoDate,
} from './iso';
import { addDays, DAY_IN_MS } from './date-math';
import { parseTimeOfDay } from './time-of-day';

/** Unique identifier for a working calendar. */
export type CalendarId = string | number;

/** Time-of-day working window for calendar-aware schedulers. */
export interface CalendarWorkingTimeRange {
  /** Start time in `HH:mm` or AM/PM format. */
  readonly start: string;
  /** End time in `HH:mm` or AM/PM format. */
  readonly end: string;
}

/** Parsed working time window expressed as minutes from midnight. */
export interface CalendarResolvedWorkingTimeRange {
  readonly startMinutes: number;
  readonly endMinutes: number;
}

/** Shared bound for working-date traversal. */
export const CALENDAR_WORKING_DATE_SEARCH_LIMIT = 3660;
// Reserve one full week after the closure for the next effective working weekday.
const MAX_BOUNDED_CLOSURE_DAYS = CALENDAR_WORKING_DATE_SEARCH_LIMIT - 7;

export type CalendarWeekday = 1 | 2 | 3 | 4 | 5 | 6 | 7;

/** Overrides one ISO weekday. An explicit empty range list closes that weekday. */
export type CalendarWeekdayWorkingHours = Partial<
  Readonly<Record<CalendarWeekday, readonly CalendarWorkingTimeRange[]>>
>;

/** Civil-date recurrence anchored to the exception's original start and end dates. */
export interface CalendarExceptionRecurrence {
  readonly frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  /** Positive integral period count; defaults to one. */
  readonly interval?: number;
  /** Inclusive final matching date; omission repeats indefinitely. */
  readonly until?: ISODateString;
}

/** Replaces the entire working schedule on matching dates; [] makes them nonworking. */
export interface CalendarException {
  readonly id: string;
  readonly name?: string;
  readonly startDate: ISODateString;
  readonly endDate?: ISODateString;
  readonly workingHours: readonly CalendarWorkingTimeRange[];
  readonly recurrence?: CalendarExceptionRecurrence;
}

/**
 * Defines the working schedule for tasks, events, and resources.
 * Working days use ISO weekday numbers: 1 = Monday ... 7 = Sunday.
 */
export interface CalendarEntity {
  /** Unique calendar identifier. */
  readonly id: CalendarId;
  /** Display name, for example `"Standard"` or `"Night Shift"`. */
  readonly name: string;
  /** IANA time zone, for example `"America/New_York"`. */
  readonly timeZone: string;
  /** ISO weekday numbers that are working days. */
  readonly workingDays: readonly number[];
  /** Specific dates that are non-working regardless of weekday. */
  readonly holidays: readonly ISODateString[];
  /** Optional working time windows inside a working day. */
  readonly workingHours?:
    | CalendarWorkingTimeRange
    | readonly CalendarWorkingTimeRange[];
  /** Base calendar. A derived calendar inherits its working week unless explicitly disabled. */
  readonly baseCalendarId?: CalendarId;
  /** Defaults to true with a base; false uses the local legacy week and local weekday overrides. */
  readonly inheritWorkingWeek?: boolean;
  readonly weekdayWorkingHours?: CalendarWeekdayWorkingHours;
  /** Base rules apply before child rules; the last matching exception wins. */
  readonly exceptions?: readonly CalendarException[];
  /** Number of working hours per day, used for effort/capacity calculations. */
  readonly hoursPerDay: number;
}

/** Default Monday-Friday calendar shared by Gantt and Event Scheduler. */
export const DEFAULT_CALENDAR: CalendarEntity = {
  id: 'default',
  name: 'Standard',
  timeZone: 'UTC',
  workingDays: [1, 2, 3, 4, 5],
  holidays: [],
  workingHours: { start: '09:00', end: '17:00' },
  hoursPerDay: 8,
};

/** Calendar with derived lookup-friendly fields used by schedulers. */
export interface ResolvedCalendarEntity {
  readonly calendar: CalendarEntity;
  readonly workingDays: readonly number[];
  readonly workingHours: readonly CalendarResolvedWorkingTimeRange[];
  readonly holidays: ReadonlySet<string>;
}

export interface CalendarListLookupContext {
  readonly calendars: readonly CalendarEntity[];
  readonly primaryCalendarId?: CalendarId;
}

export type CalendarLookupTarget =
  | CalendarId
  | { readonly calendarId?: CalendarId }
  | undefined;

export function calendarKey(calendarId: CalendarId): string {
  return String(calendarId);
}

function getCalendarLookupId(
  target: CalendarLookupTarget,
): CalendarId | undefined {
  return typeof target === 'string' || typeof target === 'number'
    ? target
    : target?.calendarId;
}

export function normalizeIsoWorkingDays(
  days: readonly number[] | undefined,
  fallback: readonly number[] = DEFAULT_CALENDAR.workingDays,
): readonly number[] {
  if (!days?.length) {
    return fallback;
  }

  const unique = Array.from(
    new Set(
      days.filter((day) => Number.isInteger(day) && day >= 1 && day <= 7),
    ),
  );
  return unique.length ? unique.sort((left, right) => left - right) : fallback;
}

export function jsWeekdayFromIsoWeekday(day: number): number {
  return day === 7 ? 0 : day;
}

export function jsWeekdaysFromIsoWeekdays(
  days: readonly number[],
): readonly number[] {
  return days.map(jsWeekdayFromIsoWeekday).sort((left, right) => left - right);
}

export function normalizeCalendarHolidaySet(
  holidays: readonly ISODateString[] | undefined,
): ReadonlySet<string> {
  return new Set((holidays ?? []).map((holiday) => normalizeIsoDate(holiday)));
}

function parseCalendarWorkingHours(
  workingHours:
    | CalendarWorkingTimeRange
    | readonly CalendarWorkingTimeRange[]
    | undefined,
  options: { readonly errorPrefix?: string } = {},
): readonly CalendarResolvedWorkingTimeRange[] {
  if (!workingHours) return [];

  const ranges = Array.isArray(workingHours) ? workingHours : [workingHours];
  const errorPrefix = options.errorPrefix ?? 'Calendar workingHours';

  return ranges
    .map((range) => {
      const startMinutes = parseTimeOfDay(range.start, {
        allowEndOfDay: false,
      });
      const endMinutes = parseTimeOfDay(range.end, { allowEndOfDay: true });
      if (endMinutes <= startMinutes) {
        throw new Error(`${errorPrefix} end must be after start.`);
      }
      return { startMinutes, endMinutes };
    })
    .sort((left, right) => left.startMinutes - right.startMinutes);
}

export function normalizeCalendarWorkingHours(
  workingHours:
    | CalendarWorkingTimeRange
    | readonly CalendarWorkingTimeRange[]
    | undefined,
  options: { readonly errorPrefix?: string } = {},
): readonly CalendarResolvedWorkingTimeRange[] {
  const parsed = parseCalendarWorkingHours(workingHours, options);
  const merged: CalendarResolvedWorkingTimeRange[] = [];
  for (const range of parsed) {
    const previous = merged[merged.length - 1];
    if (previous && range.startMinutes <= previous.endMinutes) {
      merged[merged.length - 1] = {
        startMinutes: previous.startMinutes,
        endMinutes: Math.max(previous.endMinutes, range.endMinutes),
      };
    } else {
      merged.push(range);
    }
  }
  return merged;
}

export function normalizeCalendar(
  calendar: CalendarEntity,
  options: { readonly workingHoursErrorPrefix?: string } = {},
): ResolvedCalendarEntity {
  return {
    calendar,
    workingDays: calendar.workingDays.length
      ? normalizeIsoWorkingDays(calendar.workingDays)
      : [],
    workingHours: normalizeCalendarWorkingHours(
      calendar.workingHours ?? DEFAULT_CALENDAR.workingHours,
      {
        ...(options.workingHoursErrorPrefix
          ? { errorPrefix: options.workingHoursErrorPrefix }
          : {}),
      },
    ),
    holidays: normalizeCalendarHolidaySet(calendar.holidays),
  };
}

export function createResolvedCalendarMap(
  calendars: readonly CalendarEntity[] | undefined,
  options: { readonly workingHoursErrorPrefix?: string } = {},
): Map<string, ResolvedCalendarEntity> {
  const items = new Map<string, ResolvedCalendarEntity>();
  for (const calendar of createCalendarMap(calendars).values()) {
    const id = calendarKey(calendar.id);
    if (!id) continue;
    items.set(id, normalizeCalendar(calendar, options));
  }
  return items;
}

export function createCalendarMap(
  calendars: readonly CalendarEntity[] | undefined,
): Map<CalendarId, CalendarEntity> {
  const source = new Map(
    (calendars ?? []).map((calendar) => [calendar.id, calendar]),
  );
  const resolved = new Map<CalendarId, CalendarEntity>();
  const visiting = new Set<CalendarId>();
  const resolve = (calendar: CalendarEntity): CalendarEntity => {
    const cached = resolved.get(calendar.id);
    if (cached) return cached;
    if (visiting.has(calendar.id))
      throw new Error(`Calendar inheritance cycle at "${calendar.id}".`);
    visiting.add(calendar.id);
    let effective = calendar;
    if (
      calendar.baseCalendarId !== undefined &&
      !isEffectiveCalendar(calendar)
    ) {
      const base = source.get(calendar.baseCalendarId);
      if (!base)
        throw new Error(`Missing base calendar "${calendar.baseCalendarId}".`);
      const parent = resolve(base);
      const inheritWeek = calendar.inheritWorkingWeek !== false;
      effective = {
        ...calendar,
        ...(inheritWeek
          ? {
              workingDays: parent.workingDays,
              workingHours: parent.workingHours,
              hoursPerDay: parent.hoursPerDay,
            }
          : {}),
        weekdayWorkingHours: {
          ...(inheritWeek ? parent.weekdayWorkingHours : {}),
          ...calendar.weekdayWorkingHours,
        },
        holidays: [...new Set([...parent.holidays, ...calendar.holidays])],
        exceptions: [
          ...(parent.exceptions ?? []),
          ...(calendar.exceptions ?? []),
        ],
      };
      const origins = new Map(exceptionOrigins.get(parent));
      for (const exception of parent.exceptions ?? [])
        if (!origins.has(exception)) origins.set(exception, parent.id);
      for (const exception of calendar.exceptions ?? [])
        origins.set(exception, calendar.id);
      exceptionOrigins.set(effective, origins);
      Object.defineProperty(effective, RESOLVED_CALENDAR, {
        value: {
          baseCalendarId: calendar.baseCalendarId,
          inheritWorkingWeek: calendar.inheritWorkingWeek,
        },
        enumerable: true,
      });
    }
    visiting.delete(calendar.id);
    resolved.set(calendar.id, effective);
    return effective;
  };
  for (const calendar of source.values()) resolve(calendar);
  return resolved;
}

export function resolveCalendarFromMap(
  target: CalendarLookupTarget,
  calendarsById: ReadonlyMap<CalendarId, CalendarEntity>,
  primaryCalendar: CalendarEntity | null,
): CalendarEntity | null {
  const calendarId = getCalendarLookupId(target);
  const calendar =
    calendarId === undefined
      ? primaryCalendar
      : (calendarsById.get(calendarId) ?? primaryCalendar);
  if (
    !calendar ||
    calendar.baseCalendarId === undefined ||
    isEffectiveCalendar(calendar)
  )
    return calendar;
  let resolved = calendarMapCache.get(calendarsById);
  if (!resolved) {
    resolved = createCalendarMap([...calendarsById.values()]);
    calendarMapCache.set(calendarsById, resolved);
  }
  return resolved.get(calendar.id) ?? calendar;
}

export function resolveCalendarFromList(
  context: CalendarListLookupContext,
  target?: CalendarLookupTarget,
): CalendarEntity | null {
  const calendarsById = createCalendarMap(context.calendars);
  return resolveCalendarFromMap(
    target,
    calendarsById,
    calendarsById.get(context.primaryCalendarId ?? '') ?? null,
  );
}

export function resolveCalendarItemFromMap<T>(
  target: CalendarLookupTarget,
  items: ReadonlyMap<string, T>,
): T | null {
  const calendarId = getCalendarLookupId(target);
  return calendarId === undefined
    ? null
    : (items.get(calendarKey(calendarId)) ?? null);
}

function isReadonlySet<T>(
  value: readonly T[] | ReadonlySet<T>,
): value is ReadonlySet<T> {
  return typeof (value as ReadonlySet<T>).has === 'function';
}

export function isCalendarHoliday(
  date: ISODateString | string,
  calendar:
    | { readonly holidays: readonly string[] | ReadonlySet<string> }
    | null
    | undefined,
): boolean {
  if (!calendar) return false;

  const normalizedDate = normalizeIsoDate(date);
  return isReadonlySet(calendar.holidays)
    ? calendar.holidays.has(normalizedDate)
    : calendar.holidays.includes(normalizedDate as ISODateString);
}

export function isCalendarWorkingWeekday(
  weekday: number,
  calendar:
    | Pick<CalendarEntity, 'workingDays'>
    | Pick<ResolvedCalendarEntity, 'workingDays'>
    | null
    | undefined,
): boolean {
  return !calendar || calendar.workingDays.includes(weekday);
}

export type CalendarScheduleSource = Pick<CalendarEntity, 'workingDays'> & {
  readonly holidays: readonly string[] | ReadonlySet<string>;
  readonly workingHours?: CalendarEntity['workingHours'];
  readonly weekdayWorkingHours?: CalendarWeekdayWorkingHours;
  readonly exceptions?: readonly CalendarException[];
  readonly id?: CalendarId;
};

export interface CalendarDateSchedule {
  readonly isWorking: boolean;
  readonly workingHours: readonly CalendarResolvedWorkingTimeRange[];
  readonly exception?: CalendarException;
  readonly exceptionCalendarId?: CalendarId;
}

/** Evaluates civil UTC dates; timeZone metadata does not reinterpret existing scheduler timestamps. */
export function getCalendarDateSchedule(
  date: ISODateString | string,
  calendar: CalendarScheduleSource | ResolvedCalendarEntity | null | undefined,
): CalendarDateSchedule {
  if (!calendar) return { isWorking: true, workingHours: [] };
  const source = 'calendar' in calendar ? calendar.calendar : calendar;
  const day = formatIsoDate(parseIsoDate(date));
  const weekday = getIsoWeekdayUtc(parseIsoDate(day)) as CalendarWeekday;
  const workingDays =
    'calendar' in calendar ? calendar.workingDays : source.workingDays;
  const override = source.weekdayWorkingHours?.[weekday];
  let isWorking =
    (override !== undefined
      ? override.length > 0
      : workingDays.includes(weekday)) && !isCalendarHoliday(day, calendar);
  let workingHours = isWorking
    ? override === undefined && 'calendar' in calendar
      ? calendar.workingHours
      : normalizeCalendarWorkingHours(override ?? source.workingHours)
    : [];
  let exception: CalendarException | undefined;
  for (const candidate of source.exceptions ?? []) {
    if (matchesCalendarException(day, candidate)) exception = candidate;
  }
  if (exception) {
    workingHours = normalizeCalendarWorkingHours(exception.workingHours);
    isWorking = workingHours.length > 0;
  }
  return {
    isWorking,
    workingHours,
    ...(exception
      ? {
          exception,
          exceptionCalendarId:
            exceptionOrigins.get(source)?.get(exception) ?? source.id,
        }
      : {}),
  };
}

export function isWorkingCalendarDate(
  date: ISODateString | string,
  _weekday: number,
  calendar: CalendarScheduleSource | ResolvedCalendarEntity | null | undefined,
): boolean {
  return getCalendarDateSchedule(date, calendar).isWorking;
}

export function isCalendarWorkingHour(
  date: ISODateString | string,
  calendar: CalendarEntity | ResolvedCalendarEntity | null | undefined,
): boolean {
  if (!calendar) return true;
  const parsed = parseIsoDate(date);
  const schedule = getCalendarDateSchedule(
    date,
    withDefaultCalendarHours(calendar),
  );
  if (!schedule.isWorking) return false;
  if (!schedule.workingHours.length) return true;
  const startMinutes = parsed.getUTCHours() * 60 + parsed.getUTCMinutes();
  const endMinutes = Math.min(24 * 60, startMinutes + 60);
  return schedule.workingHours.some(
    (range) =>
      startMinutes < range.endMinutes && endMinutes > range.startMinutes,
  );
}

function withDefaultCalendarHours(
  calendar: CalendarEntity | ResolvedCalendarEntity,
): CalendarEntity | ResolvedCalendarEntity {
  if ('calendar' in calendar || calendar.workingHours !== undefined)
    return calendar;
  return { ...calendar, workingHours: DEFAULT_CALENDAR.workingHours };
}

function resolveCalendarWorkingMinute(
  date: ISODateString | string,
  calendar: CalendarEntity | ResolvedCalendarEntity | null | undefined,
): { minute: number; schedule: CalendarDateSchedule } | null {
  if (!calendar) return null;
  const parsed = parseIsoDate(date);
  const schedule = getCalendarDateSchedule(
    date,
    withDefaultCalendarHours(calendar),
  );
  if (!schedule.isWorking) return null;
  return {
    minute: parsed.getUTCHours() * 60 + parsed.getUTCMinutes(),
    schedule,
  };
}

export function isCalendarWorkingMinute(
  date: ISODateString | string,
  calendar: CalendarEntity | ResolvedCalendarEntity | null | undefined,
): boolean {
  if (!calendar) return true;
  const value = resolveCalendarWorkingMinute(date, calendar);
  if (!value) return false;
  return (
    !value.schedule.workingHours.length ||
    value.schedule.workingHours.some(
      (range) =>
        value.minute >= range.startMinutes && value.minute < range.endMinutes,
    )
  );
}

export function isCalendarWorkingMinuteEnd(
  date: ISODateString | string,
  calendar: CalendarEntity | ResolvedCalendarEntity | null | undefined,
): boolean {
  const value = resolveCalendarWorkingMinute(date, calendar);
  if (
    value?.schedule.workingHours.some(
      (range) => value.minute === range.endMinutes,
    )
  )
    return true;
  if (!calendar) return false;
  const parsed = parseIsoDate(date);
  if (parsed.getUTCHours() !== 0 || parsed.getUTCMinutes() !== 0) return false;
  const previous = getCalendarDateSchedule(
    addDays(formatIsoDate(parsed), -1),
    withDefaultCalendarHours(calendar),
  );
  return (
    previous.isWorking &&
    previous.workingHours.some((range) => range.endMinutes === 1440)
  );
}

const RESOLVED_CALENDAR = Symbol('resolved-working-calendar');
function isEffectiveCalendar(calendar: CalendarEntity): boolean {
  const marker = (
    calendar as CalendarEntity & {
      [RESOLVED_CALENDAR]?: Pick<
        CalendarEntity,
        'baseCalendarId' | 'inheritWorkingWeek'
      >;
    }
  )[RESOLVED_CALENDAR];
  return (
    !!marker &&
    marker.baseCalendarId === calendar.baseCalendarId &&
    marker.inheritWorkingWeek === calendar.inheritWorkingWeek
  );
}
const exceptionOrigins = new WeakMap<
  object,
  Map<CalendarException, CalendarId>
>();
const calendarMapCache = new WeakMap<
  ReadonlyMap<CalendarId, CalendarEntity>,
  Map<CalendarId, CalendarEntity>
>();

function isStrictCalendarDate(value: string): boolean {
  return (
    typeof value === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    Number.isFinite(parseIsoDate(value).getTime()) &&
    formatIsoDate(parseIsoDate(value)) === value
  );
}

function shiftCalendarExceptionDate(
  value: string,
  months: number,
): string | null {
  const original = parseIsoDate(value);
  const shifted = new Date(0);
  shifted.setUTCFullYear(
    original.getUTCFullYear(),
    original.getUTCMonth() + months,
    original.getUTCDate(),
  );
  shifted.setUTCHours(0, 0, 0, 0);
  // Missing month days are skipped, including February 29 in non-leap years.
  if (
    shifted.getUTCDate() !== original.getUTCDate() ||
    !Number.isFinite(shifted.getTime())
  )
    return null;
  return formatIsoDate(shifted);
}

/** Matches recurrence by civil calendar fields without scanning every date or altering time zones. */
export function matchesCalendarException(
  date: string,
  exception: CalendarException,
): boolean {
  const day = formatIsoDate(parseIsoDate(date));
  const start = exception.startDate;
  const end = exception.endDate ?? start;
  if (
    !isStrictCalendarDate(start) ||
    !isStrictCalendarDate(end) ||
    end < start ||
    day < start
  )
    return false;
  const rule = exception.recurrence;
  if (!rule) return day <= end;
  const interval = rule.interval ?? 1;
  if (
    !Number.isSafeInteger(interval) ||
    interval <= 0 ||
    (rule.until !== undefined &&
      (!isStrictCalendarDate(rule.until) || day > rule.until))
  )
    return false;
  const startMs = parseIsoDate(start).getTime();
  const deltaDays = (parseIsoDate(day).getTime() - startMs) / DAY_IN_MS;
  const spanDays = (parseIsoDate(end).getTime() - startMs) / DAY_IN_MS;
  if (rule.frequency === 'daily' || rule.frequency === 'weekly') {
    const period = interval * (rule.frequency === 'weekly' ? 7 : 1);
    return deltaDays % period <= spanDays;
  }
  if (rule.frequency !== 'monthly' && rule.frequency !== 'yearly') return false;
  const from = parseIsoDate(start),
    current = parseIsoDate(day),
    last = parseIsoDate(end);
  const periodMonths = interval * (rule.frequency === 'yearly' ? 12 : 1);
  const monthsSinceStart =
    (current.getUTCFullYear() - from.getUTCFullYear()) * 12 +
    current.getUTCMonth() -
    from.getUTCMonth();
  const spanMonths =
    (last.getUTCFullYear() - from.getUTCFullYear()) * 12 +
    last.getUTCMonth() -
    from.getUTCMonth();
  const latest = Math.floor(monthsSinceStart / periodMonths);
  const earliest = Math.max(
    0,
    latest - Math.ceil(spanMonths / periodMonths) - 1,
  );
  // Exception spans are validated to at most 100 years, keeping matching bounded.
  if (spanDays > 36600) return false;
  for (let occurrence = latest; occurrence >= earliest; occurrence -= 1) {
    const occurrenceStart = shiftCalendarExceptionDate(
      start,
      occurrence * periodMonths,
    );
    const occurrenceEnd = shiftCalendarExceptionDate(
      end,
      occurrence * periodMonths,
    );
    if (
      occurrenceStart &&
      occurrenceEnd &&
      day >= occurrenceStart &&
      day <= occurrenceEnd
    )
      return true;
  }
  return false;
}

/** Detects a provable permanent closure, without inferring arbitrary recurring-rule interactions. */
function findPermanentClosedTail(
  calendar: CalendarEntity,
): CalendarException | undefined {
  let hasLaterRecurringWork = false;
  for (const exception of [...(calendar.exceptions ?? [])].reverse()) {
    const rule = exception.recurrence;
    if (!rule || rule.until !== undefined) continue;
    if (exception.workingHours.length) {
      hasLaterRecurringWork = true;
      continue;
    }
    if (rule.frequency !== 'daily' && rule.frequency !== 'weekly') continue;
    const periodDays =
      (rule.interval ?? 1) * (rule.frequency === 'weekly' ? 7 : 1);
    const spanDays =
      (parseIsoDate(exception.endDate ?? exception.startDate).getTime() -
        parseIsoDate(exception.startDate).getTime()) /
        DAY_IN_MS +
      1;
    if (spanDays >= periodDays)
      return hasLaterRecurringWork ? undefined : exception;
  }
  return undefined;
}

export interface CalendarValidationIssue {
  readonly calendarId: CalendarId;
  readonly code: string;
  readonly message: string;
  readonly exceptionId?: string;
}

/** Validates editor/import input without mutating it; legacy lookup remains tolerant of weekday normalization. */
export function validateCalendars(
  calendars: readonly CalendarEntity[],
): readonly CalendarValidationIssue[] {
  const issues: CalendarValidationIssue[] = [];
  if (!Array.isArray(calendars))
    return [
      {
        calendarId: '',
        code: 'invalid-calendars',
        message: 'Calendars must be an array.',
      },
    ];
  const candidates: CalendarEntity[] = [];
  for (const [index, value] of (calendars as readonly unknown[]).entries()) {
    if (
      !value ||
      typeof value !== 'object' ||
      !('id' in value) ||
      !Array.isArray((value as CalendarEntity).workingDays) ||
      !Array.isArray((value as CalendarEntity).holidays) ||
      typeof (value as CalendarEntity).name !== 'string' ||
      typeof (value as CalendarEntity).timeZone !== 'string' ||
      ((value as CalendarEntity).exceptions !== undefined &&
        !Array.isArray((value as CalendarEntity).exceptions)) ||
      ((value as CalendarEntity).weekdayWorkingHours !== undefined &&
        (!(value as CalendarEntity).weekdayWorkingHours ||
          typeof (value as CalendarEntity).weekdayWorkingHours !== 'object' ||
          Array.isArray((value as CalendarEntity).weekdayWorkingHours)))
    ) {
      issues.push({
        calendarId: `invalid-${index}`,
        code: 'invalid-calendar',
        message:
          'Calendar snapshots require an object with identity, name, time zone, weekdays and holidays.',
      });
      continue;
    }
    candidates.push(value as CalendarEntity);
  }
  const ids = new Set<string>();
  for (const calendar of candidates) {
    const add = (code: string, message: string, exceptionId?: string) =>
      issues.push({
        calendarId: calendar.id,
        code,
        message,
        ...(exceptionId ? { exceptionId } : {}),
      });
    const key = calendarKey(calendar.id);
    if (ids.has(key))
      add(
        'duplicate-calendar-id',
        'Calendar IDs must be unique after normalization.',
      );
    ids.add(key);
    if (
      (typeof calendar.id !== 'string' && typeof calendar.id !== 'number') ||
      String(calendar.id).trim() === '' ||
      (typeof calendar.id === 'number' && !Number.isFinite(calendar.id))
    )
      add('invalid-calendar-id', 'A calendar requires a finite, nonempty ID.');
    if (!calendar.name?.trim())
      add('invalid-calendar-name', 'A calendar requires a name.');
    try {
      new Intl.DateTimeFormat('en', { timeZone: calendar.timeZone });
    } catch {
      add(
        'invalid-calendar-timezone',
        'Calendar time zone must be an IANA time zone.',
      );
    }
    if (!calendar.timeZone?.trim())
      add('invalid-calendar-timezone', 'Calendar time zone is required.');
    if (
      calendar.inheritWorkingWeek !== undefined &&
      typeof calendar.inheritWorkingWeek !== 'boolean'
    )
      add(
        'invalid-calendar-inheritance',
        'inheritWorkingWeek must be a boolean.',
      );
    if (
      !Number.isFinite(calendar.hoursPerDay) ||
      calendar.hoursPerDay <= 0 ||
      calendar.hoursPerDay > 24
    )
      add(
        'invalid-calendar-hours-per-day',
        'Working hours per day must be greater than zero and at most 24.',
      );
    if (
      !Array.isArray(calendar.workingDays) ||
      calendar.workingDays.some(
        (day) => !Number.isInteger(day) || day < 1 || day > 7,
      )
    )
      add(
        'invalid-calendar-weekdays',
        'Working weekdays must use ISO values from 1 to 7.',
      );
    const checkHours = (
      ranges: CalendarEntity['workingHours'],
      exceptionId?: string,
    ) => {
      if (ranges === undefined) return;
      try {
        const parsed = parseCalendarWorkingHours(ranges);
        if (
          parsed.some(
            (range, index) =>
              index > 0 && range.startMinutes < parsed[index - 1].endMinutes,
          )
        )
          add(
            'invalid-calendar-working-hours',
            'Working windows must end after they start and must not overlap.',
            exceptionId,
          );
      } catch {
        add(
          'invalid-calendar-working-hours',
          'Working windows require valid times.',
          exceptionId,
        );
      }
    };
    checkHours(calendar.workingHours);
    for (const [weekday, ranges] of Object.entries(
      calendar.weekdayWorkingHours ?? {},
    )) {
      if (!/^[1-7]$/.test(weekday))
        add(
          'invalid-calendar-weekdays',
          'Weekday overrides must use ISO values from 1 to 7.',
        );
      if (!Array.isArray(ranges))
        add(
          'invalid-calendar-working-hours',
          'Weekday overrides require arrays of working windows.',
        );
      else checkHours(ranges);
    }
    for (const holiday of calendar.holidays ?? [])
      if (!isStrictCalendarDate(holiday))
        add('invalid-calendar-holiday', 'Holidays require valid civil dates.');
    const exceptionIds = new Set<string>();
    for (const exception of calendar.exceptions ?? []) {
      if (
        !exception ||
        typeof exception !== 'object' ||
        typeof exception.id !== 'string' ||
        typeof exception.startDate !== 'string' ||
        !Array.isArray(exception.workingHours) ||
        (exception.endDate !== undefined &&
          typeof exception.endDate !== 'string') ||
        (exception.recurrence !== undefined &&
          (!exception.recurrence || typeof exception.recurrence !== 'object'))
      ) {
        add(
          'invalid-calendar-exception',
          'Exceptions require an identity, start date and array of working windows.',
        );
        continue;
      }
      if (!exception.id?.trim() || exceptionIds.has(exception.id))
        add(
          'invalid-calendar-exception-id',
          'Exception IDs must be nonempty and unique within a calendar.',
          exception.id,
        );
      exceptionIds.add(exception.id);
      const end = exception.endDate ?? exception.startDate;
      if (
        !isStrictCalendarDate(exception.startDate) ||
        !isStrictCalendarDate(end) ||
        end < exception.startDate ||
        (parseIsoDate(end).getTime() -
          parseIsoDate(exception.startDate).getTime()) /
          DAY_IN_MS >
          36600
      )
        add(
          'invalid-calendar-exception-range',
          'Exception ranges require valid inclusive dates spanning at most 100 years.',
          exception.id,
        );
      checkHours(exception.workingHours, exception.id);
      const rule = exception.recurrence;
      const closureEnd = rule?.until ?? end;
      if (
        !exception.workingHours.length &&
        (!rule || rule.until !== undefined) &&
        isStrictCalendarDate(exception.startDate) &&
        isStrictCalendarDate(closureEnd) &&
        (parseIsoDate(closureEnd).getTime() -
          parseIsoDate(exception.startDate).getTime()) /
          DAY_IN_MS +
          1 >
          MAX_BOUNDED_CLOSURE_DAYS
      ) {
        add(
          'calendar-closure-exceeds-search-horizon',
          `Bounded nonworking exceptions must span at most ${MAX_BOUNDED_CLOSURE_DAYS} days to fit the working-date search horizon.`,
          exception.id,
        );
      }
      if (
        rule &&
        (!['daily', 'weekly', 'monthly', 'yearly'].includes(rule.frequency) ||
          !Number.isSafeInteger(rule.interval ?? 1) ||
          (rule.interval ?? 1) <= 0 ||
          (rule.until !== undefined &&
            (!isStrictCalendarDate(rule.until) || rule.until < end)))
      )
        add(
          'invalid-calendar-exception-recurrence',
          'Recurrence requires a positive integer interval and an optional end date on or after the exception range.',
          exception.id,
        );
    }
    const seen = new Set<CalendarId>([calendar.id]);
    let parent = calendar.baseCalendarId;
    while (parent !== undefined) {
      if (seen.has(parent)) {
        add(
          'calendar-inheritance-cycle',
          'Calendar inheritance must not contain cycles.',
        );
        break;
      }
      seen.add(parent);
      const base = candidates.find((item) => item.id === parent);
      if (!base) {
        add(
          'missing-base-calendar',
          `Base calendar "${parent}" does not exist.`,
        );
        break;
      }
      parent = base.baseCalendarId;
    }
  }
  if (!issues.length) {
    for (const calendar of createCalendarMap(candidates).values()) {
      const open = Array.from({ length: 7 }, (_, index) => index + 1).some(
        (weekday) => {
          const ranges =
            calendar.weekdayWorkingHours?.[weekday as CalendarWeekday];
          return ranges !== undefined
            ? ranges.length > 0
            : calendar.workingDays.includes(weekday);
        },
      );
      if (!open)
        issues.push({
          calendarId: calendar.id,
          code: 'calendar-without-working-day',
          message:
            'A calendar requires at least one effective working weekday.',
        });
      const permanentClosure = findPermanentClosedTail(calendar);
      if (permanentClosure)
        issues.push({
          calendarId: calendar.id,
          code: 'calendar-without-future-working-time',
          exceptionId: permanentClosure.id,
          message:
            'A calendar cannot close every future date indefinitely without a later recurring working exception.',
        });
    }
  }
  return issues;
}

/** Deeply clones calendar source data for transactional editors, snapshots and history. */
export function cloneCalendars(
  calendars: readonly CalendarEntity[],
): CalendarEntity[] {
  const cloneHours = (
    ranges: CalendarEntity['workingHours'],
  ): CalendarEntity['workingHours'] =>
    ranges === undefined
      ? undefined
      : Array.isArray(ranges)
        ? ranges.map((range) => ({ ...range }))
        : { ...ranges };
  return calendars.map((calendar) => ({
    ...calendar,
    workingDays: [...calendar.workingDays],
    holidays: [...calendar.holidays],
    ...(calendar.workingHours === undefined
      ? {}
      : { workingHours: cloneHours(calendar.workingHours) }),
    ...(calendar.weekdayWorkingHours === undefined
      ? {}
      : {
          weekdayWorkingHours: Object.fromEntries(
            Object.entries(calendar.weekdayWorkingHours).map(
              ([day, ranges]) => [day, cloneHours(ranges)],
            ),
          ),
        }),
    ...(calendar.exceptions === undefined
      ? {}
      : {
          exceptions: calendar.exceptions.map((exception) => ({
            ...exception,
            workingHours: exception.workingHours.map((range) => ({ ...range })),
            ...(exception.recurrence
              ? { recurrence: { ...exception.recurrence } }
              : {}),
          })),
        }),
  }));
}
