import warningIcon from '@fortawesome/fontawesome-free/svgs/solid/circle-exclamation.svg?raw';
import savedIcon from '@fortawesome/fontawesome-free/svgs/regular/circle-check.svg?raw';
import pendingIcon from '@fortawesome/fontawesome-free/svgs/solid/circle-notch.svg?raw';
import type { StatusFeedbackH, StatusFeedbackTone } from './types';

export function statusIcon<T>(
  h: StatusFeedbackH<T>,
  tone: StatusFeedbackTone,
  busy: boolean,
) {
  const svg = busy
    ? pendingIcon
    : tone === 'success'
      ? savedIcon
      : tone === 'warning' || tone === 'danger'
        ? warningIcon
        : undefined;
  return svg
    ? h('span', {
        class: `rv-status-feedback__icon${busy ? ' rv-status-feedback__icon--busy' : ''}`,
        'aria-hidden': 'true',
        'data-tone': tone,
        innerHTML: svg,
      })
    : null;
}
