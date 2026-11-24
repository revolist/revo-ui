import type { ElementFactory } from './types';

/** Compact occupancy chart; all text and units are supplied by the host. */
export interface CapacityDotsOptions {
  value: number;
  capacity: number;
  text: string;
  label: string;
  tooltip?: string;
  muted?: boolean;
}

export function renderCapacityDots(h: ElementFactory, options: CapacityDotsOptions) {
  const capacity = Number.isFinite(options.capacity) ? Math.max(0, Math.min(100, Math.floor(options.capacity))) : 0;
  const count = Number.isFinite(options.value) ? Math.max(0, Math.min(capacity, Math.floor(options.value))) : 0;
  return h('span', {
    class: `rv-capacity-dots${options.muted ? ' is-muted' : ''}`, role: 'img', 'aria-label': options.label,
    ...(options.tooltip ? { tabIndex: 0, 'data-tooltip': options.tooltip, 'tooltip-position': 'top' } : {}),
  }, [
    h('span', { class: 'rv-capacity-dots__dots', 'aria-hidden': 'true' }, Array.from({ length: capacity }, (_, index) => h('i', { class: index < count ? 'is-filled' : '' }))),
    h('span', { class: 'rv-capacity-dots__text', 'aria-hidden': 'true' }, options.text),
  ]);
}
