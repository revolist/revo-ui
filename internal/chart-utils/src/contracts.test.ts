import { expect, it } from 'vitest';
import { normalizeColorValue } from './colors';
import { encodeDelimitedCell } from './csv';
import { evaluateConditionalRule } from './conditional-rule';
it('preserves overflow-safe color domains, CSV escaping, and conditional numeric comparisons', () => {
  expect(normalizeColorValue(0, -Number.MAX_VALUE, Number.MAX_VALUE)).toBe(0.5);
  expect(
    encodeDelimitedCell('a,"b"', {
      columnDelimiter: ',',
      rowDelimiter: '\r\n',
    }),
  ).toBe('"a,""b"""');
  expect(
    evaluateConditionalRule('5', { operator: 'between', value: [4, 6] }),
  ).toBe(true);
});
