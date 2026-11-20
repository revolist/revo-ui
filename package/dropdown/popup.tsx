import type { ClassPreset } from '../presets/types';
/** @jsxImportSource preact */
import { getPopupCoordinates, getPopupViewport } from '../core/popup-position';
import { ownsPopupTarget } from '../core/popup-ownership';
import { h, type ComponentChildren, type RefObject, render } from 'preact';
import { inheritUiMotion } from '../core/motion';
import { createPortal, useLayoutEffect, useRef, useState } from 'preact/compat';
import { hideTopLayerPopup, showTopLayerPopup } from '../core/top-layer-popup';

// DropdownPopup component - Handles positioning and portal rendering
export type DropdownPopupProps = {
  preset?: ClassPreset;
  onPointerRelease?: (event: MouseEvent | TouchEvent) => void;
  triggerRef: RefObject<HTMLDivElement>;
  children: ComponentChildren;
  portalTarget?: HTMLElement | null;
  theme?: string | null;
  dropdownMenuId?: string;
  popupClassName?: string;
  closeOnClickOutside?: boolean;
  onClose?: () => void;
  align?: 'start' | 'end';
  matchTriggerWidth?: boolean;
  maxHeight?: number;
  observePopupResize?: boolean;
  /** Promotes the popup above modal dialogs without joining an ancestor's scroll context. */
  topLayer?: boolean;
};

type DropdownPosition = {
  readonly top: number;
  readonly left: number;
  readonly display: 'none' | 'flex';
  readonly width?: number;
  readonly maxHeight?: number;
};

const VIEWPORT_GUTTER = 5;
const POPUP_GAP = 4;

/**
 * Dropdown popup component
 * @param triggerRef - The reference to the trigger element
 * @param children - The children of the dropdown
 * @param portalTarget - The target element to render the dropdown
 * @param theme - The theme of the dropdown
 * @param dropdownMenuId - The id of the dropdown menu
 */
