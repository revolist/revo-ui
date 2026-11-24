import type { ElementFactory } from './types';
import type { MetricTileHistory } from './metric-tile-history';
export interface DottedComparisonOptions {
  values: readonly number[];
  references?: readonly number[];
  /** Shared positive maximum, to compare multiple chart segments consistently. */
  maximum: number;
  label: string;
  columnWidth?: number;
  /** Localized per-column content, used by the native tooltip adapter. */
  tooltip?: (value: number, reference: number | undefined, index: number) => MetricTileHistory;
}
/** Compact dotted bars with optional comparison markers. */
export function renderDottedComparison(h: ElementFactory, options: DottedComparisonOptions) {
  const maximum = Number.isFinite(options.maximum) && options.maximum > 0 ? options.maximum : 1;
  const percent = (value: number) => Number.isFinite(value) ? Math.max(0, Math.min(100, value / maximum * 100)) : 0;
  const width = Number.isFinite(options.columnWidth) ? Math.max(1, options.columnWidth!) : 54;
  return h('div', { class: 'rv-dotted-comparison', role: options.tooltip ? 'group' : 'img', 'aria-label': options.label }, options.values.map((value, index) => h(options.tooltip ? 'button' : 'div', { class: 'rv-dotted-comparison__column', style: { width: `${width}px` }, ...(options.tooltip ? { type: 'button', 'data-comparison-index': index, 'aria-label': options.tooltip(value, options.references?.[index], index).title } : { 'aria-hidden': 'true' }) }, [
    h('span', { class: 'rv-dotted-comparison__bar', style: { height: `${percent(value)}%` } }),
    options.references?.[index] === undefined ? null : h('span', { class: 'rv-dotted-comparison__marker', style: { bottom: `${percent(options.references[index])}%` } }),
  ])));
}
export interface StackedDotPoint { x: number; y: number; tone?: 'primary' | 'secondary' }
export interface StackedDotPlotOptions {
  label: string;
  /** Prepositioned marks: x is percent, y is pixels from the bottom. */
  points: readonly StackedDotPoint[];
  /** Localized details for each interactive point; index refers to the original points array. */
  pointTooltip?: (point: StackedDotPoint, index: number) => MetricTileHistory;
  reference?: number;
  /** Optional overall tooltip content for the native adapter. */
  tooltip?: MetricTileHistory;
}
/** Display caller-positioned marks without coupling the renderer to a domain. */
export function renderStackedDotPlot(h: ElementFactory, options: StackedDotPlotOptions) {
  const clamp = (n: number, max: number) => Number.isFinite(n) ? Math.max(0, Math.min(max, n)) : 0;
  return h('div', { class: 'rv-stacked-dot-plot', role: options.pointTooltip ? 'group' : 'img', 'aria-label': options.label, ...(options.tooltip ? { tabIndex: 0, 'data-summary-tooltip': '' } : {}) }, [
    options.reference === undefined ? null : h('span', { class: 'rv-stacked-dot-plot__reference', style: { left: `${clamp(options.reference, 100)}%` }, 'aria-hidden': 'true' }),
    ...options.points.flatMap((point, index) => {
      if (!Number.isFinite(point.x) || !Number.isFinite(point.y)) return [];
      const details = options.pointTooltip?.(point, index);
      const props = { class: `rv-stacked-dot-plot__point${point.tone === 'secondary' ? ' is-secondary' : ''}`, style: { left: `${clamp(point.x, 100)}%`, bottom: `${Math.max(0, point.y)}px` } };
      return [details ? h('button', { ...props, type: 'button', 'data-point-index': index, 'aria-label': [details.title, details.subtitle, ...details.rows.map(row => `${row.label}: ${row.value}`)].filter(Boolean).join(', ') }) : h('i', { ...props, 'aria-hidden': 'true' })];
    }),
  ]);
}
