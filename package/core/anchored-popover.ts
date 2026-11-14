export interface AnchoredPopoverPosition {
  left: number;
  top: number;
  placementX: 'left' | 'right';
  placementY: 'above' | 'below';
}

/** Pure positioning helper shared by portalled grid popups. */
export function calculateAnchoredPopoverPosition(
  anchor: Pick<DOMRect, 'left' | 'right' | 'top' | 'bottom'>,
  popup: Pick<DOMRect, 'width' | 'height'>,
  viewport: { width: number; height: number },
  gap = 4,
  inset = 8,
): AnchoredPopoverPosition {
  const below = anchor.bottom + gap;
  const above = anchor.top - popup.height - gap;
  const placementY =
    below + popup.height <= viewport.height - inset || above < inset
      ? 'below'
      : 'above';
  const alignedLeft = anchor.left;
  const alignedRight = anchor.right - popup.width;
  const placementX =
    alignedLeft + popup.width <= viewport.width - inset || alignedRight < inset
      ? 'left'
      : 'right';
  return {
    left: Math.min(
      Math.max(placementX === 'left' ? alignedLeft : alignedRight, inset),
      Math.max(inset, viewport.width - popup.width - inset),
    ),
    top: Math.min(
      Math.max(placementY === 'below' ? below : above, inset),
      Math.max(inset, viewport.height - popup.height - inset),
    ),
    placementX,
    placementY,
  };
}

export interface FloatingEditorPositionOptions {
  readonly bounds?: Pick<DOMRect, 'left' | 'right' | 'top' | 'bottom'>;
  readonly preferCenter?: boolean;
  readonly gap?: number;
  readonly inset?: number;
}
/** Prefer a lateral editor without covering its event; wide surfaces center. */
export function calculateFloatingEditorPosition(
  anchor: Pick<DOMRect, 'left' | 'right' | 'top' | 'bottom'>,
  popup: Pick<DOMRect, 'width' | 'height'>,
  viewport: { width: number; height: number },
  {
    bounds,
    preferCenter = false,
    gap = 8,
    inset = 12,
  }: FloatingEditorPositionOptions = {},
): { left: number; top: number; placement: 'left' | 'right' | 'center' } {
  const screen = {
    left: inset,
    top: inset,
    right: Math.max(inset, viewport.width - inset),
    bottom: Math.max(inset, viewport.height - inset),
  };
  const intersection = {
    left: Math.max(screen.left, bounds?.left ?? screen.left),
    right: Math.min(screen.right, bounds?.right ?? screen.right),
    top: Math.max(screen.top, bounds?.top ?? screen.top),
    bottom: Math.min(screen.bottom, bounds?.bottom ?? screen.bottom),
  };
  const area =
    intersection.right > intersection.left &&
    intersection.bottom > intersection.top
      ? intersection
      : screen;
  const clamp = (value: number, min: number, max: number) =>
    Math.min(Math.max(value, min), Math.max(min, max));
  const vertical = popup.height <= area.bottom - area.top ? area : screen;
  const right = anchor.right + gap;
  const left = anchor.left - gap - popup.width;
  const fitsRight = right >= area.left && right + popup.width <= area.right;
  const fitsLeft = left >= area.left && left + popup.width <= area.right;
  if (preferCenter || (!fitsRight && !fitsLeft))
    return {
      left: clamp(
        (area.left + area.right - popup.width) / 2,
        screen.left,
        screen.right - popup.width,
      ),
      top: clamp(
        (area.top + area.bottom - popup.height) / 2,
        vertical.top,
        vertical.bottom - popup.height,
      ),
      placement: 'center',
    };
  return {
    left: fitsRight ? right : left,
    top: clamp(
      (anchor.top + anchor.bottom - popup.height) / 2,
      vertical.top,
      vertical.bottom - popup.height,
    ),
    placement: fitsRight ? 'right' : 'left',
  };
}
