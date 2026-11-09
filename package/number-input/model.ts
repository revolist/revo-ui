import type { EditorActionText } from '../editor-actions';

export interface NumberInputText {
  invalid: string;
  configuration: string;
  required: string;
  precision: string;
  minimum: string;
  maximum: string;
  increase: string;
  decrease: string;
}
export interface NumberInputOptions {
  kind?: 'number' | 'currency' | 'percent';
  /** Maximum fraction digits in display units, from 0 to 20. Defaults to 2. */
  precision?: number;
  locale?: string;
  currency?: string;
  useGrouping?: boolean;
  /** Bounds and step use source units (ratios for percent). */
  min?: number;
  max?: number;
  /** Defaults to the smallest displayed precision unit. */
  step?: number;
  required?: boolean;
  label?: string;
  text?: Partial<NumberInputText>;
  actions?: Partial<EditorActionText>;
}
export type NumberInputResult =
  | { value: number | null; error?: never }
  | { error: string; value?: never };
export const defaultNumberInputText: NumberInputText = {
  invalid: 'Enter a valid number in the configured locale.',
  configuration: 'The number input configuration is unsupported or invalid.',
  required: 'Enter a value.',
  precision: 'Too many decimal places for this field.',
  minimum: 'The value is below the minimum.',
  maximum: 'The value is above the maximum.',
  increase: 'Increase',
  decrease: 'Decrease',
};

const bidi = /[\u061c\u200e\u200f]/g;
const clean = (text: string) => text.replace(bidi, '').trim();
const finite = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

function configuration(options: NumberInputOptions) {
  const kind = options.kind ?? 'number';
  const precision = options.precision ?? 2;
  if (
    !['number', 'currency', 'percent'].includes(kind) ||
    !Number.isInteger(precision) ||
    precision < 0 ||
    precision > 20 ||
    (options.min !== undefined && !finite(options.min)) ||
    (options.max !== undefined && !finite(options.max)) ||
    (options.step !== undefined &&
      (!finite(options.step) || options.step <= 0)) ||
    (options.min !== undefined &&
      options.max !== undefined &&
      options.min > options.max) ||
    (options.useGrouping !== undefined &&
      typeof options.useGrouping !== 'boolean') ||
    (options.required !== undefined && typeof options.required !== 'boolean')
  )
    throw new RangeError();
  if (
    options.locale !== undefined &&
    (typeof options.locale !== 'string' ||
      !options.locale.trim() ||
      !Intl.NumberFormat.supportedLocalesOf(options.locale).length)
  )
    throw new RangeError();
  const currency = options.currency ?? 'USD';
  if (
    kind === 'currency' &&
    (typeof currency !== 'string' || !/^[A-Z]{3}$/.test(currency))
  )
    throw new RangeError();
  if (options.step !== undefined) {
    const [mantissa, exponent = '0'] = String(options.step).split('e');
    const fraction = mantissa.split('.')[1]?.length ?? 0;
    if (fraction - Number(exponent) - (kind === 'percent' ? 2 : 0) > precision)
      throw new RangeError();
  }
  const style = kind === 'number' ? 'decimal' : kind;
  const formatter = new Intl.NumberFormat(options.locale, {
    style,
    ...(kind === 'currency' ? { currency } : {}),
    minimumFractionDigits: precision,
    maximumFractionDigits: precision,
    useGrouping: options.useGrouping ?? true,
  });
  const numberingSystem = options.locale
    ? new Intl.Locale(options.locale).numberingSystem
    : undefined;
  if (
    numberingSystem &&
    formatter.resolvedOptions().numberingSystem !== numberingSystem
  )
    throw new RangeError();
  return { kind, precision, currency, formatter };
}

/** Formats finite source numbers; nullish values remain blank. Invalid options throw. */
export function formatNumberValue(
  value: unknown,
  options: NumberInputOptions = {},
): string {
  const { formatter } = configuration(options);
  if (value == null) return '';
  if (!finite(value)) throw new TypeError('Expected a finite number or null.');
  return formatter.format(value);
}

/** Preserve existing precision in the draft instead of rounding a value on open. */
export function formatNumberDraft(
  value: unknown,
  options: NumberInputOptions,
): string {
  const { kind, currency } = configuration(options);
  if (value == null) return '';
  if (!finite(value)) return String(value);
  const text = new Intl.NumberFormat(options.locale, {
    style: kind === 'number' ? 'decimal' : kind,
    ...(kind === 'currency' ? { currency } : {}),
    useGrouping: options.useGrouping ?? true,
    minimumFractionDigits: 0,
    maximumFractionDigits: 20,
  }).format(value);
  // Intl can partially round beyond its fraction limit without underflowing.
  // Check source equivalence independently of the column's entry constraints.
  const roundtrip = parseNumberInput(text, {
    ...options,
    precision: 20,
    min: undefined,
    max: undefined,
    step: undefined,
  });
  // Exponential text preserves the source digits and is deliberately outside the
  // decimal input grammar, so opening and saving cannot change the source value.
  return roundtrip.error === undefined && Object.is(roundtrip.value, value)
    ? text
    : value.toExponential();
}

