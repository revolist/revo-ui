import { expect, it } from 'vitest';
import {
  analysisCalendarPeriod,
  shiftAnalysisCalendarInstant,
} from './analysis-calendar';
it('shifts UTC calendar periods with month-end and leap-year clamping while preserving intraday precision', () => {
  const instant = Date.UTC(2024, 2, 31, 12, 34, 56, 789);
  expect(shiftAnalysisCalendarInstant(instant, 'month', -1)).toBe(
    Date.UTC(2024, 1, 29, 12, 34, 56, 789),
  );
  expect(shiftAnalysisCalendarInstant(Date.UTC(2024, 1, 29), 'year', 1)).toBe(
    Date.UTC(2025, 1, 28),
  );
  expect(analysisCalendarPeriod(instant, 'quarter')).toEqual({
    start: Date.UTC(2024, 0, 1),
    end: Date.UTC(2024, 3, 1),
  });
  expect(analysisCalendarPeriod(instant, 'week')).toEqual({
    start: Date.UTC(2024, 2, 25),
    end: Date.UTC(2024, 3, 1),
  });
});
