import type { ElementFactory } from '../native-controls';
import './value.scss';
export interface TemporalValuePresentation {
  values: readonly string[];
  fullValue: string;
  multiple?: boolean;
  dir?: 'ltr' | 'rtl' | 'auto';
  maxVisibleDates?: number;
}
/** Shared read-only presentation, usable with Stencil, Preact or another element factory. */
export function renderTemporalValue(
  h: ElementFactory,
  options: TemporalValuePresentation,
) {
  const limit = Number.isFinite(options.maxVisibleDates)
    ? Math.max(1, Math.floor(options.maxVisibleDates!))
    : 2;
  const visible = options.multiple
    ? options.values.slice(0, limit)
    : options.values;
  const remaining = options.values.length - visible.length;
  return h(
    'span',
    {
      class: 'rv-temporal-value',
      role: options.fullValue ? 'group' : undefined,
      dir: options.dir ?? 'auto',
      title: options.fullValue || undefined,
      'data-tooltip': options.fullValue || undefined,
      'aria-label': options.fullValue || undefined,
    },
    [
      ...visible.map((value) =>
        h(
          'span',
          { class: 'rv-badge rv-temporal-value__item', 'aria-hidden': 'true' },
          value,
        ),
      ),
      remaining > 0
        ? h(
            'span',
            {
              class: 'rv-badge rv-temporal-value__more',
              'aria-hidden': 'true',
            },
            `+${remaining}`,
          )
        : null,
    ],
  );
}
