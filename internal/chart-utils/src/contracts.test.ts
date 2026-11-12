import { expect, it } from 'vitest';
import { normalizeColorValue } from './colors';
import { encodeDelimitedCell } from './csv';
it('preserves overflow-safe color domains and CSV escaping', () => {
  expect(normalizeColorValue(0, -Number.MAX_VALUE, Number.MAX_VALUE)).toBe(0.5);
  expect(
    encodeDelimitedCell('a,"b"', {
      columnDelimiter: ',',
      rowDelimiter: '\r\n',
    }),
  ).toBe('"a,""b"""');
});
