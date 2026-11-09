import { describe, expect, it } from 'vitest';
import {
  durationToElapsedDays,
  durationToElapsedHours,
  durationToHours,
  durationToWorkingDays,
  formatDurationValue,
  formatWorkingDuration,
  hoursToDuration,
  elapsedHoursToDuration,
  parseDuration,
  resolveAutomaticDurationUnitFromHours,
  resolveDurationSettings,
  workingDaysToDuration,
} from './duration';

describe('duration values', () => {
  const settings = resolveDurationSettings({
    hoursPerDay: 8,
    hoursPerWeek: 40,
    daysPerMonth: 20,
  });

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

  it('converts working units through project settings', () => {
    expect(durationToWorkingDays(5, 'hour', settings)).toBe(0.625);
    expect(durationToWorkingDays(30, 'minute', settings)).toBe(0.0625);
    expect(durationToWorkingDays(2, 'day', settings)).toBe(2);
    expect(durationToWorkingDays(3, 'week', settings)).toBe(15);
    expect(durationToWorkingDays(1, 'month', settings)).toBe(20);
    expect(workingDaysToDuration(2, 'hour', settings)).toBe(16);
    expect(durationToHours(2, 'day', settings)).toBe(16);
    expect(durationToHours(3, 'week', settings)).toBe(120);
    expect(hoursToDuration(16, 'day', settings)).toBe(2);
  });

  it('uses continuous 24-hour conversion for elapsed durations', () => {
    expect(durationToElapsedDays(2, 'day')).toBe(2);
    expect(durationToElapsedDays(48, 'hour')).toBe(2);
    expect(durationToElapsedDays(30, 'minute')).toBeCloseTo(30 / 1440);
    expect(durationToElapsedHours(2, 'day')).toBe(48);
    expect(elapsedHoursToDuration(48, 'day')).toBe(2);
  });

  it('formats retained and automatic units with singular and plural labels', () => {
    expect(formatDurationValue(1, 'hour')).toBe('1 hour');
    expect(formatDurationValue(5, 'hour')).toBe('5 hours');
    expect(formatDurationValue(2, 'day', { elapsed: true })).toBe(
      '2 elapsed days',
    );
    expect(formatWorkingDuration(0.5, settings)).toBe('4 hours');
    expect(formatWorkingDuration(1, settings)).toBe('1 day');
    expect(formatWorkingDuration(2, settings, { unit: 'hour' })).toBe(
      '16 hours',
    );
    expect(resolveAutomaticDurationUnitFromHours(0.5, settings)).toBe('minute');
    expect(resolveAutomaticDurationUnitFromHours(5, settings)).toBe('hour');
    expect(resolveAutomaticDurationUnitFromHours(16, settings)).toBe('day');
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

  it('resolves a separate default unit for work quantities', () => {
    expect(
      resolveDurationSettings({ defaultUnit: 'day', defaultWorkUnit: 'hour' }),
    ).toMatchObject({
      defaultUnit: 'day',
      defaultWorkUnit: 'hour',
    });
    expect(settings.defaultWorkUnit).toBe('auto');
    expect(settings.maximumFractionDigits).toBe(1);
    expect(
      resolveDurationSettings({ maximumFractionDigits: 2 })
        .maximumFractionDigits,
    ).toBe(2);
  });
});
