import { calculateAnchoredPopoverPosition } from './anchored-popover';
import { h } from 'preact';
import { createPreactElement } from '../preact-mount';

/** Shared presentation for text hints and rich product/chart tooltip content. */
export const TOOLTIP_STYLES = `
.rv-tooltip.rv-tooltip {
  box-sizing: border-box;
  position: fixed;
  z-index: 100000;
  margin: 0;
  inset: auto;
  transform: none;
  opacity: 1;
  visibility: visible;
  padding: 6px 10px;
  border: 0;
  border-radius: 6px;
  background: var(--rv-tooltip-bg, #191919);
  color: var(--rv-tooltip-fg, #fff);
  box-shadow: 0 4px 14px var(--rv-ui-shadow, rgb(0 0 0 / 18%));
  font: 12px/1.4 var(--rv-ui-font-family, Inter, ui-sans-serif, system-ui, sans-serif);
  font-weight: 400;
  text-align: start;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  max-width: min(360px, calc(100vw - 16px));
  max-height: calc(100dvh - 16px);
  overflow: auto;
  pointer-events: none;
}
.rv-tooltip[hidden], .rv-tooltip[data-visible="false"] { display: none; }
.rv-tooltip[data-overflow] { pointer-events: auto; }
@media (forced-colors: active) {
  .rv-tooltip.rv-tooltip { color: CanvasText; background: Canvas; border: 1px solid CanvasText; }
}
`;

/** Also installs into shadow roots/fullscreen roots used by standalone charts. */
export function ensureTooltipStyles(root: Document | ShadowRoot): void {
  if (root.querySelector('style[data-rv-tooltip-styles]')) return;
  const document =
    root.nodeType === 9 ? (root as Document) : root.ownerDocument!;
  const style = createPreactElement<HTMLStyleElement>(
    document,
    h('style', { 'data-rv-tooltip-styles': '' }, TOOLTIP_STYLES),
  );
  if (root.nodeType === 9) document.head.append(style);
  else root.append(style);
}

export function prepareTooltipSurface(element: HTMLElement): void {
  element.classList.add('rv-tooltip');
  element.setAttribute('role', 'tooltip');
  const root = element.getRootNode();
  ensureTooltipStyles(
    root.nodeType === 11 && 'host' in root
      ? (root as ShadowRoot)
      : element.ownerDocument,
  );
}

/** Shared hint placement: centered above the trigger, with a bounded below fallback. */
export function calculateTooltipPosition(
  anchor: DOMRect,
  popup: DOMRect,
  viewport: { width: number; height: number },
) {
  const below = calculateAnchoredPopoverPosition(anchor, popup, viewport);
  const top = anchor.top - popup.height - 8;
  return top >= 8
    ? {
        left: Math.max(
          8,
          Math.min(
            anchor.left + (anchor.width - popup.width) / 2,
            viewport.width - popup.width - 8,
          ),
        ),
        top,
      }
    : below;
}