/** Strict full-string locale parser. Bare percent input is also in percentage units. */
export function parseNumberInput(
  text: string,
  options: NumberInputOptions = {},
): NumberInputResult {
  const labels = { ...defaultNumberInputText, ...options.text };
  try {
    const { kind, precision, currency } = configuration(options);
    let input = clean(text);
    if (!input)
      return options.required ? { error: labels.required } : { value: null };
    const decimal = new Intl.NumberFormat(options.locale, {
      useGrouping: false,
      minimumFractionDigits: 1,
    })
      .formatToParts(1.1)
      .find((part) => part.type === 'decimal')!.value;
    const digitFormatter = new Intl.NumberFormat(options.locale, {
      useGrouping: false,
    });
    const digits = new Map(
      Array.from({ length: 10 }, (_, digit) => [
        clean(digitFormatter.format(digit)),
        String(digit),
      ]),
    );
    const normalizeDigits = (value: string) =>
      [...value].map((char) => digits.get(char) ?? char).join('');
    const groupFormatter = new Intl.NumberFormat(options.locale, {
      useGrouping: true,
      maximumFractionDigits: 0,
    });
    const group = groupFormatter
      .formatToParts(123456789)
      .find((part) => part.type === 'group')?.value;
    const minus =
      digitFormatter.formatToParts(-1).find((part) => part.type === 'minusSign')
        ?.value ?? '-';
    let negative = false,
      signed = false;
    if (kind === 'currency' && input.startsWith('(') && input.endsWith(')')) {
      negative = true;
      signed = true;
      input = clean(input.slice(1, -1));
    }
    const stripSign = () => {
      const token = [minus, '-', '+'].find((sign) => input.startsWith(sign));
      if (!token) return true;
      if (signed) return false;
      signed = true;
      negative = token !== '+';
      input = clean(input.slice(token.length));
      return true;
    };
    if (!stripSign()) return { error: labels.invalid };
    if (kind === 'currency') {
      const tokens = new Set([currency]);
      for (const currencyDisplay of ['symbol', 'narrowSymbol'] as const) {
        for (const part of new Intl.NumberFormat(options.locale, {
          style: 'currency',
          currency,
          currencyDisplay,
        }).formatToParts(1)) {
          if (part.type === 'currency') tokens.add(part.value);
        }
      }
      for (const token of [...tokens].sort((a, b) => b.length - a.length)) {
        if (input.startsWith(token)) {
          input = clean(input.slice(token.length));
          break;
        }
        if (input.endsWith(token)) {
          input = clean(input.slice(0, -token.length));
          break;
        }
      }
      if (!stripSign()) return { error: labels.invalid };
    } else if (kind === 'percent') {
      const token = new Intl.NumberFormat(options.locale, { style: 'percent' })
        .formatToParts(1)
        .find((part) => part.type === 'percentSign')!.value;
      if (input.endsWith(token)) input = clean(input.slice(0, -token.length));
      else if (input.startsWith(token))
        input = clean(input.slice(token.length));
    }
    input = normalizeDigits(input);
    const parts = input.split(decimal);
    if (parts.length > 2) return { error: labels.invalid };
    let integer = parts[0];
    const fraction = parts[1] ?? '';
    if (!/^\d*$/.test(fraction) || (parts.length === 2 && !fraction))
      return { error: labels.invalid };
    if (group && integer.includes(group)) {
      const ungrouped = integer.split(group).join('');
      if (!/^\d+$/.test(ungrouped)) return { error: labels.invalid };
      const expected = normalizeDigits(
        clean(groupFormatter.format(BigInt(ungrouped))),
      );
      if (expected !== integer) return { error: labels.invalid };
      integer = ungrouped;
    }
    if (!/^\d*$/.test(integer) || (!integer && !fraction))
      return { error: labels.invalid };
    if (fraction.length > precision) return { error: labels.precision };
    const canonical = `${negative ? '-' : ''}${integer || '0'}${fraction ? `.${fraction}` : ''}`;
    // Decimal exponent shifting avoids multiplication/division artifacts for ratios.
    const value = Number(kind === 'percent' ? `${canonical}e-2` : canonical);
    if (
      !Number.isFinite(value) ||
      Math.abs(value) > Number.MAX_SAFE_INTEGER ||
      (value === 0 && /[1-9]/.test(canonical))
    )
      return { error: labels.invalid };
    if (options.min !== undefined && value < options.min)
      return { error: labels.minimum };
    if (options.max !== undefined && value > options.max)
      return { error: labels.maximum };
    return { value };
  } catch {
    return { error: labels.configuration };
  }
}

/** Add decimal representations exactly before converting back to a source Number. */
function decimalAdd(left: number, right: number): number {
  const decompose = (value: number) => {
    const [mantissa, exponent = '0'] = String(value).split('e');
    const fraction = mantissa.split('.')[1]?.length ?? 0;
    return {
      integer: BigInt(mantissa.replace('.', '')),
      scale: fraction - Number(exponent),
    };
  };
  const a = decompose(left),
    b = decompose(right),
    scale = Math.max(a.scale, b.scale, 0);
  const sum =
    a.integer * 10n ** BigInt(scale - a.scale) +
    b.integer * 10n ** BigInt(scale - b.scale);
  return Number(`${sum}e-${scale}`);
}

export function stepNumberInput(
  text: string,
  direction: 1 | -1,
  options: NumberInputOptions = {},
): NumberInputResult {
  const parsed = parseNumberInput(text, options);
  if (parsed.error !== undefined) return parsed;
  const { kind, precision } = configuration(options);
  const step =
    options.step ?? 10 ** -(precision + (kind === 'percent' ? 2 : 0));
  const start =
    parsed.value ??
    Math.max(options.min ?? -Infinity, Math.min(options.max ?? Infinity, 0));
  const value = Math.max(
    options.min ?? -Infinity,
    Math.min(options.max ?? Infinity, decimalAdd(start, direction * step)),
  );
  if (!Number.isFinite(value) || Math.abs(value) > Number.MAX_SAFE_INTEGER)
    return { error: options.text?.invalid ?? defaultNumberInputText.invalid };
  // A step incompatible with displayed precision must never silently round.
  return parseNumberInput(formatNumberDraft(value, options), options);
}
