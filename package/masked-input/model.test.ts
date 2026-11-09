import { describe, expect, it } from 'vitest';
import { formatMaskedValue, parseMaskedInput } from './model';

describe('masked string identifiers', () => {
  it.each(['001234', '00-1234'])(
    'accepts complete raw or formatted input %s without losing zeros',
    (value) => {
      expect(parseMaskedInput(value, { mask: '00-0000' })).toEqual({
        valid: true,
        value: '001234',
        raw: '001234',
        formatted: '00-1234',
      });
      expect(
        parseMaskedInput(value, { mask: '00-0000', store: 'formatted' }).value,
      ).toBe('00-1234');
    },
  );
  it('supports ASCII letter/alphanumeric slots and escaped token literals', () => {
    const options = { mask: '\\A-AA/00-**' };
    expect(parseMaskedInput('Ab12z9', options)).toMatchObject({
      valid: true,
      raw: 'Ab12z9',
      formatted: 'A-Ab/12-z9',
    });
    expect(parseMaskedInput('A-Ab/12-z9', options)).toMatchObject({
      valid: true,
      value: 'Ab12z9',
    });
    expect(formatMaskedValue('012', { mask: '\\0-000' })).toBe('0-012');
    expect(formatMaskedValue('12', { mask: '\\\\00' })).toBe('\\12');
  });
  it.each([
    '0012345',
    '00/1234',
    '00-12x4',
    '00-12 34',
    ' 001234',
    '001234 ',
    '٠٠١٢٣٤',
    '00-12-34',
  ])('rejects invalid characters rather than dropping them: %s', (value) => {
    expect(parseMaskedInput(value, { mask: '00-0000' }).valid).toBe(false);
  });
  it.each(['0', '0012', '00-', '00-123'])(
    'requires completion before committing %s',
    (value) => {
      expect(parseMaskedInput(value, { mask: '00-0000' })).toMatchObject({
        valid: false,
        error: 'incomplete',
      });
    },
  );
  it('allows optional blank values and enforces required values', () => {
    for (const value of [null, undefined, '']) {
      expect(parseMaskedInput(value, { mask: '000' })).toMatchObject({
        valid: true,
        value: null,
      });
      expect(
        parseMaskedInput(value, { mask: '000', required: true }),
      ).toMatchObject({ valid: false, error: 'required' });
    }
    expect(parseMaskedInput('   ', { mask: '000' }).valid).toBe(false);
  });
  it('rejects invalid configuration even when the value is blank', () => {
    for (const mask of ['', '---', '00\\']) {
      expect(parseMaskedInput('', { mask })).toMatchObject({
        valid: false,
        error: 'configuration',
      });
    }
  });
  it('preserves arbitrary-length strings while refusing numeric coercion', () => {
    const value = '009007199254740993';
    expect(parseMaskedInput(value, { mask: '000000000000000000' }).value).toBe(
      value,
    );
    expect(parseMaskedInput(123, { mask: '000' })).toMatchObject({
      valid: false,
      error: 'invalid',
    });
    expect(formatMaskedValue('01x', { mask: '000' })).toBe('01x');
    expect(formatMaskedValue(null, { mask: '000' })).toBe('');
  });
});
