import { describe, expect, it } from 'vitest';
import {
  addDisplayMonths,
  displayWeekNumber,
  displayYearMonths,
  endOfDisplayMonth,
  formatDisplayCalendarDate,
  getDisplayCalendarParts,
  startOfDisplayMonth,
} from './display-calendar';

describe('display calendar civil date boundaries', () => {
  it('navigates Gregorian leap months and clamps a preserved day', () => {
    expect(addDisplayMonths('2024-01-31', 1, 'gregory', true)).toBe(
      '2024-02-29',
    );
    expect(addDisplayMonths('2024-02-29', 12, 'gregory', true)).toBe(
      '2025-02-28',
    );
    expect(startOfDisplayMonth('0004-02-29')).toBe('0004-02-01');
  });
  it('uses Persian month boundaries rather than relabeling Gregorian months', () => {
    expect(getDisplayCalendarParts('2024-03-20', 'persian')).toEqual({
      year: 1403,
      month: 1,
      day: 1,
    });
    expect(startOfDisplayMonth('2024-04-01', 'persian')).toBe('2024-03-20');
    expect(endOfDisplayMonth('2024-03-20', 'persian')).toBe('2024-04-19');
    expect(addDisplayMonths('2024-03-20', 1, 'persian')).toBe('2024-04-20');
    expect(displayYearMonths('2024-03-20', 'persian')).toHaveLength(12);
    expect(
      formatDisplayCalendarDate(
        '2024-03-20',
        'fa-IR',
        { day: 'numeric' },
        'persian',
      ),
    ).toBe('۱');
  });
  it('walks twelve Umm al-Qura months with round-trip civil boundaries', () => {
    const months = displayYearMonths('2026-10-24', 'islamic-umalqura');
    expect(months).toHaveLength(12);
    months.forEach((month, index) => {
      expect(getDisplayCalendarParts(month, 'islamic-umalqura')).toMatchObject({
        month: index + 1,
        day: 1,
      });
      expect(
        addDisplayMonths(
          addDisplayMonths(month, 1, 'islamic-umalqura'),
          -1,
          'islamic-umalqura',
        ),
      ).toBe(month);
    });
  });
  it('numbers ISO and Sunday-first weeks across year boundaries', () => {
    expect(displayWeekNumber('2021-01-01')).toBe(53);
    expect(displayWeekNumber('2021-01-04')).toBe(1);
    expect(displayWeekNumber('2023-12-31', 0, 1)).toBe(1);
    expect(displayWeekNumber('2024-01-07', 0, 1)).toBe(2);
  });
});
