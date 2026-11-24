import type { ElementFactory } from './types';
import { renderExpandIcon } from './expand-icon';
export interface GroupSummarySegment {
  id: string;
  label: string;
  /** Proportion of the bar, in percent. */
  percent: number;
  pressed?: boolean;
  className?: string;
}
export interface GroupSummaryOptions {
  title: string;
  actionLabel: string;
  expanded: boolean;
  value: string;
  valueDetail?: string;
  description?: string;
  segments: readonly GroupSummarySegment[];
  className?: string;
  parts?: { heading?: string; value?: string; description?: string; bar?: string; segment?: string };
  onToggle: (event: MouseEvent) => void;
  onSegment: (id: string, event: MouseEvent) => void;
}
/** Render a grouped summary with caller-owned data and interactions. */
export function renderGroupSummary(h: ElementFactory, options: GroupSummaryOptions) {
  return h('div', { class: ['rv-group-summary', options.className].filter(Boolean).join(' ') }, [
    h('button', { type: 'button', class: ['rv-group-summary__heading', options.parts?.heading].filter(Boolean).join(' '), 'aria-expanded': String(options.expanded), 'aria-label': options.actionLabel, onMouseDown: (event: MouseEvent) => event.stopPropagation(), onClick: options.onToggle }, [h('span', {}, options.title), renderExpandIcon(h, options.expanded)]),
    h('p', { class: ['rv-group-summary__value', options.parts?.value].filter(Boolean).join(' ') }, [h('strong', {}, options.value), options.valueDetail ? h('span', {}, options.valueDetail) : null]),
    options.description ? h('p', { class: ['rv-group-summary__description', options.parts?.description].filter(Boolean).join(' ') }, options.description) : null,
    h('div', { class: ['rv-group-summary__bar', options.parts?.bar].filter(Boolean).join(' '), 'aria-hidden': 'true' }, options.segments.map(segment => h('i', { class: segment.className, style: { width: `${Number.isFinite(segment.percent) ? Math.max(0, Math.min(100, segment.percent)) : 0}%` } }))),
    ...options.segments.map(segment => h('button', { type: 'button', class: ['rv-group-summary__segment', options.parts?.segment, segment.className].filter(Boolean).join(' '), 'aria-pressed': String(!!segment.pressed), onMouseDown: (event: MouseEvent) => event.stopPropagation(), onClick: (event: MouseEvent) => options.onSegment(segment.id, event) }, segment.label)),
  ]);
}
