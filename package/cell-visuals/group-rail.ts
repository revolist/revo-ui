import type { ElementFactory } from './types';
import { renderExpandIcon } from './expand-icon';

/** A group navigation rail with a caller-composed detail area. */
export interface GroupRailOptions {
  title: string;
  actionLabel: string;
  expanded: boolean;
  className?: string;
  style?: Record<string, string | number>;
  parts?: {
    rail?: string;
    railContent?: string;
    icon?: string;
    label?: string;
    details?: string;
  };
  /** Compose editable controls and domain-specific summaries without coupling to the grid. */
  details: (h: ElementFactory) => unknown;
  onToggle: (event: MouseEvent) => void;
}
export function renderGroupRail(h: ElementFactory, options: GroupRailOptions) {
  const cls = (...values: (string | undefined)[]) =>
    values.filter(Boolean).join(' ');
  return h(
    'div',
    { class: cls('rv-group-rail', options.className), style: options.style },
    [
      h(
        'button',
        {
          type: 'button',
          class: cls('rv-group-rail__toggle', options.parts?.rail),
          'aria-label': options.actionLabel,
          'aria-expanded': String(options.expanded),
          onMouseDown: (event: MouseEvent) => event.stopPropagation(),
          onClick: options.onToggle,
        },
        h(
          'span',
          {
            class: cls('rv-group-rail__content', options.parts?.railContent),
            'aria-hidden': 'true',
          },
          [
            h(
              'span',
              { class: cls('rv-group-rail__icon', options.parts?.icon) },
              renderExpandIcon(h, options.expanded),
            ),
            h(
              'span',
              { class: cls('rv-group-rail__label', options.parts?.label) },
              options.title,
            ),
          ],
        ),
      ),
      options.expanded
        ? h(
            'div',
            { class: cls('rv-group-rail__details', options.parts?.details) },
            options.details(h),
          )
        : null,
    ],
  );
}
