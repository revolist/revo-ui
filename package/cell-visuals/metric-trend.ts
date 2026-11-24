import type { ElementFactory } from './types';
import { renderMetricStack, type MetricStackOptions } from './metric-stack';

/** A caller-formatted metric with an optional visual underneath. */
export interface MetricTrendOptions extends MetricStackOptions {
  className?: string;
  visual?: (h: ElementFactory) => unknown;
  visualPosition?: 'before' | 'after';
}

export function renderMetricTrend(h: ElementFactory, options: MetricTrendOptions) {
  const metric = renderMetricStack(h, options);
  const visual = options.visual?.(h) ?? null;
  return h('div', { class: ['rv-metric-trend', options.className].filter(Boolean).join(' ') },
    options.visualPosition === 'before' ? [visual, metric] : [metric, visual]);
}
