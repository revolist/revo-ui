import type { EditorActionText } from '../editor-actions';

export interface MaskedInputText {
  required: string;
  invalid: string;
  incomplete: string;
  configuration: string;
  preview: string;
}

export interface MaskedInputOptions {
  /** 0 = ASCII digit, A = ASCII letter, * = ASCII alphanumeric. Escape literals with \\. */
  mask: string;
  /** Preserve the entered token characters, or include the mask's literal characters. */
  store?: 'raw' | 'formatted';
  required?: boolean;
  label?: string;
  placeholder?: string;
  text?: Partial<MaskedInputText>;
  actions?: Partial<EditorActionText>;
}

export interface MaskedParseResult {
  valid: boolean;
  value: string | null;
  raw: string | null;
  formatted: string | null;
  error?: 'required' | 'invalid' | 'incomplete' | 'configuration';
}

type MaskPart = { literal: string } | { token: '0' | 'A' | '*' };

export function maskParts(mask: string): MaskPart[] | undefined {
  if (typeof mask !== 'string') return;
  const parts: MaskPart[] = [];
  const characters = Array.from(mask);
  for (let index = 0; index < characters.length; index++) {
    const character = characters[index];
    if (character === '\\') {
      if (++index === characters.length) return;
      parts.push({ literal: characters[index] });
    } else if (character === '0' || character === 'A' || character === '*') {
      parts.push({ token: character });
    } else parts.push({ literal: character });
  }
  return parts.some((part) => 'token' in part) ? parts : undefined;
}

export function acceptsMaskToken(
  token: '0' | 'A' | '*',
  character: string,
): boolean {
  return token === '0'
    ? /^[0-9]$/.test(character)
    : token === 'A'
      ? /^[A-Za-z]$/.test(character)
      : /^[A-Za-z0-9]$/.test(character);
}

function match(input: string[], parts: MaskPart[]) {
  let raw = '';
  for (let index = 0; index < input.length; index++) {
    const part = parts[index];
    if (
      !part ||
      ('literal' in part
        ? input[index] !== part.literal
        : !acceptsMaskToken(part.token, input[index]))
    ) {
      return { complete: false, prefix: false, raw };
    }
    if ('token' in part) raw += input[index];
  }
  return { complete: input.length === parts.length, prefix: true, raw };
}

/** Strict, complete parsing of raw token characters or the complete formatted mask. */
export function parseMaskedInput(
  value: unknown,
  options: MaskedInputOptions,
): MaskedParseResult {
  const invalid = (error: MaskedParseResult['error']): MaskedParseResult => ({
    valid: false,
    value: null,
    raw: null,
    formatted: null,
    error,
  });
  const parts = maskParts(options.mask);
  if (
    !parts ||
    (options.store !== undefined &&
      options.store !== 'raw' &&
      options.store !== 'formatted')
  ) {
    return invalid('configuration');
  }
  if (value === null || value === undefined || value === '') {
    return options.required
      ? invalid('required')
      : { valid: true, value: null, raw: null, formatted: null };
  }
  // Identifiers are strings. Numeric coercion would lose leading zeros or precision.
  if (typeof value !== 'string') return invalid('invalid');
  const characters = Array.from(value);
  const rawMatch = match(
    characters,
    parts.filter((part) => 'token' in part),
  );
  const formattedMatch = match(characters, parts);
  const selected = rawMatch.complete
    ? rawMatch
    : formattedMatch.complete
      ? formattedMatch
      : undefined;
  if (!selected)
    return invalid(
      rawMatch.prefix || formattedMatch.prefix ? 'incomplete' : 'invalid',
    );
  const raw = selected.raw;
  const rawCharacters = Array.from(raw);
  let index = 0;
  const formatted = parts
    .map((part) => ('literal' in part ? part.literal : rawCharacters[index++]))
    .join('');
  return {
    valid: true,
    raw,
    formatted,
    value: options.store === 'formatted' ? formatted : raw,
  };
}

/** Display complete identifiers; preserve invalid source text for correction. */
export function formatMaskedValue(
  value: unknown,
  options: MaskedInputOptions,
): string {
  const parsed = parseMaskedInput(value, options);
  return parsed.valid
    ? (parsed.formatted ?? '')
    : value == null
      ? ''
      : String(value);
}
