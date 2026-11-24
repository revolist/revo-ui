import type { ElementFactory } from './types';

/** Caller-formatted, actionable heat cell. The host owns thresholds and colors. */
export interface HeatActionOptions {
  label: string;
  value: string;
  detail: string;
  className?: string;
  tooltip?: string;
  /** Optional caller-owned metadata, keyed without the data- prefix. */
  data?: Readonly<Record<string, string>>;
  onActivate: (event: MouseEvent) => void;
}
export function renderHeatAction(h: ElementFactory, options: HeatActionOptions) {
  const data = Object.fromEntries(Object.entries(options.data ?? {}).map(([key, value]) => [`data-${key}`, value]));
  return h('button', {
    ...data,
    type: 'button',
    class: ['rv-heat-action', options.className].filter(Boolean).join(' '),
    'aria-label': options.label,
    ...(options.tooltip ? { 'data-tooltip': options.tooltip } : {}),
    onMouseDown: (event: MouseEvent) => event.stopPropagation(),
    onClick: options.onActivate,
  }, [h('span', {}, options.value), h('span', {}, options.detail)]);
}
