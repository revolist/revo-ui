/** @jsxImportSource preact */
import { h } from 'preact';
import { ChartFrame } from './chart-frame';
import { chartGeometry } from './geometry';
import { MultiSeriesChart } from './multi-series-chart';
import type { DistributionChartDatum, StandaloneChartProps } from './types';

export interface BarChartProps extends StandaloneChartProps {
  /** CSS color or per-bar rule. Return undefined to retain the theme color. */
  readonly barColor?:
    | string
    | ((datum: DistributionChartDatum, index: number) => string | undefined);
}

/** Compact bar chart, independent of sliders, filters and grid instances. */
export function BarChart(props: BarChartProps) {
  if (props.series?.length)
    return <MultiSeriesChart {...props} variant="bar" />;
  const { values, max } = chartGeometry(props.data);
  const colors = props.data.map((datum, index) =>
    typeof props.barColor === 'function'
      ? props.barColor(datum, index)
      : props.barColor,
  );
  return (
    <ChartFrame
      {...props}
      datumColors={colors}
      variant="bar"
      renderDatum={(datum, index) => (
        <span
          class="rv-distribution-chart__bar"
          data-pattern={props.barPattern}
          style={{
            backgroundColor: colors[index],
            height: `${Math.max(3, (values[index] / max) * 100)}%`,
          }}
          aria-hidden="true"
        />
      )}
    />
  );
}
