import { expect, it } from 'vitest';
import { parseDurationControl } from './duration-control';
it('preserves units and parses aliases, bare defaults, zero and decimals', () => {
  const options = { defaultUnit: 'hour' as const };
  expect(parseDurationControl('2d', options).value).toEqual({
    value: 2,
    unit: 'day',
    elapsed: false,
  });
  expect(parseDurationControl('90min', options).value?.unit).toBe('minute');
  expect(parseDurationControl('0', options).value?.value).toBe(0);
  expect(parseDurationControl('1.25', options).value?.unit).toBe('hour');
});
it('validates elapsed semantics, units, required and authored-value bounds', () => {
  expect(parseDurationControl('2ed', { defaultUnit: 'day' }).valid).toBe(false);
  expect(
    parseDurationControl('2ed', { defaultUnit: 'day', allowElapsed: true })
      .value?.elapsed,
  ).toBe(true);
  expect(parseDurationControl('', { defaultUnit: 'day' })).toEqual({
    valid: true,
    value: null,
  });
  expect(
    parseDurationControl('', { defaultUnit: 'day', required: true }).valid,
  ).toBe(false);
  expect(parseDurationControl('-1d', { defaultUnit: 'day' }).valid).toBe(false);
  expect(
    parseDurationControl('3h', { defaultUnit: 'day', allowedUnits: ['day'] })
      .valid,
  ).toBe(false);
  expect(parseDurationControl('9d', { defaultUnit: 'day', max: 8 }).valid).toBe(
    false,
  );
});
