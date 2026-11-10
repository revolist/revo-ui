import {
  claimTooltip,
  releaseTooltip,
} from '@revolist/chart-utils/tooltip-owner';
import {
  calculateTooltipPosition,
  prepareTooltipSurface,
} from './tooltip-surface';
import {
  hideTopLayerPopup,
  showTopLayerPopup,
  type TopLayerPopupMode,
} from './top-layer-popup';

export type TooltipAnchor = HTMLElement | SVGElement;

/** One lifecycle for declarative and imperative tooltip adapters. */
export class TooltipSession {
  private anchor?: TooltipAnchor;
  private surface?: HTMLElement;
  private timer?: ReturnType<typeof setTimeout>;
  private mode?: TopLayerPopupMode;
  private cleanup?: () => void;
  private mounted = false;
  private pointerFocus = false;
  private pointerTravel = false;
  private hoverArea?: {
    left: number;
    right: number;
    top: number;
    bottom: number;
  };
  private open = false;
  private addedDescription = false;
  onHide?: () => void;
  onEscape?: () => void;
  delay = 0;

  get isOpen() {
    return this.open;
  }
  get isPending() {
    return this.timer !== undefined;
  }
  setSurface(surface: HTMLElement | null) {
    this.surface = surface ?? undefined;
  }

  show(anchor: TooltipAnchor) {
    if (this.anchor === anchor && this.open) return;
    this.hide();
    this.anchor = anchor;
    this.listen(anchor);
    if (this.delay > 0)
      this.timer = setTimeout(() => {
        this.timer = undefined;
        this.present();
      }, this.delay);
    else this.present();
  }

  private present() {
    const anchor = this.anchor,
      surface = this.surface;
    if (!anchor || !surface || !anchor.isConnected) {
      this.hide();
      return;
    }
    claimTooltip(anchor.ownerDocument, this, () => this.hide());
    prepareTooltipSurface(surface);
    this.mounted = !surface.isConnected;
    if (this.mounted) anchor.ownerDocument.body.append(surface);
    surface.hidden = false;
    surface.dataset.visible = 'true';
    Object.assign(surface.style, {
      position: 'fixed',
      inset: 'auto',
      margin: '0',
      transform: 'none',
      visibility: 'visible',
      positionAnchor: 'auto',
      positionArea: 'none',
    });
    this.mode = showTopLayerPopup(surface, 'block');
    const view = anchor.ownerDocument.defaultView;
    const anchorBounds = anchor.getBoundingClientRect();
    const surfaceBounds = surface.getBoundingClientRect();
    const point = calculateTooltipPosition(anchorBounds, surfaceBounds, {
      width: view?.innerWidth ?? 0,
      height: view?.innerHeight ?? 0,
    });
    Object.assign(surface.style, {
      left: `${point.left}px`,
      top: `${point.top}px`,
    });
    // Placement already measured both boxes; pointer travel needs no layout reads.
    if (
      anchorBounds.width > 0 &&
      anchorBounds.height > 0 &&
      surfaceBounds.width > 0 &&
      surfaceBounds.height > 0
    ) {
      this.hoverArea = {
        left: Math.min(anchorBounds.left, point.left),
        right: Math.max(anchorBounds.right, point.left + surfaceBounds.width),
        top: Math.min(anchorBounds.top, point.top),
        bottom: Math.max(anchorBounds.bottom, point.top + surfaceBounds.height),
      };
    }
    const descriptions = new Set(
      (anchor.getAttribute('aria-describedby') ?? '')
        .split(/\s+/)
        .filter(Boolean),
    );
    this.addedDescription = !descriptions.has(surface.id);
    descriptions.add(surface.id);
    anchor.setAttribute('aria-describedby', [...descriptions].join(' '));
    this.open = true;
  }

  hide() {
    clearTimeout(this.timer);
    this.timer = undefined;
    this.cleanup?.();
    this.cleanup = undefined;
    const anchor = this.anchor,
      surface = this.surface;
    if (anchor) releaseTooltip(anchor.ownerDocument, this);
    if (surface && this.open) {
      hideTopLayerPopup(surface, this.mode);
      surface.hidden = true;
      surface.dataset.visible = 'false';
      if (anchor && this.addedDescription) {
        const remaining = (anchor.getAttribute('aria-describedby') ?? '')
          .split(/\s+/)
          .filter((id) => id && id !== surface.id);
        if (remaining.length)
          anchor.setAttribute('aria-describedby', remaining.join(' '));
        else anchor.removeAttribute('aria-describedby');
      }
      if (this.mounted) surface.remove();
    }
    const wasOpen = this.open;
    this.open = false;
    this.pointerTravel = false;
    this.hoverArea = undefined;
    if (wasOpen) this.onHide?.();
    this.mode = undefined;
    this.mounted = false;
  }

