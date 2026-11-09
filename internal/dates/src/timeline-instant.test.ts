import { describe, expect, it } from 'vitest';
import {
  normalizeTimelineWeekStartsOn,
  parseTimelineInstantValue,
  startOfTimelineUnit,
} from './timeline';

describe('shared timeline date ownership', () => {
  it.each(['0000', '0001', '0099', '0100'])(
    'preserves ISO civil year %s for explicit-zone instants',
    (year) => {
      expect(
        parseTimelineInstantValue(`${year}-03-01T01:30:00Z`)?.toISOString(),
      ).toBe(`${year}-03-01T01:30:00.000Z`);
      expect(
        parseTimelineInstantValue(
          `${year}-03-01T02:30:00+01:00`,
        )?.toISOString(),
      ).toBe(`${year}-03-01T01:30:00.000Z`);
    },
  );

  it('validates leap days and overflowing civil fields independently of low years', () => {
    expect(
      parseTimelineInstantValue('0000-02-29T12:00:00Z')?.toISOString(),
    ).toBe('0000-02-29T12:00:00.000Z');
    for (const value of [
      '0001-02-29T12:00:00Z',
      '0099-02-29T12:00:00Z',
      '0100-02-29T12:00:00Z',
      '0001-13-01T12:00:00Z',
      '0001-03-01T24:00:00Z',
      '0001-03-01T12:60:00Z',
      '0001-03-01T12:00:60Z',
    ]) {
      expect(parseTimelineInstantValue(value)).toBeUndefined();
    }
  });
  it('accepts only unambiguous instant values and clones mutable dates', () => {
    const source = new Date('2026-10-25T01:30:00.000Z');
    const parsed = parseTimelineInstantValue(source);

    expect(parsed).toEqual(source);
    expect(parsed).not.toBe(source);
    expect(
      parseTimelineInstantValue('2026-10-25T01:30:00+01:00')?.toISOString(),
    ).toBe('2026-10-25T00:30:00.000Z');
    expect(parseTimelineInstantValue('2026-10-25T01:30:00')).toBeUndefined();
    expect(parseTimelineInstantValue('2026-02-30T01:30:00Z')).toBeUndefined();
    expect(parseTimelineInstantValue('2026-10-25T24:00:00Z')).toBeUndefined();
    expect(parseTimelineInstantValue('not-a-date')).toBeUndefined();
  });

  it('supports every configured calendar week start', () => {
    expect(normalizeTimelineWeekStartsOn(6)).toBe(6);
    expect(startOfTimelineUnit('week', '2026-09-09', 6)).toBe('2026-09-05');
    expect(normalizeTimelineWeekStartsOn(7)).toBe(0);
  });
});
