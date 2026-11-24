import type { ElementFactory } from './types';
export interface ActionStripItem {
  label: string;
  className?: string;
  disabled?: boolean;
  dividerBefore?: boolean;
}
export interface ActionStripOptions {
  label: string;
  items: readonly ActionStripItem[];
  onActivate: (index: number, event: MouseEvent) => void;
  onPreview?: (index: number | undefined) => void;
}
/** Ordered, individually accessible actions for compact schedules and status strips. */
export function renderActionStrip(
  h: ElementFactory,
  options: ActionStripOptions,
) {
  return h(
    'div',
    { class: 'rv-action-strip', role: 'group', 'aria-label': options.label,
      onMouseLeave: () => options.onPreview?.(undefined),
    },
    options.items.map((item, index) =>
      h(
        'span',
        {
          class: ['rv-action-strip__item', item.dividerBefore && 'rv-action-strip__item--divider', item.className]
            .filter(Boolean)
            .join(' '),
        },
        [
          h(
            'button',
            {
              type: 'button',
              'aria-label': item.label,
              title: item.label,
              disabled: !!item.disabled,
              onMouseEnter: () => options.onPreview?.(index),
              onFocus: () => options.onPreview?.(index),
              onBlur: (event: FocusEvent) => {
                const strip = (event.currentTarget as HTMLElement).parentElement?.parentElement;
                if (!strip?.contains(event.relatedTarget as Node | null)) options.onPreview?.(undefined);
              },
              onMouseDown: (event: MouseEvent) => event.stopPropagation(),
              onClick: (event: MouseEvent) => {
                if (!item.disabled) options.onActivate(index, event);
              },
            },
            '',
          ),
        ],
      ),
    ),
  );
}
