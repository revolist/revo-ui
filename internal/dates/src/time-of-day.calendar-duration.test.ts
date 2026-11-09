import { describe, expect, it } from 'vitest';
import { createDateTime, moveDateTimeRange } from './time-of-day';

describe('calendar-day range duration', () => {
  it.each([
    ['Europe/Lisbon', '2026-03-20', '2026-03-28'],
    ['Europe/Lisbon', '2026-10-15', '2026-10-24'],
    ['America/Los_Angeles', '2026-03-01', '2026-03-07'],
    ['America/Los_Angeles', '2026-10-20', '2026-10-31'],
    ['Australia/Sydney', '2026-03-20', '2026-04-04'],
    ['Australia/Sydney', '2026-09-20', '2026-10-03'],
  ])(
    'preserves three nights in %s moving %s to %s',
    (timeZone, source, target) => {
      const start = createDateTime(source, 0, timeZone);
      const end = createDateTime(source, 3 * 1440, timeZone);
      const nextStart = createDateTime(target, 0, timeZone);
      const result = moveDateTimeRange(start, end, nextStart, {
        durationMode: 'calendarDays',
        timeZone,
      });
      expect(result).toEqual({
        startDateTime: nextStart,
        endDateTime: createDateTime(target, 3 * 1440, timeZone),
      });
    },
  );

  it('keeps a changed start clock and the civil duration including milliseconds', () => {
    const timeZone = 'Europe/Lisbon';
    const start = '2026-03-20T15:00:25.123Z';
    const end = '2026-03-23T10:00:55.456Z';
    const next = '2026-03-28T16:00:25.123Z';
    expect(
      moveDateTimeRange(start, end, next, {
        durationMode: 'calendarDays',
        timeZone,
      }),
    ).toEqual({ startDateTime: next, endDateTime: '2026-03-31T10:00:55.456Z' });
  });

  it('preserves both instants on a no-op in the later repeated hour', () => {
    const start = '2026-10-25T01:30:25.123Z';
    const end = '2026-10-25T02:30:55.456Z';
    expect(
      moveDateTimeRange(start, end, start, {
        durationMode: 'calendarDays',
        timeZone: 'Europe/Lisbon',
      }),
    ).toEqual({ startDateTime: start, endDateTime: end });
  });

  it('uses UTC when the calendar-day timezone is omitted', () => {
    expect(
      moveDateTimeRange(
        '2026-03-20T00:00:00Z',
        '2026-03-23T00:00:00Z',
        '2026-03-28T00:00:00Z',
        { durationMode: 'calendarDays' },
      ),
    ).toEqual({
      startDateTime: '2026-03-28T00:00:00.000Z',
      endDateTime: '2026-03-31T00:00:00.000Z',
    });
  });
});
