import { expect, it } from 'vitest';
import { formatNumberDraft, parseNumberInput } from './model';

it.each(['number', 'currency', 'percent'] as const)(
  'never rounds small source digits into a valid changed %s draft',
  (kind) => {
    const options = { kind, locale: 'en-US', currency: 'USD', precision: 20 };
    for (const value of [1.23456789e-15, -1.23456789e-15, 1.23456789e-19]) {
      const draft = formatNumberDraft(value, options);
      const parsed = parseNumberInput(draft, options);
      if (parsed.error === undefined) expect(parsed.value).toBe(value);
      else expect(draft).toBe(String(value));
    }
  },
);

it('does not use configured bounds or entry precision to round existing source data', () => {
  const options = { locale: 'de-DE', precision: 2, min: 10, max: 20 };
  expect(formatNumberDraft(1.2345, options)).toBe('1,2345');
  expect(
    parseNumberInput(formatNumberDraft(1.2345, options), options),
  ).toHaveProperty('error');
});
