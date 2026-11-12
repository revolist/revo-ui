import {
  componentStyleNonce,
  externalComponentStyles,
} from './component-styles';
import type {
  TooltipAlign,
  TooltipOffset,
  TooltipPositionOptions,
  TooltipOffsetContext,
} from './tooltip-options';
import { h, type JSX } from 'preact';
import { createPreactElement, releasePreactElement } from '../preact-mount';

/** Shared presentation for text hints and rich product/chart tooltip content. */
export const TOOLTIP_STYLES = `\n.rv-tooltip.rv-tooltip {
  box-sizing: border-box;
  position: fixed;
  flex-direction: column;
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
  pointer-events: auto;
}
.rv-tooltip[data-arrow="true"] { overflow: visible; }
.rv-tooltip__content { display:block; min-height:0; max-height:inherit; overflow:auto; }
.rv-tooltip[data-arrow="true"]::before { content:''; position:absolute; width:8px; height:8px; background:inherit; transform:rotate(45deg); pointer-events:none; }
.rv-tooltip[data-side="top"]::before { bottom:-4px; left:calc(var(--rv-tooltip-arrow-x) - 4px); }
.rv-tooltip[data-side="bottom"]::before { top:-4px; left:calc(var(--rv-tooltip-arrow-x) - 4px); }
.rv-tooltip[data-side="left"]::before { right:-4px; top:calc(var(--rv-tooltip-arrow-y) - 4px); }
.rv-tooltip[data-side="right"]::before { left:-4px; top:calc(var(--rv-tooltip-arrow-y) - 4px); }
.rv-tooltip[data-duration="true"] { transition: opacity var(--rv-tooltip-duration); }
.rv-tooltip[data-state="opening"], .rv-tooltip[data-state="closing"] { opacity:0; }
.rv-tooltip[data-state="closing"] { pointer-events:none; }
@media (prefers-reduced-motion:reduce) { .rv-tooltip[data-duration="true"] { transition:none; } }
.rv-tooltip[hidden], .rv-tooltip[data-visible="false"] { display: none; }
.rv-tooltip[data-overflow] { pointer-events: auto; }
@media (forced-colors: active) {
  .rv-tooltip.rv-tooltip { color: CanvasText; background: Canvas; border: 1px solid CanvasText; }
}
`;

