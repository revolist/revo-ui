import type { ElementFactory } from './types';

export interface DotHistogramTooltip { title: string; subtitle?: string; metricLabel: string; metricValue: string }
export interface DotHistogramOptions {
  values: readonly number[];
  /** Localized description of the distribution. */
  label: string;
  formatValue?: (value: number) => string;
  bins?: number;
  maxPoints?: number;
  maxStack?: number;
  tooltip?: (value: number, index: number) => DotHistogramTooltip;
  isHighlighted?: (value: number, index: number, level: number) => boolean;
}
/** A compact binned distribution with optional domain labels. */
export function renderDotHistogram(h: ElementFactory, options: DotHistogramOptions) {
  const entries = options.values.map((value, index) => ({ value, index })).filter(entry => Number.isFinite(entry.value));
  const values = entries.map(entry => entry.value);
  let min = values.length ? Infinity : 0;
  let max = values.length ? -Infinity : 0;
  for (const value of values) {
    min = Math.min(min, value);
    max = Math.max(max, value);
  }
  const bins = Number.isFinite(options.bins) ? Math.max(2, Math.floor(options.bins!)) : 21;
  const maxPoints = Number.isFinite(options.maxPoints) ? Math.max(0, Math.floor(options.maxPoints!)) : 50;
  const maxStack = Number.isFinite(options.maxStack) ? Math.max(0, Math.floor(options.maxStack!)) : 8;
  const levels = new Map<number, number>();
  const dots = entries.slice(0, maxPoints).flatMap(({ value, index }) => {
    const slot = max === min ? 0 : Math.round(((value - min) / (max - min)) * (bins - 1));
    const level = levels.get(slot) ?? 0;
    levels.set(slot, level + 1);
    if (level >= maxStack) return [];
    const point = options.tooltip?.(value, index);
    const props = { class: `rv-dot-histogram__dot ${options.isHighlighted?.(value, index, level) ? 'is-highlighted' : ''}`, style: { left: `${slot / (bins - 1) * 94}%`, bottom: `${level * 5}px` } };
    return [point ? h('button', { ...props, type: 'button', 'data-dot-index': index, 'aria-label': [point.title, point.subtitle, `${point.metricLabel}: ${point.metricValue}`].filter(Boolean).join(', ') }) : h('i', { ...props, 'aria-hidden': 'true' })];
  });
  return h('div', { class: 'rv-dot-histogram', role: options.tooltip ? 'group' : 'img', 'aria-label': options.label }, [
    h('div', { class: 'rv-dot-histogram__plot', ...(options.tooltip ? {} : { 'aria-hidden': 'true' }) }, dots),
    values.length && options.formatValue ? h('div', { class: 'rv-dot-histogram__axis', 'aria-hidden': 'true' }, [h('span', {}, options.formatValue(min)), h('span', {}, options.formatValue(max))]) : null,
  ]);
}
