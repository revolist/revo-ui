import { describe, expect, it } from 'vitest';
import { parseDuration, formatDurationValue } from './duration';
describe('duration input values', () => {
  it('parses short, long, minute, and elapsed duration input', () => {
    expect(parseDuration('5 hrs')).toEqual({
      value: 5,
      unit: 'hour',
      elapsed: false,
    });
    expect(parseDuration('2 days')).toEqual({
      value: 2,
      unit: 'day',
      elapsed: false,
    });
    expect(parseDuration('3w')).toEqual({
      value: 3,
      unit: 'week',
      elapsed: false,
    });
    expect(parseDuration('30 mins')).toEqual({
      value: 30,
      unit: 'minute',
      elapsed: false,
    });
    expect(parseDuration('2ed')).toEqual({
      value: 2,
      unit: 'day',
      elapsed: true,
    });
    expect(parseDuration('2 elapsed days')).toEqual({
      value: 2,
      unit: 'day',
      elapsed: true,
    });
    expect(parseDuration('4', { defaultUnit: 'hour' })).toEqual({
      value: 4,
      unit: 'hour',
      elapsed: false,
    });
  });
  it('rejects unsupported or negative values', () => {
    expect(parseDuration('-2d')).toBeNull();
    expect(parseDuration('two days')).toBeNull();
    expect(parseDuration('2 fortnights')).toBeNull();
  });
  it('uses compact MSP-style fractional precision by default and supports overrides', () => {
    expect(formatDurationValue(56.625, 'day')).toBe('56.6 days');
    expect(formatDurationValue(2.04, 'hour')).toBe('2 hours');
    expect(formatDurationValue(1.04, 'day')).toBe('1 day');
    expect(formatDurationValue(-1.26, 'day')).toBe('-1.3 days');
    expect(
      formatDurationValue(56.625, 'day', { maximumFractionDigits: 2 }),
    ).toBe('56.63 days');
    expect(formatDurationValue(1.49, 'day', { maximumFractionDigits: 0 })).toBe(
      '1 day',
    );
  });
});