  focus(anchor: TooltipAnchor) {
    this.show(anchor);
  }
  blur() {
    this.pointerFocus = false;
    this.hide();
  }
  pointerDown() {
    this.pointerFocus = true;
  }
  leave(anchor?: TooltipAnchor, event?: MouseEvent) {
    // Keep the gap traversable at any pointer speed; there is no hide timeout.
    if (this.open && event && this.insideHoverArea(event)) {
      this.pointerTravel = true;
      return;
    }
    if (
      !anchor ||
      this.pointerFocus ||
      anchor.ownerDocument.activeElement !== anchor
    )
      this.hide();
  }
  private insideHoverArea(event: MouseEvent) {
    const area = this.hoverArea;
    return (
      !!area &&
      event.clientX >= area.left &&
      event.clientX <= area.right &&
      event.clientY >= area.top &&
      event.clientY <= area.bottom
    );
  }
  keyDown(event: KeyboardEvent) {
    if (
      event.key === 'Escape' &&
      (this.open || this.isPending) &&
      !event.defaultPrevented
    ) {
      event.preventDefault();
      event.stopPropagation();
      this.hide();
      this.onEscape?.();
    } else if (event.key === 'Enter' || event.key === ' ') this.hide();
  }
  destroy() {
    this.hide();
    this.surface = undefined;
    this.anchor = undefined;
  }

  private listen(anchor: TooltipAnchor) {
    const document = anchor.ownerDocument,
      view = document.defaultView;
    const parent = anchor.closest('[popover]');
    const hide = () => this.hide();
    const outside = (event: Event) => {
      const path = event.composedPath();
      if (
        !path.includes(anchor) &&
        (!this.surface || !path.includes(this.surface))
      )
        this.hide();
    };
    const move = (event: PointerEvent) => {
      if (this.pointerTravel && !this.insideHoverArea(event))
        this.leave(anchor);
    };
    const enterSurface = () => {
      this.pointerTravel = true;
    };
    const leaveSurface = (event: PointerEvent) => this.leave(anchor, event);
    const surface = this.surface;
    const scroll = (event: Event) => {
      const target = event.target as Node | null;
      if (target === document || target?.contains?.(anchor)) this.hide();
    };
    const toggle = () => {
      if (!parent?.matches(':popover-open')) this.hide();
    };
    const keyboard = (event: KeyboardEvent) => {
      if (event.key === 'Escape') this.keyDown(event);
    };
    const Observer = view?.MutationObserver;
    const observer = Observer
      ? new Observer(() => {
          if (!anchor.isConnected) this.hide();
        })
      : undefined;
    observer?.observe(document, { childList: true, subtree: true });
    document.addEventListener('keydown', keyboard, true);
    document.addEventListener('pointerdown', outside, true);
    document.addEventListener('pointermove', move, true);
    surface?.addEventListener('pointerenter', enterSurface);
    surface?.addEventListener('pointerleave', leaveSurface);
    document.addEventListener('scroll', scroll, true);
    document.addEventListener('visibilitychange', hide);
    view?.addEventListener('resize', hide);
    view?.addEventListener('blur', hide);
    parent?.addEventListener('toggle', toggle);
    this.cleanup = () => {
      observer?.disconnect();
      document.removeEventListener('keydown', keyboard, true);
      document.removeEventListener('pointerdown', outside, true);
      document.removeEventListener('pointermove', move, true);
      surface?.removeEventListener('pointerenter', enterSurface);
      surface?.removeEventListener('pointerleave', leaveSurface);
      document.removeEventListener('scroll', scroll, true);
      document.removeEventListener('visibilitychange', hide);
      view?.removeEventListener('resize', hide);
      view?.removeEventListener('blur', hide);
      parent?.removeEventListener('toggle', toggle);
    };
  }
}
