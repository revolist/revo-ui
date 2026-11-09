import { expect, it } from 'vitest';
import { parseTimelineInstantValue } from './timeline';
import { parseIsoDate, formatIsoDate } from './iso';
it('preserves UTC date-only and strict instant parsing for shared consumers', () => {
  expect(formatIsoDate(parseIsoDate('2024-02-29'))).toBe('2024-02-29');
  expect(parseTimelineInstantValue('2024-02-30T12:00:00Z')).toBeUndefined();
  expect(parseTimelineInstantValue('2024-02-29T12:00:00')).toBeUndefined();
  expect(
    parseTimelineInstantValue('2024-02-29T12:00:00+02:00')?.toISOString(),
  ).toBe('2024-02-29T10:00:00.000Z');
});
