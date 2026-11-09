import { expect, it } from 'vitest';
import {
  resolveCalendarWindow,
  resolveCalendarPreset,
  resolveCustomCalendarRange,
  formatCalendarInputDate,
} from './zoned-calendar-range';
import {
  resolveUtcCalendarWindow,
  resolveUtcCalendarPreset,
  resolveUtcCustomCalendarRange,
} from './calendar-range';
const ms = (value: string) => Date.parse(value);
const zone = 'America/New_York';
const domain = (max = '2024-03-11T04:00:00Z') => ({
  min: ms('2000-01-01T00:00:00Z'),
  max: ms(max),
});
it.each([
  ['2024-03-11T04:00:00Z', '2024-03-10T05:00:00Z', 23],
  ['2024-11-04T05:00:00Z', '2024-11-03T04:00:00Z', 25],
] as const)('subtracts a civil day ending %s (%sh)', (end, start, hours) => {
  const result = resolveCalendarWindow(
    { unit: 'day', count: 1 },
    domain(end),
    zone,
  )!;
  expect(result).toEqual({ min: ms(start), max: ms(end) });
  expect(result.max - result.min).toBe(hours * 3600000);
});
it.each([
  ['2024-03-11T06:30:12.345Z', '2024-03-10T07:00:00Z'], // missing 02:30 -> first valid 03:00
  ['2024-11-04T06:30:12.345Z', '2024-11-03T05:30:12.345Z'], // earlier 01:30 fold
  ['2024-03-31T14:11:12.345Z', '2024-02-29T15:11:12.345Z'],
] as const)('resolves gap/fold/clamping at %s', (end, start) => {
  expect(
    resolveCalendarWindow(
      { unit: end.includes('03-31') ? 'month' : 'day', count: 1 },
      domain(end),
      zone,
    )?.min,
  ).toBe(ms(start));
});
it('clamps leap years, uses zoned YTD and keeps full-domain anchor immutable', () => {
  const full = Object.freeze(domain('2024-02-29T15:00:00Z'));
  expect(
    resolveCalendarWindow({ unit: 'year', count: 1 }, full, zone)?.min,
  ).toBe(ms('2023-02-28T15:00:00Z'));
  expect(resolveCalendarPreset('YTD', full, zone)?.min).toBe(
    ms('2024-01-01T05:00:00Z'),
  );
  expect(resolveCalendarPreset('all', full, zone)).toEqual(full);
});
it.each([
  ['2024-03-10', '2024-03-10T05:00:00Z', '2024-03-11T03:59:59.999Z'],
  ['2024-11-03', '2024-11-03T04:00:00Z', '2024-11-04T04:59:59.999Z'],
] as const)('includes the entire local day %s', (day, start, end) => {
  expect(
    resolveCustomCalendarRange(day, day, domain('2025-01-01T00:00:00Z'), zone),
  ).toEqual({ min: ms(start), max: ms(end) });
});
it.each([
  ['2011-12-30', '2011-12-31'],
  ['2011-12-29', '2011-12-30'],
])('rejects skipped input date in %s to %s', (from, to) => {
  expect(
    resolveCustomCalendarRange(
      from,
      to,
      domain('2011-12-31T10:00:00Z'),
      'Pacific/Apia',
    ),
  ).toBeUndefined();
});
it('includes the complete day preceding a skipped civil date', () => {
  expect(
    resolveCustomCalendarRange(
      '2011-12-29',
      '2011-12-29',
      domain('2011-12-31T10:00:00Z'),
      'Pacific/Apia',
    ),
  ).toEqual({
    min: ms('2011-12-29T10:00:00Z'),
    max: ms('2011-12-30T09:59:59.999Z'),
  });
});
it('advances a preset boundary across a skipped civil date', () => {
  expect(
    resolveCalendarWindow(
      { unit: 'day', count: 1 },
      domain('2011-12-30T22:00:00Z'),
      'Pacific/Apia',
    )?.min,
  ).toBe(ms('2011-12-30T10:00:00Z'));
});
it('uses earlier midnight on folds and first valid boundary on midnight gaps', () => {
  const full = domain('2025-01-01T00:00:00Z');
  expect(
    resolveCustomCalendarRange(
      '2020-11-01',
      '2020-11-01',
      full,
      'America/Havana',
    )?.min,
  ).toBe(ms('2020-11-01T04:00:00Z'));
  expect(
    resolveCustomCalendarRange(
      '2018-11-04',
      '2018-11-04',
      full,
      'America/Sao_Paulo',
    )?.min,
  ).toBe(ms('2018-11-04T03:00:00Z'));
});
it('preserves years below 100 and pads date inputs without machine-local conversion', () => {
  const full = {
    min: ms('0001-01-01T00:00:00Z'),
    max: ms('0099-03-31T10:11:12.345Z'),
  };
  expect(
    resolveCalendarWindow({ unit: 'month', count: 1 }, full, 'Etc/UTC')?.min,
  ).toBe(ms('0099-02-28T10:11:12.345Z'));
  expect(formatCalendarInputDate(full.max, 'Etc/UTC')).toBe('0099-03-31');
  expect(
    resolveCustomCalendarRange('0099-02-28', '0099-02-28', full, 'Etc/UTC')
      ?.min,
  ).toBe(ms('0099-02-28T00:00:00Z'));
  expect(formatCalendarInputDate(ms('2024-01-01T01:00:00Z'), zone)).toBe(
    '2023-12-31',
  );
});
it('preserves the exact omitted UTC behavior', () => {
  const full = domain();
  for (const preset of ['1M', '3M', 'YTD', '1Y', 'all'] as const)
    expect(resolveCalendarPreset(preset, full)).toEqual(
      resolveUtcCalendarPreset(preset, full),
    );
  for (const unit of ['day', 'week', 'month', 'year'] as const)
    expect(resolveCalendarWindow({ unit, count: 2 }, full)).toEqual(
      resolveUtcCalendarWindow({ unit, count: 2 }, full),
    );
  expect(resolveCustomCalendarRange('2024-02-29', '2024-03-01', full)).toEqual(
    resolveUtcCustomCalendarRange('2024-02-29', '2024-03-01', full),
  );
});
it('rejects invalid zones, domains, dates and shifts without nonfinite results', () => {
  for (const invalid of ['Invalid/Zone', ''])
    expect(() => resolveCalendarPreset('all', domain(), invalid)).toThrow();
  for (const full of [
    { min: -8640000000000000, max: -8640000000000000 + 86400000 },
    { min: 0, max: 8640000000000001 },
    { min: NaN, max: 10 },
    { min: 10, max: 1 },
  ])
    expect(
      resolveCalendarWindow({ unit: 'month', count: 1 }, full, zone),
    ).toBeUndefined();
  const upper = {
    min: 8640000000000000 - 86400000 * 400,
    max: 8640000000000000,
  };
  const result = resolveCalendarWindow({ unit: 'day', count: 1 }, upper, zone)!;
  expect(Number.isFinite(result.min)).toBe(true);
  expect(result.max).toBe(upper.max);
  expect(formatCalendarInputDate(upper.max, zone)).toBe('');
  expect(
    resolveCalendarWindow(
      { unit: 'year', count: Number.MAX_SAFE_INTEGER },
      domain(),
      zone,
    ),
  ).toBeUndefined();
  for (const [from, to] of [
    ['2024-02-30', '2024-03-01'],
    ['2024-03-02', '2024-03-01'],
    ['', '2024-03-01'],
  ])
    expect(
      resolveCustomCalendarRange(from, to, domain(), zone),
    ).toBeUndefined();
});

it('uses the zoned calendar year and seven civil days across a DST boundary', () => {
  expect(
    resolveCalendarPreset('YTD', domain('2024-01-01T01:00:00Z'), zone)?.min,
  ).toBe(ms('2023-01-01T05:00:00Z'));
  expect(
    resolveCalendarWindow({ unit: 'week', count: 1 }, domain(), zone)?.min,
  ).toBe(ms('2024-03-04T05:00:00Z'));
});
