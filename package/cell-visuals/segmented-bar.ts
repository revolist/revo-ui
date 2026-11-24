import type { ElementFactory } from './types';

export interface SegmentedBarPart {
  value: number;
  color?: string;
  className?: string;
}
export interface SegmentedBarOptions {
  parts: readonly SegmentedBarPart[];
  /** Localized description of all meaningful parts. */
  label: string;
  /** A shared denominator. Invalid or absent totals use the sum of the parts. */
  total?: number;
}
/** A compact, ordered composition bar, with a caller-owned accessible summary. */
export function renderSegmentedBar(
  h: ElementFactory,
  options: SegmentedBarOptions,
) {
  const parts = Array.isArray(options.parts)
    ? options.parts.filter(
        (part) =>
          part &&
          typeof part.value === 'number' &&
          Number.isFinite(part.value) &&
          part.value >= 0,
      )
    : [];
  const max = parts.reduce((current, part) => Math.max(current, part.value), 0);
  const scaledSum = max
    ? parts.reduce((sum, part) => sum + part.value / max, 0)
    : 0;
  const total =
    typeof options.total === 'number' &&
    Number.isFinite(options.total) &&
    options.total > 0
      ? options.total
      : undefined;
  let remaining = 1;
  const children = parts.map((part) => {
    const fraction = Math.max(
      0,
      Math.min(
        remaining,
        total === undefined
          ? max
            ? part.value / max / scaledSum
            : 0
          : part.value / total,
      ),
    );
    remaining = Math.max(0, remaining - fraction);
    return h('span', {
      class: ['rv-segmented-bar__part', part.className]
        .filter(Boolean)
        .join(' '),
      style: {
        width: `${fraction * 100}%`,
        ...(part.color ? { backgroundColor: part.color } : {}),
      },
      'aria-hidden': 'true',
    });
  });
  return h(
    'div',
    { class: 'rv-segmented-bar', role: 'img', 'aria-label': options.label },
    children,
  );
}
