import { describe, expect, it } from 'vitest';
import {
  DEFAULT_CALENDAR,
  createResolvedCalendarMap,
  isCalendarHoliday,
  isCalendarWorkingHour,
  isCalendarWorkingMinute,
  isCalendarWorkingMinuteEnd,
  isWorkingCalendarDate,
  jsWeekdaysFromIsoWeekdays,
  normalizeCalendar,
  normalizeCalendarWorkingHours,
  normalizeIsoWorkingDays,
  resolveCalendarFromList,
  resolveCalendarItemFromMap,
} from './calendars';
import type { CalendarEntity } from './calendars';

const customCalendar: CalendarEntity = {
  id: 'night',
  name: 'Night Shift',
  timeZone: 'UTC',
  workingDays: [5, 1, 7, 7, 0],
  holidays: ['2026-04-10'],
  workingHours: [
    { start: '10 PM', end: '24:00' },
    { start: '08:00', end: '12:00' },
  ],
  hoursPerDay: 6,
};

describe('shared calendars', () => {
  it('provides the shared default planning calendar', () => {
    expect(DEFAULT_CALENDAR).toEqual({
      id: 'default',
      name: 'Standard',
      timeZone: 'UTC',
      workingDays: [1, 2, 3, 4, 5],
      holidays: [],
      workingHours: { start: '09:00', end: '17:00' },
      hoursPerDay: 8,
    });
  });

  it('normalizes ISO weekdays and converts them to JavaScript weekday indexes', () => {
    expect(normalizeIsoWorkingDays(customCalendar.workingDays)).toEqual([
      1, 5, 7,
    ]);
    expect(normalizeIsoWorkingDays([0, 8])).toEqual(
      DEFAULT_CALENDAR.workingDays,
    );
    expect(jsWeekdaysFromIsoWeekdays([1, 5, 7])).toEqual([0, 1, 5]);
  });

  it('parses and sorts working-hour ranges', () => {
    expect(normalizeCalendarWorkingHours(customCalendar.workingHours)).toEqual([
      { startMinutes: 8 * 60, endMinutes: 12 * 60 },
      { startMinutes: 22 * 60, endMinutes: 24 * 60 },
    ]);
    expect(() =>
      normalizeCalendarWorkingHours({ start: '18:00', end: '09:00' }),
    ).toThrow(/Calendar workingHours end must be after start/);
  });

  it('normalizes calendar holidays and working-day checks', () => {
    const calendar = normalizeCalendar(customCalendar);

    expect(calendar.calendar).toBe(customCalendar);
    expect(calendar.holidays.has('2026-04-10')).toBe(true);
    expect(isCalendarHoliday('2026-04-10', calendar)).toBe(true);
    expect(isWorkingCalendarDate('2026-04-10', 5, calendar)).toBe(false);
    expect(isWorkingCalendarDate('2026-04-12', 7, calendar)).toBe(true);
    expect(isWorkingCalendarDate('2026-04-13', 1, calendar)).toBe(true);
    expect(isWorkingCalendarDate('2026-04-14', 2, calendar)).toBe(false);
  });

  it('checks working-hour slots against weekdays, holidays, and working-hour ranges', () => {
    const calendar: CalendarEntity = {
      id: 'office',
      name: 'Office',
      timeZone: 'UTC',
      workingDays: [1, 2, 3, 4, 5],
      holidays: ['2026-04-10'],
      workingHours: [
        { start: '09:00', end: '12:00' },
        { start: '13:00', end: '17:00' },
      ],
      hoursPerDay: 7,
    };

    expect(isCalendarWorkingHour('2026-04-06T09:00:00.000Z', calendar)).toBe(
      true,
    );
    expect(isCalendarWorkingHour('2026-04-06T12:00:00.000Z', calendar)).toBe(
      false,
    );
    expect(isCalendarWorkingHour('2026-04-06T16:30:00.000Z', calendar)).toBe(
      true,
    );
    expect(isCalendarWorkingHour('2026-04-10T09:00:00.000Z', calendar)).toBe(
      false,
    );
    expect(isCalendarWorkingHour('2026-04-11T09:00:00.000Z', calendar)).toBe(
      false,
    );
  });

  it('checks exact working-minute boundaries', () => {
    const calendar: CalendarEntity = {
      id: 'office',
      name: 'Office',
      timeZone: 'UTC',
      workingDays: [1, 2, 3, 4, 5],
      holidays: [],
      workingHours: [{ start: '09:00', end: '17:00' }],
      hoursPerDay: 8,
    };

    expect(isCalendarWorkingMinute('2026-04-06T08:59:00.000Z', calendar)).toBe(
      false,
    );
    expect(isCalendarWorkingMinute('2026-04-06T09:00:00.000Z', calendar)).toBe(
      true,
    );
    expect(isCalendarWorkingMinute('2026-04-06T16:59:00.000Z', calendar)).toBe(
      true,
    );
    expect(isCalendarWorkingMinute('2026-04-06T17:00:00.000Z', calendar)).toBe(
      false,
    );
    expect(
      isCalendarWorkingMinuteEnd('2026-04-06T17:00:00.000Z', calendar),
    ).toBe(true);
  });

  it('uses shared default working hours when a working calendar omits hour ranges', () => {
    const calendar: CalendarEntity = {
      ...DEFAULT_CALENDAR,
      workingHours: undefined,
    };

    expect(isCalendarWorkingHour('2026-04-06T02:00:00.000Z', null)).toBe(true);
    expect(isCalendarWorkingHour('2026-04-06T02:00:00.000Z', calendar)).toBe(
      false,
    );
    expect(isCalendarWorkingHour('2026-04-06T09:00:00.000Z', calendar)).toBe(
      true,
    );
    expect(isCalendarWorkingHour('2026-04-11T02:00:00.000Z', calendar)).toBe(
      false,
    );
  });

  it('resolves calendars by id with primary fallback from lists and resolved maps', () => {
    const calendars = [DEFAULT_CALENDAR, customCalendar];
    const map = createResolvedCalendarMap(calendars);

    expect(
      resolveCalendarFromList(
        { calendars, primaryCalendarId: customCalendar.id },
        DEFAULT_CALENDAR.id,
      ),
    ).toBe(DEFAULT_CALENDAR);
    expect(
      resolveCalendarFromList(
        { calendars, primaryCalendarId: customCalendar.id },
        'missing',
      ),
    ).toBe(customCalendar);
    expect(
      resolveCalendarFromList(
        { calendars, primaryCalendarId: 'missing' },
        'missing',
      ),
    ).toBeNull();
    expect(resolveCalendarItemFromMap(customCalendar.id, map)?.calendar).toBe(
      customCalendar,
    );
    expect(resolveCalendarItemFromMap('missing', map)).toBeNull();
  });
});
