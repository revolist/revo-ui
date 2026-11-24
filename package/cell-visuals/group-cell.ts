import type { ElementFactory } from './types';
import { renderExpandIcon } from './expand-icon';
export interface GroupCellOptions {
  label: string;
  actionLabel?: string;
  onActivate?: (event: MouseEvent) => void;
  expanded?: boolean;
  variant?: 'card' | 'inline' | 'tree';
  /** Optional subgroup chevron; the default preserves the standard group icon. */
  expandIcon?: 'chevron';
  className?: string;
  actionClassName?: string;
  labelClassName?: string;
  leading?: (h: ElementFactory) => unknown;
  /** Caller-owned content after the label and supporting text. */
  trailing?: (h: ElementFactory) => unknown;
  rank?: { label: string; tone?: 'gold' | 'silver' | 'bronze' | 'neutral' };
  detail?: string;
  summary?: {
    label: string;
    value: string;
    change?: string;
    map?: { paths: readonly string[]; activeIndex?: number; viewBox?: string };
  };
  fields?: readonly { label: string; value: string }[];
}
export function renderGroupCell(h: ElementFactory, options: GroupCellOptions) {
  const label = options.onActivate
    ? h(
        'button',
        {
          type: 'button',
          class: ['rv-group-cell__action', options.actionClassName]
            .filter(Boolean)
            .join(' '),
          'aria-label': options.actionLabel ?? options.label,
          title: options.actionLabel ?? options.label,
          'aria-expanded':
            options.expanded === undefined
              ? undefined
              : String(options.expanded),
          onMouseDown: (event: MouseEvent) => event.stopPropagation(),
          onClick: options.onActivate,
        },
        options.variant === 'tree'
          ? renderExpandIcon(h, options.expanded, options.expandIcon)
          : options.expanded !== undefined
            ? [h('span', { class: 'rv-group-cell__action-label' }, options.label), renderExpandIcon(h, options.expanded, options.expandIcon)]
            : options.label,
      )
    : h('strong', {}, options.label);
  const summary = options.summary;
  return h(
    'div',
    {
      class: `rv-group-cell ${options.variant === 'inline' ? 'rv-group-cell--inline' : options.variant === 'tree' ? 'rv-group-cell--tree' : 'rv-group-cell--card'} ${options.className ?? ''}`,
    },
    [
      h('div', { class: 'rv-group-cell__heading' }, [
        options.rank
          ? h(
              'span',
              {
                class: `rv-group-cell__rank is-${options.rank.tone ?? 'neutral'}`,
              },
              options.rank.label,
            )
          : null,
        ...(options.variant === 'tree'
          ? [options.onActivate ? label : null]
          : []),
        options.leading?.(h) ?? null,
        options.variant === 'tree'
          ? h('span', { class: options.labelClassName }, options.label)
          : label,
        options.detail ? h('small', {}, options.detail) : null,
        options.trailing?.(h) ?? null,
      ]),
      options.expanded && summary
        ? h('div', { class: 'rv-group-cell__details' }, [
            h('div', { class: 'rv-group-cell__summary' }, [
              summary.map
                ? h(
                    'svg',
                    {
                      class: 'rv-group-cell__map',
                      viewBox: summary.map.viewBox ?? '0 0 84 100',
                      'aria-hidden': 'true',
                    },
                    summary.map.paths.map((path, index) =>
                      h('path', {
                        d: path,
                        fill:
                          index === summary.map?.activeIndex
                            ? '#454545'
                            : '#e9e9e9',
                        stroke: '#fff',
                        'stroke-width': '0.6',
                      }),
                    ),
                  )
                : null,
              h('div', {}, [
                h('span', {}, summary.label),
                h('strong', {}, summary.value),
                summary.change ? h('small', {}, summary.change) : null,
              ]),
            ]),
            options.fields?.length
              ? h(
                  'dl',
                  {},
                  options.fields.flatMap((field) => [
                    h('dt', {}, field.label),
                    h('dd', {}, field.value),
                  ]),
                )
              : null,
          ])
        : null,
    ],
  );
}
