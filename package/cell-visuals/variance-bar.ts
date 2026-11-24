import type { ElementFactory } from './types';
export interface VarianceBarOptions {
  value: number;
  min: number;
  max: number;
  baseline?: number;
  reference?: number;
  /** Localized description of value, baseline and reference. */
  label: string;
}
/** One horizontal value extending to either side of a baseline. */
export function renderVarianceBar(
  h: ElementFactory,
  options: VarianceBarOptions,
) {
  const { value, min, max, label } = options;
  if (
    !Number.isFinite(value) ||
    !Number.isFinite(min) ||
    !Number.isFinite(max) ||
    max <= min ||
    !Number.isFinite(max - min)
  )
    return h('div', { class: 'rv-variance-bar rv-variance-bar--empty' }, '');
  const position = (v: number) =>
    Math.max(0, Math.min(1, (v - min) / (max - min))) * 100;
  const base = Number.isFinite(options.baseline) ? options.baseline! : 0;
  const origin = position(base),
    end = position(value);
  const children = [
    h('span', {
      class: 'rv-variance-bar__baseline',
      style: { left: `${origin}%` },
      'aria-hidden': 'true',
    }),
    h('span', {
      class: `rv-variance-bar__value ${value < base ? 'is-negative' : 'is-positive'}`,
      style: {
        left: `${Math.min(origin, end)}%`,
        width: `${Math.abs(end - origin)}%`,
      },
      'aria-hidden': 'true',
    }),
  ];
  if (
    typeof options.reference === 'number' &&
    Number.isFinite(options.reference)
  )
    children.push(
      h('span', {
        class: 'rv-variance-bar__reference',
        style: { left: `${position(options.reference)}%` },
        'aria-hidden': 'true',
      }),
    );
  return h(
    'div',
    { class: 'rv-variance-bar', role: 'img', 'aria-label': label },
    children,
  );
}
