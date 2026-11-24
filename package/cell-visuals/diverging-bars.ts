import type { ElementFactory } from './types';

export interface DivergingBarsOptions {
  value: unknown;
  /** Localized description covering the data and any important meaning. */
  label: string;
  /** Maximum absolute value shown; defaults to the largest finite magnitude. */
  maxAbs?: number;
  /** Zero-based emphasized bar index. */
  highlightIndex?: number;
}

/** Compact bars extending above or below a shared zero baseline. */
export function renderDivergingBars(
  h: ElementFactory,
  options: DivergingBarsOptions,
) {
  const values = Array.isArray(options.value)
    ? Array.from(options.value, (value) =>
        typeof value === 'number' && Number.isFinite(value) ? value : null,
      )
    : [];
  if (!values.some((value) => value !== null))
    return h(
      'div',
      { class: 'rv-diverging-bars rv-diverging-bars--empty' },
      '',
    );
  const computed = values.reduce<number>(
    (max, value) => (value === null ? max : Math.max(max, Math.abs(value))),
    0,
  );
  const maxAbs =
    Number.isFinite(options.maxAbs) && options.maxAbs! > 0
      ? options.maxAbs!
      : computed || 1;
  return h(
    'div',
    {
      class: 'rv-diverging-bars',
      role: 'img',
      'aria-label': options.label,
      title: options.label,
    },
    values.map((value, index) => {
      const classes = [
        'rv-diverging-bars__bar',
        value === null
          ? 'is-missing'
          : value < 0
            ? 'is-negative'
            : value > 0
              ? 'is-positive'
              : 'is-zero',
      ];
      if (index === options.highlightIndex) classes.push('is-highlighted');
      const amount =
        value === null ? 0 : Math.min(1, Math.abs(value) / maxAbs) * 50;
      return h('span', {
        class: classes.join(' '),
        'aria-hidden': 'true',
        style: { height: `${amount}%` },
      });
    }),
  );
}
