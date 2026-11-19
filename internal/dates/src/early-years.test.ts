import { describe, expect, it } from 'vitest';
import { parseLocalDateValue } from './iso';
import {
  addCalendarMonths,
  addDays,
  diffInCalendarDays,
  endOfMonth,
} from './date-math';
import { formatIsoDateInTimeZone } from './iso';
import {
  parseIsoCivilDate,
  parseIsoLocalCivilDateTime,
  getPossibleInstants,
} from './civil-time';

describe('four-digit years below 100', () => {
  it('retains the literal Gregorian year in date arithmetic', () => {
    expect(endOfMonth('0000-02-01')).toBe('0000-02-29');
    expect(addCalendarMonths('0099-01-31', 1)).toBe('0099-02-28');
    expect(diffInCalendarDays('0099-12-31', '0100-01-01')).toBe(1);
  });

  it('returns complete ISO dates when walking beyond four-digit years', () => {
    expect(addDays('0000-01-01', -1)).toBe('-000001-12-31');
    expect(addDays('9999-12-31', 1)).toBe('+010000-01-01');
    expect(addDays(addDays('9999-12-31', 1), 1)).toBe('+010000-01-02');
  });

  it('uses astronomical Gregorian years for zoned ISO output', () => {
    expect(
      formatIsoDateInTimeZone(new Date('0000-03-01T00:00:00Z'), 'UTC'),
    ).toBe('0000-03-01');
  });
  it.each(['0000', '0001', '0099', '0100'])(
    'preserves year %s in local date parsing',
    (year) => {
      const date = parseLocalDateValue(`${year}-02-28`);
      expect(date?.getFullYear()).toBe(Number(year));
      expect(date?.getMonth()).toBe(1);
      expect(date?.getDate()).toBe(28);
    },
  );
  it.each(['0000', '0001', '0099', '0100'])(
    'preserves year %s in civil date parsing',
    (year) => {
      expect(parseIsoCivilDate(`${year}-02-28`)).toEqual({
        year: Number(year),
        month: 2,
        day: 28,
      });
      const civil = {
        year: Number(year),
        month: 2,
        day: 28,
        hour: 12,
        minute: 30,
        second: 0,
      };
      expect(parseIsoLocalCivilDateTime(`${year}-02-28T12:30:00`)).toEqual(
        civil,
      );
      expect(getPossibleInstants(civil, 'UTC')[0]?.toISOString()).toBe(
        `${year}-02-28T12:30:00.000Z`,
      );
    },
  );
  it('validates leap years without a 1900 offset', () => {
    expect(parseIsoCivilDate('0000-02-29')).toEqual({
      year: 0,
      month: 2,
      day: 29,
    });
    expect(parseIsoCivilDate('0001-02-29')).toBeUndefined();
    expect(parseLocalDateValue('0000-02-29')?.getDate()).toBe(29);
    expect(parseLocalDateValue('0001-02-29')).toBeUndefined();
  });
});

import { formatLocalIsoDate } from './iso';
import { formatLocalDateControlValue } from './date-controls';

it('preserves a four-digit local year in date serialization and controls', () => {
  const date = new Date(0);
  date.setFullYear(1, 1, 28);
  date.setHours(12, 30, 0, 0);
  expect(formatLocalIsoDate(date)).toBe('0001-02-28');
  expect(formatLocalDateControlValue('datetime', date)).toBe(
    '0001-02-28T12:30',
  );
});
