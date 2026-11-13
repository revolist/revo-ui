import { statusIcon } from './icons';
import { badgeClassName } from '../badge';
import { avatarTemplate } from '../avatar';
import type { StatusFeedbackH, StatusFeedbackItem } from './types';

export function renderItem<T>(
  h: StatusFeedbackH<T>,
  item: StatusFeedbackItem,
): T {
  const tone = item.tone ?? 'neutral';
  const actions = item.actions ?? [];
  return h(
    'div',
    {
      ...item.data,
      key: item.id,
      class: [
        'rv-status-feedback__item',
        actions.length > 1 ? 'rv-status-feedback__item--multiple-actions' : '',
        item.className,
      ]
        .filter(Boolean)
        .join(' '),
      'data-tone': tone,
      role: tone === 'warning' || tone === 'danger' ? 'alert' : 'status',
      'aria-atomic': 'true',
    },
    [
      statusIcon(h, tone, !!item.busy),
      h('div', { class: 'rv-status-feedback__copy' }, [
        h('div', { class: 'rv-status-feedback__title' }, item.title),
        item.badges?.length || item.avatars?.length
          ? h('div', { class: 'rv-status-feedback__badges' }, [
              ...(item.badges ?? []).map((badge) =>
                h('span', { class: badgeClassName(badge) }, badge.label),
              ),
              item.avatars?.length
                ? h(
                    'span',
                    { class: 'rv-status-feedback__avatars' },
                    item.avatars.map((avatar) => avatarTemplate(h, avatar)),
                  )
                : null,
            ])
          : null,
        item.description
          ? h(
              'div',
              { class: 'rv-status-feedback__description' },
              item.description,
            )
          : null,
        item.detail
          ? h('div', { class: 'rv-status-feedback__detail' }, item.detail)
          : null,
      ]),
      actions.length
        ? h(
            'div',
            { class: 'rv-status-feedback__actions' },
            actions.map((action) =>
              h(
                'button',
                {
                  key: action.id,
                  type: 'button',
                  disabled: action.disabled,
                  class: `${action.appearance === 'primary' ? 'rv-btn-solid' : action.appearance === 'ghost' ? 'rv-btn-ghost' : 'rv-btn'} rv-status-feedback__action`,
                  'aria-label': action.ariaLabel,
                  onClick: (event: MouseEvent) => {
                    event.stopPropagation();
                    if (!action.disabled) action.onClick(event);
                  },
                },
                action.label,
              ),
            ),
          )
        : null,
    ],
  );
}