export function DropdownPopup({
  preset,
  onPointerRelease,
  triggerRef,
  children,
  portalTarget,
  theme,
  dropdownMenuId,
  popupClassName,
  closeOnClickOutside = false,
  onClose,
  align = 'start',
  matchTriggerWidth = false,
  maxHeight,
  observePopupResize = true,
  topLayer = false,
}: DropdownPopupProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState<DropdownPosition>({
    top: 0,
    left: 0,
    display: 'none',
  });

  // Portals preserve the trigger's motion policy before any entrance can run.
  useLayoutEffect(() => {
    const trigger = triggerRef.current;
    const popup = dropdownRef.current;
    if (!trigger || !popup) return;
    return inheritUiMotion(trigger, popup);
  }, [portalTarget, triggerRef]);

  // Measure and position before the first visible paint, including top-layer promotion.
  useLayoutEffect(() => {
    const trigger = triggerRef.current;
    const popup = dropdownRef.current;
    if (!trigger || !popup) return;
    const ownerWindow = trigger.ownerDocument.defaultView ?? window;

    const updatePosition = () => {
      const popup = dropdownRef.current;
      if (!popup) return;
      const triggerRect = trigger.getBoundingClientRect();
      const optionList = popup.querySelector<HTMLElement>('.dropdown-options');
      const optionScrollTop = optionList?.scrollTop ?? 0;
      const optionScrollLeft = optionList?.scrollLeft ?? 0;
      const viewport = getPopupViewport(ownerWindow);
      const coordinateSpace = getPopupCoordinates(popup, 0, 0);
      // Preserve authored width limits while allowing a narrow or zoomed
      // visible viewport to take precedence over the menu's minimum width.
      popup.style.maxWidth = '';
      popup.style.minWidth = '';
      popup.style.direction = ownerWindow.getComputedStyle(trigger).direction;
      const authored = ownerWindow.getComputedStyle(popup);
      const chrome =
        authored.boxSizing === 'border-box'
          ? 0
          : [
              authored.paddingLeft,
              authored.paddingRight,
              authored.borderLeftWidth,
              authored.borderRightWidth,
            ].reduce((sum, value) => sum + (Number.parseFloat(value) || 0), 0);
      const availableWidth = Math.max(
        0,
        (viewport.right - viewport.left - 2 * VIEWPORT_GUTTER) /
          coordinateSpace.scaleX -
          chrome,
      );
      popup.style.maxWidth =
        !authored.maxWidth || authored.maxWidth === 'none'
          ? `${availableWidth}px`
          : `min(${authored.maxWidth}, ${availableWidth}px)`;
      popup.style.minWidth = `min(${!authored.minWidth || authored.minWidth === 'auto' ? '0px' : authored.minWidth}, ${availableWidth}px)`;
      // Measure against the authored CSS cap, not the inline viewport cap from
      // a previous positioning pass. Otherwise ResizeObserver can turn a
      // temporary constraint into the popup's permanent desired height.
      const constrainedMaxHeight = popup.style.maxHeight;
      popup.style.maxHeight = '';
      const menuRect = popup.getBoundingClientRect();
      // Overflowing custom content does not override the authored CSS height cap.
      const measuredHeight = Math.max(
        menuRect.height,
        popup.offsetHeight * coordinateSpace.scaleY,
      );
      popup.style.maxHeight = constrainedMaxHeight;
      // WebKit clamps native scroll when the temporary natural-height measure
      // expands the list. Restore its offset under the original constraint.
      if (optionList) {
        optionList.scrollTop = optionScrollTop;
        optionList.scrollLeft = optionScrollLeft;
      }
      // Entry animation may shrink the rectangle; clamp the settled box too.
      const menuWidth = Math.max(
        menuRect.width,
        popup.offsetWidth * coordinateSpace.scaleX,
      );
      const desiredHeight = Math.min(
        measuredHeight,
        typeof maxHeight === 'number'
          ? Math.max(0, maxHeight * coordinateSpace.scaleY)
          : Number.POSITIVE_INFINITY,
      );
      const availableAbove = Math.max(
        0,
        triggerRect.top - viewport.top - POPUP_GAP - VIEWPORT_GUTTER,
      );
      const availableBelow = Math.max(
        0,
        viewport.bottom - triggerRect.bottom - POPUP_GAP - VIEWPORT_GUTTER,
      );
      const opensAbove =
        desiredHeight > availableBelow && availableAbove > availableBelow;
      const availableHeight = opensAbove ? availableAbove : availableBelow;
      const menuHeight = Math.min(desiredHeight, availableHeight);
      let viewportTop = opensAbove
        ? triggerRect.top - POPUP_GAP - menuHeight
        : triggerRect.bottom + POPUP_GAP;
      let viewportLeft =
        align === 'end' ? triggerRect.right - menuWidth : triggerRect.left;

      viewportTop = Math.max(
        viewport.top + VIEWPORT_GUTTER,
        Math.min(viewportTop, viewport.bottom - VIEWPORT_GUTTER - menuHeight),
      );
      viewportLeft = Math.max(
        viewport.left + VIEWPORT_GUTTER,
        Math.min(viewportLeft, viewport.right - menuWidth - VIEWPORT_GUTTER),
      );
      const position = getPopupCoordinates(popup, viewportTop, viewportLeft);
      setDropdownPosition({
        top: position.top,
        left: position.left,
        display: 'flex',
        maxHeight: menuHeight / position.scaleY,
        ...(matchTriggerWidth
          ? { width: triggerRect.width / position.scaleX }
          : {}),
      });
    };

    const handleScroll = (event: Event) => {
      // Internal editor/options scrolling cannot move this popup's anchor.
      // Remeasuring here can reset that native scroll while uncapping height.
      if (
        event.target instanceof ownerWindow.Node &&
        ownsPopupTarget(dropdownRef.current, event.target)
      )
        return;
      updatePosition();
    };

    // The initial render is visibility:hidden so native promotion can make the
    // panel measurable without exposing its placeholder coordinates. Width must
    // be applied before measuring wrapping and the above/below placement.
    const mode = topLayer ? showTopLayerPopup(popup) : undefined;
    popup.style.display = 'flex';
    if (matchTriggerWidth) {
      const triggerRect = trigger.getBoundingClientRect();
      const coordinateSpace = getPopupCoordinates(popup, 0, 0);
      popup.style.width = `${triggerRect.width / coordinateSpace.scaleX}px`;
    }
    updatePosition();
    const visualViewport = ownerWindow.visualViewport;
    visualViewport?.addEventListener('scroll', updatePosition);
    visualViewport?.addEventListener('resize', updatePosition);
    ownerWindow.addEventListener('resize', updatePosition);
    ownerWindow.addEventListener('scroll', handleScroll, true);
    const ResizeObserverCtor = ownerWindow.ResizeObserver;
    const resizeObserver = ResizeObserverCtor
      ? new ResizeObserverCtor(updatePosition)
      : undefined;
    resizeObserver?.observe(trigger);
    // Surrounding content can move the field without changing its own size.
    // Observe its layout ancestors only while open, using the same observer.
    for (
      let parent = trigger.parentElement;
      parent;
      parent = parent.parentElement
    )
      resizeObserver?.observe(parent);
    if (observePopupResize && dropdownRef.current) {
      resizeObserver?.observe(dropdownRef.current);
    }
    // Filtered or remote results can grow inside an unchanged clipped box.
    // Content mutations must refresh the natural height even without a resize.
    const mutationObserver =
      observePopupResize && ownerWindow.MutationObserver
        ? new ownerWindow.MutationObserver(updatePosition)
        : undefined;
    mutationObserver?.observe(popup, {
      childList: true,
      characterData: true,
      subtree: true,
    });
    return () => {
      visualViewport?.removeEventListener('scroll', updatePosition);
      visualViewport?.removeEventListener('resize', updatePosition);
      ownerWindow.removeEventListener('resize', updatePosition);
      ownerWindow.removeEventListener('scroll', handleScroll, true);
      resizeObserver?.disconnect();
      mutationObserver?.disconnect();
      if (mode) hideTopLayerPopup(popup, mode);
    };
  }, [
    align,
    matchTriggerWidth,
    maxHeight,
    observePopupResize,
    portalTarget,
    topLayer,
    triggerRef,
  ]);

  useLayoutEffect(() => {
    if (!closeOnClickOutside || !onClose) return;

    const ownerDocument =
      portalTarget?.ownerDocument ??
      dropdownRef.current?.ownerDocument ??
      triggerRef.current?.ownerDocument ??
      (typeof document !== 'undefined' ? document : undefined);
    if (!ownerDocument) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (ownsPopupTarget(dropdownRef.current, target)) return;
      if (triggerRef.current?.contains(target)) return;
      onClose();
    };

    ownerDocument.addEventListener('mousedown', handleClickOutside);
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (dropdownRef.current?.querySelector('[aria-expanded="true"]')) return;
      const active = ownerDocument.activeElement;
      if (
        !active ||
        (!dropdownRef.current?.contains(active) &&
          !triggerRef.current?.contains(active))
      )
        return;
      event.preventDefault();
      event.stopPropagation();
      onClose();
      triggerRef.current
        ?.querySelector<HTMLElement>('button, input, select')
        ?.focus();
    };
    ownerDocument.addEventListener('keydown', handleEscape);
    return () => {
      ownerDocument.removeEventListener('mousedown', handleClickOutside);
      ownerDocument.removeEventListener('keydown', handleEscape);
    };
  }, [closeOnClickOutside, onClose, portalTarget, triggerRef]);

  const dropdownContent = (
    <div
      ref={dropdownRef}
      id={dropdownMenuId}
      className={`revo-dropdown-menu ${preset?.className ?? ''} ${popupClassName || ''}`}
      data-part="popup"
      data-theme={theme ?? 'default'}
      data-rv-match-trigger-width={matchTriggerWidth ? '' : undefined}
      onMouseUp={onPointerRelease}
      onTouchEnd={onPointerRelease}
      style={{
        top: `${dropdownPosition.top}px`,
        left: `${dropdownPosition.left}px`,
        ...(topLayer ? { right: 'auto', bottom: 'auto', margin: '0' } : {}),
        display: dropdownPosition.display,
        visibility: dropdownPosition.display === 'none' ? 'hidden' : undefined,
        maxHeight:
          dropdownPosition.maxHeight === undefined
            ? undefined
            : `${dropdownPosition.maxHeight}px`,
        width:
          dropdownPosition.width === undefined
            ? undefined
            : `${dropdownPosition.width}px`,
      }}
    >
      {children}
    </div>
  );

  if (portalTarget) {
    return createPortal(dropdownContent, portalTarget);
  }

  return dropdownContent;
}
