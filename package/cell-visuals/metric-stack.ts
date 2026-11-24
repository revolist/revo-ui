import type { ElementFactory } from './types';

export interface MetricStackOptions {
  value: string;
  detail?: string;
  tone?: 'positive' | 'negative' | 'neutral';
  valueTone?: 'positive' | 'negative' | 'neutral' | 'muted';
  layout?: 'stacked' | 'inline';
  detailLabel?: string;
  trend?: 'up' | 'down';
}

/** Render caller-formatted primary and supporting metric text. */
export function renderMetricStack(
  h: ElementFactory,
  options: MetricStackOptions,
) {
  return h(
    'div',
    {
      class: `rv-metric-stack${options.layout === 'inline' ? ' rv-metric-stack--inline' : ''}`,
    },
    [
      h(
        'span',
        {
          class: `rv-metric-stack__value${options.valueTone ? ` is-${options.valueTone}` : ''}`,
        },
        options.value,
      ),
      options.detail
        ? h(
            'small',
            {
              class: `rv-metric-stack__detail is-${options.tone ?? 'neutral'}`,
              ...(options.detailLabel
                ? { 'aria-label': options.detailLabel }
                : {}),
            },
            options.trend
              ? [
                  h(
                    'svg',
                    {
                      viewBox: '0 0 24 24',
                      fill: 'none',
                      stroke: 'currentColor',
                      'stroke-width': '2',
                      'stroke-linecap': 'round',
                      'stroke-linejoin': 'round',
                      'aria-hidden': 'true',
                    },
                    [
                      h('path', {
                        d:
                          options.trend === 'down'
                            ? 'M22 17l-8-8-5 5-7-7M16 17h6v-6'
                            : 'M22 7l-8 8-5-5-7 7M16 7h6v6',
                      }),
                    ],
                  ),
                  h('span', {}, options.detail),
                ]
              : options.detail,
          )
        : null,
    ],
  );
}
