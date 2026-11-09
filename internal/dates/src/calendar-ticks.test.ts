import { describe, it, expect } from 'vitest';
import {
  utcCalendarTicks,
  hasMissingUtcCalendarPeriod,
} from './calendar-ticks';

describe('UTC calendar ticks', () => {
  it('uses real quarter starts across unequal months', () => {
    const result = utcCalendarTicks(
      Date.UTC(2026, 0, 15),
      Date.UTC(2026, 11, 20),
      4,
    );
    expect(result.unit).toBe('quarter');
    expect(result.values).toEqual([
      Date.UTC(2026, 3, 1),
      Date.UTC(2026, 6, 1),
      Date.UTC(2026, 9, 1),
    ]);
  });
  it('uses leap-year month boundaries and never emits interpolated days', () => {
    const result = utcCalendarTicks(
      Date.UTC(2024, 0, 10),
      Date.UTC(2024, 5, 20),
      6,
    );
    expect(result.unit).toBe('month');
    expect(result.values.map((value) => new Date(value).getUTCDate())).toEqual([
      1, 1, 1, 1, 1,
    ]);
    expect(result.values).toContain(Date.UTC(2024, 2, 1));
  });
  it('aligns days to UTC midnight despite intraday data and aligns weeks to Monday', () => {
    const daily = utcCalendarTicks(
      Date.UTC(2026, 0, 1, 3),
      Date.UTC(2026, 0, 6, 3),
      5,
    );
    expect(daily.unit).toBe('day');
    expect(daily.values.every((value) => value % 86400000 === 0)).toBe(true);
    const weekly = utcCalendarTicks(
      Date.UTC(2026, 0, 1),
      Date.UTC(2026, 1, 1),
      5,
    );
    expect(weekly.unit).toBe('week');
    expect(
      weekly.values.every((value) => new Date(value).getUTCDay() === 1),
    ).toBe(true);
  });
  it('bounds work and rejects invalid dates', () => {
    expect(utcCalendarTicks(NaN, 1, 4).values).toEqual([]);
    expect(
      utcCalendarTicks(0, 8640000000000000, 4).values.length,
    ).toBeLessThanOrEqual(20);
  });
});

it('compares calendar buckets without falsely gapping adjacent month ends or intraday shifts', () => {
  expect(
    hasMissingUtcCalendarPeriod(
      Date.UTC(2024, 1, 29),
      Date.UTC(2024, 2, 31),
      'month',
    ),
  ).toBe(false);
  expect(
    hasMissingUtcCalendarPeriod(
      Date.UTC(2024, 0, 31),
      Date.UTC(2024, 2, 1),
      'month',
    ),
  ).toBe(true);
  expect(
    hasMissingUtcCalendarPeriod(
      Date.UTC(2024, 0, 1, 3),
      Date.UTC(2024, 0, 2, 20),
      'day',
    ),
  ).toBe(false);
  expect(
    hasMissingUtcCalendarPeriod(
      Date.UTC(2024, 0, 1),
      Date.UTC(2024, 0, 15),
      'week',
    ),
  ).toBe(true);
});
