import type { ElementFactory } from './types';

export interface ComparisonSparklineSeries {
  values: unknown;
  /** A CSS color, supplied by the host or theme. */
  color?: string;
  /** Fill contiguous segments with a gradient (true) or a solid color. */
  fill?: boolean | 'solid' | 'gradient';
  fillOpacity?: number;
  /** An SVG stroke-dasharray for this series. */
  dash?: string;
  endpoint?: boolean | 'hollow';
  /** Render independent strokes between adjacent points. */
  segmentLines?: boolean;
  /** Color the stroke below this threshold, and limit its area fill to the upper region. */
  belowThreshold?: { value: number; color: string };
}
export interface ComparisonSparklineOptions {
  series: readonly ComparisonSparklineSeries[];
  label: string;
  minValue?: number;
  maxValue?: number;
  /** Preserve the plot aspect ratio instead of stretching it to the SVG bounds. */
  preserveAspectRatio?: 'none' | 'xMidYMid meet';
  /** Localized tooltip text for each point; omit to keep the chart noninteractive. */
  tooltip?: (index: number, values: readonly (number | null)[]) => string;
}
let nextSparklineId = 0;

/** Render compact, consistently scaled series without connecting missing data. */
export function renderComparisonSparkline(
  h: ElementFactory,
  options: ComparisonSparklineOptions,
) {
  const series = options.series.map((item) => ({
    ...item,
    values: Array.isArray(item.values)
      ? Array.from(item.values, (value) =>
          typeof value === 'number' && Number.isFinite(value) ? value : null,
        )
      : [],
  }));
  const finite = series.flatMap((item) =>
    item.values.filter((value): value is number => value !== null),
  );
  if (!finite.length)
    return h(
      'div',
      { class: 'rv-comparison-sparkline rv-comparison-sparkline--empty' },
      '',
    );
  const dataMin = finite.reduce(
    (minimum, value) => Math.min(minimum, value),
    Infinity,
  );
  const dataMax = finite.reduce(
    (maximum, value) => Math.max(maximum, value),
    -Infinity,
  );
  let min = Number.isFinite(options.minValue) ? options.minValue! : dataMin;
  let max = Number.isFinite(options.maxValue) ? options.maxValue! : dataMax;
  if (max <= min) {
    if (Number.isFinite(options.minValue)) max = min + 1;
    else if (Number.isFinite(options.maxValue)) min = max - 1;
    else max = min + 1;
  }
  const y = (value: number) => {
    if (value <= min || max <= min) return 20;
    if (value >= max) return 0;
    const span = max - min;
    const scale = Math.max(Math.abs(min), Math.abs(max), 1);
    const ratio = Number.isFinite(span)
      ? (value - min) / span
      : (value / scale - min / scale) / (max / scale - min / scale);
    return 20 - Math.max(0, Math.min(1, ratio)) * 20;
  };
  const count = series.reduce(
    (max, item) => Math.max(max, item.values.length),
    0,
  );
  const defs: unknown[] = [],
    areas: unknown[] = [],
    lines: unknown[] = [],
    points: unknown[] = [],
    endpointMarkers: unknown[] = [];
  const chartId = ++nextSparklineId;
  series.forEach((item, seriesIndex) => {
    const color = item.color ?? 'currentColor';
    const gradientId = `rv-comparison-sparkline-${chartId}-${seriesIndex}`;
    const threshold = item.belowThreshold;
    const thresholdY =
      threshold && Number.isFinite(threshold.value)
        ? y(threshold.value)
        : undefined;
    const upperClip = `${gradientId}-above`;
    const lowerClip = `${gradientId}-below`;
    if (thresholdY !== undefined) {
      defs.push(
        h('clipPath', { id: upperClip }, [
          h('rect', { x: 0, y: 0, width: 100, height: thresholdY }),
        ]),
        h('clipPath', { id: lowerClip }, [
          h('rect', {
            x: 0,
            y: thresholdY,
            width: 100,
            height: 20 - thresholdY,
          }),
        ]),
      );
    }
    const opacity = Number.isFinite(item.fillOpacity)
      ? Math.max(0, Math.min(1, item.fillOpacity!))
      : 0.16;
    if (item.fill && item.fill !== 'solid') {
      defs.push(
        h(
          'linearGradient',
          { id: gradientId, x1: '0', y1: '0', x2: '0', y2: '1' },
          [
            h('stop', {
              offset: '0%',
              'stop-color': color,
              'stop-opacity': opacity,
            }),
            h('stop', {
              offset: '100%',
              'stop-color': color,
              'stop-opacity': 0,
            }),
          ],
        ),
      );
    }
    const groups: Array<Array<{ x: number; y: number }>> = [];
    let group: Array<{ x: number; y: number }> = [];
    item.values.forEach((value, index) => {
      if (value === null) {
        if (group.length) groups.push(group);
        group = [];
        return;
      }
      group.push({
        x: count === 1 ? 0 : (index / (count - 1)) * 100,
        y: y(value),
      });
    });
    if (group.length) groups.push(group);
    for (const points of groups) {
      const coordinates = points
        .map((point) => `${point.x},${point.y}`)
        .join(' ');
      if (item.fill && points.length > 1)
        areas.push(
          h('polygon', {
            class: 'rv-comparison-sparkline__area',
            ...(thresholdY !== undefined
              ? { 'clip-path': `url(#${upperClip})` }
              : {}),
            points: `${points[0].x},20 ${coordinates} ${points[points.length - 1].x},20`,
            fill: item.fill === 'solid' ? color : `url(#${gradientId})`,
            ...(item.fill === 'solid' ? { 'fill-opacity': opacity } : {}),
          }),
        );
      if (points.length > 1) {
        const style = {
          class: 'rv-comparison-sparkline__line',
          fill: 'none',
          stroke: color,
          ...(item.dash ? { 'stroke-dasharray': item.dash } : {}),
        };
        if (item.segmentLines) {
          for (let index = 1; index < points.length; index++) {
            lines.push(
              h('line', {
                ...style,
                x1: points[index - 1].x,
                y1: points[index - 1].y,
                x2: points[index].x,
                y2: points[index].y,
              }),
            );
          }
        } else {
          lines.push(h('polyline', { ...style, points: coordinates }));
        }
        if (thresholdY !== undefined) {
          lines.push(
            h('polyline', {
              ...style,
              stroke: threshold!.color,
              points: coordinates,
              'clip-path': `url(#${lowerClip})`,
              'data-sparkline-below-threshold': '',
            }),
          );
        }
      }
    }
    const last = groups.at(-1)?.at(-1);
    if (item.endpoint && last) {
      if (
        item.endpoint === 'hollow' &&
        options.preserveAspectRatio !== 'xMidYMid meet'
      ) {
        endpointMarkers.push(
          h('span', {
            class: 'rv-comparison-sparkline__endpoint',
            'aria-hidden': 'true',
            style: {
              left: `${last.x}%`,
              top: `${(last.y / 20) * 100}%`,
              borderColor: color,
            },
          }),
        );
      } else {
        points.push(
          h('circle', {
            class: 'rv-comparison-sparkline__point',
            cx: last.x,
            cy: last.y,
            r: 1.8,
            fill: item.endpoint === 'hollow' ? 'white' : color,
            ...(item.endpoint === 'hollow'
              ? { stroke: color, 'vector-effect': 'non-scaling-stroke' }
              : {}),
          }),
        );
      }
    }
  });
  const targets = options.tooltip
    ? Array.from({ length: count }, (_, index) => {
        const values = series.map((item) => item.values[index] ?? null);
        if (values.every((value) => value === null)) return null;
        const label = options.tooltip!(index, values);
        const left =
          count === 1 ? 0 : Math.max(0, ((index - 0.5) / (count - 1)) * 100);
        const right =
          count === 1
            ? 100
            : Math.min(100, ((index + 0.5) / (count - 1)) * 100);
        const x = count === 1 ? 50 : (index / (count - 1)) * 100;
        return h(
          'button',
          {
            type: 'button',
            class: 'rv-comparison-sparkline__target',
            style: { left: `${left}%`, width: `${right - left}%` },
            'aria-label': label,
            'data-tooltip': label,
            'tooltip-position': 'top',
          },
          [
            h('span', {
              class: 'rv-comparison-sparkline__cursor',
              style: { left: `${((x - left) / (right - left)) * 100}%` },
            }),
            ...values
              .map((value, seriesIndex) =>
                value === null
                  ? null
                  : h('span', {
                      class: 'rv-comparison-sparkline__marker',
                      style: {
                        left: `${((x - left) / (right - left)) * 100}%`,
                        top: `${(y(value) / 20) * 100}%`,
                        background: series[seriesIndex].color ?? 'currentColor',
                      },
                    }),
              )
              .filter(Boolean),
          ],
        );
      }).filter(Boolean)
    : [];
  return h(
    'div',
    {
      class: 'rv-comparison-sparkline',
      role: options.tooltip ? 'group' : 'img',
      'aria-label': options.label,
    },
    [
      h(
        'svg',
        {
          viewBox: '0 0 100 20',
          preserveAspectRatio: options.preserveAspectRatio ?? 'none',
          'aria-hidden': 'true',
        },
        [
          ...(defs.length ? [h('defs', {}, defs)] : []),
          ...areas,
          ...lines,
          ...points,
        ],
      ),
      ...endpointMarkers,
      ...targets,
    ],
  );
}
