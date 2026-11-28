/** @jsxImportSource preact */
import { h } from 'preact';
import type { DistributionChartPattern } from './types';

/** SVG texture with a solid base so the underlying series remains identifiable. */
export function ChartPattern({
  id,
  color,
  pattern,
}: {
  id: string;
  color: string;
  pattern: DistributionChartPattern;
}) {
  return (
    <pattern id={id} width="4" height="4" patternUnits="userSpaceOnUse">
      <rect width="4" height="4" fill={color} />
      {pattern === 'dots' ? (
        <circle cx="2" cy="2" r="0.7" fill="var(--rv-ui-surface, white)" />
      ) : (
        <path
          d="M -1 1 L 1 -1 M 0 4 L 4 0 M 3 5 L 5 3"
          fill="none"
          stroke="var(--rv-ui-surface, white)"
          stroke-width="0.6"
        />
      )}
    </pattern>
  );
}
