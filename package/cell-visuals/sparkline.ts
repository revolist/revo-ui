import { controlClassName } from '../control-presentation';
import type { ElementFactory, ValueClasses } from './types';
export function renderSparkline(
  h: ElementFactory,
  options: {
    value: unknown;
    minValue?: number;
    maxValue?: number;
    ariaLabel?: string | ((values: readonly number[]) => string);
    classesForValue?: ValueClasses;
  },
) {
  const { value } = options;
  const sparklineData = Array.isArray(value)
    ? Array.from(value)
        .filter(
          (item): item is number | null | undefined =>
            item == null || (typeof item === 'number' && Number.isFinite(item)),
        )
        .map((item) => item ?? null)
    : [];
  const finiteData = sparklineData.filter(
    (item): item is number => item !== null,
  );
  if (finiteData.length === 0)
    return h('div', { class: 'sparkline-container' }, ''); // Handle empty data
  const ariaLabel =
    typeof options.ariaLabel === 'function'
      ? options.ariaLabel(finiteData)
      : (options.ariaLabel ?? sparklineData.join(', '));

  const maxValue = options.maxValue ?? Math.max(...finiteData); // Use column maxValue or data max
  const minValue = options.minValue ?? Math.min(...finiteData); // Use column minValue or data min

  // Avoid division by zero if minValue equals maxValue
  const range = maxValue - minValue || 1;

  // Normalize the data points to the range of the SVG (0 to 20 vertically)
  const normalizedData = sparklineData.map(
    (val) => (val === null ? null : 20 - ((val - minValue) / range) * 20), // Invert to fit SVG Y-axis (0 at top)
  );

  // Create line segments instead of a single polyline
  const lineSegments = [];
  for (let i = 0; i < normalizedData.length - 1; i++) {
    if (normalizedData[i] === null || normalizedData[i + 1] === null) continue;
    const x1 = (i / (sparklineData.length - 1)) * 100;
    const y1 = normalizedData[i];
    const x2 = ((i + 1) / (sparklineData.length - 1)) * 100;
    const y2 = normalizedData[i + 1];

    // Get threshold classes for the current data point
    const thresholdClasses = options.classesForValue?.(sparklineData[i]!) ?? {};

    lineSegments.push(
      h('line', {
        class: controlClassName('sparkline-segment', thresholdClasses),
        x1: x1.toString(),
        y1: y1!.toString(),
        x2: x2.toString(),
        y2: y2!.toString(),
      }),
    );
  }

  return h(
    'div',
    {
      class: 'sparkline-container',
      role: 'img',
      'aria-label': ariaLabel,
    },
    [
      h(
        'svg',
        {
          class: 'sparkline',
          viewBox: '0 0 100 20',
          xmlns: 'http://www.w3.org/2000/svg',
        },
        lineSegments,
      ),
    ],
  );
}
