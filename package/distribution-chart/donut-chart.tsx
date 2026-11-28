/** @jsxImportSource preact */
import { h } from 'preact';
import { useId } from 'preact/hooks';
import { ChartFrame } from './chart-frame';
import { chartGeometry } from './geometry';
import { CHART_SERIES_COLORS } from '../color-palette/chart-palettes';
import { ChartPattern } from './chart-pattern';
import type { StandaloneChartProps } from './types';

export type DonutChartProps = StandaloneChartProps;
const defaultColors = Object.values(CHART_SERIES_COLORS);

/** Part-to-whole chart. Nonfinite and negative values are treated as zero. */
export function DonutChart(props: DonutChartProps) {
  const patternId = `rv-donut-pattern-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const { values } = chartGeometry(props.data);
  const max = Math.max(1, ...values);
  const scaled = values.map((value) => value / max);
  const total = scaled.reduce((sum, value) => sum + value, 0);
  let offset = 0;
  const slices = scaled.map((value, index) => {
    const start = offset;
    const fraction = total ? value / total : 0;
    offset += fraction;
    const angle = (start + fraction / 2) * Math.PI * 2 - Math.PI / 2;
    return {
      fraction,
      start,
      color:
        props.sliceColors?.[index] ??
        `var(--rv-chart-${(index % defaultColors.length) + 1}, ${defaultColors[index % defaultColors.length]})`,
      x: 50 + 36 * Math.cos(angle),
      y: 50 + 36 * Math.sin(angle),
    };
  });
  const paint = (index: number) =>
    props.slicePatterns?.[index]
      ? `url(#${patternId}-${index})`
      : slices[index].color;
  return (
    <ChartFrame
      {...props}
      variant="donut"
      positions={slices}
      renderLabel={(_datum, index) => (
        <svg
          class="rv-distribution-chart__label-swatch"
          viewBox="0 0 12 12"
          aria-hidden="true"
          focusable="false"
        >
          <rect x="0" y="0" width="12" height="12" rx="2" fill={paint(index)} />
        </svg>
      )}
      renderDatum={() => (
        <span class="rv-distribution-chart__donut-target" aria-hidden="true" />
      )}
      renderSurface={({ show, hide, focus }) => (
        <svg
          class="rv-distribution-chart__donut-plot"
          viewBox="0 0 100 100"
          aria-hidden="true"
          focusable="false"
        >
          <defs>
            {slices.map(
              (slice, index) =>
                props.slicePatterns?.[index] && (
                  <ChartPattern
                    key={props.data[index].key}
                    id={`${patternId}-${index}`}
                    color={slice.color}
                    pattern={props.slicePatterns[index]!}
                  />
                ),
            )}
          </defs>
          <circle
            cx="50"
            cy="50"
            r="36"
            fill="none"
            stroke="var(--rv-ui-border)"
            stroke-width="16"
          />
          {slices.map(
            (slice, index) =>
              slice.fraction > 0 && (
                <circle
                  key={props.data[index].key}
                  cx="50"
                  cy="50"
                  r="36"
                  fill="none"
                  stroke={paint(index)}
                  stroke-width="16"
                  pathLength="100"
                  stroke-dasharray={`${slice.fraction * 100} ${100 - slice.fraction * 100}`}
                  stroke-dashoffset={-slice.start * 100}
                  transform="rotate(-90 50 50)"
                  onMouseEnter={() => show(index)}
                  onMouseLeave={() => hide(index)}
                  onClick={() => focus(index)}
                />
              ),
          )}
          {props.centerLabel && (
            <text
              x="50"
              y="50"
              text-anchor="middle"
              dominant-baseline="central"
              class="rv-distribution-chart__donut-label"
            >
              {props.centerLabel}
            </text>
          )}
        </svg>
      )}
    />
  );
}
