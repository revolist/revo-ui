/** @jsxImportSource preact */
import { h } from 'preact';
import { useId } from 'preact/hooks';
import { CHART_SERIES_COLORS } from '../color-palette/chart-palettes';
import { ChartFrame, ChartPlot } from './chart-frame';
import { chartSegment } from './geometry';
import type { StandaloneChartProps } from './types';

type Variant = 'bar' | 'line' | 'area';
const colors = Object.values(CHART_SERIES_COLORS);
const valid = (value: number | undefined) =>
  value !== undefined && Number.isFinite(value) ? Math.max(0, value) : 0;

/** Multiple aligned series rendered on a shared scale and category axis. */
export function MultiSeriesChart(
  props: StandaloneChartProps & { variant: Variant },
) {
  const gradientId = `rv-multi-area-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const series = props.series ?? [];
  const count = props.data.length;
  const stacked = props.seriesMode === 'stacked';
  const hasSelection = props.data.some((datum) => datum.selected !== undefined);
  const opacity = (selected: boolean | undefined) =>
    hasSelection && !selected ? 0.3 : 1;
  const matrix = series.map((item) =>
    props.data.map((_, index) => valid(item.values[index])),
  );
  const scale =
    matrix.reduce(
      (largest, values) =>
        values.reduce((max, value) => Math.max(max, value), largest),
      0,
    ) || 1;
  const normalized = matrix.map((values) =>
    values.map((value) => value / scale),
  );
  const totals = props.data.map((_, index) =>
    normalized.reduce((sum, values) => sum + values[index], 0),
  );
  const max = stacked
    ? totals.reduce((largest, value) => Math.max(largest, value), 1)
    : 1;
  const hasBars = series.some((item) => (item.type ?? props.variant) === 'bar');
  const bars = series.filter((item) => (item.type ?? props.variant) === 'bar');
  const x = (index: number) =>
    hasBars
      ? ((index + 0.5) * 100) / Math.max(1, count)
      : count < 2
        ? 50
        : (index * 100) / (count - 1);
  const y = (value: number) => 96 - (value / max) * 88;
  const data = props.data.map((datum, index) => ({
    ...datum,
    value: matrix.reduce(
      (aggregate, values) =>
        stacked
          ? Math.min(Number.MAX_VALUE, aggregate + values[index])
          : Math.max(aggregate, values[index]),
      0,
    ),
    tooltip: {
      title: datum.tooltip.title,
      details: [
        ...(datum.tooltip.details ?? []),
        ...series.map(
          (item, i) =>
            `${item.label}: ${(props.formatValue ?? String)(matrix[i][index])}`,
        ),
      ],
    },
  }));
  const lower = props.data.map(() => 0);
  const shapes = series.map((item, seriesIndex) => {
    const values = normalized[seriesIndex];
    const base = [...lower];
    const top = values.map((value, index) =>
      stacked ? base[index] + value : value,
    );
    if (stacked)
      top.forEach((value, index) => {
        lower[index] = value;
      });
    const type = item.type ?? props.variant;
    const color =
      item.color ??
      `var(--rv-chart-${(seriesIndex % colors.length) + 1}, ${colors[seriesIndex % colors.length]})`;
    const points = top.map((value, index) => ({ x: x(index), y: y(value) }));
    const bottoms = base.map((value, index) => ({
      x: x(index),
      y: y(stacked ? value : 0),
    }));
    if (type === 'bar') {
      const groupWidth = 80 / Math.max(1, count);
      const width = stacked
        ? groupWidth
        : groupWidth / Math.max(1, bars.length);
      const barIndex = bars.indexOf(item);
      return (
        <g
          key={item.key}
          data-series={item.key}
          data-series-type="bar"
          fill={color}
        >
          {values.map((value, index) => (
            <rect
              key={props.data[index].key}
              x={x(index) - groupWidth / 2 + (stacked ? 0 : barIndex * width)}
              y={y(top[index])}
              width={width}
              height={Math.max(0, y(stacked ? base[index] : 0) - y(top[index]))}
              opacity={opacity(props.data[index].selected)}
            />
          ))}
        </g>
      );
    }
    return (
      <g key={item.key} data-series={item.key} data-series-type={type}>
        {points.slice(1).map((point, index) => {
          const line = chartSegment(points[index], point, props.interpolation);
          const from = bottoms[index + 1],
            to = bottoms[index];
          const midpoint = (from.x + to.x) / 2;
          const lower =
            props.interpolation === 'step'
              ? `V ${to.y} H ${to.x}`
              : props.interpolation === 'smooth'
                ? `C ${midpoint} ${from.y}, ${midpoint} ${to.y}, ${to.x} ${to.y}`
                : `L ${to.x} ${to.y}`;
          const alpha = opacity(
            props.data[index].selected && props.data[index + 1].selected,
          );
          return (
            <g key={props.data[index].key}>
              {type === 'area' && (
                <path
                  d={`${line} L ${from.x} ${from.y} ${lower} Z`}
                  fill={
                    props.areaFill === 'gradient'
                      ? `url(#${gradientId}-${seriesIndex})`
                      : color
                  }
                  fill-opacity={props.areaFill === 'gradient' ? 1 : 0.25}
                  opacity={alpha}
                />
              )}
              <path
                d={line}
                fill="none"
                stroke={color}
                stroke-width="2"
                opacity={alpha}
                vector-effect="non-scaling-stroke"
              />
            </g>
          );
        })}
        {props.showPoints !== false &&
          points.map((point, index) => (
            <line
              key={props.data[index].key}
              data-part="series-point"
              x1={point.x}
              x2={point.x}
              y1={point.y}
              y2={point.y}
              stroke={color}
              stroke-width="7"
              stroke-linecap="round"
              vector-effect="non-scaling-stroke"
              opacity={opacity(props.data[index].selected)}
            />
          ))}
      </g>
    );
  });
  return (
    <div class="rv-distribution-multiseries">
      <ChartFrame
        {...props}
        legend={undefined}
        data={data}
        variant={props.variant}
        renderDatum={() => null}
        renderTooltip={
          props.renderTooltip
            ? (_datum, index) => props.renderTooltip!(props.data[index], index)
            : undefined
        }
      >
        <ChartPlot>
          {props.areaFill === 'gradient' && (
            <defs>
              {series.map(
                (item, index) =>
                  (item.type ?? props.variant) === 'area' && (
                    <linearGradient
                      key={item.key}
                      id={`${gradientId}-${index}`}
                      gradientUnits="userSpaceOnUse"
                      x1="0"
                      y1="8"
                      x2="0"
                      y2="96"
                    >
                      <stop
                        offset="0%"
                        stop-color={
                          item.color ??
                          `var(--rv-chart-${(index % colors.length) + 1}, ${colors[index % colors.length]})`
                        }
                        stop-opacity="0.4"
                      />
                      <stop
                        offset="100%"
                        stop-color={
                          item.color ??
                          `var(--rv-chart-${(index % colors.length) + 1}, ${colors[index % colors.length]})`
                        }
                        stop-opacity="0.02"
                      />
                    </linearGradient>
                  ),
              )}
            </defs>
          )}
          {shapes}
        </ChartPlot>
      </ChartFrame>
      <ul class="rv-distribution-multiseries__legend" aria-label={props.legend}>
        {series.map((item, index) => (
          <li key={item.key}>
            <i
              style={{
                background:
                  item.color ??
                  `var(--rv-chart-${(index % colors.length) + 1}, ${colors[index % colors.length]})`,
              }}
              aria-hidden="true"
            />
            {item.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
