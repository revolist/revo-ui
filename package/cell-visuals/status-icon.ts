import type { ElementFactory } from './types';

/** Visual meaning of a status; labels and persisted values belong to the host. */
export type StatusIconKind = 'not-started' | 'pending' | 'passed' | 'failed';

/** Render a compact, decorative status icon. The surrounding control supplies its accessible name. */
export function renderStatusIcon(h: ElementFactory, kind: StatusIconKind) {
  const paths: Record<StatusIconKind, string> = {
    'not-started': '',
    pending: 'M12 6v6l4 2',
    passed: 'M8 12l3 3 5-6',
    failed: 'M9 9l6 6m0-6l-6 6',
  };
  return h('svg', {
    class: `rv-status-icon rv-status-icon--${kind}`,
    width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none',
    stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round',
    'stroke-linejoin': 'round', 'aria-hidden': 'true', focusable: 'false',
  }, [h('circle', { cx: 12, cy: 12, r: 10, ...(kind === 'not-started' ? { 'stroke-dasharray': '3 3' } : {}) }),
    ...(paths[kind] ? [h('path', { d: paths[kind] })] : []),
  ]);
}
