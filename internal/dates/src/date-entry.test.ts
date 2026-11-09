import { expect, it } from 'vitest';
import {
  parseDateEntry,
  formatDateEntry,
  dateEntryPlaceholder,
} from './date-entry';
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
