import { describe, expect, it } from 'vitest';
import { addElapsedMinutes, createDateTime } from './time-of-day';

describe('explicit elapsed-minute arithmetic', () => {
  it('constructs fractional civil minutes with milliseconds in UTC and a named zone', () => {
    expect(createDateTime('2026-06-09', 21 * 60 + 14 + 44.5 / 60)).toBe(
      '2026-06-09T21:14:44.500Z',
    );
    expect(
      createDateTime('2026-06-09', 21 * 60 + 14 + 44.5 / 60, 'Europe/Berlin'),
    ).toBe('2026-06-09T19:14:44.500Z');
  });
  it('rejects non-finite elapsed offsets', () => {
    expect(() => addElapsedMinutes('2026-04-06T08:00:00Z', NaN)).toThrow();
    expect(() => addElapsedMinutes('2026-04-06T08:00:00Z', Infinity)).toThrow();
  });
});
