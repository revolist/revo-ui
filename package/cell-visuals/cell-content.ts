import ellipsisIcon from '@fortawesome/fontawesome-free/svgs/solid/ellipsis.svg?raw';
import type { ElementFactory } from './types';

/** Text and image supplied by the application; no domain-specific formatting. */
export interface IdentityCellOptions {
  label: string;
  className?: string;
  actionClassName?: string;
  labelElement?: 'strong' | 'span';
  detailPosition?: 'below' | 'inline';
  prefix?: (h: ElementFactory) => unknown;
  detail?: string;
  image?: string;
  /** Optional domain-owned icon or image; takes precedence over image. */
  leading?: (h: ElementFactory) => unknown;
  badge?: { text: string; tone?: 'positive' | 'neutral'; className?: string };
  actionLabel?: string;
  onActivate?: (event: MouseEvent) => void;
}
export function renderIdentityCell(
  h: ElementFactory,
  options: IdentityCellOptions,
) {
  const label = options.onActivate
    ? h(
        'button',
        {
          type: 'button',
          class: ['rv-identity-cell__action', options.actionClassName]
            .filter(Boolean)
            .join(' '),
          'aria-label': options.actionLabel ?? options.label,
          title: options.actionLabel ?? options.label,
          onMouseDown: (event: MouseEvent) => event.stopPropagation(),
          onClick: options.onActivate,
        },
        options.label,
      )
    : h(options.labelElement ?? 'strong', {}, options.label);
  return h(
    'div',
    {
      class: [
        'rv-identity-cell',
        options.detailPosition === 'inline' && 'rv-identity-cell--inline',
        options.className,
      ]
        .filter(Boolean)
        .join(' '),
    },
    [
      ...(options.prefix ? [options.prefix(h)] : []),
      options.leading
        ? options.leading(h)
        : options.image
          ? h('img', {
              class: 'rv-identity-cell__image',
              src: options.image,
              alt: '',
            })
          : null,
      h('div', { class: 'rv-identity-cell__copy' }, [
        options.badge
          ? h('div', { class: 'rv-identity-cell__heading' }, [
              label,
              h(
                'span',
                {
                  class: `rv-identity-cell__badge is-${options.badge.tone ?? 'neutral'} ${options.badge.className ?? ''}`,
                },
                options.badge.text,
              ),
            ])
          : label,
        options.detail ? h('small', {}, options.detail) : null,
      ]),
    ],
  );
}

export interface StatusSegmentsOptions {
  label: string;
  detail?: string;
  segments: readonly {
    tone?: 'positive' | 'warning' | 'negative' | 'neutral';
    label?: string;
  }[];
}
export function renderStatusSegments(
  h: ElementFactory,
  options: StatusSegmentsOptions,
) {
  return h('div', { class: 'rv-status-segments' }, [
    h('div', { class: 'rv-status-segments__heading' }, [
      h('span', {}, options.label),
      options.detail ? h('small', {}, options.detail) : null,
    ]),
    h(
      'div',
      { class: 'rv-status-segments__marks' },
      options.segments.map((segment) =>
        h('i', {
          class: `is-${segment.tone ?? 'neutral'}`,
          ...(segment.label
            ? { role: 'img', 'aria-label': segment.label }
            : { 'aria-hidden': 'true' }),
        }),
      ),
    ),
  ]);
}

export interface CellActionOptions {
  label: string;
  text?: string;
  className?: string;
  content?: (h: ElementFactory) => unknown;
  expanded?: boolean;
  onActivate: (event: MouseEvent) => void;
}
export function renderCellAction(
  h: ElementFactory,
  options: CellActionOptions,
) {
  return h(
    'button',
    {
      type: 'button',
      class: ['rv-cell-action', options.className].filter(Boolean).join(' '),
      'aria-label': options.label,
      title: options.label,
      ...(options.expanded === undefined ? {} : { 'aria-expanded': String(options.expanded) }),
      onMouseDown: (event: MouseEvent) => event.stopPropagation(),
      onClick: options.onActivate,
    },
    options.content?.(h) ?? options.text ??
      h('span', {
        class: 'rv-cell-action__icon',
        'aria-hidden': 'true',
        innerHTML: ellipsisIcon,
      }),
  );
}
