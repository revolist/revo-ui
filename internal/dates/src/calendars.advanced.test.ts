import { describe, expect, it } from 'vitest';
import {
  DEFAULT_CALENDAR,
  CALENDAR_WORKING_DATE_SEARCH_LIMIT,
  cloneCalendars,
  createCalendarMap,
  createResolvedCalendarMap,
  getCalendarDateSchedule,
  matchesCalendarException,
  validateCalendars,
  isWorkingCalendarDate,
  isCalendarWorkingHour,
  isCalendarWorkingMinute,
  isCalendarWorkingMinuteEnd,
  resolveCalendarFromMap,
  resolveCalendarFromList,
  type CalendarEntity,
  type CalendarException,
} from './calendars';
import { addDays } from './date-math';
import {
  addWorkingDays,
  moveToNextWorkingDate,
  subtractWorkingDays,
  countWorkingDaysInclusive,
  countWorkingDuration,
  moveToNextWorkingDateTime,
  resolveTaskEndDate,
  resolveTaskStartDateFromEnd,
} from './working-days';

const office = (extra: Partial<CalendarEntity> = {}): CalendarEntity => ({
  ...DEFAULT_CALENDAR,
  id: 'base',
  ...extra,
});
const closed = (
  id: string,
  startDate: CalendarException['startDate'],
  extra: Partial<CalendarException> = {},
): CalendarException => ({ id, startDate, workingHours: [], ...extra });
const hours = [
  { start: '10:00', end: '12:00' },
  { start: '13:00', end: '16:00' },
];

