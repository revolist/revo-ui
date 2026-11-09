export interface NormalizedProgressRange {
  readonly min: number;
  readonly max: number;
  readonly percent: number;
}

/** Normalize a numeric value into a finite, clamped 0–100 progress range. */
export function normalizeProgressRange(
  value: unknown,
  configuredMin: unknown = 0,
  configuredMax: unknown = 100,
): NormalizedProgressRange {
  const first = finiteNumber(configuredMin, 0);
  const second = finiteNumber(configuredMax, 100);
  const min = Math.min(first, second);
  const max = Math.max(first, second);
  const numericValue = finiteNumber(value, min);
  const percent =
    min === max
      ? numericValue >= max
        ? 100
        : 0
      : ((Math.min(max, Math.max(min, numericValue)) - min) / (max - min)) *
        100;
  return { min, max, percent };
}

function finiteNumber(value: unknown, fallback: number): number {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}
