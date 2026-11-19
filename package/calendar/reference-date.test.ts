import { afterEach, expect, it, vi } from 'vitest';
import {
  getCalendarInitialDate,
  resolveCalendarReferenceDate,
} from './reference-date';
import { createCalendarMonth } from './model';

afterEach(() => vi.useRealTimers());

it.each([
  ['Asia/Kolkata', '2024-02-29T18:29:59Z', '2024-02-29'],
  ['Asia/Kolkata', '2024-02-29T18:30:00Z', '2024-03-01'],
  ['Asia/Beirut', '2024-03-31T20:59:59Z', '2024-03-31'],
  ['Asia/Beirut', '2024-03-31T21:00:00Z', '2024-04-01'],
] as const)(
  'opens on the correct civil date in %s at %s',
  (timeZone, instant, expected) => {
    const options = { referenceInstant: new Date(instant), timeZone };
    expect(resolveCalendarReferenceDate(options)).toBe(expected);
    expect(getCalendarInitialDate(options)).toBe(expected);
  },
);

it('prioritizes the selected date and constrains the empty-picker fallback', () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2024-02-29T18:30:00Z'));
  expect(resolveCalendarReferenceDate({})).toBeUndefined();
  expect(resolveCalendarReferenceDate({ timeZone: 'Asia/Kolkata' })).toBe(
    '2024-03-01',
  );
  expect(getCalendarInitialDate({ timeZone: 'Asia/Kolkata' })).toBe(
    '2024-03-01',
  );
  expect(getCalendarInitialDate({ minDate: '2024-03-15' })).toBe('2024-03-15');
  expect(getCalendarInitialDate({ maxDate: '2024-02-10' })).toBe('2024-02-10');
  const options = {
    referenceDate: '2024-04-03',
    referenceInstant: new Date('2024-02-29T18:30:00Z'),
    timeZone: 'Asia/Kolkata',
  } as const;
  expect(getCalendarInitialDate(options, '2024-02-20')).toBe('2024-02-20');
  expect(getCalendarInitialDate(options)).toBe('2024-04-03');
  expect(getCalendarInitialDate({ ...options, endMonth: '2024-03-01' })).toBe(
    '2024-03-01',
  );
});

it.each([
  ['0000-01-01', '-000001-12-27', '0000-02-06'],
  ['9999-12-01', '9999-11-29', '+010000-01-09'],
] as const)(
  'builds a finite six-week grid for %s',
  (civilDate, first, last) => {
    const dates = createCalendarMonth(civilDate, 1);
    expect(dates).toHaveLength(42);
    expect(dates[0]).toBe(first);
    expect(dates.at(-1)).toBe(last);
  },
);
