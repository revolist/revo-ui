/** @jsxImportSource preact */
import { h } from 'preact';
import { BarChart } from './bar-chart';
import { LineChart } from './line-chart';
import { AreaChart } from './area-chart';
import type { DistributionChartProps } from './types';

export * from './types';
export { BarChart, type BarChartProps } from './bar-chart';
export { LineChart, type LineChartProps } from './line-chart';
export { AreaChart, type AreaChartProps } from './area-chart';

/** Chart-type composition; each presentation has its own standalone owner. */
export function DistributionChart({
  type = 'bar',
  ...props
}: DistributionChartProps) {
  if (type === 'line') return <LineChart {...props} />;
  if (type === 'area') return <AreaChart {...props} />;
  return <BarChart {...props} />;
}
