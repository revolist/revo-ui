import type { ElementFactory } from './types';
import { renderCellAction } from './cell-content';

/** Caller-owned labels and actions for a compact grid header. */
export interface ColumnHeaderOptions {
  label: string;
  subtitle?: string;
  className?: string;
  action?: { label: string; content: (h: ElementFactory) => unknown; onActivate: (event: MouseEvent) => void; className?: string };
}
export function renderColumnHeader(h: ElementFactory, options: ColumnHeaderOptions) {
  return h('div', { class: options.className }, [
    h(options.subtitle ? 'strong' : 'span', {}, options.label),
    options.subtitle ? h('small', {}, options.subtitle) : null,
    options.action ? renderCellAction(h, options.action) : null,
  ]);
}
