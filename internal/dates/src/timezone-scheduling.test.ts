import { describe, it, expect } from 'vitest';
import {
  createDateTime,
  getDateMinutes,
  snapDateTime,
  replaceDateTimeDate,
} from './time-of-day';
import { getDateDayBounds, getOccupiedDateRange } from './date-math';
import {
  parseZonedDateTimeControlValue,
  splitTimeZoneOffsetRanges,
} from './civil-time';

describe('timezone scheduling contracts', () => {
  it('keeps UTC defaults and supports fractional offsets', () => {
    expect(createDateTime('2026-04-06', 480)).toBe('2026-04-06T08:00:00.000Z');
    expect(createDateTime('2026-04-06', 480, 'Asia/Kathmandu')).toBe(
      '2026-04-06T02:15:00.000Z',
    );
    expect(
      getDateMinutes(new Date('2026-04-06T02:15Z'), 'Asia/Kathmandu'),
    ).toBe(480);
    expect(snapDateTime('2026-04-06T02:19Z', 30, 'Asia/Kathmandu')).toBe(
      '2026-04-06T02:15:00.000Z',
    );
  });
  it.each([
    ['2026-03-08', 23],
    ['2026-11-01', 25],
  ] as const)('resolves %s as a %i-hour local day', (date, hours) => {
    const bounds = getDateDayBounds(date, 'America/Los_Angeles');
    expect((bounds.endMs - bounds.startMs) / 3600000).toBe(hours);
    expect(
      splitTimeZoneOffsetRanges(
        bounds.startMs,
        bounds.endMs,
        'America/Los_Angeles',
      ),
    ).toHaveLength(2);
  });
  it('rejects gap editor values and preserves the original repeated instant', () => {
    expect(
      parseZonedDateTimeControlValue('2026-03-08T02:30', 'America/Los_Angeles'),
    ).toBeUndefined();
    expect(
      parseZonedDateTimeControlValue(
        '2026-11-01T01:30',
        'America/Los_Angeles',
      )?.toISOString(),
    ).toBe('2026-11-01T08:30:00.000Z');
    const original = new Date('2026-11-01T09:30:25.123Z');
    expect(
      parseZonedDateTimeControlValue(
        '2026-11-01T01:30',
        'America/Los_Angeles',
        original,
      )?.toISOString(),
    ).toBe(original.toISOString());
    expect(snapDateTime('2026-11-01T09:30Z', 30, 'America/Los_Angeles')).toBe(
      '2026-11-01T09:30:00.000Z',
    );
  });
  it('uses local dates and exclusive ends for overnight events', () => {
    expect(
      getOccupiedDateRange(
        '2026-04-07T01:00Z',
        '2026-04-07T07:00Z',
        'America/Los_Angeles',
      ),
    ).toEqual({ startDate: '2026-04-06', endDate: '2026-04-06' });
    expect(
      replaceDateTimeDate(
        '2026-03-07T17:00Z',
        '2026-03-08',
        'America/Los_Angeles',
      ),
    ).toBe('2026-03-08T16:00:00.000Z');
  });
});

it('snaps seconds consistently in UTC and explicit schedule timezones', () => {
  expect(snapDateTime('2026-04-06T15:14:45Z', 30, 'America/Los_Angeles')).toBe(
    '2026-04-06T15:30:00.000Z',
  );
  expect(snapDateTime('2026-04-06T15:14:45Z', 30)).toBe(
    '2026-04-06T15:30:00.000Z',
  );
});

it('keeps seconds and milliseconds when advancing civil days and moving a range', async () => {
  const { shiftDateTimeByCalendarDays, moveDateTimeRange } =
    await import('./time-of-day');
  const start = '2026-03-07T17:00:25.123Z';
  const next = shiftDateTimeByCalendarDays(start, 1, 'America/Los_Angeles');
  expect(next).toBe('2026-03-08T16:00:25.123Z');
  expect(moveDateTimeRange(start, '2026-03-07T18:00:55.123Z', next)).toEqual({
    startDateTime: next,
    endDateTime: '2026-03-08T17:00:55.123Z',
  });
  expect(shiftDateTimeByCalendarDays(start, 0.5, 'America/Los_Angeles')).toBe(
    '2026-03-08T05:00:25.123Z',
  );
});
