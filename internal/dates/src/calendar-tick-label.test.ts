import { describe, expect, it } from 'vitest';
import { formatUtcCalendarTickLabel } from './calendar-tick-label';
import type { UtcCalendarTickUnit } from './calendar-ticks';

describe('UTC calendar tick labels', () => {
  it.each<[UtcCalendarTickUnit, string, boolean]>([
    ['year', '2024', true],
    ['quarter', '2024 Q1', true],
    ['month', '2024-02', true],
    ['week', '2024-02-29', true],
    ['day', '2024-02-29', true],
    ['hour', '2024-02-29 23:45:06Z', false],
    ['minute', '2024-02-29 23:45:06Z', false],
    ['second', '2024-02-29 23:45:06Z', false],
  ])('formats %s ticks with matching precision', (unit, text, dateOnly) => {
    expect(
      formatUtcCalendarTickLabel(Date.UTC(2024, 1, 29, 23, 45, 6), unit),
    ).toEqual({ text, dateOnly });
  });

  it('uses the UTC calendar across an offset year boundary', () => {
    const value = Date.parse('2026-01-01T00:30:00+02:00');
    expect(formatUtcCalendarTickLabel(value, 'quarter')).toEqual({
      text: '2025 Q4',
      dateOnly: true,
    });
  });

  it('preserves fractional seconds for intraday labels', () => {
    expect(
      formatUtcCalendarTickLabel(Date.UTC(2026, 0, 1, 0, 0, 1, 123), 'second'),
    ).toEqual({ text: '2026-01-01 00:00:01.123Z', dateOnly: false });
  });

  it.each([NaN, Infinity, 8640000000000001])(
    'rejects invalid epoch %s',
    (value) => {
      expect(formatUtcCalendarTickLabel(value, 'day')).toBeUndefined();
    },
  );
});
