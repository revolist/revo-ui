import { h, type ComponentChildren } from 'preact';
import { h as preactH } from 'preact';
import type { ElementFactory } from './native-controls';
import type { ClassPreset } from './presets/types';
import { renderMiniBarChart } from './metric-panel-trend';
import { PopoverController } from './core/popover-controller';
import { createControlId } from './core/control-id';

export type MetricTone = 'neutral' | 'positive' | 'negative';
const openMetricPopovers = new WeakMap<Document, PopoverController>();

/** Display-ready values; formatting and translations are supplied by the host. */
export interface MetricTileData {
  /** Localized name of the metric. */
  label: string;
  /** Formatted value shown prominently. */
  value: string | number;
  /** Optional formatted context or change. */
  detail?: string | number;
  /** Explicitly override the inferred tone of a signed value. */
  valueTone?: MetricTone;
  /** Override the inferred tone of the detail. */
  detailTone?: MetricTone;
  /** Compact heading with a color marker and optional comparison legend. */
  summary?: { markerColor: string; legend?: string; detailColor?: string };
  /** Optional illustrated card presentation; all labels and data are caller-owned. */
  visual?: {
    accent: string;
    icon?: ComponentChildren;
    /** Trusted bundled SVG markup, rendered as a decorative icon. */
    iconSvg?: string;
    showIcon?: boolean;
    detailLead?: string;
    detailRest?: string;
    detailTone?: MetricTone;
    trend?: readonly number[];
    progress?: {
      value: number;
      label: string;
      captionLead?: string;
      captionRest?: string;
    };
  };
}

export interface MetricTileProps extends MetricTileData {
  /** Show a compact icon and caller-formatted badge with the full visual tile on hover or focus. */
  compact?: { badge: string };
  /** Portable presentation preset. */
  preset?: ClassPreset;
  /** Additional host class. */
  className?: string;
  /** Optional extra content such as a compact chart. */
  children?: ComponentChildren;
}

export interface MetricPanelProps {
  /** Portable presentation preset. */
  preset?: ClassPreset;
  /** Metrics to render in the panel. */
  items?: readonly MetricTileData[];
  /** Accessible name for this group, supplied by the host. */
  label?: string;
  /** Additional host class. */
  className?: string;
  /** Compose individual MetricTile components or other content. */
  children?: ComponentChildren;
}

/** Explicit + numbers are positive; unsigned values retain the neutral style. */
function metricTone(value: string | number, override?: MetricTone): MetricTone {
  return (
    override ??
    (typeof value === 'string' &&
    /^\+\s*(?:\p{Sc}\s*)?(?:\p{Nd}|[.,]\p{Nd})/u.test(value.trim())
      ? 'positive'
      : 'neutral')
  );
}

