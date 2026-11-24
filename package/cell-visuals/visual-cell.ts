import type { ElementFactory } from './types';
import { renderExpandIcon } from './expand-icon';
import {
  METRIC_TILE_HISTORY_TOOLTIP,
  type MetricTileHistory,
} from './metric-tile-history';
import { renderStripPlot, type StripPlotOptions } from './strip-plot';

interface Base {
  className?: string;
  parts?: {
    action?: string;
    axis?: string;
    label?: string;
    value?: string;
    leaders?: string;
    symbol?: string;
    detail?: string;
  };
}
export type VisualCellPresentation =
  | (Base & {
      kind: 'text';
      text: string;
      element?: 'span' | 'strong' | 'small' | 'div';
      tone?: 'positive' | 'negative' | 'neutral';
      strong?: boolean;
      detail?: string;
      title?: string;
      actionLabel?: string;
      expanded?: boolean;
    })
  | (Base & { kind: 'empty'; hatch?: boolean })
  | (Base & {
      kind: 'heat-value';
      text: string;
      tone?:
        | 'very-positive'
        | 'positive'
        | 'warning'
        | 'negative'
        | 'very-negative'
        | 'neutral';
    })
  | (Base & {
      kind: 'rail';
      text?: string;
      actionLabel?: string;
      expanded?: boolean;
    })
  | (Base & {
      kind: 'badge';
      text: string;
      tone?: 'positive' | 'warning' | 'negative' | 'neutral';
    })
  | (Base & {
      kind: 'value-action';
      text: string;
      actionLabel?: string;
      suffix?: { text: string; label?: string };
    })
  | (Base & {
      kind: 'value-delta';
      text: string;
      detail?: string;
      tone?: 'positive' | 'negative' | 'neutral';
    })
  | (Base & {
      kind: 'summary';
      label?: string;
      value: string;
      items: readonly { label: string; value: string }[];
      axis?: readonly string[];
    })
  | (Base & {
      kind: 'section';
      /** Use a single-row summary for collapsed sections. */
      layout?: 'compact';
      title: string;
      label: string;
      value: string;
      expanded: boolean;
      actionLabel: string;
      leaders?: readonly {
        rank: string;
        label: string;
        color: string;
        path: string;
      }[];
    })
  | (Base & {
      kind: 'decision';
      text: string;
      tone?: 'positive' | 'warning' | 'negative' | 'neutral';
      badgeClassName?: string;
      actionLabel: string;
      actionText?: string;
    })
  | (Base & {
      kind: 'range';
      values: readonly [number, number, number];
      color: string;
      label: string;
      tooltip?: MetricTileHistory;
    })
  | (Base & {
      kind: 'bubbles';
      label: string;
      points: readonly {
        x: number;
        y: number;
        size: number;
        tone: 'positive' | 'negative';
        title?: string;
        tooltip?: MetricTileHistory;
      }[];
    })
  | (Base & {
      kind: 'stat-list';
      items: readonly { label: string; value: string }[];
    })
  | (Base & { kind: 'strip'; options: StripPlotOptions });

const classes = (...parts: (string | undefined | false)[]) =>
  parts.filter(Boolean).join(' ');
const percent = (value: number) =>
  Number.isFinite(value) ? Math.max(0, Math.min(100, value)) : 0;
