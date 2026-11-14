import { h as preactH } from 'preact';
import { renderHeader } from './header';
import { renderItem } from './item';
import { renderStatusBadge } from './badge';
import { useAutoDismiss } from './use-auto-dismiss';
import type {
  StatusBadgeProps,
  StatusFeedbackH,
  StatusFeedbackPanelProps,
} from './types';

export { renderStatusBadge } from './badge';

/** One shared activity surface, with divided rows rather than nested notice cards. */
export function renderStatusFeedbackPanel<T>(
  h: StatusFeedbackH<T>,
  props: StatusFeedbackPanelProps,
): T | null {
  const { title, items, ariaLabel, className, popover, onCollapsedChange } =
    props;
  if (!items.length) {
    popover?.hide(true);
    return null;
  }
  const collapsed = popover?.collapsed ?? props.collapsed ?? false;
  const collapsible = !!(popover || onCollapsedChange);
  const setCollapsed = (next: boolean, event: Event) => {
    if (next && !popover) {
      const panel = (event.currentTarget as HTMLElement).closest(
        '.rv-status-feedback',
      );
      const focused = panel?.ownerDocument.activeElement;
      if (focused && panel?.contains(focused)) {
        panel
          .querySelector<HTMLButtonElement>('.rv-status-feedback__toggle')
          ?.focus({ preventScroll: true });
      }
    }
    popover?.setCollapsed(next);
    onCollapsedChange?.(next);
  };
  popover?.refresh();
  return h(
    'section',
    {
      onKeyDown: (event: KeyboardEvent) => {
        if (event.key === 'Escape' && collapsible && !collapsed) {
          event.preventDefault();
          event.stopPropagation();
          setCollapsed(true, event);
        }
      },
      ref: popover?.panelRef,
      id: popover?.id,
      class: [
        'rv-status-feedback',
        className,
        props.compact ? 'rv-status-feedback--compact' : '',
        props.hideHeader ? 'rv-status-feedback--headerless' : '',
        popover ? 'rv-status-feedback--popover' : '',
        collapsed ? 'rv-status-feedback--collapsed' : '',
      ]
        .filter(Boolean)
        .join(' '),
      'aria-label': ariaLabel ?? title,
      'data-collapsed': String(collapsed),
    },
    [
      props.hideHeader
        ? null
        : renderHeader(h, props, collapsed, collapsible, setCollapsed),
      h(
        'div',
        {
          id: popover ? `${popover.id}-items` : undefined,
          class: 'rv-status-feedback__items',
          hidden: collapsed,
        },
        items.map((item) => renderItem(h, item)),
      ),
    ],
  );
}

/** Preact adapters share the exact same presentation as RevoGrid template consumers. */
export function StatusFeedbackPanel(props: StatusFeedbackPanelProps) {
  const items = useAutoDismiss(
    props.items,
    props.autoDismissMs,
    props.onDismissItem,
  );
  return renderStatusFeedbackPanel(preactH, { ...props, items });
}
export function StatusBadge(props: StatusBadgeProps) {
  return renderStatusBadge(preactH, props);
}
