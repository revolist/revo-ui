import type { ElementFactory } from './types';

export interface FilledCircleOptions {
  value: number | null;
  /** Numeric range used only for visual fill. */
  min: number;
  max: number;
  /** Host-formatted value, including any units or missing-value text. */
  display: string;
  /** Localized description of the value and its status. */
  label: string;
  tone?: 'positive' | 'warning' | 'negative' | 'neutral';
}

/** A circular outline with a bottom-up fill and a caller-formatted value. */
export function renderFilledCircle(h: ElementFactory, options: FilledCircleOptions) {
  const { value, min, max } = options;
  const valid = value != null && Number.isFinite(value) && Number.isFinite(min) && Number.isFinite(max) && max > min && Number.isFinite(max - min);
  const fill = valid ? Math.max(0, Math.min(1, (value - min) / (max - min))) * 100 : 0;
  return h('div', { class: `rv-filled-circle is-${valid ? options.tone ?? 'neutral' : 'neutral'}`, role: 'img', 'aria-label': options.label }, [
    h('span', { class: 'rv-filled-circle__ring', 'aria-hidden': 'true' }, [
      h('span', { class: 'rv-filled-circle__interior' }, [
        h('span', { class: 'rv-filled-circle__fill', style: { height: `${fill}%` } }),
      ]),
    ]),
    h('span', { class: 'rv-filled-circle__value', 'aria-hidden': 'true' }, options.display),
  ]);
}
