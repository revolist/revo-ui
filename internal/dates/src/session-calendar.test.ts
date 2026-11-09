import { expect, it } from 'vitest';
import { createSessionCalendar } from './session-calendar';
it('resolves explicit New York civil sessions on either side of DST and early closes', () => {
  const calendar = createSessionCalendar({
    timeZone: 'America/New_York',
    sessions: [
      { date: '2024-03-08', open: '09:30', close: '16:00' },
      { date: '2024-03-11', open: '09:30', close: '13:00' },
    ],
  });
  expect(calendar.sessions).toEqual([
    {
      open: Date.parse('2024-03-08T14:30Z'),
      close: Date.parse('2024-03-08T21:00Z'),
    },
    {
      open: Date.parse('2024-03-11T13:30Z'),
      close: Date.parse('2024-03-11T17:00Z'),
    },
  ]);
});
it('handles overnight sessions only through an explicit end date', () => {
  const value = createSessionCalendar({
    timeZone: 'UTC',
    sessions: [
      {
        date: '2024-02-29',
        open: '22:00',
        close: '02:00',
        endDate: '2024-03-01',
      },
    ],
  });
  expect(value.sessions[0].close - value.sessions[0].open).toBe(4 * 3600000);
});
it('rejects spring gaps, skipped days and ambiguous folds unless explicitly resolved', () => {
  for (const [timeZone, date, open, close] of [
    ['America/New_York', '2024-03-10', '02:30', '04:00'],
    ['America/New_York', '2024-11-03', '01:30', '03:00'],
    ['Pacific/Apia', '2011-12-30', '09:30', '16:00'],
  ])
    expect(() =>
      createSessionCalendar({ timeZone, sessions: [{ date, open, close }] }),
    ).toThrow();
  const session = { date: '2024-11-03', open: '01:30', close: '03:00' };
  const earlier = createSessionCalendar({
    timeZone: 'America/New_York',
    disambiguation: 'earlier',
    sessions: [session],
  });
  const later = createSessionCalendar({
    timeZone: 'America/New_York',
    disambiguation: 'later',
    sessions: [session],
  });
  expect(later.sessions[0].open - earlier.sessions[0].open).toBe(3600000);
});
it.each(['bad-zone', ''])('rejects invalid zone %s', (timeZone) => {
  expect(() =>
    createSessionCalendar({
      timeZone,
      sessions: [{ date: '2024-01-01', open: '09:30', close: '16:00' }],
    }),
  ).toThrow();
});
it.each(['24:00', '09:60', '9:30'])('rejects invalid clock %s', (open) => {
  expect(() =>
    createSessionCalendar({
      timeZone: 'UTC',
      sessions: [{ date: '2024-01-01', open, close: '16:00' }],
    }),
  ).toThrow();
});
it('preserves years below 100, rejects impossible dates and unordered overlaps', () => {
  expect(
    new Date(
      createSessionCalendar({
        timeZone: 'UTC',
        sessions: [{ date: '0099-02-28', open: '09:00', close: '10:00' }],
      }).sessions[0].open,
    ).getUTCFullYear(),
  ).toBe(99);
  expect(() =>
    createSessionCalendar({
      timeZone: 'UTC',
      sessions: [{ date: '2023-02-29', open: '09:00', close: '10:00' }],
    }),
  ).toThrow();
  expect(() =>
    createSessionCalendar({
      timeZone: 'UTC',
      sessions: [
        { date: '2024-01-01', open: '09:00', close: '11:00' },
        { date: '2024-01-01', open: '10:00', close: '12:00' },
      ],
    }),
  ).toThrow();
});

it.each([
  ['2024-03-10', '2024-03-11', 23],
  ['2024-11-03', '2024-11-04', 25],
] as const)(
  'keeps actual %s overnight open-session duration',
  (date, endDate, hours) => {
    const calendar = createSessionCalendar({
      timeZone: 'America/New_York',
      sessions: [{ date, open: '00:00', endDate, close: '00:00' }],
    });
    expect(calendar.sessions[0].close - calendar.sessions[0].open).toBe(
      hours * 3600000,
    );
  },
);
