/** @jsxImportSource preact */
import { h } from 'preact';
import { ChartFrame, ChartPlot } from './chart-frame';
import { chartGeometry, chartSegment } from './geometry';
import type { StandaloneChartProps } from './types';

export type LineChartProps = StandaloneChartProps;

/** Compact line chart with independently selected intervals and optional points. */
export function LineChart(props: LineChartProps) {
  const { points } = chartGeometry(props.data);
  return (
    <ChartFrame
      {...props}
      variant="line"
      positions={points}
      renderDatum={() =>
        props.showPoints === false ? null : (
          <span class="rv-distribution-chart__point" aria-hidden="true" />
        )
      }
    >
      {points.length > 0 && (
        <ChartPlot>
          {points.slice(1).map((point, index) => (
            <path
              key={props.data[index].key}
              class={`rv-distribution-chart__series rv-distribution-chart__segment${props.data[index].selected && props.data[index + 1].selected ? ' is-selected' : ''}`}
              d={chartSegment(points[index], point, props.interpolation)}
              vector-effect="non-scaling-stroke"
            />
          ))}
        </ChartPlot>
      )}
    </ChartFrame>
  );
}
