import closeIcon from '@fortawesome/fontawesome-free/svgs/solid/xmark.svg?raw';
import chevronUp from '@fortawesome/fontawesome-free/svgs/solid/chevron-up.svg?raw';
import chevronDown from '@fortawesome/fontawesome-free/svgs/solid/chevron-down.svg?raw';
import { statusIcon } from './icons';
import type {
  StatusFeedbackH,
  StatusFeedbackItem,
  StatusFeedbackPanelProps,
  StatusFeedbackTone,
} from './types';

function summary(items: readonly StatusFeedbackItem[]): {
  tone: StatusFeedbackTone;
  busy: boolean;
} {
  const tone = items.some((item) => item.tone === 'danger')
    ? 'danger'
    : items.some((item) => item.tone === 'warning')
      ? 'warning'
      : 'neutral';
  return { tone, busy: tone === 'neutral' && items.some((item) => item.busy) };
}

export function renderHeader<T>(
  h: StatusFeedbackH<T>,
  props: StatusFeedbackPanelProps,
  collapsed: boolean,
  collapsible: boolean,
  setCollapsed: (collapsed: boolean, event: Event) => void,
): T {
  const { title, items, localeText, popover } = props;
  const label = collapsed
    ? (props.expandLabel ?? localeText?.expand ?? 'Expand activity')
    : (props.collapseLabel ?? localeText?.collapse ?? 'Collapse activity');
  const state = summary(items);
  return h(
    'div',
    {
      class: 'rv-status-feedback__header',
      'aria-live': collapsed ? 'polite' : undefined,
      'aria-atomic': collapsed ? 'true' : undefined,
    },
    [
      collapsed ? statusIcon(h, state.tone, state.busy) : null,
      h('h3', { class: 'rv-status-feedback__heading' }, title),
      h(
        'span',
        {
          class: 'rv-count rv-status-feedback__count',
          'aria-label': localeText?.countLabel?.(items.length),
          'aria-hidden':
            !collapsed && !localeText?.countLabel ? 'true' : undefined,
        },
        localeText?.formatCount?.(items.length) ?? String(items.length),
      ),
      collapsible
        ? h(
            'button',
            {
              type: 'button',
              class: 'rv-btn-ghost rv-status-feedback__toggle',
              'aria-label': label,
              title: label,
              'aria-expanded': String(!collapsed),
              'aria-controls': popover ? `${popover.id}-items` : undefined,
              onClick: (event: MouseEvent) => {
                event.stopPropagation();
                setCollapsed(!collapsed, event);
              },
            },
            h('span', {
              class: 'rv-status-feedback__icon',
              'aria-hidden': 'true',
              innerHTML: collapsed ? chevronUp : chevronDown,
            }),
          )
        : null,
      props.onClose
        ? h(
            'button',
            {
              type: 'button',
              class: 'rv-btn-ghost rv-status-feedback__close',
              'aria-label': props.closeLabel ?? 'Close activity',
              title: props.closeLabel ?? 'Close activity',
              onClick: (event: MouseEvent) => {
                event.stopPropagation();
                props.onClose?.();
              },
            },
            h('span', {
              class: 'rv-status-feedback__icon',
              'aria-hidden': 'true',
              innerHTML: closeIcon,
            }),
          )
        : null,
    ],
  );
}
