import { calculateAnchoredPopoverPosition } from './anchored-popover';

/** Prefer keeping the field visible, with an optional viewport fit for larger editors. */
export function calculateEditorPopupPosition(
  anchor: Pick<DOMRect, 'left' | 'right' | 'top' | 'bottom'>,
  popup: Pick<DOMRect, 'width' | 'height'>,
  viewport: { width: number; height: number },
  { gap = 4, inset = 8, fitViewport = false } = {},
) {
  const below = Math.max(0, viewport.height - inset - anchor.bottom - gap);
  const above = Math.max(0, anchor.top - inset - gap);
  const placementY =
    popup.height <= below || below >= above ? 'below' : 'above';
  const sideHeight = placementY === 'below' ? below : above;
  const maxHeight =
    fitViewport && popup.height > sideHeight
      ? Math.max(sideHeight, viewport.height - 2 * inset)
      : sideHeight;
  const height = Math.min(popup.height, maxHeight);
  const top =
    placementY === 'below' ? anchor.bottom + gap : anchor.top - height - gap;
  return {
    ...calculateAnchoredPopoverPosition(anchor, popup, viewport, gap, inset),
    placementY,
    maxHeight,
    top:
      maxHeight > sideHeight
        ? Math.max(inset, Math.min(top, viewport.height - inset - height))
        : top,
  };
}
