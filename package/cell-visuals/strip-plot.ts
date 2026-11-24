import type { ElementFactory } from './types';
import { METRIC_TILE_HISTORY_TOOLTIP, type MetricTileHistory } from './metric-tile-history';

export interface StripPlotPoint {
  value: number;
  /** Diameter in CSS pixels. */
  size?: number;
  color?: string;
  /** Optional one-pixel outline for a point. */
  borderColor?: string;
  title?: string;
  /** Localized details shown on hover and keyboard focus. */
  tooltip?: MetricTileHistory;
}
export interface StripPlotOptions {
  points: readonly StripPlotPoint[];
  /** Localized description, including any meaning conveyed by marks. */
  label: string;
  domain: { min: number; max: number };
  reverse?: boolean;
  reference?: number;
  zero?: number;
}
/** Render compact point positions on a caller-specified domain. */
export function renderStripPlot(h: ElementFactory, options: StripPlotOptions) {
  const { min, max } = options.domain;
  if (
    !Number.isFinite(min) ||
    !Number.isFinite(max) ||
    min >= max ||
    !Number.isFinite(max - min)
  ) {
    return h('div', { class: 'rv-strip-plot rv-strip-plot--empty' }, '');
  }
  const position = (value: number) => {
    const normalized = Math.max(0, Math.min(1, (value - min) / (max - min)));
    return (options.reverse ? 1 - normalized : normalized) * 100;
  };
  const children: any[] = [];
  if (typeof options.zero === 'number' && Number.isFinite(options.zero)) {
    const zero = position(options.zero);
    children.push(
      h('span', {
        class: 'rv-strip-plot__zero',
        style: options.reverse
          ? { left: `${zero}%`, width: `${100 - zero}%` }
          : { left: '0%', width: `${zero}%` },
        'aria-hidden': 'true',
      }),
    );
  }
  if (
    typeof options.reference === 'number' &&
    Number.isFinite(options.reference)
  ) {
    children.push(
      h('span', {
        class: 'rv-strip-plot__reference',
        style: { left: `${position(options.reference)}%` },
        'aria-hidden': 'true',
      }),
    );
  }
  for (const point of options.points) {
    if (
      !point ||
      typeof point.value !== 'number' ||
      !Number.isFinite(point.value)
    )
      continue;
    const size =
      typeof point.size === 'number' &&
      Number.isFinite(point.size) &&
      point.size > 0
        ? point.size
        : 6;
    children.push(
      h(point.tooltip ? 'button' : 'span', {
        class: 'rv-strip-plot__point',
        style: {
          left: `${position(point.value)}%`,
          width: `${size}px`,
          height: `${size}px`,
          ...(point.color ? { backgroundColor: point.color } : {}),
          ...(point.borderColor
            ? { border: `1px solid ${point.borderColor}` }
            : {}),
        },
        ...(point.tooltip ? {
          type: 'button',
          'aria-label': point.title ?? point.tooltip.title,
          'data-tooltip': JSON.stringify({ history: point.tooltip, index: -1 }),
          'tooltip-type': METRIC_TILE_HISTORY_TOOLTIP,
          'tooltip-position': 'top',
          onMouseDown: (event: MouseEvent) => event.stopPropagation(),
        } : { title: point.title, 'aria-hidden': 'true' }),
      }),
    );
  }
  return h(
    'div',
    { class: 'rv-strip-plot', role: options.points.some((point) => !!point?.tooltip) ? 'group' : 'img', 'aria-label': options.label },
    children,
  );
}
