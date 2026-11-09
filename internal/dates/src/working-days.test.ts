import { describe, expect, it } from 'vitest';
import {
  addWorkingDays,
  countWorkingDuration,
  moveToNextWorkingDate,
  moveToNextWorkingDateTime,
  offsetByLagCalendar,
  resolveTaskEndDate,
  resolveTaskStartDateFromEnd,
  subtractWorkingDays,
  type WorkingCalendar,
} from './working-days';

const calendar: WorkingCalendar = {
  workingDays: [1, 2, 3, 4, 5],
  holidays: ['2026-04-03'],
};

describe('working-days', () => {
  it('moves and offsets through working dates deterministically', () => {
    expect(moveToNextWorkingDate('2026-04-04', calendar)).toBe('2026-04-06');
    expect(addWorkingDays('2026-04-02', 1, calendar)).toBe('2026-04-06');
  });

  it('resolves task ranges from either edge using the selected calendar policy', () => {
    const options = { excludeHolidaysFromDuration: true };

    expect(resolveTaskEndDate('2026-04-02', 2, calendar, options)).toBe(
      '2026-04-06',
    );
    expect(
      resolveTaskStartDateFromEnd('2026-04-06', 2, calendar, options),
    ).toBe('2026-04-02');
  });

  it('falls back to calendar days when working-day offsets have no calendar', () => {
    expect(addWorkingDays('2026-04-01', 2, null)).toBe('2026-04-03');
    expect(subtractWorkingDays('2026-04-03', 2, undefined)).toBe('2026-04-01');
    expect(
      offsetByLagCalendar('2026-04-01', 2, null, {
        lagCalendar: 'working-days',
      }),
    ).toBe('2026-04-03');
    expect(
      offsetByLagCalendar('2026-04-03', -2, undefined, {
        lagCalendar: 'working-days',
      }),
    ).toBe('2026-04-01');
  });

  it('resolves working-day durations as calendar-day durations when no calendar exists', () => {
    const options = { excludeHolidaysFromDuration: true };

    expect(resolveTaskEndDate('2026-04-01', 3, null, options)).toBe(
      '2026-04-03',
    );
    expect(
      resolveTaskStartDateFromEnd('2026-04-03', 3, undefined, options),
    ).toBe('2026-04-01');
  });

  it('preserves fractional datetime durations when excluding holidays from duration', () => {
    const options = { excludeHolidaysFromDuration: true };

    expect(
      resolveTaskEndDate('2026-04-02T08:00:00.000Z', 0.5, calendar, options),
    ).toBe('2026-04-02T20:00:00.000Z');
    expect(
      resolveTaskEndDate('2026-04-02T08:00:00.000Z', 1.5, calendar, options),
    ).toBe('2026-04-06T20:00:00.000Z');
    expect(
      resolveTaskStartDateFromEnd(
        '2026-04-06T20:00:00.000Z',
        1.5,
        calendar,
        options,
      ),
    ).toBe('2026-04-02T08:00:00.000Z');
  });

  it('resolves datetime durations through configured working hours', () => {
    const options = { excludeHolidaysFromDuration: true };
    const hourCalendar: WorkingCalendar = {
      ...calendar,
      workingHours: [
        { start: '09:00', end: '12:00' },
        { start: '13:00', end: '17:00' },
      ],
    };

    expect(
      moveToNextWorkingDateTime('2026-04-01T08:00:00.000Z', hourCalendar),
    ).toBe('2026-04-01T09:00:00.000Z');
    expect(moveToNextWorkingDateTime('2026-04-01', hourCalendar)).toBe(
      '2026-04-01T09:00:00.000Z',
    );
    expect(
      moveToNextWorkingDateTime('2026-04-01T18:00:00.000Z', hourCalendar),
    ).toBe('2026-04-02T09:00:00.000Z');
    expect(
      moveToNextWorkingDateTime('2026-04-01T12:30:00.000Z', hourCalendar),
    ).toBe('2026-04-01T13:00:00.000Z');
    expect(moveToNextWorkingDateTime('2026-04-03', hourCalendar)).toBe(
      '2026-04-06T09:00:00.000Z',
    );
    expect(moveToNextWorkingDateTime('2026-04-04', calendar)).toBe(
      '2026-04-06',
    );
    expect(
      resolveTaskEndDate(
        '2026-04-01T15:00:00.000Z',
        4 / 24,
        hourCalendar,
        options,
      ),
    ).toBe('2026-04-02T11:00:00.000Z');
    expect(
      resolveTaskStartDateFromEnd(
        '2026-04-02T11:00:00.000Z',
        4 / 24,
        hourCalendar,
        options,
      ),
    ).toBe('2026-04-01T15:00:00.000Z');
    expect(
      resolveTaskEndDate(
        '2026-04-02T16:00:00.000Z',
        2 / 24,
        hourCalendar,
        options,
      ),
    ).toBe('2026-04-06T10:00:00.000Z');
    expect(
      resolveTaskStartDateFromEnd(
        '2026-04-02T10:00:00.000Z',
        2 / 24,
        {
          ...calendar,
          workingHours: { start: '09:00', end: '17:00' },
        },
        options,
      ),
    ).toBe('2026-04-01T16:00:00.000Z');
    expect(
      resolveTaskStartDateFromEnd(
        '2026-04-02T08:00:00.000Z',
        2 / 24,
        {
          ...calendar,
          workingHours: { start: '09:00', end: '17:00' },
        },
        options,
      ),
    ).toBe('2026-04-01T15:00:00.000Z');
    expect(
      countWorkingDuration(
        '2026-04-01T15:00:00.000Z',
        '2026-04-02T11:00:00.000Z',
        hourCalendar,
      ),
    ).toBe(4 / 24);
    expect(
      countWorkingDuration(
        '2026-04-06T18:00:00.000Z',
        '2026-04-24T00:00:00.000Z',
        calendar,
      ),
    ).toBe(15);
  });

  it('treats ISO weekday 7 as Sunday', () => {
    const sundayCalendar: WorkingCalendar = {
      workingDays: [7],
      holidays: [],
    };

    expect(moveToNextWorkingDate('2026-04-05', sundayCalendar)).toBe(
      '2026-04-05',
    );
    expect(moveToNextWorkingDate('2026-04-04', sundayCalendar)).toBe(
      '2026-04-05',
    );
  });
});
