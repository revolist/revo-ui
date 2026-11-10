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
import { inheritUiMotion, isUiMotionEnabled } from './motion';
import type {
  TooltipAnchor,
  TooltipChangeDetails,
  TooltipOptions,
  TooltipReason,
} from './tooltip-options';
export type { TooltipAnchor } from './tooltip-options';

/** Shared state, ownership, placement and timers for every tooltip adapter. */
export class TooltipSession {
  private anchor?: TooltipAnchor;
  private surface?: HTMLElement;
  private timer?: ReturnType<typeof setTimeout>;
  private closeTimer?: ReturnType<typeof setTimeout>;
  private transitionTimer?: ReturnType<typeof setTimeout>;
  private frame?: number;
  private mode?: TopLayerPopupMode;
  private cleanup?: () => void;
  private restoreMotion?: () => void;
  private managedMount = false;
  private home?: { parent: Node; next: Node | null };
  private pointerFocus = false;
  private pointerTravel = false;
  private hoverArea?: {
    left: number;
    right: number;
    top: number;
    bottom: number;
  };
  private open = false;
  private disposed = false;
  private addedDescription = false;
  private classes: string[] = [];
  private styleKeys: string[] = [];
  private details?: TooltipChangeDetails;
  private options: TooltipOptions = {};
  onShow?: (details: TooltipChangeDetails) => void;
  onHide?: () => void;
  onEscape?: () => void;
  /** Legacy direct-session delay; configured options/group take precedence. */
  delay = 0;
  get isOpen() {
    return this.open;
  }
  get isPending() {
    return this.timer !== undefined;
  }
  get target() {
    return this.anchor;
  }
  get element() {
    return this.surface;
  }
  configure(options: TooltipOptions) {
    const group = this.options.group;
    if (this.open && group !== options.group) {
      group?.closed(this);
      options.group?.opened(this);
    }
    this.options = options;
    if (options.disabled) this.hide('disabled', undefined, true);
    else if (this.open) this.refresh();
  }
  setSurface(surface: HTMLElement | null) {
    this.surface = surface ?? undefined;
  }
  private duration() {
    return this.surface && isUiMotionEnabled(this.surface)
      ? Math.max(0, this.options.transitionDuration ?? 0)
      : 0;
  }
  private request(open: boolean, details: TooltipChangeDetails, force = false) {
    if (details.reason === 'controlled' || details.reason === 'destroy')
      return true;
    if (!force && this.options.onBeforeOpenChange?.(open, details) === false)
      return false;
    this.options.onOpenChange?.(open, details);
    return (
      force || this.options.open === undefined || this.options.open === open
    );
  }
  show(
    anchor: TooltipAnchor,
    reason: TooltipReason = 'imperative',
    event?: Event,
  ) {
    clearTimeout(this.closeTimer);
    this.closeTimer = undefined;
    if (this.disposed || this.options.disabled) return;
    if (this.anchor === anchor && this.open) return;
    this.hide('owner-change', undefined, true);
    this.anchor = anchor;
    this.details = { target: anchor, reason, event };
    this.listen(anchor);
    const delay =
      reason === 'controlled'
        ? 0
        : reason === 'imperative'
          ? this.delay
          : reason === 'focus'
            ? (this.options.focusDelay ?? 0)
            : (this.options.delay ??
              this.options.group?.getDelay() ??
              this.delay);
    if (delay > 0)
      this.timer = setTimeout(() => {
        this.timer = undefined;
        this.present();
      }, delay);
    else this.present();
  }
  private applyStyles(surface: HTMLElement) {
    for (const key of this.styleKeys) {
      if (key.startsWith('--')) surface.style.removeProperty(key);
      else (surface.style as any)[key] = '';
    }
    this.styleKeys = Object.keys(this.options.style ?? {});
    surface.classList.remove(...this.classes);
    this.classes = this.options.className?.split(/\s+/).filter(Boolean) ?? [];
    surface.classList.add(...this.classes);
    const size = (value: string | number | undefined, fallback = '') =>
      typeof value === 'number' ? `${value}px` : (value ?? fallback);
    Object.assign(surface.style, {
      width: size(this.options.width),
      height: size(this.options.height),
      maxWidth: size(this.options.maxWidth, 'min(360px, calc(100vw - 16px))'),
      maxHeight: size(this.options.maxHeight, 'calc(100dvh - 16px)'),
    });
    for (const [key, value] of Object.entries(this.options.style ?? {})) {
      if (key.startsWith('--')) surface.style.setProperty(key, String(value));
      else (surface.style as any)[key] = value;
    }
    surface.dataset.arrow = String(this.options.arrow ?? false);
  }
  private present() {
    const anchor = this.anchor,
      surface = this.surface,
      details = this.details;
    if (
      !anchor ||
      !surface ||
      !details ||
      !anchor.isConnected ||
      this.disposed
    ) {
      this.hide('anchor-removed', undefined, true);
      return;
    }
    if (!this.request(true, details)) {
      this.cleanup?.();
      this.cleanup = undefined;
      return;
    }
    if (this.disposed) return;
    claimTooltip(anchor.ownerDocument, this, () =>
      this.hide('owner-change', undefined, true),
    );
    const destination = this.options.appendTo;
    if (destination && surface.parentNode !== destination) {
      if (!this.managedMount && surface.parentNode && surface.isConnected)
        this.home = { parent: surface.parentNode, next: surface.nextSibling };
      else this.managedMount = true;
      destination.append(surface);
    } else if (!surface.isConnected) {
      this.managedMount = true;
      anchor.ownerDocument.body.append(surface);
    }
    prepareTooltipSurface(surface);
    this.restoreMotion = inheritUiMotion(anchor, surface);
    surface.hidden = false;
    surface.dataset.visible = 'true';
    this.applyStyles(surface);
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
    const descriptions = new Set(
      (anchor.getAttribute('aria-describedby') ?? '')
        .split(/\s+/)
        .filter(Boolean),
    );
    this.addedDescription = !descriptions.has(surface.id);
    descriptions.add(surface.id);
    anchor.setAttribute('aria-describedby', [...descriptions].join(' '));
    this.open = true;
    this.options.group?.opened(this);
    this.position(anchor, surface);
    if (!this.open) return;
    const duration = this.duration();
    surface.dataset.duration = String(duration > 0);
    surface.style.setProperty('--rv-tooltip-duration', `${duration}ms`);
    surface.dataset.state = duration ? 'opening' : 'open';
    if (duration) {
      this.frame = anchor.ownerDocument.defaultView?.requestAnimationFrame(
        () => {
          this.frame = undefined;
          if (this.open) surface.dataset.state = 'open';
        },
      );
      this.transitionTimer = setTimeout(() => {
        this.transitionTimer = undefined;
        if (this.open) this.options.onOpenChangeComplete?.(true, details);
      }, duration);
    }
    this.onShow?.(details);
    this.options.onShow?.(details);
    if (!duration && this.open)
      this.options.onOpenChangeComplete?.(true, details);
  }
  private position(anchor: TooltipAnchor, surface: HTMLElement) {
    const view = anchor.ownerDocument.defaultView;
    const anchorBounds = anchor.getBoundingClientRect();
    if (
      !this.options.sticky &&
      anchorBounds.width > 0 &&
      anchorBounds.height > 0 &&
      (anchorBounds.bottom < 0 ||
        anchorBounds.right < 0 ||
        anchorBounds.top > (view?.innerHeight ?? Infinity) ||
        anchorBounds.left > (view?.innerWidth ?? Infinity))
    ) {
      this.hide('viewport', undefined, true);
      return;
    }
    const positionOptions = {
      ...this.options,
      direction:
        this.options.direction ??
        ((view?.getComputedStyle(anchor).direction === 'rtl'
          ? 'rtl'
          : 'ltr') as 'ltr' | 'rtl'),
    };
    const viewport = {
      width: view?.innerWidth ?? 0,
      height: view?.innerHeight ?? 0,
    };
    let surfaceBounds = surface.getBoundingClientRect();
    let point = calculateTooltipPosition(
      anchorBounds,
      surfaceBounds,
      viewport,
      positionOptions,
    );
    if (
      this.options.collisionAvoidance !== false &&
      (surfaceBounds.width > point.availableWidth ||
        surfaceBounds.height > point.availableHeight)
    ) {
      if (surfaceBounds.width > point.availableWidth)
        surface.style.maxWidth = `${point.availableWidth}px`;
      if (surfaceBounds.height > point.availableHeight)
        surface.style.maxHeight = `${point.availableHeight}px`;
      surfaceBounds = surface.getBoundingClientRect();
      point = calculateTooltipPosition(
        anchorBounds,
        surfaceBounds,
        viewport,
        positionOptions,
      );
    }
    Object.assign(surface.style, {
      left: `${point.left}px`,
      top: `${point.top}px`,
    });
    surface.dataset.side = point.side;
    surface.dataset.align = point.align;
    for (const [key, value] of Object.entries({
      '--rv-tooltip-arrow-x': point.arrowX,
      '--rv-tooltip-arrow-y': point.arrowY,
      '--anchor-width': anchorBounds.width,
      '--anchor-height': anchorBounds.height,
      '--available-width': point.availableWidth,
      '--available-height': point.availableHeight,
    }))
      surface.style.setProperty(key, `${value}px`);
    // Reuse placement measurements. Pointer movement never measures layout.
    this.hoverArea =
      anchorBounds.width > 0 && surfaceBounds.width > 0
        ? {
            left: Math.min(anchorBounds.left, point.left),
            right: Math.max(
              anchorBounds.right,
              point.left + surfaceBounds.width,
            ),
            top: Math.min(anchorBounds.top, point.top),
            bottom: Math.max(
              anchorBounds.bottom,
              point.top + surfaceBounds.height,
            ),
          }
        : undefined;
  }
  refresh() {
    if (this.open && this.anchor && this.surface) {
      this.applyStyles(this.surface);
      this.position(this.anchor, this.surface);
    }
  }
  hide(reason: TooltipReason = 'imperative', event?: Event, force = false) {
    const anchor = this.anchor,
      surface = this.surface;
    const details = anchor ? { target: anchor, reason, event } : undefined;
    if (
      (this.open || this.isPending) &&
      details &&
      !this.request(false, details, force)
    )
      return;
    clearTimeout(this.timer);
    clearTimeout(this.closeTimer);
    clearTimeout(this.transitionTimer);
    this.timer = this.closeTimer = this.transitionTimer = undefined;
    if (this.frame !== undefined)
      anchor?.ownerDocument.defaultView?.cancelAnimationFrame(this.frame);
    this.frame = undefined;
    this.cleanup?.();
    this.cleanup = undefined;
    const duration = this.open && !force ? this.duration() : 0;
    this.restoreMotion?.();
    this.restoreMotion = undefined;
    if (anchor) releaseTooltip(anchor.ownerDocument, this);
    const wasOpen = this.open;
    this.open = false;
    this.pointerTravel = false;
    this.hoverArea = undefined;
    this.options.group?.closed(this);
    if (anchor && this.addedDescription && surface) {
      const remaining = (anchor.getAttribute('aria-describedby') ?? '')
        .split(/\s+/)
        .filter((id) => id && id !== surface.id);
      if (remaining.length)
        anchor.setAttribute('aria-describedby', remaining.join(' '));
      else anchor.removeAttribute('aria-describedby');
    }
    this.addedDescription = false;
    const finish = () => {
      if (surface) {
        hideTopLayerPopup(surface, this.mode);
        surface.hidden = true;
        surface.dataset.visible = 'false';
        surface.dataset.state = 'closed';
        if (this.home) {
          const { parent, next } = this.home;
          parent.insertBefore(
            surface,
            next?.parentNode === parent ? next : null,
          );
          this.home = undefined;
        } else if (this.managedMount && !this.options.keepMounted)
          surface.remove();
      }
      this.mode = undefined;
      if (wasOpen && details && reason !== 'destroy')
        this.options.onOpenChangeComplete?.(false, details);
    };
    if (duration && surface) {
      surface.dataset.state = 'closing';
      this.transitionTimer = setTimeout(() => {
        this.transitionTimer = undefined;
        finish();
      }, duration);
    } else finish();
    if (wasOpen) {
      this.onHide?.();
      if (details && reason !== 'destroy') this.options.onHide?.(details);
    }
  }
  focus(anchor: TooltipAnchor, event?: Event) {
    this.show(anchor, 'focus', event);
  }
  blur(event?: Event) {
    this.pointerFocus = false;
    this.hide('blur', event);
  }
  pointerDown() {
    this.pointerFocus = true;
  }
  leave(anchor?: TooltipAnchor, event?: MouseEvent) {
    if (this.options.autoHide === false) return;
    if (
      !this.options.disableHoverablePopup &&
      this.open &&
      event &&
      this.insideHoverArea(event)
    ) {
      this.pointerTravel = true;
      return;
    }
    if (
      !anchor ||
      this.pointerFocus ||
      anchor.ownerDocument.activeElement !== anchor
    ) {
      const delay =
        this.options.closeDelay ?? this.options.group?.options.closeDelay ?? 0;
      if (delay > 0 && this.open) {
        clearTimeout(this.closeTimer);
        this.closeTimer = setTimeout(() => {
          this.closeTimer = undefined;
          this.hide('pointer-leave', event);
        }, delay);
      } else this.hide('pointer-leave', event);
    }
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
      !event.defaultPrevented &&
      this.options.closeOnEscape !== false
    ) {
      this.hide('escape', event);
      event.preventDefault();
      event.stopPropagation();
      this.onEscape?.();
      this.options.onEscape?.();
    } else if (
      (event.key === 'Enter' || event.key === ' ') &&
      this.options.hideOnClick !== false
    )
      this.hide('press', event);
  }
  destroy() {
    this.hide('destroy', undefined, true);
    this.disposed = true;
    if (this.managedMount) this.surface?.remove();
    this.surface = undefined;
    this.anchor = undefined;
  }
  private listen(anchor: TooltipAnchor) {
    const document = anchor.ownerDocument,
      view = document.defaultView,
      parent = anchor.closest('[popover]');
    const hide = () => this.hide('viewport', undefined, true);
    const outside = (event: Event) => {
      const path = event.composedPath();
      if (
        this.options.closeOnOutside !== false &&
        !path.includes(anchor) &&
        (!this.surface || !path.includes(this.surface))
      )
        this.hide('outside-press', event);
    };
    const move = (event: PointerEvent) => {
      if (this.pointerTravel && !this.insideHoverArea(event)) {
        this.pointerTravel = false;
        this.leave(anchor);
      }
    };
    const enterSurface = () => {
      if (this.options.disableHoverablePopup) return;
      clearTimeout(this.closeTimer);
      this.closeTimer = undefined;
      if (!this.options.disableHoverablePopup) this.pointerTravel = true;
    };
    const leaveSurface = (event: PointerEvent) => this.leave(anchor, event);
    const surface = this.surface;
    const scroll = (event: Event) => {
      const target = event.target as Node | null;
      if (target === document || target?.contains?.(anchor)) {
        if (
          this.open &&
          (document.activeElement === anchor || this.options.sticky) &&
          this.surface
        )
          this.position(anchor, this.surface);
        else hide();
      }
    };
    const resize = () => this.refresh();
    const toggle = () => {
      if (!parent?.matches(':popover-open')) hide();
    };
    const keyboard = (event: KeyboardEvent) => {
      if (event.key === 'Escape') this.keyDown(event);
    };
    const observer = view?.MutationObserver
      ? new view.MutationObserver(() => {
          if (!anchor.isConnected) this.hide('anchor-removed', undefined, true);
        })
      : undefined;
    observer?.observe(document, { childList: true, subtree: true });
    let positionFrame: number | undefined;
    const sizeObserver = view?.ResizeObserver
      ? new view.ResizeObserver(() => {
          if (positionFrame === undefined)
            positionFrame = view.requestAnimationFrame(() => {
              positionFrame = undefined;
              this.refresh();
            });
        })
      : undefined;
    sizeObserver?.observe(anchor);
    if (surface) sizeObserver?.observe(surface);
    document.addEventListener('keydown', keyboard, true);
    document.addEventListener('pointerdown', outside, true);
    document.addEventListener('pointermove', move, true);
    surface?.addEventListener('pointerenter', enterSurface);
    surface?.addEventListener('pointerleave', leaveSurface);
    document.addEventListener('scroll', scroll, true);
    document.addEventListener('visibilitychange', hide);
    view?.addEventListener('resize', resize);
    view?.addEventListener('blur', hide);
    parent?.addEventListener('toggle', toggle);
    this.cleanup = () => {
      observer?.disconnect();
      sizeObserver?.disconnect();
      if (positionFrame !== undefined)
        view?.cancelAnimationFrame(positionFrame);
      document.removeEventListener('keydown', keyboard, true);
      document.removeEventListener('pointerdown', outside, true);
      document.removeEventListener('pointermove', move, true);
      surface?.removeEventListener('pointerenter', enterSurface);
      surface?.removeEventListener('pointerleave', leaveSurface);
      document.removeEventListener('scroll', scroll, true);
      document.removeEventListener('visibilitychange', hide);
      view?.removeEventListener('resize', resize);
      view?.removeEventListener('blur', hide);
      parent?.removeEventListener('toggle', toggle);
    };
  }
}
