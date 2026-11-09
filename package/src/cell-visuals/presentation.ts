import { controlClassName } from '../control-presentation';
import type { ElementFactory } from './types';
import { renderProgressBar } from '../progress/bar';
export function renderProgressLine(
  h: ElementFactory,
  options: {
    percent: number;
    label: string;
    classes?: Record<string, boolean>;
  },
) {
  return h('div', { class: 'progress-line-container' }, [
    renderProgressBar(h, {
      value: options.percent,
      className: 'progress-line-background',
      fillClass: { 'progress-line-bar': true, ...options.classes },
      ariaLabel: options.label,
    }),
    h('span', { class: 'progress-line-label' }, options.label),
  ]);
}
export function renderProgressLineValue(
  h: ElementFactory,
  options: {
    percent: number;
    label: string;
    classes?: Record<string, boolean>;
  },
) {
  return h(
    'div',
    { class: controlClassName('progress-line-cell', options.classes) },
    [
      h('div', { class: 'cell-value', dir: 'auto' }, options.label),
      h('div', {
        class: 'progress-line-bar',
        style: { width: `${options.percent}%` },
      }),
      h('div', {
        class: 'progress-line-bar-shadow',
        style: { width: `${options.percent}%` },
      }),
      h('div', { class: 'progress-line-background' }),
    ],
  );
}
export function renderBadgeValue(
  h: ElementFactory,
  options: {
    value: unknown;
    backgroundColor?: string;
    color?: string;
    isDefault?: boolean;
    rectangular?: boolean;
    classes?: Record<string, boolean>;
  },
) {
  const { value } = options;
  if (value == null || (typeof value === 'string' && !value.trim())) return '';
  return h(
    'div',
    {
      class: controlClassName(
        'badge-cell',
        {
          default: options.isDefault ?? !options.backgroundColor,
          rectangular: options.rectangular,
        },
        options.classes,
      ),
      style: {
        '--badge-cell-value-background-color':
          options.backgroundColor ?? '#475569',
        '--badge-cell-value-color': options.color ?? '#ffffff',
      },
    },
    String(value),
  );
}
export function renderChange(
  h: ElementFactory,
  options: { value: number; label: unknown; classes?: Record<string, boolean> },
) {
  const { value, label } = options,
    kind = value > 0 ? 'positive' : value < 0 ? 'negative' : 'neutral';
  return h('div', { class: controlClassName('change-cell', options.classes) }, [
    h('div', { class: `change-${kind}` }, [
      h(
        'span',
        { class: 'change-value' },
        value < 0 ? `(${label})` : String(label),
      ),
      ...(value === 0
        ? []
        : [h('span', { class: 'change-icon' }, value > 0 ? '▲' : '▼')]),
    ]),
  ]);
}
export function renderThumbs(
  h: ElementFactory,
  value: boolean,
  labels = { true: 'True', false: 'False' },
) {
  return h('div', { class: 'thumb-cell' }, [
    h(
      'div',
      {
        class: `thumb thumb-${value ? 'up' : 'down'}`,
        title: value ? labels.true : labels.false,
      },
      value ? '👍' : '👎',
    ),
  ]);
}
export function renderTypeIcon(
  h: ElementFactory,
  options: { icon: string; className: string; title: string },
) {
  return h('span', {
    class: `column-icon ${options.className}`,
    title: options.title,
    innerHTML: options.icon,
  });
}
export function renderLabelledIcon(
  h: ElementFactory,
  options: { icon: unknown; label: string },
) {
  return h('div', { class: 'column-type-container' }, [
    options.icon,
    h('span', { class: 'column-label' }, options.label),
  ]);
}
export function renderPercentageSummary(
  h: ElementFactory,
  items: readonly {
    label: string;
    count: number;
    percentage: number;
    other?: boolean;
  }[],
) {
  return h(
    'ul',
    { class: 'summary-percentage-content' },
    items.map((item) =>
      h(
        'li',
        {
          class: `summary-percentage-item${item.other ? ' summary-percentage-others' : ''}`,
        },
        `${item.label} (${item.count}) ${item.percentage}%`,
      ),
    ),
  );
}
export function renderAggregateSummary(
  h: ElementFactory,
  items: readonly string[],
) {
  return h(
    'div',
    { class: 'summary-aggregate-content' },
    items.map((label) => h('div', { class: 'summary-aggregate-item' }, label)),
  );
}
