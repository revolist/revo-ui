import { describe, expect, it } from 'vitest';
import {
  coerceValidDate,
  formatLocalDateControlValue,
  parseLocalDateControlValue,
} from './date-controls';
import {
  coerceSpreadsheetDate,
  spreadsheetDateToExcelSerial,
} from './spreadsheet-date';
import {
  addDays,
  addHours,
  addMinutes,
  addMonths,
  createCompletedMonthDateList,
  createSafeDateList,
  DAY_IN_MS,
  diffInHours,
  diffInMinutes,
  diffInDays,
  endOfMonth,
  endOfYear,
  getDateDayBounds,
  getDateRangeBounds,
  getIsoWeekNumber,
  getMonthStartIsoDate,
  getOccupiedDateRange,
  getWeekStartIsoDate,
  HOUR_IN_MS,
  maxDate,
  minDate,
  MINUTE_IN_MS,
  shiftDate,
  shiftDateRange,
  shiftDateRanges,
  subtractDays,
  rangesOverlap,
  startOfMonth,
  startOfQuarter,
  startOfUtcDayMs,
  startOfWeek,
  startOfYear,
  WEEK_IN_MS,
} from './date-math';
import {
  formatIsoDate,
  formatIsoDateTime,
  formatLocalIsoDateTimeInTimeZone,
  getIsoWeekday,
  getUtcWeekday,
  isValidIsoDate,
  isValidIsoDateTime,
  normalizeIsoDate,
  parseDateTime,
  parseIsoDate,
  parseIsoDateOnly,
  parseLocalDateValue,
  toLocalIsoDate,
  toISODate,
  toIsoDate,
} from './iso';
import {
  assertIanaTimeZone,
  createTimeZoneWeekdayHourReader,
  createDateTime,
  createDateTimeFromTimeOfDay,
  formatAmPmTimeOfDay,
  formatCompactTimeOfDay,
  formatDuration,
  formatDurationMinutes,
  formatDisplayTimeOfDay,
  formatTimeOfDay,
  getLocalDateTimeAsUtcIsoDateTime,
  getTimeZoneWeekdayHour,
  hasAmPmMarker,
  isMidnightDateTime,
  isIanaTimeZone,
  parseTimeOfDay,
  replaceDateTimeDate,
  shiftDateTime,
} from './time-of-day';
import {
  getCivilParts,
  getPossibleInstants,
  parseIsoCivilDate,
  parseIsoLocalCivilDateTime,
  resolveCivilBoundary,
} from './civil-time';
import {
  addTimelineUnit,
  formatTimelineCompactWeekdayDayLabel,
  formatTimelineDateLabel,
  getTimelineEndExclusiveDate,
  getTimelineQuarter,
  normalizeTimelineWeekStartsOn,
  parseTimelineDateValue,
  startOfHour,
  startOfMinute,
  startOfTimelineUnit,
  startOfTimelineWeek,
} from './timeline';

