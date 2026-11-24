import type { ElementFactory } from './types';

/** Localized column-menu trigger with an optional current sort direction. */
export interface SortMenuHeaderOptions {
  label: string;
  ariaLabel: string;
  direction?: 'asc' | 'desc';
  className?: string;
}
export function renderSortMenuHeader(h: ElementFactory, options: SortMenuHeaderOptions) {
  const path = options.direction === 'asc'
    ? 'M12 19V5m-5 5 5-5 5 5'
    : options.direction === 'desc'
      ? 'M12 5v14m-5-5 5 5 5-5'
      : 'm7 10 5-5 5 5M7 14l5 5 5-5';
  return h('button', {
    type: 'button', class: options.className,
    'aria-label': options.ariaLabel, 'aria-haspopup': 'menu', 'data-column-menu-trigger': '',
  }, [h('span', {}, options.label), h('svg', {
    viewBox: '0 0 24 24', 'aria-hidden': 'true', fill: 'none', stroke: 'currentColor',
    'stroke-width': '1.8', 'stroke-linecap': 'round', 'stroke-linejoin': 'round',
  }, [h('path', { d: path })])]);
}
