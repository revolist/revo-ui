import { expect, it } from 'vitest';
import { validateTemporalSelection as validate } from './validation';
const month = '2026-10-01';
it('rejects invalid dates, bounds, disabled dates/months and required empties', () => {
  for (const value of [
    'bad',
    '2026-02-30',
    '2026-09-30',
    '2026-11-01',
    '2026-10-13',
  ])
    expect(
      validate(
        {
          value,
          onChange: () => {},
          calendar: {
            minDate: '2026-10-01',
            maxDate: '2026-10-31',
            isDateDisabled: (d) => d === '2026-10-13',
          },
        },
        month,
      ).valid,
    ).toBe(false);
  expect(
    validate({ value: null, required: true, onChange: () => {} }, month)
      .errorMessage,
  ).toBe('A value is required.');
  expect(
    validate(
      {
        value: '2026-10-12',
        onChange: () => {},
        calendar: { isMonthDisabled: () => true },
      },
      month,
    ).valid,
  ).toBe(false);
});
it('checks range order, length, disabled interiors and custom reasons', () => {
  expect(
    validate(
      {
        value: { from: '2026-10-15', to: '2026-10-12' },
        selection: 'range',
        onChange: () => {},
      },
      month,
    ).valid,
  ).toBe(false);
  expect(
    validate(
      {
        value: { from: '2026-10-12', to: '2026-10-15' },
        selection: 'range',
        onChange: () => {},
        calendar: { min: 5 },
      },
      month,
    ).valid,
  ).toBe(false);
  expect(
    validate(
      {
        value: { from: '2026-10-12', to: '2026-10-15' },
        selection: 'range',
        onChange: () => {},
        calendar: {
          excludeDisabled: true,
          isDateDisabled: (d) => d === '2026-10-13',
        },
      },
      month,
    ).valid,
  ).toBe(false);
  expect(
    validate(
      {
        value: '2026-10-12',
        onChange: () => {},
        calendar: { validateSelection: () => 'Not bookable' },
      },
      month,
    ).errorMessage,
  ).toBe('Not bookable');
});
it('checks multiple counts/duplicates and uses translated validation text', () => {
  expect(
    validate(
      {
        value: ['2026-10-12'],
        selection: 'multiple',
        onChange: () => {},
        calendar: { min: 2 },
      },
      month,
    ).valid,
  ).toBe(false);
  expect(
    validate(
      {
        value: ['2026-10-12', '2026-10-12'],
        selection: 'multiple',
        onChange: () => {},
      },
      month,
    ).valid,
  ).toBe(false);
  expect(
    validate(
      {
        value: 'bad',
        onChange: () => {},
        text: { invalidDate: 'Date invalide' },
      },
      month,
    ).errorMessage,
  ).toBe('Date invalide');
});
