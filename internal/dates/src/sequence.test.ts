import { describe, expect, it } from 'vitest';
import {
  addUtcDays,
  addUtcMonths,
  formatDateValue,
  formatTimeValue,
  monthDiff,
  parseDateValue,
  parseTimeValue,
} from './sequence';

describe('sequence date and time primitives', () => {
  it.each(['0001-02-28', '0099/02/28', '02/28/0001'])(
    'round-trips early-year input %s',
    (value) => {
      const parsed = parseDateValue(value);
      expect(parsed).not.toBeNull();
      expect(formatDateValue(parsed!.date, parsed!.format)).toBe(value);
    },
  );
  it('preserves calendar overflow and does not mutate Date input', () => {
    const value = new Date('2026-01-31T00:00:00Z');
    expect(addUtcDays(value, 1).toISOString()).toBe('2026-02-01T00:00:00.000Z');
    expect(addUtcMonths(value, 1).toISOString()).toBe(
      '2026-03-03T00:00:00.000Z',
    );
    expect(monthDiff(value, addUtcMonths(value, 1))).toBe(2);
    expect(value.toISOString()).toBe('2026-01-31T00:00:00.000Z');
    expect(parseDateValue('2026-02-30')).toBeNull();
  });
  it('retains seconds and wraps negative clock values', () => {
    expect(parseTimeValue('1:02:03')).toEqual({
      seconds: 3723,
      format: 'hh:mm:ss',
    });
    expect(parseTimeValue('24:00')).toBeNull();
    expect(formatTimeValue(-1, 'hh:mm:ss')).toBe('23:59:59');
  });
});