/** Shared metric markup for Preact and renderer-neutral hosts. */
export function renderMetricTile<H extends ElementFactory>(
  h: H,
  props: MetricTileProps,
): ReturnType<H> {
  if (props.compact && props.visual && (props.visual.icon || props.visual.iconSvg)) {
    const icon = props.visual.icon;
    const id = createControlId('rv-metric-popover');
    const controller = new PopoverController();
    let anchor: HTMLButtonElement | null = null;
    let popup: HTMLElement | null = null;
    let closeTimer: ReturnType<typeof setTimeout> | undefined;
    const cancelClose = () => clearTimeout(closeTimer);
    const open = () => {
      cancelClose();
      if (!anchor || !popup || controller.isOpen) return;
      const document = anchor.ownerDocument;
      openMetricPopovers.get(document)?.close(false);
      openMetricPopovers.set(document, controller);
      anchor.setAttribute('aria-describedby', id);
      controller.open({
        anchor, content: popup, restoreFocus: false,
        onClose: () => {
          if (openMetricPopovers.get(document) === controller) openMetricPopovers.delete(document);
          anchor?.removeAttribute('aria-describedby');
        },
      });
    };
    const scheduleClose = () => {
      cancelClose();
      closeTimer = setTimeout(() => {
        if (anchor?.matches(':focus') || popup?.matches(':hover')) return;
        controller.close(false);
      }, 120);
    };
    return h('div', {
      class: 'rv-metric-tile-compact',
      style: { '--rv-metric-visual-accent': props.visual.accent },
    }, [
      h('button', {
        type: 'button',
        class: 'rv-metric-tile-compact__trigger',
        'aria-label': `${props.label}: ${props.compact.badge}`,
        ref: (element: HTMLButtonElement | null) => {
          if (!element) { cancelClose(); controller.destroy(); }
          anchor = element;
        },
        onMouseEnter: open,
        onMouseLeave: scheduleClose,
        onFocus: open,
        onBlur: scheduleClose,
      }, [
        h('span', {
          class: 'rv-metric-tile-compact__icon',
          'aria-hidden': 'true',
          ...(props.visual.iconSvg && !icon
            ? h === preactH
              ? { dangerouslySetInnerHTML: { __html: props.visual.iconSvg } }
              : { innerHTML: props.visual.iconSvg }
            : {}),
        }, icon),
        h('span', { class: 'rv-metric-tile-compact__badge', 'aria-hidden': 'true' }, props.compact.badge),
      ]),
      h('div', {
        ref: (element: HTMLElement | null) => { popup = element; },
        id, class: 'rv-popover rv-metric-tile-compact__popover', role: 'tooltip', hidden: true,
        onMouseEnter: cancelClose, onMouseLeave: scheduleClose,
      },
        renderMetricTile(h, { ...props, compact: undefined })),
    ]);
  }
  if (props.summary) {
    return h(
      'dl',
      {
        class: [
          'rv-metric-tile',
          'rv-metric-tile--summary',
          props.preset?.className,
          props.className,
        ]
          .filter(Boolean)
          .join(' '),
        style: {
          '--rv-metric-summary-marker': props.summary.markerColor,
          '--rv-metric-summary-detail': props.summary.detailColor ?? '#397d70',
        },
        'data-part': 'root',
      },
      [
        h('dt', { class: 'rv-metric-tile__label' }, props.label),
        h('div', { class: 'rv-metric-tile__summary-values' }, [
          h(
            'dd',
            { class: 'rv-metric-tile__value' },
            h('strong', {}, props.value),
          ),
          props.detail === undefined
            ? null
            : h('dd', { class: 'rv-metric-tile__detail' }, props.detail),
        ]),
        props.summary.legend
          ? h('span', { class: 'rv-metric-tile__legend' }, props.summary.legend)
          : null,
        props.children == null
          ? null
          : h(
              'dd',
              { class: 'rv-metric-tile__extra', 'data-part': 'extra' },
              props.children,
            ),
      ],
    );
  }
  if (props.visual) {
    const { visual } = props;
    const value = visual.progress?.value;
    const progressValue =
      typeof value === 'number' && Number.isFinite(value)
        ? Math.max(0, Math.min(100, value))
        : 0;
    const trend =
      visual.trend?.filter((value) => Number.isFinite(value) && value >= 0) ??
      [];
    const hasIcon =
      visual.showIcon !== false && (visual.icon != null || !!visual.iconSvg);
    return h(
      'dl',
      {
        class: [
          'rv-metric-tile',
          'rv-metric-tile--visual',
          !hasIcon && 'rv-metric-tile--no-icon',
          props.preset?.className,
          props.className,
        ]
          .filter(Boolean)
          .join(' '),
        style: { '--rv-metric-visual-accent': visual.accent },
        'data-part': 'root',
      },
      [
        !hasIcon
          ? null
          : h(
              'span',
              {
                class: 'rv-metric-tile__icon',
                'aria-hidden': 'true',
                ...(visual.iconSvg && visual.icon == null
                  ? h === preactH
                    ? { dangerouslySetInnerHTML: { __html: visual.iconSvg } }
                    : { innerHTML: visual.iconSvg }
                  : {}),
              },
              visual.icon,
            ),
        h('div', { class: 'rv-metric-tile__body' }, [
          h(
            'dt',
            { class: 'rv-metric-tile__label', 'data-part': 'label' },
            props.label,
          ),
          h(
            'dd',
            { class: 'rv-metric-tile__value', 'data-part': 'value' },
            props.value,
          ),
          visual.detailLead !== undefined || visual.detailRest !== undefined
            ? h(
                'dd',
                {
                  class: `rv-metric-tile__detail is-${visual.detailTone ?? 'accent'}`,
                  'data-part': 'detail',
                },
                [h('b', {}, visual.detailLead ?? ''), visual.detailRest ?? ''],
              )
            : props.detail !== undefined
              ? h(
                  'dd',
                  { class: 'rv-metric-tile__detail', 'data-part': 'detail' },
                  props.detail,
                )
              : null,
        ]),
        trend.length
          ? h(
              'div',
              { class: 'rv-metric-tile__trend', 'aria-hidden': 'true' },
              renderMiniBarChart(h, { value: trend, minValue: 0 }),
            )
          : null,
        visual.progress
          ? h('progress', {
              class: 'rv-metric-tile__progress',
              max: 100,
              value: progressValue,
              'aria-label': visual.progress.label,
            })
          : null,
        visual.progress &&
        (visual.progress.captionLead !== undefined ||
          visual.progress.captionRest !== undefined)
          ? h('dd', { class: 'rv-metric-tile__caption' }, [
              h('b', {}, visual.progress.captionLead ?? ''),
              visual.progress.captionRest ?? '',
            ])
          : null,
        props.children == null
          ? null
          : h(
              'dd',
              { class: 'rv-metric-tile__extra', 'data-part': 'extra' },
              props.children,
            ),
      ],
    );
  }
  const detail = props.detail;
  return h(
    'dl',
    {
      class: ['rv-metric-tile', props.preset?.className, props.className]
        .filter(Boolean)
        .join(' '),
      'data-part': 'root',
    },
    [
      h(
        'dt',
        { class: 'rv-metric-tile__label', 'data-part': 'label' },
        props.label,
      ),
      h(
        'dd',
        {
          class: `rv-metric-tile__value is-${metricTone(props.value, props.valueTone)}`,
          'data-part': 'value',
        },
        props.value,
      ),
      detail !== undefined && detail !== null
        ? h(
            'dd',
            {
              class: `rv-metric-tile__detail is-${metricTone(detail, props.detailTone)}`,
              'data-part': 'detail',
            },
            detail,
          )
        : null,
      props.children == null
        ? null
        : h(
            'dd',
            { class: 'rv-metric-tile__extra', 'data-part': 'extra' },
            props.children,
          ),
    ],
  );
}

/** Compose caller-provided metric data and/or tiles in the same responsive panel. */
export function renderMetricPanel(h: ElementFactory, props: MetricPanelProps) {
  return h(
    'div',
    {
      class: ['rv-metric-panel', props.preset?.className, props.className]
        .filter(Boolean)
        .join(' '),
      'data-part': 'root',
      ...(props.label ? { role: 'group', 'aria-label': props.label } : {}),
    },
    [
      ...(props.items ?? []).map((item) => renderMetricTile(h, item)),
      props.children,
    ],
  );
}

export function MetricTile(props: MetricTileProps) {
  return renderMetricTile(h, props);
}

export function MetricPanel(props: MetricPanelProps) {
  return renderMetricPanel(h, props);
}
