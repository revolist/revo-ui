import { expect, it } from 'vitest';
import { resolveUtcCalendarWindow } from './calendar-range';
const ms = (value: string) => new Date(value).getTime();
const domain = {
  min: ms('2020-01-01T00:00:00Z'),
  max: ms('2024-03-31T15:45:12.345Z'),
};
it.each([
  ['day', 7, '2024-03-24T15:45:12.345Z'],
  ['week', 2, '2024-03-17T15:45:12.345Z'],
  ['month', 2, '2024-01-31T15:45:12.345Z'],
  ['year', 2, '2022-03-31T15:45:12.345Z'],
] as const)(
  'resolves trailing %s windows using calendar units and the full-domain anchor',
  (unit, count, start) => {
    expect(resolveUtcCalendarWindow({ unit, count }, domain)).toEqual({
      min: ms(start),
      max: domain.max,
    });
  },
);
it('clamps leap/month ends, preserves early years and intersects without mutating configuration', () => {
  const range = {
    min: ms('0001-01-01T00:00:00Z'),
    max: ms('0099-03-31T10:11:12.345Z'),
  };
  expect(resolveUtcCalendarWindow({ unit: 'month', count: 1 }, range)).toEqual({
    min: ms('0099-02-28T10:11:12.345Z'),
    max: range.max,
  });
  const leap = { min: domain.min, max: ms('2024-02-29T10:00:00Z') };
  expect(resolveUtcCalendarWindow({ unit: 'year', count: 1 }, leap)).toEqual({
    min: ms('2023-02-28T10:00:00Z'),
    max: leap.max,
  });
  const short = Object.freeze({ min: domain.max - 1000, max: domain.max });
  expect(
    resolveUtcCalendarWindow(
      Object.freeze({ unit: 'month' as const, count: 6 }),
      short,
    ),
  ).toEqual(short);
  expect(resolveUtcCalendarWindow({ unit: 'month', count: 6 }, short)).not.toBe(
    short,
  );
});
it.each([0, -1, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1])(
  'rejects invalid count %s',
  (count) => {
    expect(
      resolveUtcCalendarWindow({ unit: 'day', count }, domain),
    ).toBeUndefined();
  },
);
it('rejects unknown units, invalid domains and unrepresentable calendar shifts', () => {
  expect(
    resolveUtcCalendarWindow({ unit: 'hour', count: 1 } as any, domain),
  ).toBeUndefined();
  for (const range of [
    { min: 1, max: 1 },
    { min: 2, max: 1 },
    { min: NaN, max: 2 },
    { min: 0, max: Infinity },
  ])
    expect(
      resolveUtcCalendarWindow({ unit: 'day', count: 1 }, range),
    ).toBeUndefined();
  expect(
    resolveUtcCalendarWindow(
      { unit: 'year', count: Number.MAX_SAFE_INTEGER },
      domain,
    ),
  ).toBeUndefined();
  expect(
    resolveUtcCalendarWindow(
      { unit: 'month', count: 1 },
      { min: -8640000000000000, max: -8640000000000000 + 86400000 },
    ),
  ).toBeUndefined();
});