describe('advanced working calendars', () => {
  it('inherits base working weeks dynamically and supports explicit local weeks', () => {
    const child = office({
      id: 'child',
      baseCalendarId: 'base',
      workingDays: [7],
      hoursPerDay: 2,
    });
    const map = createCalendarMap([
      office({ workingDays: [1, 2], hoursPerDay: 6 }),
      child,
    ]);
    expect(map.get('child')).toMatchObject({
      workingDays: [1, 2],
      hoursPerDay: 6,
    });
    expect(
      createCalendarMap([office({ workingDays: [3] }), child]).get('child')
        ?.workingDays,
    ).toEqual([3]);
    expect(
      createCalendarMap([
        office({ weekdayWorkingHours: { 1: hours } }),
        { ...child, inheritWorkingWeek: false },
      ]).get('child'),
    ).toMatchObject({ workingDays: [7], hoursPerDay: 2 });
    expect(child.workingDays).toEqual([7]);
  });
  it('applies weekday overrides including empty closure and weekend opening', () => {
    const calendar = office({
      weekdayWorkingHours: { 1: hours, 2: [], 6: hours },
    });
    expect(getCalendarDateSchedule('2026-04-06', calendar)).toMatchObject({
      isWorking: true,
      workingHours: [
        { startMinutes: 600, endMinutes: 720 },
        { startMinutes: 780, endMinutes: 960 },
      ],
    });
    expect(isWorkingCalendarDate('2026-04-07', 2, calendar)).toBe(false);
    expect(isWorkingCalendarDate('2026-04-11', 6, calendar)).toBe(true);
    expect(isCalendarWorkingMinute('2026-04-06T12:30:00Z', calendar)).toBe(
      false,
    );
    expect(isCalendarWorkingHour('2026-04-06T09:30:00Z', calendar)).toBe(true);
    expect(isCalendarWorkingMinuteEnd('2026-04-06T16:00:00Z', calendar)).toBe(
      true,
    );
  });
  it('preserves inheritance through raw map, resolved map and list lookup', () => {
    const base = office({ weekdayWorkingHours: { 1: hours, 2: [] } });
    const child = office({
      id: 'child',
      baseCalendarId: 'base',
      weekdayWorkingHours: { 1: [] },
    });
    const raw = new Map([
      ['base', base],
      ['child', child],
    ]);
    const effective = resolveCalendarFromMap('child', raw, base)!;
    expect(getCalendarDateSchedule('2026-04-06', effective).isWorking).toBe(
      false,
    );
    expect(
      getCalendarDateSchedule(
        '2026-04-07',
        resolveCalendarFromList({ calendars: [base, child] }, 'child')!,
      ).isWorking,
    ).toBe(false);
    expect(
      getCalendarDateSchedule(
        '2026-04-07',
        createResolvedCalendarMap([base, child]).get('child')!,
      ).isWorking,
    ).toBe(false);
  });
  it('gives child exceptions priority over parent exceptions and holidays', () => {
    const base = office({
      holidays: ['2026-04-07'],
      exceptions: [
        closed('base-closed', '2026-04-06', { endDate: '2026-04-09' }),
      ],
    });
    const child = office({
      id: 'child',
      baseCalendarId: 'base',
      exceptions: [
        { id: 'open', startDate: '2026-04-07', workingHours: hours },
      ],
    });
    const effective = createCalendarMap([base, child]).get('child')!;
    expect(getCalendarDateSchedule('2026-04-06', effective).isWorking).toBe(
      false,
    );
    expect(getCalendarDateSchedule('2026-04-07', effective)).toMatchObject({
      isWorking: true,
      exception: { id: 'open' },
      exceptionCalendarId: 'child',
    });
    expect(getCalendarDateSchedule('2026-04-08', effective)).toMatchObject({
      isWorking: false,
      exceptionCalendarId: 'base',
    });
  });
  it.each([
    ['daily', '2024-03-02', '2024-03-01'],
    ['weekly', '2024-03-14', '2024-03-07'],
    ['monthly', '2024-04-29', '2024-03-29'],
    ['yearly', '2028-02-29', '2027-02-28'],
  ] as const)(
    'matches bounded %s recurrence without extending until',
    (frequency, included, excluded) => {
      const exception = closed('repeat', '2024-02-29', {
        recurrence: { frequency, interval: 2, until: '2028-02-29' },
      });
      expect(matchesCalendarException('2024-02-28', exception)).toBe(false);
      expect(matchesCalendarException('2024-02-29', exception)).toBe(true);
      expect(matchesCalendarException(included, exception)).toBe(true);
      expect(matchesCalendarException(excluded, exception)).toBe(false);
      expect(matchesCalendarException('2029-02-28', exception)).toBe(false);
    },
  );
  it('skips nonexistent monthly and yearly dates instead of clamping or drifting', () => {
    const month = closed('month', '2026-01-31', {
      recurrence: { frequency: 'monthly' },
    });
    expect(matchesCalendarException('2026-02-28', month)).toBe(false);
    expect(matchesCalendarException('2026-03-31', month)).toBe(true);
    const leap = closed('leap', '2024-02-29', {
      recurrence: { frequency: 'yearly' },
    });
    expect(matchesCalendarException('2025-02-28', leap)).toBe(false);
    expect(matchesCalendarException('2028-02-29', leap)).toBe(true);
    expect(matchesCalendarException('2100-02-28', leap)).toBe(false);
  });
  it('repeats cross-year exception date ranges using inclusive civil bounds', () => {
    const exception = closed('shutdown', '2025-12-30', {
      endDate: '2026-01-02',
      recurrence: { frequency: 'yearly' },
    });
    expect(matchesCalendarException('2027-01-02', exception)).toBe(true);
    expect(matchesCalendarException('2027-01-03', exception)).toBe(false);
    expect(matchesCalendarException('2026-12-30', exception)).toBe(true);
  });
  it('applies later matching exceptions in one calendar', () => {
    const calendar = office({
      exceptions: [
        closed('closed', '2026-04-06'),
        { id: 'open', startDate: '2026-04-06', workingHours: hours },
      ],
    });
    expect(getCalendarDateSchedule('2026-04-06', calendar).isWorking).toBe(
      true,
    );
  });
  it('rejects ambiguous numeric and string calendar identities before normalized lookup can collide', () => {
    expect(
      validateCalendars([office({ id: 1 }), office({ id: '1' })]),
    ).toContainEqual(
      expect.objectContaining({
        calendarId: '1',
        code: 'duplicate-calendar-id',
      }),
    );
  });
  it('validates missing bases, cycles, recurrence bounds, impossible dates and overlapping windows', () => {
    expect(
      validateCalendars([office({ baseCalendarId: 'missing' })]).some(
        (issue) => issue.code === 'missing-base-calendar',
      ),
    ).toBe(true);
    expect(
      validateCalendars([
        office({ baseCalendarId: 'child' }),
        office({ id: 'child', baseCalendarId: 'base' }),
      ]).some((issue) => issue.code === 'calendar-inheritance-cycle'),
    ).toBe(true);
    expect(() =>
      createCalendarMap([office({ baseCalendarId: 'missing' })]),
    ).toThrow();
    for (const recurrence of [
      { frequency: 'weekly', interval: Infinity },
      { frequency: 'yearly', interval: 0 },
      { frequency: 'monthly', until: '2020-01-01' },
    ] as any[]) {
      expect(
        validateCalendars([
          office({ exceptions: [closed('x', '2026-01-01', { recurrence })] }),
        ]).length,
      ).toBeGreaterThan(0);
    }
    expect(
      validateCalendars([office({ exceptions: [closed('x', '2026-02-30')] })])
        .length,
    ).toBeGreaterThan(0);
    expect(
      validateCalendars([
        office({
          weekdayWorkingHours: {
            1: [
              { start: '09:00', end: '12:00' },
              { start: '11:00', end: '13:00' },
            ],
          },
        }),
      ]).length,
    ).toBeGreaterThan(0);
    expect(
      validateCalendars([office({ hoursPerDay: NaN })]).length,
    ).toBeGreaterThan(0);
  });
  it('does not double-count overlapping working windows for direct helper callers', () => {
    const calendar = office({
      workingHours: [
        { start: '09:00', end: '12:00' },
        { start: '11:00', end: '13:00' },
      ],
    });
    expect(
      countWorkingDuration(
        '2026-04-06T09:00:00Z',
        '2026-04-06T13:00:00Z',
        calendar,
      ),
    ).toBe(4 / 24);
  });
  it('uses effective dates and windows consistently in forward, backward and duration calculations', () => {
    const calendar = office({
      weekdayWorkingHours: { 1: [{ start: '09:00', end: '11:00' }], 2: [] },
      exceptions: [
        {
          id: 'short',
          startDate: '2026-04-08',
          workingHours: [{ start: '13:00', end: '17:00' }],
        },
      ],
    });
    const options = { excludeHolidaysFromDuration: true };
    expect(addWorkingDays('2026-04-06', 1, calendar)).toBe('2026-04-08');
    expect(subtractWorkingDays('2026-04-08', 1, calendar)).toBe('2026-04-06');
    expect(
      countWorkingDaysInclusive('2026-04-06', '2026-04-08', calendar),
    ).toBe(2);
    expect(moveToNextWorkingDateTime('2026-04-06T11:00:00Z', calendar)).toBe(
      '2026-04-08T13:00:00.000Z',
    );
    expect(
      resolveTaskEndDate('2026-04-06T10:00:00Z', 5 / 8, calendar, options),
    ).toBe('2026-04-08T17:00:00.000Z');
    expect(
      resolveTaskStartDateFromEnd(
        '2026-04-08T17:00:00Z',
        5 / 8,
        calendar,
        options,
      ),
    ).toBe('2026-04-06T10:00:00.000Z');
    expect(
      countWorkingDuration(
        '2026-04-06T10:00:00Z',
        '2026-04-08T17:00:00Z',
        calendar,
      ),
    ).toBe(5 / 24);
  });
  it('deep clones every authored calendar field for draft and undo isolation', () => {
    const original = office({
      weekdayWorkingHours: { 1: hours },
      exceptions: [
        closed('annual', '2026-12-25', {
          recurrence: { frequency: 'yearly', until: '2030-12-25' },
        }),
      ],
    });
    const cloned = cloneCalendars([original])[0];
    expect(cloned).toEqual(original);
    expect(cloned.workingDays).not.toBe(original.workingDays);
    expect(cloned.weekdayWorkingHours?.[1]?.[0]).not.toBe(
      original.weekdayWorkingHours?.[1]?.[0],
    );
    expect(cloned.exceptions?.[0].recurrence).not.toBe(
      original.exceptions?.[0].recurrence,
    );
  });
  it.each([
    null,
    {},
    { id: 'x', name: 'x' },
    { ...DEFAULT_CALENDAR, exceptions: [null] },
    { ...DEFAULT_CALENDAR, weekdayWorkingHours: { 1: null } },
    { ...DEFAULT_CALENDAR, holidays: [null] },
  ])('rejects malformed snapshot input without throwing', (value) => {
    expect(() => validateCalendars([value] as any)).not.toThrow();
    expect(validateCalendars([value] as any).length).toBeGreaterThan(0);
  });
  it('rejects calendars with no effective working weekday while permitting inherited weeks', () => {
    expect(validateCalendars([office({ workingDays: [] })])).toContainEqual(
      expect.objectContaining({ code: 'calendar-without-working-day' }),
    );
    expect(
      validateCalendars([
        office(),
        office({ id: 'child', workingDays: [], baseCalendarId: 'base' }),
      ]),
    ).toEqual([]);
    expect(validateCalendars([office({ workingHours: [] })])).toEqual([]);
  });
  it('preserves uniform empty-hour legacy semantics while explicit weekday emptiness closes a date', () => {
    const calendar = office({ workingHours: [] });
    expect(getCalendarDateSchedule('2026-04-06', calendar).isWorking).toBe(
      true,
    );
    expect(
      resolveTaskEndDate('2026-04-06T08:00:00Z', 0.5, calendar, {
        excludeHolidaysFromDuration: true,
      }),
    ).toBe('2026-04-06T20:00:00.000Z');
    expect(
      getCalendarDateSchedule('2026-04-06', {
        ...calendar,
        weekdayWorkingHours: { 1: [] },
      }).isWorking,
    ).toBe(false);
  });
  it('keeps default hour boundaries for normalized calendars without authored hours', () => {
    const resolved = createResolvedCalendarMap([
      office({ workingHours: undefined }),
    ]).get('base')!;
    expect(isCalendarWorkingMinute('2026-04-06T02:00:00Z', resolved)).toBe(
      false,
    );
    expect(isCalendarWorkingMinute('2026-04-06T09:00:00Z', resolved)).toBe(
      true,
    );
  });
  it('retains flattened inherited rules through calendar copies and rejects input inheritance switches as already resolved', () => {
    const child = office({
      id: 'child',
      baseCalendarId: 'base',
      workingDays: [7],
    });
    const base = office({
      workingDays: [1],
      exceptions: [closed('closed', '2026-04-06')],
    });
    const effective = createCalendarMap([base, child]).get('child')!;
    const copied = { ...effective, hoursPerDay: 4 };
    expect(
      resolveCalendarFromMap(
        'child',
        new Map([
          ['base', base],
          ['child', copied],
        ]),
        base,
      )?.hoursPerDay,
    ).toBe(4);
    expect(getCalendarDateSchedule('2026-04-06', copied).isWorking).toBe(false);
    const switched = {
      ...effective,
      inheritWorkingWeek: false,
      workingDays: [7],
    };
    expect(
      createCalendarMap([base, switched]).get('child')?.workingDays,
    ).toEqual([7]);
  });

  it('honors sub-hour nominal days consistently with validated working hours', () => {
    const calendar = office({
      hoursPerDay: 0.5,
      workingHours: [{ start: '09:00', end: '09:30' }],
    });
    expect(validateCalendars([calendar])).toEqual([]);
    expect(
      resolveTaskEndDate('2026-04-06T09:00:00Z', 1, calendar, {
        excludeHolidaysFromDuration: true,
      }),
    ).toBe('2026-04-06T09:30:00.000Z');
    expect(
      resolveTaskStartDateFromEnd('2026-04-06T09:30:00Z', 1, calendar, {
        excludeHolidaysFromDuration: true,
      }),
    ).toBe('2026-04-06T09:00:00.000Z');
  });
  it('recognizes midnight as the exclusive end of the previous civil working day', () => {
    const calendar = office({
      weekdayWorkingHours: { 1: [{ start: '22:00', end: '24:00' }], 2: [] },
    });
    expect(isCalendarWorkingMinute('2026-04-07T00:00:00Z', calendar)).toBe(
      false,
    );
    expect(isCalendarWorkingMinuteEnd('2026-04-07T00:00:00Z', calendar)).toBe(
      true,
    );
  });

  it.each([
    { frequency: 'daily' as const },
    { frequency: 'weekly' as const, endDate: '2026-04-12' as const },
    {
      frequency: 'daily' as const,
      interval: 3,
      endDate: '2026-04-08' as const,
    },
  ])(
    'rejects an unbounded recurring closure covering every future date (%o)',
    ({ frequency, interval, endDate }) => {
      const calendar = office({
        exceptions: [
          closed('forever', '2026-04-06', {
            endDate,
            recurrence: { frequency, interval },
          }),
        ],
      });
      expect(validateCalendars([calendar])).toContainEqual(
        expect.objectContaining({
          calendarId: 'base',
          code: 'calendar-without-future-working-time',
          exceptionId: 'forever',
        }),
      );
    },
  );
  it('allows a bounded closure and a partial recurring weekly closure', () => {
    expect(
      validateCalendars([
        office({
          exceptions: [
            closed('bounded', '2026-04-06', {
              recurrence: { frequency: 'daily', until: '2026-04-10' },
            }),
          ],
        }),
      ]),
    ).toEqual([]);
    expect(
      validateCalendars([
        office({
          exceptions: [
            closed('mondays', '2026-04-06', {
              recurrence: { frequency: 'weekly' },
            }),
          ],
        }),
      ]),
    ).toEqual([]);
  });
  it('allows a child recurring working exception to rescue an inherited permanent closure', () => {
    const base = office({
      exceptions: [
        closed('forever', '2026-04-06', { recurrence: { frequency: 'daily' } }),
      ],
    });
    const child = office({
      id: 'child',
      baseCalendarId: 'base',
      exceptions: [
        {
          id: 'weekly-work',
          startDate: '2026-04-07',
          workingHours: hours,
          recurrence: { frequency: 'weekly' },
        },
      ],
    });
    // The parent itself remains invalid; the effective child has future work.
    const issues = validateCalendars([base, child]);
    expect(
      issues.some(
        (issue) =>
          issue.calendarId === 'base' &&
          issue.code === 'calendar-without-future-working-time',
      ),
    ).toBe(true);
    expect(issues.some((issue) => issue.calendarId === 'child')).toBe(false);
    const effective = createCalendarMap([base, child]).get('child')!;
    expect(getCalendarDateSchedule('2026-04-14', effective).isWorking).toBe(
      true,
    );
  });
  it('does not mistake a finite opening before a permanent closed tail for an indefinite rescue', () => {
    const calendar = office({
      exceptions: [
        closed('forever', '2026-04-06', { recurrence: { frequency: 'daily' } }),
        { id: 'one-day', startDate: '2026-04-07', workingHours: hours },
      ],
    });
    expect(validateCalendars([calendar])).toContainEqual(
      expect.objectContaining({ code: 'calendar-without-future-working-time' }),
    );
  });
  it('preserves exception priority when a later permanent closure overrides recurring work', () => {
    const calendar = office({
      exceptions: [
        {
          id: 'weekly-work',
          startDate: '2026-04-07',
          workingHours: hours,
          recurrence: { frequency: 'weekly' },
        },
        closed('forever', '2026-04-06', { recurrence: { frequency: 'daily' } }),
      ],
    });
    expect(validateCalendars([calendar])).toContainEqual(
      expect.objectContaining({ code: 'calendar-without-future-working-time' }),
    );
  });

  it('keeps current UTC/civil scheduling semantics across DST changes', () => {
    const calendar = office({
      timeZone: 'Europe/Lisbon',
      exceptions: [
        closed('spring', '2026-03-29', { recurrence: { frequency: 'yearly' } }),
      ],
    });
    expect(isCalendarWorkingMinute('2026-03-30T09:00:00Z', calendar)).toBe(
      true,
    );
    expect(isCalendarWorkingMinute('2026-10-26T09:00:00Z', calendar)).toBe(
      true,
    );
    expect(getCalendarDateSchedule('2026-03-29', calendar).isWorking).toBe(
      false,
    );
  });
});

