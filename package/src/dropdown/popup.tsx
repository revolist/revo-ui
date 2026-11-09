/** @jsxImportSource preact */
import { ownsPopupTarget } from '../core/popup-ownership';
import { h, type ComponentChildren, type RefObject, render } from 'preact';
import { inheritUiMotion } from '../core/motion';
import {
  createPortal,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'preact/compat';
import { hideTopLayerPopup, showTopLayerPopup } from '../core/top-layer-popup';

// DropdownPopup component - Handles positioning and portal rendering
export type DropdownPopupProps = {
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
 * Converts viewport coordinates into the coordinate space used by the popup's
 * actual CSS containing block. A custom portal is only a DOM mount point: when
 * it is statically positioned, an ancestor (or the initial containing block)
 * still owns `top` and `left` for the absolutely positioned popup.
 */
function toPopupCoordinates(
  popup: HTMLElement,
  viewportTop: number,
  viewportLeft: number,
) {
  const ownerWindow = popup.ownerDocument.defaultView;
  if (!ownerWindow) {
    return { top: viewportTop, left: viewportLeft, scaleX: 1, scaleY: 1 };
  }
  if (ownerWindow.getComputedStyle(popup).position === 'fixed') {
    // Painted viewport rectangles include inherited CSS zoom. Fixed-position
    // offsets and dimensions still use the popup's unzoomed CSS coordinates.
    const zoom = popup.currentCSSZoom;
    const scale = Number.isFinite(zoom) && zoom > 0 ? zoom : 1;
    return {
      top: viewportTop / scale,
      left: viewportLeft / scale,
      scaleX: scale,
      scaleY: scale,
    };
  }

  const offsetParent = popup.offsetParent;
  const document = popup.ownerDocument;
  if (
    !offsetParent ||
    offsetParent === document.body ||
    offsetParent === document.documentElement
  ) {
    return {
      top: viewportTop + ownerWindow.scrollY,
      left: viewportLeft + ownerWindow.scrollX,
      scaleX: 1,
      scaleY: 1,
    };
  }

  const parentRect = offsetParent.getBoundingClientRect();
  const parent = offsetParent as HTMLElement;
  const scaleX =
    parent.offsetWidth > 0 ? parentRect.width / parent.offsetWidth : 1;
  const scaleY =
    parent.offsetHeight > 0 ? parentRect.height / parent.offsetHeight : 1;
  const safeScaleX = Number.isFinite(scaleX) && scaleX > 0 ? scaleX : 1;
  const safeScaleY = Number.isFinite(scaleY) && scaleY > 0 ? scaleY : 1;
  return {
    top:
      (viewportTop - parentRect.top) / safeScaleY -
      parent.clientTop +
      parent.scrollTop,
    left:
      (viewportLeft - parentRect.left) / safeScaleX -
      parent.clientLeft +
      parent.scrollLeft,
    scaleX: safeScaleX,
    scaleY: safeScaleY,
  };
}

/**
 * Dropdown popup component
 * @param triggerRef - The reference to the trigger element
 * @param children - The children of the dropdown
 * @param portalTarget - The target element to render the dropdown
 * @param theme - The theme of the dropdown
 * @param dropdownMenuId - The id of the dropdown menu
 */
export function DropdownPopup({
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

  // Update dropdown position when opened
  useEffect(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const ownerWindow = trigger.ownerDocument.defaultView ?? window;

    const showForMeasurement = () => {
      const popup = dropdownRef.current;
      if (!popup) return;
      const triggerRect = trigger.getBoundingClientRect();
      const position = toPopupCoordinates(
        popup,
        triggerRect.bottom + POPUP_GAP,
        triggerRect.left,
      );

      setDropdownPosition({
        top: position.top,
        left: position.left,
        display: 'flex',
        ...(matchTriggerWidth
          ? { width: triggerRect.width / position.scaleX }
          : {}),
      });
    };

    const updatePosition = () => {
      const popup = dropdownRef.current;
      if (!popup) return;
      const triggerRect = trigger.getBoundingClientRect();
      // Measure against the authored CSS cap, not the inline viewport cap from
      // a previous positioning pass. Otherwise ResizeObserver can turn a
      // temporary constraint into the popup's permanent desired height.
      const constrainedMaxHeight = popup.style.maxHeight;
      popup.style.maxHeight = '';
      const menuRect = popup.getBoundingClientRect();
      const coordinateSpace = toPopupCoordinates(popup, 0, 0);
      const measuredHeight = Math.max(
        menuRect.height,
        popup.offsetHeight * coordinateSpace.scaleY,
        popup.scrollHeight * coordinateSpace.scaleY,
      );
      popup.style.maxHeight = constrainedMaxHeight;
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
      const viewportHeight = ownerWindow.innerHeight;
      const viewportWidth = ownerWindow.innerWidth;
      const availableAbove = Math.max(
        0,
        triggerRect.top - POPUP_GAP - VIEWPORT_GUTTER,
      );
      const availableBelow = Math.max(
        0,
        viewportHeight - triggerRect.bottom - POPUP_GAP - VIEWPORT_GUTTER,
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
        VIEWPORT_GUTTER,
        Math.min(viewportTop, viewportHeight - VIEWPORT_GUTTER - menuHeight),
      );
      viewportLeft = Math.max(
        VIEWPORT_GUTTER,
        Math.min(viewportLeft, viewportWidth - menuWidth - VIEWPORT_GUTTER),
      );
      const position = toPopupCoordinates(popup, viewportTop, viewportLeft);
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

    showForMeasurement();
    const timer = ownerWindow.setTimeout(updatePosition, 0);
    ownerWindow.addEventListener('resize', updatePosition);
    ownerWindow.addEventListener('scroll', handleScroll, true);
    const ResizeObserverCtor = ownerWindow.ResizeObserver;
    const resizeObserver = ResizeObserverCtor
      ? new ResizeObserverCtor(updatePosition)
      : undefined;
    resizeObserver?.observe(trigger);
    // Validation and selection content can move a trigger without resizing it.
    const dialogSurface = trigger.closest('.rv-dialog__surface, dialog');
    if (dialogSurface) resizeObserver?.observe(dialogSurface);
    if (observePopupResize && dropdownRef.current) {
      resizeObserver?.observe(dropdownRef.current);
    }
    return () => {
      ownerWindow.clearTimeout(timer);
      ownerWindow.removeEventListener('resize', updatePosition);
      ownerWindow.removeEventListener('scroll', handleScroll, true);
      resizeObserver?.disconnect();
    };
  }, [
    align,
    matchTriggerWidth,
    maxHeight,
    observePopupResize,
    portalTarget,
    triggerRef,
  ]);

  useLayoutEffect(() => {
    const popup = dropdownRef.current;
    if (!topLayer || !popup) return;
    const mode = showTopLayerPopup(popup);
    return () => {
      hideTopLayerPopup(popup, mode);
    };
  }, [portalTarget, topLayer]);

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
      className={`revo-dropdown-menu ${popupClassName || ''}`}
      data-theme={theme ?? 'default'}
      onMouseUp={onPointerRelease}
      onTouchEnd={onPointerRelease}
      style={{
        top: `${dropdownPosition.top}px`,
        left: `${dropdownPosition.left}px`,
        ...(topLayer ? { right: 'auto', bottom: 'auto', margin: '0' } : {}),
        display: dropdownPosition.display,
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
