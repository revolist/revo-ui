import { expect, it } from 'vitest';
import { formatTemporalRange, formatTemporalValue } from './temporal-value';
it('compacts civil ranges without shifting zones and retains different years', () => {
  expect(
    formatTemporalRange('2026-10-12', '2026-10-17', { locale: 'en-US' }),
  ).toMatch(/Oct.*12.*17/);
  const crossYear = formatTemporalRange('2026-12-31', '2027-01-02', {
    locale: 'en-US',
  });
  expect(crossYear).toContain('2026');
  expect(crossYear).toContain('2027');
  expect(formatTemporalValue('2026-10-12', {}, true)).toBe('Oct 12, 2026');
});
it('honors explicit date entry formats, custom labels, locale and safe invalid values', () => {
  expect(
    formatTemporalValue('2026-10-12', { dateInput: { format: 'eu' } }),
  ).toBe('12/10/2026');
  expect(
    formatTemporalValue('2026-10-12', { dateInput: { format: 'iso' } }),
  ).toBe('2026-10-12');
  expect(
    formatTemporalValue('2026-10-12', { formatValue: () => 'Custom' }),
  ).toBe('Custom');
  expect(formatTemporalValue('2026-10-12', { locale: 'fr-FR' })).toContain(
    'oct.',
  );
  expect(formatTemporalValue('2026-02-30')).toBe('2026-02-30');
  expect(formatTemporalRange('bad', '2026-10-12')).toContain('bad');
});
it('formats date-free times and civil datetimes with configured precision', () => {
  expect(
    formatTemporalValue('09:30:15', {
      kind: 'time',
      timeFormat: '24h',
      precision: 'second',
    }),
  ).toBe('09:30:15');
  expect(
    formatTemporalValue('2026-10-12T09:30', {
      kind: 'datetime',
      timeFormat: '12h',
    }),
  ).toMatch(/Oct 12, 09:30 AM/);
});

it('honors display calendar systems and custom date input formatting', () => {
  expect(
    formatTemporalValue(
      '2026-10-12',
      { calendarSystem: 'persian', locale: 'en-US' },
      true,
    ),
  ).toContain('1405');
  expect(
    formatTemporalValue('2026-10-12', {
      dateInput: { formatValue: (date) => date.split('-').reverse().join('.') },
    }),
  ).toBe('12.10.2026');
});
