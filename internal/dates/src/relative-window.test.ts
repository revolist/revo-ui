import { describe, expect, it } from 'vitest';
import {
  isRelativeDateWindowExpression,
  resolveRelativeDateWindow,
  startOfFiscalYear,
} from './relative-window';

const calendar = {
  weekStartsOn: 1 as const,
  fiscalYearStart: { month: 1, day: 1 },
};

describe('relative date window owner', () => {
  it('resolves presets without persisting resolved dates', () => {
    expect(
      resolveRelativeDateWindow(
        '2026-08-26',
        {
          version: 1,
          mode: 'preset',
          preset: 'last7Days',
        },
        calendar,
      ),
    ).toEqual({ from: '2026-08-20', to: '2026-08-26' });
    expect(
      resolveRelativeDateWindow(
        '2026-08-26',
        {
          version: 1,
          mode: 'preset',
          preset: 'overdue',
        },
        calendar,
      ),
    ).toEqual({ to: '2026-08-25' });
  });

  it('resolves rolling and calendar-aligned custom windows', () => {
    expect(
      resolveRelativeDateWindow(
        '2026-08-26',
        {
          version: 1,
          mode: 'custom',
          direction: 'last',
          amount: 7,
          unit: 'day',
          rolling: true,
        },
        calendar,
      ),
    ).toEqual({ from: '2026-08-20', to: '2026-08-26' });
    expect(
      resolveRelativeDateWindow(
        '2026-08-26',
        {
          version: 1,
          mode: 'custom',
          direction: 'next',
          amount: 2,
          unit: 'week',
          rolling: false,
        },
        calendar,
      ),
    ).toEqual({ from: '2026-08-24', to: '2026-09-06' });

    expect(
      resolveRelativeDateWindow(
        '2026-03-31',
        {
          version: 1,
          mode: 'custom',
          direction: 'next',
          amount: 1,
          unit: 'month',
          rolling: true,
        },
        calendar,
      ),
    ).toEqual({ from: '2026-03-31', to: '2026-04-29' });
    expect(
      resolveRelativeDateWindow(
        '2024-02-29',
        {
          version: 1,
          mode: 'custom',
          direction: 'last',
          amount: 1,
          unit: 'year',
          rolling: true,
        },
        calendar,
      ),
    ).toEqual({ from: '2023-03-01', to: '2024-02-29' });
  });

  it('aligns weeks at year and DST-adjacent civil-date boundaries', () => {
    expect(
      resolveRelativeDateWindow(
        '2026-01-01',
        {
          version: 1,
          mode: 'custom',
          direction: 'last',
          amount: 1,
          unit: 'week',
          rolling: false,
        },
        { ...calendar, weekStartsOn: 0 },
      ),
    ).toEqual({ from: '2025-12-28', to: '2026-01-03' });
    expect(
      resolveRelativeDateWindow(
        '2026-03-08',
        {
          version: 1,
          mode: 'custom',
          direction: 'last',
          amount: 2,
          unit: 'day',
          rolling: true,
        },
        calendar,
      ),
    ).toEqual({ from: '2026-03-07', to: '2026-03-08' });
  });

  it('honors fiscal quarter and year anchors', () => {
    const fiscal = {
      weekStartsOn: 0 as const,
      fiscalYearStart: { month: 2, day: 1 },
    };
    expect(
      resolveRelativeDateWindow(
        '2026-08-26',
        {
          version: 1,
          mode: 'preset',
          preset: 'thisQuarter',
        },
        fiscal,
      ),
    ).toEqual({ from: '2026-08-01', to: '2026-10-31' });
    expect(
      resolveRelativeDateWindow(
        '2026-01-15',
        {
          version: 1,
          mode: 'preset',
          preset: 'yearToDate',
        },
        fiscal,
      ),
    ).toEqual({ from: '2025-02-01', to: '2026-01-15' });
    expect(
      resolveRelativeDateWindow(
        '2026-08-26',
        {
          version: 1,
          mode: 'preset',
          preset: 'thisQuarter',
        },
        { ...fiscal, fiscalYearStart: { month: 2, day: 15 } },
      ),
    ).toEqual({ from: '2026-08-15', to: '2026-11-14' });
    expect(startOfFiscalYear('2026-01-15', fiscal)).toBe('2025-02-01');
    expect(startOfFiscalYear('2026-02-01', fiscal)).toBe('2026-02-01');
  });

  it('rejects incomplete or unsafe expressions', () => {
    expect(
      isRelativeDateWindowExpression({
        version: 1,
        mode: 'custom',
        direction: 'last',
        amount: 0,
        unit: 'day',
        rolling: true,
      }),
    ).toBe(false);
    expect(
      isRelativeDateWindowExpression({
        version: 1,
        mode: 'custom',
        direction: 'last',
        amount: 10_001,
        unit: 'day',
        rolling: true,
      }),
    ).toBe(false);
    expect(
      resolveRelativeDateWindow(
        'invalid',
        {
          version: 1,
          mode: 'preset',
          preset: 'today',
        },
        calendar,
      ),
    ).toBeUndefined();
    expect(
      resolveRelativeDateWindow(
        '2026-08-26',
        {
          version: 1,
          mode: 'preset',
          preset: 'today',
        },
        { ...calendar, weekStartsOn: 7 as never },
      ),
    ).toBeUndefined();
    expect(
      resolveRelativeDateWindow(
        '2026-08-26',
        {
          version: 1,
          mode: 'preset',
          preset: 'thisQuarter',
        },
        { ...calendar, fiscalYearStart: { month: 2, day: 30 } },
      ),
    ).toBeUndefined();
    expect(
      resolveRelativeDateWindow(
        '9999-12-31',
        {
          version: 1,
          mode: 'custom',
          direction: 'next',
          amount: 10_000,
          unit: 'year',
          rolling: true,
        },
        calendar,
      ),
    ).toBeUndefined();
    expect(
      resolveRelativeDateWindow(
        '2026-08-26',
        {
          version: 1,
          mode: 'preset',
          preset: 'today',
        },
        undefined as never,
      ),
    ).toBeUndefined();
  });
});
