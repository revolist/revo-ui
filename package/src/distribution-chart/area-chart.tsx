/** @jsxImportSource preact */
import { h } from 'preact';
import { useId } from 'preact/hooks';
import { ChartFrame, ChartPlot } from './chart-frame';
import { chartGeometry, chartSegment } from './geometry';
import type { StandaloneChartProps } from './types';

export type AreaChartProps = StandaloneChartProps;

export function AreaChart(props: AreaChartProps) {
  const gradientId = `rv-area-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const { points } = chartGeometry(props.data);
  const hasSelection = props.data.some((datum) => datum.selected !== undefined);
  const intervals = points.slice(1).map((to, index) => {
    const from = points[index];
    const line = chartSegment(from, to, props.interpolation);
    return {
      key: props.data[index].key,
      selected:
        !hasSelection ||
        !!(props.data[index].selected && props.data[index + 1].selected),
      line,
      area: `${line} L ${to.x} 100 L ${from.x} 100 Z`,
    };
  });
  return (
    <ChartFrame
      {...props}
      variant="area"
      positions={points}
      renderDatum={() =>
        props.showPoints === false ? null : (
          <span class="rv-distribution-chart__point" aria-hidden="true" />
        )
      }
    >
      {points.length > 0 && (
        <ChartPlot>
          {props.areaFill === 'gradient' && (
            <defs>
              {[true, false].map((selected) => {
                const color = selected
                  ? 'var(--rv-distribution-accent, var(--rv-ui-accent))'
                  : 'var(--rv-distribution-muted, var(--rv-ui-border))';
                return (
                  <linearGradient
                    key={String(selected)}
                    id={`${gradientId}${selected ? '' : '-muted'}`}
                    gradientUnits="userSpaceOnUse"
                    x1="0"
                    y1="8"
                    x2="0"
                    y2="100"
                  >
                    <stop offset="0%" stop-color={color} stop-opacity="0.4" />
                    <stop
                      offset="100%"
                      stop-color={color}
                      stop-opacity="0.02"
                    />
                  </linearGradient>
                );
              })}
            </defs>
          )}
          {intervals.map((interval) => (
            <g key={interval.key}>
              <path
                class={`rv-distribution-chart__area${interval.selected ? ' is-selected' : ''}`}
                d={interval.area}
                style={
                  props.areaFill === 'gradient'
                    ? {
                        fill: `url(#${gradientId}${interval.selected ? '' : '-muted'})`,
                      }
                    : undefined
                }
              />
              <path
                class={`rv-distribution-chart__series rv-distribution-chart__segment${interval.selected ? ' is-selected' : ''}`}
                d={interval.line}
                vector-effect="non-scaling-stroke"
              />
            </g>
          ))}
        </ChartPlot>
      )}
    </ChartFrame>
  );
}
