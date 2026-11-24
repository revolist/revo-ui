import type { ElementFactory } from './types';

export type TargetActualTone = 'neutral' | 'positive' | 'warning' | 'negative' | 'muted';
/** Preformatted values and semantic presentation supplied by the application. */
export interface TargetActualOptions {
  target: string;
  actual: string;
  actualTone?: TargetActualTone;
  detail?: string;
  detailTone?: TargetActualTone;
  /** Localized description when the values need additional context. */
  label?: string;
}

/** Render a target above its actual value, with optional variance below. */
export function renderTargetActual(h: ElementFactory, options: TargetActualOptions) {
  return h('div', { class: 'rv-target-actual', ...(options.label ? { role: 'img', 'aria-label': options.label } : {}) }, [
    h('div', { class: 'rv-target-actual__card' }, [
      h('div', { class: 'rv-target-actual__target' }, options.target),
      h('div', { class: `rv-target-actual__actual is-${options.actualTone ?? 'neutral'}` }, options.actual),
    ]),
    options.detail != null ? h('div', { class: `rv-target-actual__detail is-${options.detailTone ?? 'neutral'}` }, options.detail) : null,
  ]);
}