/** Renderer-neutral cell presentation; all business logic and text remain caller-owned. */
export function renderVisualCell(
  h: ElementFactory,
  data: VisualCellPresentation,
  onActivate?: (event: MouseEvent) => void,
): ReturnType<ElementFactory> {
  const action = (label: string, text: unknown, expanded?: boolean) =>
    h(
      'button',
      {
        type: 'button',
        key: label,
        class: classes('rv-visual-cell__action', data.parts?.action),
        'aria-label': label,
        title: label,
        ...(expanded === undefined
          ? {}
          : { 'aria-expanded': String(expanded) }),
        onMouseDown: (event: MouseEvent) => event.stopPropagation(),
        onClick: onActivate,
      },
      text,
    );
  switch (data.kind) {
    case 'heat-value':
      return h(
        'span',
        {
          class: classes(
            'rv-visual-cell__heat',
            data.className,
            `is-${data.tone ?? 'neutral'}`,
          ),
        },
        data.text,
      );
    case 'rail':
      return h(
        'div',
        { class: classes('rv-visual-cell__rail', data.className) },
        data.actionLabel && onActivate
          ? [
              action(
                data.actionLabel,
                data.expanded === undefined
                  ? (data.text ?? '')
                  : [
                      renderExpandIcon(h, data.expanded),
                      h('span', {}, data.text ?? ''),
                    ],
                data.expanded,
              ),
            ]
          : data.text
            ? [h('span', { class: 'rv-visual-cell__rail-text' }, data.text)]
            : [],
      );
    case 'badge':
      return h(
        'span',
        {
          class: classes(
            'rv-visual-cell__badge',
            data.className,
            `is-${data.tone ?? 'neutral'}`,
          ),
        },
        data.text,
      );
    case 'value-action':
      if (data.actionLabel && onActivate)
        return h(
          'div',
          { class: classes('rv-visual-cell__value-action', data.className) },
          [
            action(data.actionLabel, data.text),
            data.suffix
              ? h(
                  'span',
                  data.suffix.label
                    ? { 'aria-label': data.suffix.label }
                    : { 'aria-hidden': 'true' },
                  data.suffix.text,
                )
              : null,
          ],
        );
      return h(
        'span',
        { class: classes('rv-visual-cell__value-action', data.className) },
        [
          h('span', {}, data.text),
          data.suffix
            ? h(
                'span',
                data.suffix.label
                  ? { 'aria-label': data.suffix.label }
                  : { 'aria-hidden': 'true' },
                data.suffix.text,
              )
            : null,
        ],
      );
    case 'value-delta':
      return h(
        'span',
        {
          class: classes(
            'rv-visual-cell__delta',
            data.className,
            `is-${data.tone ?? 'neutral'}`,
          ),
        },
        [
          data.detail
            ? h('small', { class: data.parts?.detail }, data.detail)
            : null,
          h('span', {}, data.text),
        ],
      );
    case 'text': {
      const className = classes(
        'rv-visual-cell__text',
        data.className,
        data.tone && `is-${data.tone}`,
        data.strong && 'is-strong',
      );
      if (data.actionLabel && onActivate)
        return action(
          data.actionLabel,
          data.expanded === undefined
            ? data.text
            : [renderExpandIcon(h, data.expanded), ' ', data.text],
          data.expanded,
        );
      if (data.detail !== undefined)
        return h('div', { class: className }, [
          h('strong', {}, data.text),
          h('small', {}, data.detail),
        ]);
      return h(
        data.element ?? 'span',
        { class: className, ...(data.title ? { title: data.title } : {}) },
        data.text,
      );
    }
    case 'empty':
      return h('div', {
        class: classes(
          'rv-visual-cell__empty',
          data.hatch && 'is-hatched',
          data.className,
        ),
        'aria-hidden': 'true',
      });
    case 'summary':
      return h('div', { class: classes('rv-visual-summary', data.className) }, [
        h('strong', {}, [
          data.label
            ? h('span', { class: data.parts?.label }, data.label)
            : null,
          h('span', { class: data.parts?.value }, data.value),
        ]),
        h(
          'div',
          {},
          data.items.map((item) =>
            h('span', {}, [h('small', {}, item.label), h('b', {}, item.value)]),
          ),
        ),
        data.axis
          ? h(
              'div',
              {
                class: classes('rv-visual-summary__axis', data.parts?.axis),
                'aria-hidden': 'true',
              },
              data.axis.map((label) => h('span', {}, label)),
            )
          : null,
      ]);
    case 'section':
      if (data.layout === 'compact') {
        return h(
          'div',
          { class: classes('rv-visual-section--compact', data.className) },
          [
            action(
              data.actionLabel,
              renderExpandIcon(h, data.expanded),
              data.expanded,
            ),
            h('span', { class: 'rv-visual-section__title' }, data.title),
            h('span', { class: 'rv-visual-section__value' }, data.value),
          ],
        );
      }
      return h('div', { class: classes('rv-visual-section', data.className) }, [
        h('span', {}, data.title),
        h('div', {}, [
          action(
            data.actionLabel,
            renderExpandIcon(h, data.expanded),
            data.expanded,
          ),
          h('small', {}, data.label),
          h('strong', {}, data.value),
          data.leaders?.length
            ? h(
                'div',
                {
                  class: classes(
                    'rv-visual-section__leaders',
                    data.parts?.leaders,
                  ),
                },
                data.leaders.map((leader) =>
                  h('span', {}, [
                    h('small', {}, leader.rank),
                    h(
                      'svg',
                      {
                        class: classes(
                          'rv-visual-section__symbol',
                          data.parts?.symbol,
                        ),
                        viewBox: '0 0 18 18',
                        fill: 'none',
                        stroke: 'currentColor',
                        'stroke-width': '1.2',
                        style: { color: leader.color },
                        'aria-hidden': 'true',
                      },
                      [h('path', { d: leader.path })],
                    ),
                    h('span', {}, leader.label),
                  ]),
                ),
              )
            : null,
        ]),
      ]);
    case 'decision':
      return h(
        'div',
        { class: classes('rv-visual-decision', data.className) },
        [
          h(
            'small',
            {
              class: classes(
                `is-${data.tone ?? 'neutral'}`,
                data.badgeClassName,
              ),
            },
            data.text,
          ),
          action(data.actionLabel, data.actionText ?? '⋮'),
        ],
      );
    case 'range':
      return h(
        'div',
        {
          class: classes('rv-visual-range', data.className),
          style: {
            '--rv-visual-color': data.color,
            '--low': `${percent(data.values[0])}%`,
            '--high': `${percent(data.values[2])}%`,
          },
          role: 'img',
          'aria-label': data.label,
          ...(data.tooltip
            ? {
                tabIndex: 0,
                'data-tooltip': JSON.stringify({
                  history: data.tooltip,
                  index: 1,
                }),
                'tooltip-type': METRIC_TILE_HISTORY_TOOLTIP,
                'tooltip-position': 'bottom',
              }
            : {}),
        },
        data.values.map((value) =>
          h('i', { style: { bottom: `${percent(value)}%` } }),
        ),
      );
    case 'bubbles':
      return h(
        'div',
        {
          class: classes('rv-visual-bubbles', data.className),
          role: data.points.some((point) => point.tooltip) ? 'group' : 'img',
          'aria-label': data.label,
        },
        data.points
          .filter(
            (point) =>
              Number.isFinite(point.x) &&
              Number.isFinite(point.y) &&
              Number.isFinite(point.size) &&
              point.size > 0,
          )
          .map((point) =>
            h('i', {
              class: point.tone === 'negative' ? 'loss' : 'profit',
              title: point.title,
              ...(point.tooltip
                ? {
                    tabIndex: 0,
                    role: 'button',
                    'aria-label': point.title ?? point.tooltip.title,
                    'data-tooltip': JSON.stringify({
                      history: point.tooltip,
                      index: -1,
                    }),
                    'tooltip-type': METRIC_TILE_HISTORY_TOOLTIP,
                    'tooltip-position': 'bottom',
                  }
                : {}),
              style: {
                left: `${percent(point.x)}%`,
                bottom: `${percent(point.y)}%`,
                width: `${point.size}px`,
                height: `${point.size}px`,
              },
            }),
          ),
      );
    case 'stat-list':
      return h(
        'div',
        { class: classes('rv-visual-stats', data.className) },
        data.items.flatMap((item) => [
          h('span', {}, item.label),
          h('strong', {}, item.value),
        ]),
      );
    case 'strip':
      return renderStripPlot(h, data.options);
  }
}
