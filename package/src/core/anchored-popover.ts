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
