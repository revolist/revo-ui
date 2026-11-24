import type { ElementFactory } from './types';
import { METRIC_TILE_HISTORY_TOOLTIP, type MetricTileHistory } from './metric-tile-history';

/** Renderer-neutral target comparison. Values use the same numeric domain. */
export interface BulletChartOptions {
  outlook: number | null;
  actual?: number | null;
  target?: number | null;
  min?: number;
  max: number;
  /** Localized description supplied by the consumer, including for missing data. */
  label: string;
  /** Optional text shown beside the chart. */
  display?: string;
  /** Optional localized detail displayed by a compatible tooltip host. */
  tooltip?: MetricTileHistory;
}

export function renderBulletChart(h: ElementFactory, options: BulletChartOptions) {
  const { outlook, label } = options;
  const tooltip = options.tooltip ? { tabIndex: 0, 'data-tooltip': JSON.stringify({ history: options.tooltip, index: -1 }), 'tooltip-type': METRIC_TILE_HISTORY_TOOLTIP, 'tooltip-position': 'top' } : {};
  if (outlook == null || !Number.isFinite(outlook)) {
    return h('span', { class: 'rv-bullet-chart__empty', ...tooltip }, label);
  }
  const min = Number.isFinite(options.min) ? options.min! : 0;
  const max = Number.isFinite(options.max) && options.max > min ? options.max : min + 1;
  const position = (value: number) => `${Math.max(0, Math.min(1, (value - min) / (max - min))) * 100}%`;
  const target = options.target != null && Number.isFinite(options.target) ? options.target : null;
  const actual = options.actual != null && Number.isFinite(options.actual) ? options.actual : null;
  const chart = h('div', {
    class: `rv-bullet-chart${target === null ? '' : outlook >= target ? ' is-on-target' : ' is-below-target'}`,
    role: 'img', 'aria-label': label, title: label, ...tooltip,
  }, [
    h('span', { class: 'rv-bullet-chart__outlook', style: { width: position(outlook) } }),
    ...(actual === null ? [] : [h('span', { class: 'rv-bullet-chart__actual', style: { width: position(actual) } })]),
    ...(target === null ? [] : [h('span', { class: 'rv-bullet-chart__target', style: { left: position(target) } })]),
    h('span', { class: 'rv-bullet-chart__point', style: { left: position(outlook) } }),
  ]);
  return options.display === undefined ? chart : h('div', { class: 'rv-bullet-chart-value' }, [chart, h('span', {}, options.display)]);
}