describe('dates', () => {
  it('exports shared time constants', () => {
    expect(MINUTE_IN_MS).toBe(60_000);
    expect(HOUR_IN_MS).toBe(60 * MINUTE_IN_MS);
    expect(DAY_IN_MS).toBe(24 * HOUR_IN_MS);
    expect(WEEK_IN_MS).toBe(7 * DAY_IN_MS);
  });

  it('formats timezone-local datetime control values without browser-zone drift', () => {
    expect(
      formatLocalIsoDateTimeInTimeZone(
        new Date('2026-08-05T12:34:56Z'),
        'America/New_York',
      ),
    ).toBe('2026-08-05T08:34:56');
  });

  it('extracts timezone-local weekday/hour across day and DST boundaries', () => {
    expect(
      getTimeZoneWeekdayHour(
        new Date('2026-08-03T00:30:00Z'),
        'America/Los_Angeles',
      ),
    ).toEqual({ weekday: 0, hour: 17 });
    expect(
      getTimeZoneWeekdayHour(
        new Date('2026-03-08T10:30:00Z'),
        'America/Los_Angeles',
      ),
    ).toEqual({ weekday: 0, hour: 3 });
    expect(
      getTimeZoneWeekdayHour(
        new Date('2026-11-01T08:30:00Z'),
        'America/Los_Angeles',
      ),
    ).toEqual({ weekday: 0, hour: 1 });
    expect(
      getTimeZoneWeekdayHour(
        new Date('2026-11-01T09:30:00Z'),
        'America/Los_Angeles',
      ),
    ).toEqual({ weekday: 0, hour: 1 });
    expect(getTimeZoneWeekdayHour(new Date(Number.NaN), 'UTC')).toBeUndefined();
    expect(isIanaTimeZone('Europe/Lisbon')).toBe(true);
    expect(isIanaTimeZone('Invalid/Zone')).toBe(false);
    expect(() => assertIanaTimeZone('Invalid/Zone', 'matrix.timeZone')).toThrow(
      'Invalid matrix.timeZone IANA timezone "Invalid/Zone".',
    );
  });

  it('shares compiled timezone readers and DST-safe civil-time resolution', () => {
    const readLosAngeles = createTimeZoneWeekdayHourReader(
      'America/Los_Angeles',
    );
    const repeatedHour = new Date('2026-11-01T08:30:00Z');
    expect(readLosAngeles(repeatedHour)).toEqual({ weekday: 0, hour: 1 });
    expect(readLosAngeles(repeatedHour)).toEqual({ weekday: 0, hour: 1 });
    expect(
      createTimeZoneWeekdayHourReader('UTC')(new Date('2026-08-03T23:00:00Z')),
    ).toEqual({ weekday: 1, hour: 23 });

    const ambiguous = {
      year: 2026,
      month: 11,
      day: 1,
      hour: 1,
      minute: 30,
      second: 0,
    };
    expect(getPossibleInstants(ambiguous, 'America/New_York')).toHaveLength(2);
    expect(parseIsoCivilDate('2026-02-29')).toBeUndefined();
    expect(parseIsoCivilDate('2026-08-05')).toEqual({
      year: 2026,
      month: 8,
      day: 5,
    });
    expect(parseIsoLocalCivilDateTime('2026-08-05 10:20')).toBeUndefined();
    expect(parseIsoLocalCivilDateTime('2026-08-05T10:20:30')).toEqual({
      year: 2026,
      month: 8,
      day: 5,
      hour: 10,
      minute: 20,
      second: 30,
    });
    expect(
      getCivilParts(
        resolveCivilBoundary(
          { year: 2026, month: 3, day: 8, hour: 2, minute: 0, second: 0 },
          'America/New_York',
        ),
        'America/New_York',
      ),
    ).toEqual({ year: 2026, month: 3, day: 8, hour: 3, minute: 0, second: 0 });
  });

  it('performs UTC ISO date math without local timezone drift', () => {
    expect(formatIsoDate(parseIsoDate('2026-04-01'))).toBe('2026-04-01');
    expect(parseIsoDateOnly('2026-04-01T18:30:00.000Z').toISOString()).toBe(
      '2026-04-01T00:00:00.000Z',
    );
    expect(addDays('2026-04-01', 6)).toBe('2026-04-07');
    expect(diffInDays('2026-04-01', '2026-04-07')).toBe(6);
  });

  it('parses grid date values with local date-only calendar semantics', () => {
    const dateOnly = parseLocalDateValue('2026-04-06');
    expect(
      dateOnly && [
        dateOnly.getFullYear(),
        dateOnly.getMonth(),
        dateOnly.getDate(),
      ],
    ).toEqual([2026, 3, 6]);
    expect(parseLocalDateValue('2026-02-29')).toBeUndefined();
    expect(
      parseLocalDateValue('"2026-04-06T09:00:00.000Z"')?.toISOString(),
    ).toBe('2026-04-06T09:00:00.000Z');
    expect(parseLocalDateValue('not-a-date')).toBeUndefined();
  });

  it('validates and compares ISO date strings', () => {
    expect(isValidIsoDate('2026-02-29')).toBe(false);
    expect(isValidIsoDate('2026-02-28')).toBe(true);
    expect(minDate('2026-04-02', '2026-04-01')).toBe('2026-04-01');
    expect(maxDate('2026-04-02', '2026-04-01')).toBe('2026-04-02');
    expect(startOfWeek('2026-04-05')).toBe('2026-03-30');
  });

  it('shifts dates and date ranges', () => {
    expect(shiftDate('2026-04-01', 2)).toBe('2026-04-03');
    expect(subtractDays('2026-04-03', 2)).toBe('2026-04-01');
    expect(
      shiftDateRange({ startDate: '2026-04-01', endDate: '2026-04-02' }, 2),
    ).toEqual({
      startDate: '2026-04-03',
      endDate: '2026-04-04',
    });
    expect(
      shiftDateRanges([{ startDate: '2026-04-01', endDate: '2026-04-02' }], 2),
    ).toEqual([
      {
        startDate: '2026-04-03',
        endDate: '2026-04-04',
      },
    ]);
  });

  it('supports UTC datetime math for intraday precision', () => {
    expect(isValidIsoDateTime('2026-04-01T12:30:00.000Z')).toBe(true);
    expect(formatIsoDateTime(parseIsoDate('2026-04-01T12:30:00.000Z'))).toBe(
      '2026-04-01T12:30:00.000Z',
    );
    expect(addHours('2026-04-01T00:00:00.000Z', 2)).toBe(
      '2026-04-01T02:00:00.000Z',
    );
    expect(addMinutes('2026-04-01T00:00:00.000Z', 30)).toBe(
      '2026-04-01T00:30:00.000Z',
    );
    expect(
      diffInHours('2026-04-01T00:00:00.000Z', '2026-04-01T03:00:00.000Z'),
    ).toBe(3);
    expect(
      diffInMinutes('2026-04-01T00:00:00.000Z', '2026-04-01T00:45:00.000Z'),
    ).toBe(45);
    expect(startOfHour('2026-04-01T03:29:45.000Z')).toBe(
      '2026-04-01T03:00:00.000Z',
    );
    expect(startOfMinute('2026-04-01T03:29:45.000Z')).toBe(
      '2026-04-01T03:29:00.000Z',
    );
    expect(addDays('2026-04-01T08:00:00.000Z', 0.5)).toBe(
      '2026-04-01T20:00:00.000Z',
    );
  });

  it('normalizes ISO dates and anchors UTC weeks and months', () => {
    expect(normalizeIsoDate('2026-06-18')).toBe('2026-06-18');
    expect(() => normalizeIsoDate('2026-02-29')).toThrow(/Invalid date/);
    expect(toISODate(parseIsoDate('2026-06-18'))).toBe('2026-06-18');
    expect(toIsoDate(new Date(Date.UTC(2026, 5, 18, 23, 30)))).toBe(
      '2026-06-18',
    );
    expect(getWeekStartIsoDate(parseIsoDate('2026-06-18'))).toBe('2026-06-15');
    expect(getWeekStartIsoDate(parseIsoDate('2026-06-21'))).toBe('2026-06-15');
    expect(getMonthStartIsoDate(parseIsoDate('2026-06-18'))).toBe('2026-06-01');
    expect(addMonths('2026-12-15', 1)).toBe('2027-01-01');
    expect(endOfMonth('2024-02-18')).toBe('2024-02-29');
    expect(endOfMonth('2026-12-18')).toBe('2026-12-31');
    expect(endOfYear('2024-02-18')).toBe('2024-12-31');
  });

  it('builds complete calendar months with shared UTC date math', () => {
    expect(createCompletedMonthDateList('2021-02-15', 1)).toHaveLength(28);
    expect(createCompletedMonthDateList('2026-02-15', 1)).toHaveLength(35);
    expect(createCompletedMonthDateList('2026-08-15', 1)).toHaveLength(42);
    const sundayFirst = createCompletedMonthDateList('2026-07-15', 0);
    expect(sundayFirst).toHaveLength(35);
    expect(sundayFirst[0]).toBe('2026-06-28');
    expect(sundayFirst.at(-1)).toBe('2026-08-01');
  });

  it('resolves occupied dates for half-open datetime ranges', () => {
    expect(
      getOccupiedDateRange(
        '2026-12-31T09:30:00.000Z',
        '2027-01-02T00:00:00.000Z',
      ),
    ).toEqual({ startDate: '2026-12-31', endDate: '2027-01-01' });
    expect(
      getOccupiedDateRange(
        '2026-07-03T09:30:00.000Z',
        '2026-07-03T09:30:00.000Z',
      ),
    ).toEqual({ startDate: '2026-07-03', endDate: '2026-07-03' });
    const previousTimeZone = process.env.TZ;
    process.env.TZ = 'America/Los_Angeles';
    try {
      expect(
        getOccupiedDateRange('2026-07-03T23:30:00', '2026-07-04T00:30:00'),
      ).toEqual({ startDate: '2026-07-03', endDate: '2026-07-04' });
    } finally {
      if (previousTimeZone === undefined) delete process.env.TZ;
      else process.env.TZ = previousTimeZone;
    }
  });

  it('serializes local calendar fields without timezone drift', () => {
    expect(toLocalIsoDate(new Date(2026, 5, 18, 23, 30))).toBe('2026-06-18');
    expect(toLocalIsoDate(new Date(Number.NaN))).toBeNull();
    expect(toLocalIsoDate(undefined)).toBeNull();
  });

  it('parses and formats native local date control values', () => {
    const date = parseLocalDateControlValue('date', '2026-08-20');
    expect(date && formatLocalDateControlValue('date', date)).toBe(
      '2026-08-20',
    );

    const datetime = parseLocalDateControlValue(
      'datetime',
      '2026-08-20T12:45:30.125',
    );
    expect(datetime && datetime.getMilliseconds()).toBe(125);
    expect(datetime && formatLocalDateControlValue('datetime', datetime)).toBe(
      '2026-08-20T12:45',
    );

    const baseDate = new Date(2026, 7, 16, 9, 30);
    const time = parseLocalDateControlValue('time', '14:15:30', baseDate);
    expect(time && formatLocalDateControlValue('date', time)).toBe(
      '2026-08-16',
    );
    expect(time?.getHours()).toBe(14);
    expect(time?.getMinutes()).toBe(15);
    expect(time?.getSeconds()).toBe(30);
  });

  it('rejects invalid local date control values without calendar normalization', () => {
    expect(parseLocalDateControlValue('date', '2026-02-31')).toBeUndefined();
    expect(
      parseLocalDateControlValue('datetime', '2026-02-31T12:00'),
    ).toBeUndefined();
    expect(parseLocalDateControlValue('time', '24:00')).toBeUndefined();
    expect(parseLocalDateControlValue('time', '12:60')).toBeUndefined();
  });

  it('coerces supported date scalars to independent valid dates', () => {
    const source = new Date(2026, 7, 20, 12, 45);
    const cloned = coerceValidDate(source);
    expect(cloned).toEqual(source);
    expect(cloned).not.toBe(source);
    expect(coerceValidDate(source.getTime())).toEqual(source);
    expect(coerceValidDate(null)).toBeUndefined();
    expect(coerceValidDate(false)).toBeUndefined();
    expect(coerceValidDate(Symbol('invalid'))).toBeUndefined();
  });

  it('round-trips Excel serial dates through local spreadsheet calendar fields', () => {
    const date = coerceSpreadsheetDate(39448.5);

    expect(date && formatLocalDateControlValue('datetime', date)).toBe(
      '2008-01-01T12:00',
    );
    expect(date && spreadsheetDateToExcelSerial(date)).toBe(39448.5);
    expect(
      coerceSpreadsheetDate(61) &&
        formatLocalDateControlValue('date', coerceSpreadsheetDate(61)!),
    ).toBe('1900-03-01');
  });

  it('keeps date-only strings on their authored local calendar day', () => {
    const date = coerceSpreadsheetDate('2026-08-20');

    expect(date && formatLocalDateControlValue('date', date)).toBe(
      '2026-08-20',
    );
    expect(coerceSpreadsheetDate(-1)).toBeUndefined();
  });

  it('creates UTC datetimes and parses local clock labels', () => {
    expect(createDateTimeFromTimeOfDay('2026-06-15', '07:30', 1)).toBe(
      '2026-06-16T07:30:00.000Z',
    );
    expect(createDateTime('2026-06-15', 9 * 60)).toBe(
      '2026-06-15T09:00:00.000Z',
    );
    expect(shiftDateTime('2026-06-15T07:30:00.000Z', 90)).toBe(
      '2026-06-15T09:00:00.000Z',
    );
    expect(parseDateTime('2026-04-06T09:00').toISOString()).toBe(
      '2026-04-06T09:00:00.000Z',
    );
    expect(parseDateTime('2026-04-06T09:00:30.123').toISOString()).toBe(
      '2026-04-06T09:00:30.123Z',
    );
    expect(() => parseDateTime('not-a-date')).toThrow(/Invalid datetime/);
    expect(parseTimeOfDay('7:30 AM')).toBe(450);
    expect(parseTimeOfDay('24:00', { allowEndOfDay: true })).toBe(1440);
    expect(() => parseTimeOfDay('24:00')).toThrow(/Invalid time/);
    expect(formatTimeOfDay(450)).toBe('07:30');
    expect(formatTimeOfDay(1500)).toBe('24:00');
    expect(formatCompactTimeOfDay(75)).toBe('1:15a');
    expect(formatCompactTimeOfDay(13 * 60 + 5)).toBe('1:05p');
    expect(formatAmPmTimeOfDay(8 * 60)).toBe('8 AM');
    expect(formatAmPmTimeOfDay(13 * 60 + 5)).toBe('1:05 PM');
    expect(formatDisplayTimeOfDay(0)).toBe('00:00');
    expect(formatDisplayTimeOfDay(12 * 60, { useAmPm: true })).toBe('12 PM');
    expect(
      formatDisplayTimeOfDay(9 * 60, {
        timeLabelFormatter: (minutes) => `${minutes}m`,
      }),
    ).toBe('540m');
    expect(formatDurationMinutes(150)).toBe('2h 30m');
    expect(formatDuration(3)).toBe('3 days');
    expect(formatDuration(1 / 24)).toBe('1h');
    expect(formatDuration(2.5416666666666665)).toBe('2 days 13h');
    expect(hasAmPmMarker('7:30 AM')).toBe(true);
    expect(hasAmPmMarker('19:30')).toBe(false);
    expect(replaceDateTimeDate('2026-07-03T09:30:45.123Z', '2027-01-02')).toBe(
      '2027-01-02T09:30:45.123Z',
    );
    expect(isMidnightDateTime('2026-07-04T00:00:00.000Z')).toBe(true);
    expect(isMidnightDateTime('2026-07-04T00:00:00.001Z')).toBe(false);
  });

  it('calculates ISO week numbers and local-clock UTC serialization', () => {
    expect(getIsoWeekNumber(parseIsoDate('2026-06-18'))).toBe(25);
    expect(getIsoWeekNumber(parseIsoDate('2021-01-01'))).toBe(53);
    expect(getUtcWeekday('2026-06-21')).toBe(0);
    expect(getIsoWeekday('2026-06-21')).toBe(7);

    const localDate = new Date(2026, 5, 18, 12, 34, 56);
    expect(getLocalDateTimeAsUtcIsoDateTime(localDate)).toBe(
      '2026-06-18T12:34:56.000Z',
    );
  });

  it('returns UTC day starts and day bounds', () => {
    expect(startOfUtcDayMs('2026-04-06T14:30:00.000Z')).toBe(
      Date.UTC(2026, 3, 6),
    );
    expect(startOfUtcDayMs(Date.UTC(2026, 3, 6, 14, 30))).toBe(
      Date.UTC(2026, 3, 6),
    );
    expect(getDateDayBounds('2026-04-06')).toEqual({
      startMs: Date.UTC(2026, 3, 6),
      endMs: Date.UTC(2026, 3, 7),
    });
    expect(
      getDateRangeBounds({ start: '2026-04-06', end: '2026-04-07' }),
    ).toEqual({
      startMs: Date.UTC(2026, 3, 6),
      endMs: Date.UTC(2026, 3, 8),
    });
    expect(rangesOverlap(1, 3, 2, 4)).toBe(true);
    expect(rangesOverlap(1, 2, 2, 4)).toBe(false);
  });

  it('supports UTC timeline unit starts and offsets', () => {
    expect(normalizeTimelineWeekStartsOn(1)).toBe(1);
    expect(normalizeTimelineWeekStartsOn(0)).toBe(0);
    expect(normalizeTimelineWeekStartsOn(2)).toBe(2);
    expect(startOfTimelineWeek('2026-04-08', 0)).toBe('2026-04-05');
    expect(startOfTimelineWeek('2026-04-08', 1)).toBe('2026-04-06');
    expect(startOfTimelineUnit('minute', '2026-04-08T09:15:42.000Z')).toBe(
      '2026-04-08T09:15:00.000Z',
    );
    expect(startOfTimelineUnit('hour', '2026-04-08T09:15:42.000Z')).toBe(
      '2026-04-08T09:00:00.000Z',
    );
    expect(startOfTimelineUnit('day', '2026-04-08T09:15:42.000Z')).toBe(
      '2026-04-08',
    );
    expect(startOfTimelineUnit('week', '2026-04-08', 1)).toBe('2026-04-06');
    expect(startOfMonth('2026-04-18')).toBe('2026-04-01');
    expect(startOfQuarter('2026-05-18')).toBe('2026-04-01');
    expect(startOfYear('2026-05-18')).toBe('2026-01-01');

    expect(addTimelineUnit('minute', '2026-04-08T09:15:00.000Z', 30)).toBe(
      '2026-04-08T09:45:00.000Z',
    );
    expect(addTimelineUnit('hour', '2026-04-08T09:15:00.000Z', 2)).toBe(
      '2026-04-08T11:15:00.000Z',
    );
    expect(addTimelineUnit('day', '2026-04-08', 2)).toBe('2026-04-10');
    expect(addTimelineUnit('week', '2026-04-08', 2)).toBe('2026-04-22');
    expect(addTimelineUnit('month', '2026-04-08', 2)).toBe('2026-06-01');
    expect(addTimelineUnit('quarter', '2026-04-08', 1)).toBe('2026-07-01');
    expect(addTimelineUnit('year', '2026-04-08', 1)).toBe('2027-01-01');
  });

  it('supports timeline boundaries, quarters, parsing, and UTC labels', () => {
    expect(parseTimelineDateValue('2026-04-08').toISOString()).toBe(
      '2026-04-08T00:00:00.000Z',
    );
    expect(getTimelineEndExclusiveDate('2026-04-08')).toBe('2026-04-09');
    expect(getTimelineEndExclusiveDate('2026-04-08T09:15:00.000Z')).toBe(
      '2026-04-08T09:15:00.000Z',
    );
    expect(getTimelineQuarter('2026-05-18')).toBe(2);
    expect(
      formatTimelineDateLabel('2026-04-08T23:00:00.000Z', 'en-US', {
        month: 'short',
        day: 'numeric',
      }),
    ).toBe('Apr 8');
    expect(
      formatTimelineDateLabel(
        '2026-04-08T01:00:00.000Z',
        'en-US',
        {
          month: 'short',
          day: 'numeric',
        },
        'America/Los_Angeles',
      ),
    ).toBe('Apr 7');
    expect(formatTimelineCompactWeekdayDayLabel('2026-04-08', 'en-US')).toBe(
      'Wed 8',
    );
  });

  it('creates safe inclusive date lists', () => {
    expect(createSafeDateList('2026-04-01', '2026-04-03')).toEqual([
      '2026-04-01',
      '2026-04-02',
      '2026-04-03',
    ]);
    expect(createSafeDateList('2026-04-03', '2026-04-01')).toEqual([]);
    expect(createSafeDateList('invalid', '2026-04-01')).toEqual([]);
    expect(createSafeDateList('2026-02-30', '2026-03-01')).toEqual([]);
  });
});
