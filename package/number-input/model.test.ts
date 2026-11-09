import { describe, expect, it } from 'vitest';
import {
  formatNumberDraft,
  formatNumberValue,
  parseNumberInput,
  stepNumberInput,
} from './model';

describe('locale numeric input', () => {
  it.each([
    ['1,234.50', 'en-US', 1234.5],
    ['1.234,50', 'de-DE', 1234.5],
    ['1\u202f234,50', 'fr-FR', 1234.5],
    ['12,34,567.89', 'en-IN', 1234567.89],
    ['١٬٢٣٤٫٥٠', 'ar-EG', 1234.5],
    ['۱۲۳۴٫۵۰', 'fa-IR', 1234.5],
    [
      new Intl.NumberFormat('de-CH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(1234.5),
      'de-CH',
      1234.5,
    ],
    ['-0.25', 'en-US', -0.25],
  ])('parses the complete %s input in %s', (text, locale, value) => {
    expect(parseNumberInput(text, { locale })).toEqual({ value });
  });
  it.each([
    '12abc',
    '1,23.45',
    '1,234,56',
    '1.234,50',
    'Infinity',
    'NaN',
    '0x20',
    '1e3',
    '1..2',
    '--2',
    '2-',
    '.',
    '1.',
    '9007199254740993',
  ])('rejects %s without coercing a prefix', (text) => {
    expect(parseNumberInput(text, { locale: 'en-US' })).toHaveProperty('error');
  });
  it('rejects noncanonical Indian grouping and preserves configured ungrouped entry', () => {
    expect(
      parseNumberInput('1,234,567.89', { locale: 'en-IN' }),
    ).toHaveProperty('error');
    expect(
      parseNumberInput('1234567.89', { locale: 'en-IN', useGrouping: false }),
    ).toEqual({ value: 1234567.89 });
  });
  it('accepts only the configured currency and accounting negative syntax', () => {
    const options = {
      kind: 'currency' as const,
      currency: 'USD',
      locale: 'en-US',
    };
    expect(parseNumberInput('($1,234.50)', options)).toEqual({
      value: -1234.5,
    });
    expect(parseNumberInput('-USD 1,234.50', options)).toEqual({
      value: -1234.5,
    });
    expect(parseNumberInput('1,234.50 USD', options)).toEqual({
      value: 1234.5,
    });
    expect(parseNumberInput('€1,234.50', options)).toHaveProperty('error');
    expect(parseNumberInput('(-$1)', options)).toHaveProperty('error');
    expect(parseNumberInput('$$1', options)).toHaveProperty('error');
    expect(parseNumberInput('(1)', { locale: 'en-US' })).toHaveProperty(
      'error',
    );
  });
  it('roundtrips rendered currency and percent forms including localized digits and bidi marks', () => {
    for (const locale of [
      'en-US',
      'de-DE',
      'fr-FR',
      'ar-EG',
      'fa-IR',
      'en-IN',
    ]) {
      for (const kind of ['number', 'currency', 'percent'] as const) {
        const options = { locale, kind, currency: 'USD' };
        const value = kind === 'percent' ? -0.1234 : -1234.5;
        expect(
          parseNumberInput(formatNumberValue(value, options), options),
        ).toEqual({ value });
      }
    }
  });
  it('uses displayed percentage units for both bare and explicit-percent input', () => {
    const options = {
      kind: 'percent' as const,
      locale: 'en-US',
      min: 0,
      max: 1,
    };
    expect(parseNumberInput('12.5', options)).toEqual({ value: 0.125 });
    expect(parseNumberInput('12.5%', options)).toEqual({ value: 0.125 });
    expect(parseNumberInput('0.29%', options)).toEqual({ value: 0.0029 });
    expect(parseNumberInput('101%', options)).toHaveProperty('error');
    expect(parseNumberInput('12.5%', { locale: 'en-US' })).toHaveProperty(
      'error',
    );
  });
  it('enforces precision and bounds without rounding typed data', () => {
    expect(parseNumberInput('1.235', { precision: 2 })).toHaveProperty('error');
    expect(parseNumberInput('1.230', { precision: 2 })).toHaveProperty('error');
    expect(parseNumberInput('1.2', { precision: 0 })).toHaveProperty('error');
    expect(parseNumberInput('0', { min: 0, max: 1 })).toEqual({ value: 0 });
    expect(parseNumberInput('-0.01', { min: 0 })).toHaveProperty('error');
    expect(parseNumberInput('1.01', { max: 1 })).toHaveProperty('error');
    expect(parseNumberInput(' ', {})).toEqual({ value: null });
    expect(
      parseNumberInput('', {
        required: true,
        text: { required: 'Obligatoire' },
      }),
    ).toEqual({ error: 'Obligatoire' });
  });
  it.each([
    { precision: -1 },
    { precision: 21 },
    { precision: 1.5 },
    { min: 2, max: 1 },
    { min: NaN },
    { step: 0 },
    { step: Infinity },
    { step: 0.001, precision: 2 },
    { locale: 'invalid_locale' },
    { locale: 'zz-ZZ' },
    { locale: 'en-u-nu-foobar' },
    { kind: 'currency' as const, currency: 'INVALID' },
  ])('surfaces invalid configuration %j', (options) => {
    expect(parseNumberInput('1', options)).toHaveProperty('error');
    expect(() => formatNumberValue(1, options)).toThrow();
  });
  it('keeps formatting separate from source precision and does not erase an invalid initial draft', () => {
    expect(formatNumberValue(1.2345, { precision: 2, locale: 'en-US' })).toBe(
      '1.23',
    );
    expect(formatNumberDraft(1.2345, { precision: 2, locale: 'en-US' })).toBe(
      '1.2345',
    );
    expect(formatNumberValue(null)).toBe('');
    expect(() => formatNumberValue('123')).toThrow();
    expect(() => formatNumberValue(Infinity)).toThrow();
  });
  it('preserves tiny ratios when their displayed percent fits the precision', () => {
    const options = {
      kind: 'percent' as const,
      precision: 20,
      locale: 'en-US',
    };
    const draft = formatNumberDraft(1e-21, options);
    expect(parseNumberInput(draft, options)).toEqual({ value: 1e-21 });
    expect(
      parseNumberInput(formatNumberDraft(1e-22, options), options),
    ).toEqual({ value: 1e-22 });
    expect(parseNumberInput(formatNumberDraft(1e-25, {}), {})).toHaveProperty(
      'error',
    );
  });
  it.each([
    ['USD', 0, 12],
    ['USD', 1, 12.5],
    ['KWD', 2, 1.25],
  ] as const)(
    'does not impose default %s currency decimals on precision %d',
    (currency, precision, value) => {
      const options = {
        kind: 'currency' as const,
        locale: 'en-US',
        currency,
        precision,
      };
      expect(
        parseNumberInput(formatNumberDraft(value, options), options),
      ).toEqual({ value });
      expect(
        stepNumberInput(formatNumberDraft(value, options), 1, options),
      ).toEqual({ value: value + 10 ** -precision });
    },
  );
});

describe('decimal-stable source-unit stepping', () => {
  it('adds decimal steps without floating-point tail digits and clamps at bounds', () => {
    expect(stepNumberInput('0.2', 1, { step: 0.1 })).toEqual({ value: 0.3 });
    expect(stepNumberInput('0.3', -1, { step: 0.1 })).toEqual({ value: 0.2 });
    expect(stepNumberInput('0.9', 1, { step: 0.3, max: 1 })).toEqual({
      value: 1,
    });
    expect(stepNumberInput('0.1', -1, { step: 0.3, min: 0 })).toEqual({
      value: 0,
    });
    expect(stepNumberInput('bad', 1)).toHaveProperty('error');
  });
  it('steps ratios in source units and initializes a blank within the bounds', () => {
    expect(stepNumberInput('12%', 1, { kind: 'percent', step: 0.01 })).toEqual({
      value: 0.13,
    });
    expect(stepNumberInput('12%', 1, { kind: 'percent' })).toEqual({
      value: 0.1201,
    });
    expect(stepNumberInput('', 1, { min: 2, max: 3, step: 0.1 })).toEqual({
      value: 2.1,
    });
  });
});
