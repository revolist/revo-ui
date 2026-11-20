import { describe, expect, it } from 'vitest';
import {
  addDays,
  compareIsoDates,
  diffInCalendarDays,
  endOfMonth,
  formatCalendarDateDisplay,
  formatIsoDate,
  formatIsoDateTime,
  isValidIsoDate,
  isValidIsoDateTime,
  parseIsoDate,
  startOfMonth,
  subtractDays,
} from './dates';

describe('public date utilities', () => {
  it('validates dates before parsing and round-tripping at UTC midnight', () => {
    expect(isValidIsoDate('2000-02-29')).toBe(true);
    for (const value of [
      '1900-02-29',
      '2026-02-29',
      '2026-04-31',
      '2026-1-01',
      '2026-11-16T00:00:00Z',
    ])
      expect(isValidIsoDate(value)).toBe(false);
    const date = parseIsoDate('2026-11-16');
    expect(formatIsoDateTime(date)).toBe('2026-11-16T00:00:00.000Z');
    expect(formatIsoDate(date)).toBe('2026-11-16');
    expect(isValidIsoDateTime(formatIsoDateTime(date))).toBe(true);
  });

  it('adds UTC calendar days across leap days and DST without changing input representation', () => {
    expect(addDays('2024-03-01', -1)).toBe('2024-02-29');
    expect(subtractDays('2026-03-30', 1)).toBe('2026-03-29');
    expect(addDays('2026-03-28T12:00:00.000Z', 1)).toBe(
      '2026-03-29T12:00:00.000Z',
    );
    expect(diffInCalendarDays('2026-03-28', '2026-03-30')).toBe(2);
    expect(diffInCalendarDays('2026-03-30', '2026-03-28')).toBe(-2);
    expect(diffInCalendarDays('2026-03-28', '2026-03-28')).toBe(0);
  });

  it('resolves month boundaries and compares dates', () => {
    expect(startOfMonth('2026-11-16')).toBe('2026-11-01');
    expect(endOfMonth('2024-02-16')).toBe('2024-02-29');
    expect(compareIsoDates('2026-10-31', '2026-11-01')).toBeLessThan(0);
  });

  it('formats civil dates in the requested locale without shifting their calendar day', () => {
    expect(
      formatCalendarDateDisplay('2026-11-16', 'en-GB', 'America/Los_Angeles'),
    ).toBe('16 Nov 2026');
    expect(
      formatCalendarDateDisplay('2026-11-16', 'fr-FR', 'Pacific/Kiritimati'),
    ).toBe('16 nov. 2026');
    expect(formatCalendarDateDisplay('2026-02-29', 'en-GB')).toBeUndefined();
  });
});