it('rejects bounded nonworking recurrences exceeding the traversal horizon', () => {
  const calendar = office({
    exceptions: [
      closed('shutdown', '2026-01-01', {
        recurrence: { frequency: 'daily', until: '2040-01-01' },
      }),
    ],
  });
  expect(validateCalendars([calendar])).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        code: 'calendar-closure-exceeds-search-horizon',
        exceptionId: 'shutdown',
      }),
    ]),
  );
});

it('keeps the accepted bounded closure inside date and datetime traversal limits', () => {
  const until = addDays('2026-01-01', CALENDAR_WORKING_DATE_SEARCH_LIMIT - 8);
  const calendar = office({
    exceptions: [
      closed('shutdown', '2026-01-01', {
        recurrence: { frequency: 'daily', until },
      }),
    ],
  });
  expect(validateCalendars([calendar])).toEqual([]);
  const date = moveToNextWorkingDate('2026-01-01', calendar);
  const timestamp = moveToNextWorkingDateTime('2026-01-01T10:00:00Z', calendar);
  expect(date > until).toBe(true);
  expect(timestamp.slice(0, 10) > until).toBe(true);
  expect(getCalendarDateSchedule(date, calendar).isWorking).toBe(true);
  expect(getCalendarDateSchedule(timestamp, calendar).isWorking).toBe(true);
  const beyond = {
    ...calendar,
    exceptions: [
      closed('shutdown', '2026-01-01', {
        recurrence: { frequency: 'daily' as const, until: addDays(until, 1) },
      }),
    ],
  };
  expect(validateCalendars([beyond])).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        code: 'calendar-closure-exceeds-search-horizon',
      }),
    ]),
  );
});

it('applies the same traversal bound to nonrecurring closures', () => {
  expect(
    validateCalendars([
      office({
        exceptions: [
          closed('shutdown', '2026-01-01', { endDate: '2040-01-01' }),
        ],
      }),
    ]),
  ).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        code: 'calendar-closure-exceeds-search-horizon',
      }),
    ]),
  );
});
