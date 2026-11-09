import { describe, expect, it } from 'vitest';
import {
  formatCalendarDateDisplay,
  formatCompactDateRangeDisplay,
  formatDateTimeDisplay,
  type DateDisplayFormat,
} from '.';

const value = '2026-10-14T13:05:00Z';

it.each<[DateDisplayFormat, string]>([
  ['eu', '14/10/2026 13:05'],
  ['us', '10/14/2026 01:05 PM'],
  ['iso', '2026-10-14 13:05'],
])(
  'formats the %s preset independently of the host locale',
  (dateFormat, expected) => {
    expect(
      formatDateTimeDisplay(value, {
        dateFormat,
        timeZone: 'UTC',
        mode: 'dateTime',
      }),
    ).toBe(expected);
  },
);

it('supports localized month names and other locale conventions', () => {
  expect(
    formatDateTimeDisplay(value, {
      dateFormat: 'long',
      locale: 'de-DE',
      timeZone: 'UTC',
      mode: 'date',
    }),
  ).toBe('14. Oktober 2026');
  expect(
    formatDateTimeDisplay(value, {
      locale: 'ja-JP',
      timeZone: 'UTC',
      mode: 'date',
    }),
  ).toBe(
    new Intl.DateTimeFormat('ja-JP', {
      timeZone: 'UTC',
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    }).format(new Date(value)),
  );
});

it('lets explicit 12/24-hour choice override a regional default, including midnight', () => {
  expect(
    formatDateTimeDisplay(value, {
      dateFormat: 'us',
      timeFormat: '24h',
      timeZone: 'UTC',
      mode: 'time',
    }),
  ).toBe('13:05');
  expect(
    formatDateTimeDisplay(value, {
      dateFormat: 'eu',
      timeFormat: '12h',
      locale: 'en-US',
      timeZone: 'UTC',
      mode: 'time',
    }),
  ).toBe('01:05 PM');
  expect(
    formatDateTimeDisplay('2026-10-14T00:00:00Z', {
      timeFormat: '24h',
      locale: 'en-US',
      timeZone: 'UTC',
      mode: 'time',
    }),
  ).toBe('00:00');
  expect(
    formatDateTimeDisplay('2026-10-14T00:00:00Z', {
      timeFormat: '12h',
      locale: 'en-US',
      timeZone: 'UTC',
      mode: 'time',
    }),
  ).toBe('12:00 AM');
});

it('projects timestamps into the selected timezone across date and DST boundaries', () => {
  expect(
    formatDateTimeDisplay('2026-10-14T00:30:00Z', {
      dateFormat: 'iso',
      timeZone: 'America/Los_Angeles',
      mode: 'dateTime',
    }),
  ).toBe('2026-10-13 17:30');
  expect(
    formatDateTimeDisplay('2026-03-08T06:30:00Z', {
      dateFormat: 'iso',
      timeZone: 'America/New_York',
      mode: 'time',
    }),
  ).toBe('01:30');
  expect(
    formatDateTimeDisplay('2026-03-08T07:30:00Z', {
      dateFormat: 'iso',
      timeZone: 'America/New_York',
      mode: 'time',
    }),
  ).toBe('03:30');
});

it('keeps default browser formatting and safely rejects invalid values', () => {
  expect(formatDateTimeDisplay(value, { mode: 'time' })).toBe(
    new Date(value).toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    }),
  );
  expect(formatDateTimeDisplay('not a date', { mode: 'date' })).toBeUndefined();
});

describe('calendar-safe date display', () => {
  it.each([
    'UTC',
    'Europe/Lisbon',
    'Europe/Warsaw',
    'America/New_York',
    'Pacific/Honolulu',
  ])('preserves authored dates in %s', (zone) => {
    expect(formatCalendarDateDisplay('2026-08-12', 'en-US', zone)).toBe(
      'Aug 12, 2026',
    );
    expect(formatCalendarDateDisplay('2024-02-29', 'en-US', zone)).toBe(
      'Feb 29, 2024',
    );
    expect(
      formatCalendarDateDisplay('2026-02-30', 'en-US', zone),
    ).toBeUndefined();
  });
  it('projects instants into the supplied zone', () => {
    expect(
      formatCalendarDateDisplay(
        '2026-08-12T01:30Z',
        'en-US',
        'America/New_York',
      ),
    ).toBe('Aug 11, 2026');
  });
});

it('compacts date ranges without weekdays and retains cross-year context', () => {
  const start = new Date(2024, 0, 1);
  expect(formatCompactDateRangeDisplay(start, new Date(2024, 0, 30))).toMatch(
    /Jan 1.*30/,
  );
  expect(formatCompactDateRangeDisplay(start, new Date(2025, 1, 28))).toMatch(
    /2024.*2025/,
  );
  expect(formatCompactDateRangeDisplay(new Date(NaN), start)).toBe('');
  expect(
    formatCompactDateRangeDisplay(start, new Date(2024, 1, 2), 'de-DE'),
  ).toContain('Jan');
});
