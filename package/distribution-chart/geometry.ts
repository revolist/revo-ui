import type { DistributionChartDatum } from './types';

export function chartGeometry(data: readonly DistributionChartDatum[]) {
  const values = data.map(({ value }) =>
    Number.isFinite(value) ? Math.max(0, value) : 0,
  );
  const max = Math.max(1, ...values);
  const points = values.map((value, index) => ({
    x: data.length <= 1 ? 50 : (index / (data.length - 1)) * 100,
    y: 96 - (value / max) * 88,
  }));
  return { values, max, points };
}

type ChartPoint = { readonly x: number; readonly y: number };

function nextPoint(point: ChartPoint, interpolation: 'linear' | 'step') {
  return interpolation === 'step'
    ? `H ${point.x} V ${point.y}`
    : `L ${point.x} ${point.y}`;
}

/** Step-after keeps the category value until the next category. */
export function chartSegment(
  from: ChartPoint,
  to: ChartPoint,
  interpolation: 'linear' | 'step' = 'linear',
) {
  return `M ${from.x} ${from.y} ${nextPoint(to, interpolation)}`;
}

export function chartPath(
  points: readonly ChartPoint[],
  interpolation: 'linear' | 'step' = 'linear',
) {
  if (!points.length) return '';
  return `M ${points[0].x} ${points[0].y} ${points
    .slice(1)
    .map((point) => nextPoint(point, interpolation))
    .join(' ')}`;
}
