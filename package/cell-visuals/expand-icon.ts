import type { ElementFactory } from './types';

/** Indicator for expanding or collapsing a group. Accessible text belongs on its button. */
export function renderExpandIcon(h: ElementFactory, expanded = false, variant: 'default' | 'chevron' = 'default') {
  return h('svg', {
    class: `rv-expand-icon ${expanded ? 'is-collapse' : 'is-expand'}${variant === 'chevron' ? ' rv-expand-icon--chevron' : ''}`, width: variant === 'chevron' ? 12 : 8, height: 12, viewBox: variant === 'chevron' ? '0 0 12 12' : '0 0 8 12',
    fill: 'none', stroke: 'currentColor', 'stroke-width': 1, 'aria-hidden': 'true',
  }, [h('path', { d: variant === 'chevron' ? (expanded ? 'M2.5 4.5 6 8 9.5 4.5' : 'M4.5 2.5 8 6 4.5 9.5') : expanded ? 'M1.5 7.5 4 5 6.5 7.5' : 'M1.5 4 4 1.5 6.5 4M1.5 8 4 10.5 6.5 8' })]);
}