/** Also installs into shadow roots/fullscreen roots used by standalone charts. */
export function ensureTooltipStyles(root: Document | ShadowRoot): void {
  if (externalComponentStyles(root)) return;
  if (root.querySelector('style[data-rv-tooltip-styles]')) return;
  const document =
    root.nodeType === 9 ? (root as Document) : root.ownerDocument!;
  const style = createPreactElement<HTMLStyleElement>(
    document,
    h(
      'style',
      { 'data-rv-tooltip-styles': '', nonce: componentStyleNonce(root) },
      TOOLTIP_STYLES,
    ),
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

/** Fixed-position coordinates, with physical/logical sides and bounded flip/shift. */
export function calculateTooltipPosition(
  anchor: DOMRect,
  popup: DOMRect,
  viewport: { width: number; height: number },
  options: TooltipPositionOptions = {},
) {
  type Side = TooltipOffsetContext['side'];
  const rtl = options.direction === 'rtl';
  const requested: Side =
    options.side === 'inline-start'
      ? rtl
        ? 'right'
        : 'left'
      : options.side === 'inline-end'
        ? rtl
          ? 'left'
          : 'right'
        : (options.side ?? 'top');
  const align: TooltipAlign = options.align ?? 'center';
  const custom = options.collisionBoundary;
  const bounds =
    custom && 'getBoundingClientRect' in custom
      ? custom.getBoundingClientRect()
      : custom;
  const padding = (edge: 'top' | 'bottom' | 'left' | 'right') =>
    Math.max(
      0,
      typeof options.collisionPadding === 'number'
        ? options.collisionPadding
        : (options.collisionPadding?.[edge] ?? 8),
    );
  const box = {
    left: Math.max(0, bounds?.left ?? 0) + padding('left'),
    top: Math.max(0, bounds?.top ?? 0) + padding('top'),
    right:
      Math.min(viewport.width, bounds?.right ?? viewport.width) -
      padding('right'),
    bottom:
      Math.min(viewport.height, bounds?.bottom ?? viewport.height) -
      padding('bottom'),
  };
  const offset = (
    value: TooltipOffset | undefined,
    fallback: number,
    side: Side,
  ) => {
    const next =
      typeof value === 'function'
        ? value({ anchor, popup, side, align })
        : (value ?? fallback);
    return Number.isFinite(next) ? next : fallback;
  };
  const coordinates = (side: Side) => {
    const vertical = side === 'top' || side === 'bottom';
    const sideOffset = offset(options.sideOffset, 8, side),
      alignOffset = offset(options.alignOffset, 0, side);
    const start = vertical ? anchor.left : anchor.top,
      size = vertical ? anchor.width : anchor.height,
      popupSize = vertical ? popup.width : popup.height;
    const resolvedAlign =
      vertical && rtl && align !== 'center'
        ? align === 'start'
          ? 'end'
          : 'start'
        : align;
    const cross =
      (resolvedAlign === 'start'
        ? start
        : resolvedAlign === 'end'
          ? start + size - popupSize
          : start + (size - popupSize) / 2) + alignOffset;
    return {
      left: vertical
        ? cross
        : side === 'left'
          ? anchor.left - popup.width - sideOffset
          : anchor.right + sideOffset,
      top: vertical
        ? side === 'top'
          ? anchor.top - popup.height - sideOffset
          : anchor.bottom + sideOffset
        : cross,
    };
  };
  const overflow = (point: { left: number; top: number }) =>
    Math.max(0, box.left - point.left) +
    Math.max(0, point.left + popup.width - box.right) +
    Math.max(0, box.top - point.top) +
    Math.max(0, point.top + popup.height - box.bottom);
  let side = requested,
    point = coordinates(side);
  const avoid = options.collisionAvoidance;
  if (avoid !== false && (typeof avoid !== 'object' || avoid.side !== 'none')) {
    const opposite = (
      { top: 'bottom', bottom: 'top', left: 'right', right: 'left' } as const
    )[side];
    const candidate = coordinates(opposite);
    if (overflow(candidate) < overflow(point)) {
      side = opposite;
      point = candidate;
    }
  }
  if (
    avoid !== false &&
    (typeof avoid !== 'object' || avoid.align !== 'none')
  ) {
    point.left = Math.max(
      box.left,
      Math.min(point.left, box.right - popup.width),
    );
    point.top = Math.max(
      box.top,
      Math.min(point.top, box.bottom - popup.height),
    );
  }
  return {
    ...point,
    side,
    align,
    arrowX: Math.max(
      8,
      Math.min(popup.width - 8, anchor.left + anchor.width / 2 - point.left),
    ),
    arrowY: Math.max(
      8,
      Math.min(popup.height - 8, anchor.top + anchor.height / 2 - point.top),
    ),
    availableWidth: Math.max(0, box.right - box.left),
    availableHeight: Math.max(0, box.bottom - box.top),
  };
}

/** Use the renderer's public style contract, including its unitless property list.
 * The detached probe never participates in layout and is disposed after copying. */
export function normalizeTooltipStyles(
  document: Document,
  style?: JSX.CSSProperties,
) {
  if (!style) return [];
  const probe = createPreactElement<HTMLSpanElement>(
    document,
    h('span', { style }),
  );
  try {
    return Array.from({ length: probe.style.length }, (_, index) => {
      const property = probe.style.item(index);
      return [
        property,
        probe.style.getPropertyValue(property),
        probe.style.getPropertyPriority(property),
      ] as const;
    });
  } finally {
    releasePreactElement(probe);
  }
}
