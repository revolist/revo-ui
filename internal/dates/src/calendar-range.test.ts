import { describe, expect, it } from 'vitest';
import {
  resolveUtcCalendarPreset,
  resolveUtcCustomCalendarRange,
  shiftUtcCalendarMonths,
} from './calendar-range';
const ms = (value: string) => new Date(value).getTime();
const domain = {
  min: ms('2020-01-01T00:00:00Z'),
  max: ms('2024-03-31T15:45:12.345Z'),
};
describe('UTC calendar range math', () => {
  it.each([
    ['1M', '2024-02-29T15:45:12.345Z'],
    ['3M', '2023-12-31T15:45:12.345Z'],
    ['1Y', '2023-03-31T15:45:12.345Z'],
    ['YTD', '2024-01-01T00:00:00.000Z'],
  ] as const)(
    'anchors %s to the latest available instant and preserves UTC calendar semantics',
    (preset, start) => {
      expect(resolveUtcCalendarPreset(preset, domain)).toEqual({
        min: ms(start),
        max: domain.max,
      });
    },
  );
  it('clamps leap day and preserves early years without the Date.UTC year-1900 special case', () => {
    expect(
      new Date(
        shiftUtcCalendarMonths(ms('2024-02-29T10:00:00Z'), -12)!,
      ).toISOString(),
    ).toBe('2023-02-28T10:00:00.000Z');
    expect(
      new Date(
        shiftUtcCalendarMonths(ms('0099-03-31T10:00:00Z'), -1)!,
      ).toISOString(),
    ).toBe('0099-02-28T10:00:00.000Z');
  });
  it('clamps short domains and returns an owned full-domain range for All', () => {
    const short = { min: ms('2024-03-30T12:00:00Z'), max: domain.max };
    expect(resolveUtcCalendarPreset('1M', short)).toEqual(short);
    const all = resolveUtcCalendarPreset('all', domain);
    expect(all).toEqual(domain);
    expect(all).not.toBe(domain);
  });
  it('includes the entire final UTC date and supports a same-day custom range', () => {
    expect(
      resolveUtcCustomCalendarRange('2024-02-29', '2024-02-29', domain),
    ).toEqual({
      min: ms('2024-02-29T00:00:00Z'),
      max: ms('2024-02-29T23:59:59.999Z'),
    });
  });
  it('intersects inclusive dates with full available instants', () => {
    expect(
      resolveUtcCustomCalendarRange('2019-01-01', '2024-12-31', domain),
    ).toEqual(domain);
  });
  it.each([
    ['2024-02-30', '2024-03-01'],
    ['2024-03-02', '2024-03-01'],
    ['2025-01-01', '2025-01-02'],
    ['2024-01-01T00:00:00Z', '2024-01-02'],
    ['', '2024-01-01'],
  ])(
    'rejects malformed, inverted or nonoverlapping custom dates %s / %s',
    (from, to) => {
      expect(resolveUtcCustomCalendarRange(from, to, domain)).toBeUndefined();
    },
  );
  it('rejects invalid or degenerate domains and unsupported calendar shifts', () => {
    for (const invalid of [
      { min: 1, max: 1 },
      { min: 2, max: 1 },
      { min: 0, max: Infinity },
      { min: -9e15, max: 9e15 },
    ]) {
      expect(resolveUtcCalendarPreset('all', invalid)).toBeUndefined();
      expect(
        resolveUtcCustomCalendarRange('2024-01-01', '2024-01-02', invalid),
      ).toBeUndefined();
    }
    expect(shiftUtcCalendarMonths(NaN, 1)).toBeUndefined();
    expect(shiftUtcCalendarMonths(domain.max, 1.5)).toBeUndefined();
  });
});
