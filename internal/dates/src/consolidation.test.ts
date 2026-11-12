import { expect, it } from 'vitest';
import {
  addCivilDays,
  addCivilMonths,
  compareCivilDates,
  getCivilWeekday,
} from './civil-time';
import {
  addLocalCalendarDays,
  addLocalCalendarMonths,
  startOfLocalCalendarUnit,
} from './local-calendar';
import {
  coerceValidDate,
  formatLocalDateControlValue,
  parseOffsetDateTimeValue,
} from './date-controls';
import { isParseableIsoDateValue, isParseableUtcDateTime } from './iso';

it('shares civil arithmetic without mutating fields or remapping early years', () => {
  const civil = { year: 1, month: 1, day: 31 };
  expect(addCivilMonths(civil, 1)).toEqual({ year: 1, month: 2, day: 28 });
  expect(addCivilDays(civil, 1)).toEqual({ year: 1, month: 2, day: 1 });
  expect(getCivilWeekday({ year: 1, month: 1, day: 1 })).toBe(1);
  expect(compareCivilDates(civil, addCivilDays(civil, 1))).toBe(-86_400_000);
  expect(civil).toEqual({ year: 1, month: 1, day: 31 });
  expect(addCivilMonths({ year: 2024, month: 1, day: 31 }, 1).day).toBe(29);
});

it('shares local boundaries, native month overflow, and DST-aware day shifts', () => {
  const date = new Date(2026, 2, 7, 12, 34, 56);
  expect(addLocalCalendarDays(date, 1).getHours()).toBe(12);
  expect(startOfLocalCalendarUnit(date, 'day').getHours()).toBe(0);
  expect(startOfLocalCalendarUnit(date, 'month').getDate()).toBe(1);
  expect(startOfLocalCalendarUnit(date, 'quarter').getMonth()).toBe(0);
  expect(startOfLocalCalendarUnit(date, 'year').getMonth()).toBe(0);
  expect(addLocalCalendarMonths(new Date(2026, 0, 31), 1).getMonth()).toBe(2);
  expect(date.getHours()).toBe(12);
  expect(formatLocalDateControlValue('datetime', date, 'second')).toBe(
    '2026-03-07T12:34:56',
  );
});

it('keeps legacy offset and chart parsing separate from strict timeline policies', () => {
  expect(
    parseOffsetDateTimeValue('2026-08-05T12:00:00+02:00')?.toISOString(),
  ).toBe('2026-08-05T10:00:00.000Z');
  expect(parseOffsetDateTimeValue('2026-08-05T12:00:00')).toBeUndefined();
  expect(parseOffsetDateTimeValue('2026-08-05')).toBeUndefined();
  expect(isParseableIsoDateValue('2026-02-30')).toBe(true);
  expect(isParseableIsoDateValue('August 5, 2026')).toBe(false);
  expect(isParseableUtcDateTime('2026-08-05T12:00:00.123456Z')).toBe(true);
  expect(isParseableUtcDateTime('2026-08-05T12:00Z')).toBe(false);
  expect(isParseableUtcDateTime('2026-08-05T12:00:00+00:00')).toBe(false);
});

it('coerces valid scalar values, clones Dates, and rejects unsupported inputs', () => {
  const date = new Date('2026-08-05T12:00:00Z');
  expect(coerceValidDate(date)).not.toBe(date);
  expect(coerceValidDate(date, false)).toBe(date);
  expect(coerceValidDate(new Date(NaN), false)).toBeUndefined();
  expect(coerceValidDate(0)?.getTime()).toBe(0);
  for (const value of [true, false, {}, null, undefined, NaN, new Date(NaN)]) {
    expect(coerceValidDate(value)).toBeUndefined();
  }
});
