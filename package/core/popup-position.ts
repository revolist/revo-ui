/** Shared viewport coordinate contract for floating surfaces and dialog roots. */
export const VIEWPORT_POPUP_STYLE = {
  position: 'fixed',
  right: 'auto',
  bottom: 'auto',
  margin: '0',
} as const;

/**
 * Converts viewport coordinates into the coordinate space used by the popup's
 * actual CSS containing block. A custom portal is only a DOM mount point: when
 * it is statically positioned, an ancestor (or the initial containing block)
 * still owns `top` and `left` for the absolutely positioned popup.
 */
export function getPopupCoordinates(
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
    const zoom = popup.currentCSSZoom;
    const scale = Number.isFinite(zoom) && zoom > 0 ? zoom : 1;
    return {
      top: (viewportTop + ownerWindow.scrollY) / scale,
      left: (viewportLeft + ownerWindow.scrollX) / scale,
      scaleX: scale,
      scaleY: scale,
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

/** Applies a painted viewport point in the surface's actual CSS coordinate space. */
export function applyPopupPosition(
  popup: HTMLElement,
  point: { readonly top: number; readonly left: number },
) {
  const position = getPopupCoordinates(popup, point.top, point.left);
  popup.style.top = `${position.top}px`;
  popup.style.left = `${position.left}px`;
  return position;
}

/** Visible viewport in the same layout coordinates as getBoundingClientRect. */
export function getPopupViewport(view: Window) {
  const viewport = view.visualViewport;
  const left = viewport?.offsetLeft ?? 0;
  const top = viewport?.offsetTop ?? 0;
  return {
    left,
    top,
    right: left + (viewport?.width ?? view.innerWidth),
    bottom: top + (viewport?.height ?? view.innerHeight),
  };
}
