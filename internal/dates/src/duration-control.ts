import {
  parseDuration,
  type DurationUnit,
  type ParsedDuration,
} from './duration';
export interface DurationControlOptions {
  defaultUnit: DurationUnit;
  allowedUnits?: readonly DurationUnit[];
  allowElapsed?: boolean;
  required?: boolean;
  /** Numeric bounds apply to the authored value, without implicit calendar conversions. */
  min?: number;
  max?: number;
  maximumFractionDigits?: number;
}
export function parseDurationControl(
  value: unknown,
  options: DurationControlOptions,
): { valid: boolean; value: ParsedDuration | null } {
  if (
    value === null ||
    value === undefined ||
    (typeof value === 'string' && !value.trim())
  )
    return { valid: !options.required, value: null };
  const input =
    typeof value === 'object' &&
    value !== null &&
    'unit' in value &&
    'value' in value
      ? `${String(value.value)}${'elapsed' in value && value.elapsed ? ' elapsed ' : ' '}${String(value.unit)}`
      : value;
  const parsed = parseDuration(input, {
    ...options,
    allowElapsed: options.allowElapsed ?? false,
  });
  const valid =
    !!parsed &&
    (!options.allowedUnits || options.allowedUnits.includes(parsed.unit)) &&
    (options.min === undefined || parsed.value >= options.min) &&
    (options.max === undefined || parsed.value <= options.max);
  return { valid, value: valid ? parsed : null };
}
