import { expect, it } from 'vitest';
import {
  defaultPdfViewerText,
  formatPdfText,
  resolvePdfViewerText,
} from './translations';

it('retains English fallbacks for incomplete translation dictionaries without losing intentional empty strings', () => {
  const text = resolvePdfViewerText({
    open: 'Ouvrir',
    search: undefined,
    emptyHint: '',
  });
  expect(text.open).toBe('Ouvrir');
  expect(text.search).toBe('Find in document');
  expect(text.emptyHint).toBe('');
  expect(Object.values(text).every((value) => typeof value === 'string')).toBe(
    true,
  );
  expect(resolvePdfViewerText()).toEqual(defaultPdfViewerText);
});

it('supports reordered translated count templates and preserves unknown tokens', () => {
  expect(
    formatPdfText('{total} résultats — résultat {match}', {
      match: 2,
      total: 5,
    }),
  ).toBe('5 résultats — résultat 2');
  expect(formatPdfText('{percent} % {suffix}', { percent: 150 })).toBe(
    '150 % {suffix}',
  );
});
