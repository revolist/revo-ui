import { expect, it } from 'vitest';
import {
  parseDateEntry,
  formatDateEntry,
  dateEntryPlaceholder,
} from './date-entry';

it.each([
  'en-IN',
  'hi-IN-u-nu-deva',
  'ar-LB',
  'fr-LB',
  'hu-HU',
  'ko-KR',
  'zh-SG',
  'ky',
])('round-trips formatted leap dates and four-digit years in %s', (locale) => {
  const options = { locale, format: 'locale' } as const;
  for (const date of [
    '2024-02-29',
    '0000-02-29',
    '0001-02-28',
    '0099-12-31',
    '0100-01-01',
    '0999-06-01',
  ]) {
    expect(parseDateEntry(formatDateEntry(date, options), options)).toBe(date);
  }
});
it('keeps canonical ISO input distinct from Kyrgyz day-first input', () => {
  const options = { locale: 'ky', format: 'locale' } as const;
  expect(parseDateEntry('2024-06-01', options)).toBe('2024-06-01');
  expect(parseDateEntry(formatDateEntry('2024-01-06', options), options)).toBe(
    '2024-01-06',
  );
});
it('strictly validates civil dates and explicit formats without rolling invalid dates', () => {
  expect(parseDateEntry('2024-02-29')).toBe('2024-02-29');
  for (const text of [
    '2026-02-29',
    '2026-02-30',
    '2026-13-01',
    '12/10/26',
    'garbage',
  ])
    expect(parseDateEntry(text)).toBeUndefined();
  expect(parseDateEntry('12/10/2026', { format: 'eu' })).toBe('2026-10-12');
  expect(parseDateEntry('12/10/2026', { format: 'us' })).toBe('2026-12-10');
  expect(parseDateEntry('31/02/2026', { format: 'eu' })).toBeUndefined();
  expect(parseDateEntry('2026-10-12', { format: 'eu' })).toBe('2026-10-12');
});
it('round trips locale numeric dates and localized digits as civil ISO values', () => {
  for (const locale of ['en-US', 'en-GB', 'de-DE', 'ja-JP', 'ar-EG', 'fa-IR']) {
    const options = { format: 'locale' as const, locale };
    expect(
      parseDateEntry(formatDateEntry('2026-10-12', options), options),
    ).toBe('2026-10-12');
    expect(dateEntryPlaceholder(options)).toContain('YYYY');
  }
});
it('supports custom hooks while still rejecting impossible results', () => {
  expect(parseDateEntry('launch', { parse: () => '2026-10-12' })).toBe(
    '2026-10-12',
  );
  expect(parseDateEntry('bad', { parse: () => '2026-02-30' })).toBeUndefined();
  expect(formatDateEntry('2026-10-12', { formatValue: () => 'Launch' })).toBe(
    'Launch',
  );
});
