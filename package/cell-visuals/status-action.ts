import type { ElementFactory } from './types';

export interface StatusActionOptions {
  label: string;
  /** The host controls semantic status names and presentation classes. */
  className?: string;
  actionClassName?: string;
  text?: string;
  /** Optional localized content for the host's tooltip system. */
  tooltip?: string;
  detail?: string;
  iconPaths?: readonly string[];
  /** Render an inactive state as text instead of an action. */
  asText?: boolean;
  hasPopup?: 'dialog' | 'menu' | 'listbox' | 'tree' | 'grid';
  onActivate: (event: MouseEvent) => void;
}

/** A compact, accessible action representing a status in a grid cell. */
export function renderStatusAction(h: ElementFactory, options: StatusActionOptions) {
  const icon = options.iconPaths && h('svg', {
    width: 15, height: 15, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'aria-hidden': 'true',
  }, options.iconPaths.map(d => h('path', { d })));
  if (options.asText) return h('span', { class: options.className }, options.text ?? '');
  return h('div', { class: ['rv-status-action', options.className].filter(Boolean).join(' ') }, [
    h('button', {
      type: 'button', class: ['rv-status-action__button', options.actionClassName].filter(Boolean).join(' '),
      title: options.label, 'aria-label': options.label, ...(options.hasPopup ? { 'aria-haspopup': options.hasPopup } : {}),
      ...(options.tooltip ? { 'data-tooltip': options.tooltip, 'tooltip-position': 'top' } : {}),
      onMouseDown: (event: MouseEvent) => event.stopPropagation(), onClick: options.onActivate,
    }, options.detail !== undefined ? [h('span', {}, options.text ?? ''), h('small', {}, options.detail)] : options.text ?? icon),
  ]);
}

export interface ProgressDetailOptions {
  value: number;
  max: number;
  label: string;
  valueText: string;
  detail?: string;
  className?: string;
}
/** A native progress indicator with an adjacent value and supporting detail. */
export function renderProgressDetail(h: ElementFactory, options: ProgressDetailOptions) {
  return h('div', { class: ['rv-progress-detail', options.className].filter(Boolean).join(' ') }, [
    h('div', {}, [h('progress', { max: options.max > 0 ? options.max : 1, value: options.value, 'aria-label': options.label }), h('small', {}, options.valueText)]),
    options.detail ? h('span', {}, options.detail) : null,
  ]);
}
