import type { ElementFactory } from './types';

export type DiagonalSplitTone = 'neutral' | 'muted' | 'positive' | 'positive-strong' | 'warning' | 'negative' | 'negative-strong';
export interface DiagonalSplitPart {
  /** Formatted display value. A nullish value leaves this half empty. */
  value: string | number | null | undefined;
  tone?: DiagonalSplitTone;
}
export interface DiagonalSplitOptions {
  upper?: DiagonalSplitPart;
  lower?: DiagonalSplitPart;
  /** Localized description of both values and any meaning conveyed by color. */
  label: string;
}

/** Render two caller-formatted values in a diagonally split cell. */
export function renderDiagonalSplit(h: ElementFactory, options: DiagonalSplitOptions) {
  const upper = options.upper?.value;
  const lower = options.lower?.value;
  if (upper == null && lower == null) return null;
  return h('div', { class: 'rv-diagonal-split', role: 'img', 'aria-label': options.label }, [
    lower != null ? h('span', { class: `rv-diagonal-split__lower-bg is-${options.lower?.tone ?? 'muted'}`, 'aria-hidden': 'true' }) : null,
    upper != null ? h('span', { class: `rv-diagonal-split__upper-bg is-${options.upper?.tone ?? 'neutral'}`, 'aria-hidden': 'true' }) : null,
    upper != null ? h('span', { class: 'rv-diagonal-split__upper', 'aria-hidden': 'true' }, String(upper)) : null,
    lower != null ? h('span', { class: 'rv-diagonal-split__lower', 'aria-hidden': 'true' }, String(lower)) : null,
  ]);
}
