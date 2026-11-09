/** Shared finite RGB interpolation for chart renderers. */
export type RgbColor = readonly [number, number, number];

export function parseHexColor(value: string): RgbColor | undefined {
  const match = /^#([\da-f]{6}|[\da-f]{3})$/i.exec(value.trim());
  if (!match) return undefined;
  const hex =
    match[1].length === 3
      ? [...match[1]].map((character) => character.repeat(2)).join('')
      : match[1];
  return [
    Number.parseInt(hex.slice(0, 2), 16),
    Number.parseInt(hex.slice(2, 4), 16),
    Number.parseInt(hex.slice(4, 6), 16),
  ];
}

/** Clamped ratio, using normalized coordinates when a finite domain span overflows. */
export function normalizeColorValue(
  value: number,
  start: number,
  end: number,
  singletonRatio = 0.5,
): number {
  if (start === end)
    return value === start ? singletonRatio : value > end ? 1 : 0;
  if (value <= start) return 0;
  if (value >= end) return 1;
  const span = end - start;
  const magnitude = Math.max(Math.abs(start), Math.abs(end));
  const ratio = Number.isFinite(span)
    ? (value - start) / span
    : (value / magnitude - start / magnitude) /
      (end / magnitude - start / magnitude);
  return Math.min(1, Math.max(0, ratio));
}

export function interpolateRgb(
  start: RgbColor,
  end: RgbColor,
  ratio: number,
): string {
  const bounded = Math.min(1, Math.max(0, ratio));
  return `rgb(${start.map((channel, index) => Math.round(channel + (end[index] - channel) * bounded)).join(', ')})`;
}
