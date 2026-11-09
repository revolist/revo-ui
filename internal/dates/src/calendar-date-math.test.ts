import { describe, expect, it } from 'vitest';
import { addCalendarMonths } from '.';

describe('calendar date math', () => {
  it('preserves and clamps the day while paging between calendar months', () => {
    expect(addCalendarMonths('2026-01-31', 1)).toBe('2026-02-28');
    expect(addCalendarMonths('2024-01-31', 1)).toBe('2024-02-29');
    expect(addCalendarMonths('2026-03-31', -1)).toBe('2026-02-28');
    expect(addCalendarMonths('2026-12-15', 1)).toBe('2027-01-15');
  });
});
