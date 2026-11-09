import { expect, it, vi } from 'vitest';
import { encodeDelimitedCell } from './csv';
it('calls the pre-escape observer after a single conversion and before retaining escaped output', () => {
  const toJSON = vi.fn(() => 'a"b'),
    before = vi.fn();
  expect(
    encodeDelimitedCell(
      { toJSON },
      { columnDelimiter: ',', rowDelimiter: '\n' },
      false,
      before,
    ),
  ).toBe('"""a\\""b"""');
  expect(toJSON).toHaveBeenCalledTimes(1);
  expect(before).toHaveBeenCalledTimes(1);
  expect(before).toHaveBeenCalledWith('"a\\"b"', true);
});
it('preserves absent values and allows the observer to reject encoding', () => {
  const before = vi.fn();
  expect(
    encodeDelimitedCell(
      undefined,
      { columnDelimiter: ',', rowDelimiter: '\n' },
      false,
      before,
    ),
  ).toBe('');
  expect(before).not.toHaveBeenCalled();
  expect(() =>
    encodeDelimitedCell(
      'x"',
      { columnDelimiter: ',', rowDelimiter: '\n' },
      false,
      () => {
        throw new Error('stop');
      },
    ),
  ).toThrow('stop');
});
