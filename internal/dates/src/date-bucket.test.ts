import { runInNewContext } from 'node:vm';
import { describe, expect, it, vi } from 'vitest';
import {
  compileDateBucketClassifier,
  type DateBucketOperation,
} from './date-bucket';
const civil = (grain: string, extra: object = {}) =>
  ({
    version: 1,
    type: 'truncate',
    input: { kind: 'civil-date' },
    calendar: 'gregory',
    grain,
    ...extra,
  }) as DateBucketOperation;
const instant = (
  grain: string,
  timeZone = 'America/New_York',
  extra: object = {},
) =>
  ({
    ...civil(grain),
    input: { kind: 'instant', timeZone },
    ...extra,
  }) as DateBucketOperation;
const key = (policy: DateBucketOperation, value: unknown) =>
  compileDateBucketClassifier(policy)(value);
describe('portable Gregorian date buckets', () => {
  it('keeps civil dates independent of process timezone and rejects malformed values', () => {
    expect(key(civil('day'), '2024-02-29')).toEqual({
      kind: 'value',
      value: '2024-02-29',
    });
    for (const value of [
      '2026-02-29',
      '',
      ' ',
      ' 2024-02-29 ',
      '2024-02-29T00:00:00Z',
      new Date(),
      0,
    ])
      expect(key(civil('day'), value).kind).toBe('invalid');
    for (const value of [null, undefined])
      expect(key(civil('day'), value)).toEqual({ kind: 'missing' });
  });
  it('truncates all grains and separates weekday extraction', () => {
    for (const [grain, expected] of Object.entries({
      day: '2026-04-01',
      week: '2026-03-30',
      month: '2026-04-01',
      quarter: '2026-04-01',
      year: '2026-01-01',
    }))
      expect(
        key(
          civil(grain, grain === 'week' ? { weekStartsOn: 1 } : {}),
          '2026-04-01',
        ),
      ).toEqual({ kind: 'value', value: expected });
    expect(key(instant('hour'), '2026-04-01T12:34:56Z')).toEqual({
      kind: 'value',
      value: '2026-04-01T08',
    });
    expect(key(instant('minute'), '2026-04-01T12:34:56Z')).toEqual({
      kind: 'value',
      value: '2026-04-01T08:34',
    });
    expect(
      key(
        {
          version: 1,
          type: 'weekday',
          input: { kind: 'civil-date' },
          calendar: 'gregory',
        },
        '2026-04-05',
      ),
    ).toEqual({ kind: 'value', value: 0 });
    expect(key(civil('week', { weekStartsOn: 0 }), '2026-01-01')).toEqual({
      kind: 'value',
      value: '2025-12-28',
    });
  });
  it('uses strict instant union and explicit zones without mutating Date inputs', () => {
    const date = new Date('2026-01-01T00:30:00Z');
    const stamp = date.getTime();
    for (const value of [
      date,
      stamp,
      '2025-12-31T19:30:00-05:00',
      ' 2026-01-01T00:30:00Z ',
    ])
      expect(key(instant('day', 'America/Los_Angeles'), value)).toEqual({
        kind: 'value',
        value: '2025-12-31',
      });
    expect(date.getTime()).toBe(stamp);
    expect(Object.isFrozen(date)).toBe(false);
    expect(key(instant('day', 'UTC'), date)).toEqual({
      kind: 'value',
      value: '2026-01-01',
    });
    for (const value of [
      '2026-01-01',
      '2026-01-01T01:00:00',
      '1767227400000',
      NaN,
      Infinity,
      new Date(NaN),
      {},
      '',
    ])
      expect(key(instant('day'), value).kind).toBe('invalid');
    expect(key(instant('day', 'UTC'), 1767227400)).toEqual({
      kind: 'value',
      value: '1970-01-21',
    });
  });
  it('merges fallback wall-clock buckets and handles gaps and skipped dates', () => {
    for (const value of ['2026-11-01T05:30:00Z', '2026-11-01T06:30:00Z'])
      expect(key(instant('hour'), value)).toEqual({
        kind: 'value',
        value: '2026-11-01T01',
      });
    expect(key(instant('hour'), '2026-03-08T07:30:00Z')).toEqual({
      kind: 'value',
      value: '2026-03-08T03',
    });
    for (const value of ['2026-04-04T14:45:00Z', '2026-04-04T15:15:00Z'])
      expect(key(instant('minute', 'Australia/Lord_Howe'), value)).toEqual({
        kind: 'value',
        value: '2026-04-05T01:45',
      });
    expect(key(instant('day', 'Pacific/Apia'), '2011-12-30T12:00:00Z')).toEqual(
      { kind: 'value', value: '2011-12-31' },
    );
  });
  it('enforces input UTC, projected civil and truncated bucket year limits', () => {
    expect(key(civil('year'), '0100-01-01')).toEqual({
      kind: 'value',
      value: '0100-01-01',
    });
    expect(key(civil('year'), '9999-12-31')).toEqual({
      kind: 'value',
      value: '9999-01-01',
    });
    for (const value of ['0099-12-31', '0001-01-01', '10000-01-01'])
      expect(key(civil('day'), value).kind).toBe('invalid');
    expect(key(civil('week', { weekStartsOn: 0 }), '0100-01-01').kind).toBe(
      'invalid',
    );
    for (const value of [
      new Date('0001-01-01T00:00:00Z'),
      new Date('-000100-01-01T00:00:00Z'),
      new Date('+010000-01-01T00:00:00Z'),
    ])
      expect(key(instant('day', 'UTC'), value).kind).toBe('invalid');
    expect(
      key(instant('day', 'America/New_York'), '0100-01-01T00:00:00Z').kind,
    ).toBe('invalid');
    expect(
      key(instant('day', 'Pacific/Kiritimati'), '9999-12-31T23:30:00Z').kind,
    ).toBe('invalid');
  });
  it('does not coerce malformed public policies or invoke descriptor accessors', () => {
    const coerce = vi.fn(() => 'truncate');
    expect(() =>
      compileDateBucketClassifier(
        civil('day', { type: { toString: coerce } }) as DateBucketOperation,
      ),
    ).toThrow();
    expect(coerce).not.toHaveBeenCalled();
    const getter = vi.fn();
    const policy = civil('day');
    Object.defineProperty(policy, 'invalid', { get: getter });
    expect(() => compileDateBucketClassifier(policy)).toThrow();
    expect(getter).not.toHaveBeenCalled();
    expect(() =>
      compileDateBucketClassifier({ ...civil('day'), [Symbol('x')]: 1 }),
    ).toThrow();
    const hidden = civil('day');
    Object.defineProperty(hidden, 'surprise', { value: 1 });
    expect(() => compileDateBucketClassifier(hidden)).toThrow();
  });
  it('accepts native Date internal slots from another realm', () => {
    const date: Date = runInNewContext('new Date("2026-01-01T00:00:00Z")');
    expect(key(instant('day', 'UTC'), date)).toEqual({
      kind: 'value',
      value: '2026-01-01',
    });
  });
  it('reads Date timestamps intrinsically and treats malformed Date authority as invalid', () => {
    const date = new Date('2026-01-01T00:00:00Z');
    const getter = vi.fn(() => {
      throw new Error('unsafe');
    });
    Object.defineProperty(date, 'getTime', { get: getter });
    expect(key(instant('day', 'UTC'), date)).toEqual({
      kind: 'value',
      value: '2026-01-01',
    });
    expect(getter).not.toHaveBeenCalled();
    expect(key(instant('day'), new Proxy(date, {})).kind).toBe('invalid');
    expect(
      key(
        instant('day'),
        new Proxy(
          {},
          {
            getPrototypeOf() {
              throw new Error('opaque');
            },
          },
        ),
      ).kind,
    ).toBe('invalid');
  });
  it('rejects unsupported policies before classification', () => {
    for (const policy of [
      civil('minute'),
      civil('hour'),
      civil('week'),
      civil('week', { weekStartsOn: 7 }),
      civil('month', { weekStartsOn: 1 }),
      civil('day', { calendar: 'buddhist' }),
      civil('day', { version: 2 }),
      instant('day', 'Invalid/Zone'),
      { ...instant('day'), input: { kind: 'instant' } },
      civil('day', { invalid: 'ignore' }),
    ])
      expect(() =>
        compileDateBucketClassifier(policy as DateBucketOperation),
      ).toThrow();
  });
});
