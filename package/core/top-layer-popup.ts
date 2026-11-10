export {
  ensureTooltipStyles,
  prepareTooltipSurface,
  TOOLTIP_STYLES,
} from './tooltip-surface';
import { ownsPopupTarget } from './popup-ownership';
export { ownsPopupTarget };

const originalSurfaceAttributes = new WeakMap<HTMLElement, string | null>();

export type TopLayerPopupMode = 'popover' | 'fallback';

export type TopLayerPopupElement = HTMLElement & {
  showPopover?: () => void;
  hidePopover?: () => void;
};

/** Opens an overlay in the browser top layer when supported. */
export function showTopLayerPopup(
  element: TopLayerPopupElement,
  visibleDisplay = 'flex',
): TopLayerPopupMode {
  if (!originalSurfaceAttributes.has(element))
    originalSurfaceAttributes.set(
      element,
      element.getAttribute('data-rv-ui-surface'),
    );
  element.setAttribute('data-rv-ui-surface', '');
  // Popover promotion can be rejected while author styles resolve to
  // `display: none`. Make the element renderable before calling the native API.
  element.style.display = visibleDisplay;

  if (typeof element.showPopover === 'function') {
    element.setAttribute('popover', 'manual');
    try {
      element.showPopover();
      return 'popover';
    } catch {
      element.removeAttribute('popover');
    }
  }

  element.style.display = visibleDisplay;
  return 'fallback';
}

/** Hides an overlay opened by `showTopLayerPopup`; safe to call repeatedly. */
export function hideTopLayerPopup(
  element: TopLayerPopupElement,
  mode?: TopLayerPopupMode,
): void {
  const originalSurface = originalSurfaceAttributes.get(element);
  if (originalSurface !== undefined) {
    if (originalSurface === null) element.removeAttribute('data-rv-ui-surface');
    else element.setAttribute('data-rv-ui-surface', originalSurface);
    originalSurfaceAttributes.delete(element);
  }
  if (mode === 'popover' && typeof element.hidePopover === 'function') {
    try {
      element.hidePopover();
      element.style.removeProperty('display');
      return;
    } catch {
      // Fall through when the element was detached before cleanup.
    }
  }

  element.style.display = 'none';
}

/** Includes portalled popup content linked by descendant aria-controls triggers. */
export function popupOwnsTarget(
  panel: HTMLElement,
  target: Node | null,
): boolean {
  return ownsPopupTarget(panel, target);
}
