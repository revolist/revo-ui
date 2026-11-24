import type { ElementFactory } from './types';

export interface TrendSummaryPoint {
  value: number | null;
  /** Localized period and value, shown by the grid tooltip on hover or focus. */
  label: string;
}
export interface TrendSummaryHeaderOptions {
  label: string;
  value: string;
  change?: string;
  changeTone?: 'positive' | 'negative' | 'neutral';
  color: string;
  domain: { min: number; max: number };
  points: readonly TrendSummaryPoint[];
  /** Localized description of the trend. */
  trendLabel: string;
}

/** KPI summary and chronological dotted trend; data and localization are host-owned. */
export function renderTrendSummaryHeader(h: ElementFactory, options: TrendSummaryHeaderOptions) {
  const { min, max } = options.domain;
  const validDomain = Number.isFinite(min) && Number.isFinite(max) && max > min && Number.isFinite(max - min);
  return h('div', { class: 'rv-trend-summary-header', style: { '--rv-trend-summary-color': options.color } }, [
    h('div', { class: 'rv-trend-summary-header__summary' }, [
      h('div', { class: 'rv-trend-summary-header__label' }, [h('span', { class: 'rv-trend-summary-header__swatch', 'aria-hidden': 'true' }), h('span', {}, options.label)]),
      h('div', { class: 'rv-trend-summary-header__metrics' }, [h('strong', {}, options.value), options.change == null ? null : h('span', { class: `rv-trend-summary-header__change is-${options.changeTone ?? 'neutral'}` }, options.change)]),
    ]),
    h('div', { class: 'rv-trend-summary-header__plot', role: 'group', 'aria-label': options.trendLabel }, options.points.map((point, index) => {
      const valid = validDomain && point.value != null && Number.isFinite(point.value);
      const height = valid ? Math.max(0, Math.min(1, (point.value! - min) / (max - min))) * 100 : 0;
      return h('button', {
        type: 'button', class: `rv-trend-summary-header__period${index === options.points.length - 1 ? ' is-latest' : ''}`,
        'aria-label': point.label, 'data-tooltip': point.label, 'tooltip-position': 'top',
        onMouseDown: (event: MouseEvent) => event.stopPropagation(),
        onClick: (event: MouseEvent) => event.stopPropagation(),
      }, [h('span', { class: 'rv-trend-summary-header__fill', style: { height: `${height}%` }, 'aria-hidden': 'true' })]);
    })),
  ]);
}
