import { statusIcon } from './icons';
import type { StatusBadgeProps, StatusFeedbackH } from './types';

/** Stateless status badge; labels and status transitions belong to the consumer. */
export function renderStatusBadge<T>(
  h: StatusFeedbackH<T>,
  {
    label,
    tone = 'neutral',
    busy = false,
    className,
    preset,
  }: StatusBadgeProps,
): T {
  return h(
    'span',
    {
      class: ['rv-status-badge', preset?.className, className]
        .filter(Boolean)
        .join(' '),
      'data-part': 'root',
      'data-tone': tone,
    },
    [statusIcon(h, tone, busy), h('span', {}, label)],
  );
}
