import { describe, expect, it } from 'vitest';
import {
  addElapsedMinutes,
  getElapsedDurationMinutes,
  getDurationMinutes,
  shiftDateTime,
  createDateTime,
} from './time-of-day';

describe('explicit elapsed-minute arithmetic', () => {
  it('constructs fractional civil minutes with milliseconds in UTC and a named zone', () => {
    expect(createDateTime('2026-06-09', 21 * 60 + 14 + 44.5 / 60)).toBe(
      '2026-06-09T21:14:44.500Z',
    );
    expect(
      createDateTime('2026-06-09', 21 * 60 + 14 + 44.5 / 60, 'Europe/Berlin'),
    ).toBe('2026-06-09T19:14:44.500Z');
  });

  it('preserves sub-minute duration and millisecond precision', () => {
    const startDateTime = '2026-04-06T08:00:00.123Z';
    const endDateTime = addElapsedMinutes(startDateTime, 0.15);
    expect(endDateTime).toBe('2026-04-06T08:00:09.123Z');
    expect(getElapsedDurationMinutes({ startDateTime, endDateTime })).toBe(
      0.15,
    );
    expect(addElapsedMinutes(endDateTime, -0.15)).toBe(startDateTime);
  });
  it.each(['2026-03-08T09:30:25.123Z', '2026-11-01T09:30:25.123Z'])(
    'preserves actual elapsed duration across DST from %s',
    (startDateTime) => {
      const endDateTime = addElapsedMinutes(startDateTime, 120.5);
      expect(getElapsedDurationMinutes({ startDateTime, endDateTime })).toBe(
        120.5,
      );
    },
  );
  it('retains the contracts of legacy rounded helpers', () => {
    const startDateTime = '2026-04-06T08:00:00.123Z';
    expect(shiftDateTime(startDateTime, 0.15)).toBe(startDateTime);
    expect(
      getDurationMinutes({
        startDateTime,
        endDateTime: '2026-04-06T08:00:09.123Z',
      }),
    ).toBe(0);
  });
  it('rejects non-finite elapsed offsets', () => {
    expect(() => addElapsedMinutes('2026-04-06T08:00:00Z', NaN)).toThrow();
    expect(() => addElapsedMinutes('2026-04-06T08:00:00Z', Infinity)).toThrow();
  });
});
