import { h, type ComponentChildren } from 'preact';
import { useEffect, useLayoutEffect, useRef } from 'preact/hooks';
import { Button, Toolbar, ToolbarGroup, ToolbarSeparator } from './controls';
import { RemoveButton } from './buttons/remove-button';
import { getDialogFocusableElements } from './dialog/dialog.dom';
import { SvgIcon } from './icons';
import type { ClassPreset } from './presets/types';

export interface ActionBarAction {
  /** Stable action identifier returned to the host. */
  id: string;
  /** Visible, localized action name. */
  label: string;
  /** Optional trusted SVG markup. */
  icon?: string;
  variant?: 'ghost' | 'primary' | 'danger-outline';
  disabled?: boolean;
}

export interface ActionBarProps {
  /** Accessible name of the bulk actions toolbar. */
  label: string;
  /** Number of selected items. A positive count opens the bar by default. */
  count: number;
  /** Localized summary of the selection, for example “3 files selected”. */
  selectionLabel: string;
  /** Override the visibility derived from count. */
  open?: boolean;
  /** Localized name of the dismiss button. */
  closeLabel?: string;
  /** Handle close requests from the dismiss button or Escape. */
  onOpenChange?: (open: boolean) => void;
  /** Allow Escape to request dismissal. Defaults to true. */
  closeOnEscape?: boolean;
  /** Logical bottom placement and optional CSS length from the edge. */
  positioning?: {
    placement?: 'bottom' | 'bottom-start' | 'bottom-end';
    gutter?: string;
    mode?: 'fixed' | 'inline';
  };
  /** Actions displayed in order. */
  actions?: readonly ActionBarAction[];
  /** Called with the selected action. The host owns the selection afterward. */
  onAction?: (id: string) => void;
  /** Additional controls such as a menu trigger. */
  children?: ComponentChildren;
  /** Optional presentation preset. */
  preset?: ClassPreset;
  /** Additional CSS classes on the toolbar. */
  className?: string;
}

/** Contextual toolbar for host-owned bulk selection. */
export function ActionBar({
  label,
  count,
  selectionLabel,
  open = count > 0,
  closeLabel,
  onOpenChange,
  closeOnEscape = true,
  positioning,
  actions,
  onAction,
  children,
  preset,
  className = '',
}: ActionBarProps) {
  const surface = useRef<HTMLDivElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const hasFocus = useRef(false);

  useLayoutEffect(() => {
    const node = surface.current;
    if (!node || open || !hasFocus.current) return;
    hasFocus.current = false;
    const document = node.ownerDocument;
    if (
      node.contains(document.activeElement) ||
      document.activeElement === document.body
    ) {
      if (returnFocus.current?.isConnected)
        returnFocus.current.focus({ preventScroll: true });
    }
  }, [open]);

  useEffect(() => {
    const node = surface.current;
    const view = node?.ownerDocument.defaultView;
    if (!open || !closeOnEscape || !onOpenChange || !node || !view) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Escape' || event.defaultPrevented || event.isComposing)
        return;
      const target = event.target;
      if (
        target instanceof Element &&
        target.closest('[role="dialog"], [role="menu"], dialog[open]')
      )
        return;
      const eligible = '[data-rv-action-bar-escape]:not([hidden])';
      const owner = target instanceof Element ? target.closest(eligible) : null;
      const bars = node!.ownerDocument.querySelectorAll(eligible);
      if ((owner ?? bars[bars.length - 1]) !== node) return;
      event.preventDefault();
      onOpenChange?.(false);
    }
    view.addEventListener('keydown', onKeyDown);
    return () => view.removeEventListener('keydown', onKeyDown);
  }, [open, closeOnEscape, onOpenChange]);

  return (
    <>
      <span class="rv-visually-hidden" role="status">
        {open ? selectionLabel : ''}
      </span>
      <div
        ref={surface}
        class="rv-action-bar"
        data-mode={positioning?.mode ?? 'fixed'}
        data-placement={positioning?.placement ?? 'bottom'}
        data-rv-action-bar-escape={
          closeOnEscape && onOpenChange ? '' : undefined
        }
        style={{ '--rv-action-bar-gutter': positioning?.gutter }}
        hidden={!open}
        onFocusIn={(event) => {
          if (
            !event.currentTarget.contains(event.relatedTarget as Node | null)
          ) {
            returnFocus.current =
              event.relatedTarget instanceof HTMLElement
                ? event.relatedTarget
                : null;
          }
          hasFocus.current = true;
        }}
        onFocusOut={(event) => {
          if (
            event.relatedTarget &&
            !event.currentTarget.contains(event.relatedTarget as Node)
          )
            hasFocus.current = false;
        }}
        onKeyDown={(event) => {
          if (
            event.defaultPrevented ||
            event.altKey ||
            event.ctrlKey ||
            event.metaKey
          )
            return;
          const { key, currentTarget, target } = event;
          if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(key)) return;
          if (
            !(target instanceof HTMLElement) ||
            !target.matches('button, a[href], [role="button"]')
          )
            return;
          const buttons = getDialogFocusableElements(currentTarget).filter(
            (element) => element.matches('button, a[href], [role="button"]'),
          );
          const index = buttons.indexOf(target);
          if (index < 0) return;
          const rtl = getComputedStyle(currentTarget).direction === 'rtl';
          const forward = (key === 'ArrowRight') !== rtl;
          const next =
            key === 'Home'
              ? 0
              : key === 'End'
                ? buttons.length - 1
                : (index + (forward ? 1 : -1) + buttons.length) %
                  buttons.length;
          event.preventDefault();
          buttons[next].focus();
        }}
      >
        <Toolbar
          label={label}
          preset={preset}
          className={`rv-toolbar--surface rv-action-bar-surface ${className}`}
        >
          <span
            data-part="selection"
            class="rv-action-bar-selection"
            aria-hidden="true"
          >
            {selectionLabel}
          </span>
          {(!!actions?.length || children != null) && (
            <>
              <ToolbarSeparator />
              <ToolbarGroup className="rv-action-bar-actions">
                {actions?.map((action) => (
                  <Button
                    key={action.id}
                    size="compact"
                    variant={action.variant ?? 'ghost'}
                    disabled={action.disabled || !onAction}
                    onClick={() => onAction?.(action.id)}
                  >
                    {action.icon && <SvgIcon svg={action.icon} size={14} />}
                    {action.label}
                  </Button>
                ))}
                {children}
              </ToolbarGroup>
            </>
          )}
          {onOpenChange && closeLabel && (
            <RemoveButton
              className="rv-action-bar-close"
              locale={{ title: closeLabel, ariaLabel: closeLabel }}
              onClick={() => onOpenChange(false)}
            />
          )}
        </Toolbar>
      </div>
    </>
  );
}
