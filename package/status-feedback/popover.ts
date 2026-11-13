import { inheritUiMotion } from '../core/motion';
import { statusFeedbackSize } from './placement';
import { animateStatusFeedback } from './motion';
import { statusFeedbackExit } from './exit-snapshot';
import { calculateAnchoredPopoverPosition } from '../core/anchored-popover';
import {
  hideTopLayerPopup,
  showTopLayerPopup,
  type TopLayerPopupMode,
} from '../core/top-layer-popup';

export interface StatusFeedbackPopoverOptions {
  readonly onChange: () => void;
  readonly boundary?: HTMLElement;
  readonly width?: number;
  readonly collapsedWidth?: number;
  readonly collapsed?: boolean;
  /** Prefer above-anchor feedback while keeping the full surface on screen. */
  readonly placement?: 'auto' | 'above';
}
let nextPopoverId = 0;

/** Shared positioning and lifecycle for persistent, non-modal activity popovers. */
export class StatusFeedbackPopoverController {
  readonly id = `rv-status-popover-${++nextPopoverId}`;
  private anchor: HTMLElement | null = null;
  private panel: HTMLElement | null = null;
  private window: Window | null = null;
  private observer?: ResizeObserver;
  private frame?: number;
  private mode?: TopLayerPopupMode;
  private disposed = false;
  private isCollapsed: boolean;
  private animation?: Animation;
  private releaseMotion?: () => void;
  private removeExit?: () => void;

  constructor(private readonly options: StatusFeedbackPopoverOptions) {
    this.isCollapsed = options.collapsed ?? false;
  }
  get collapsed(): boolean {
    return this.isCollapsed;
  }

  readonly anchorRef = (element?: HTMLElement | null): void => {
    const next = element ?? null;
    if (next !== this.anchor) {
      this.stopWatching();
      this.releaseMotion?.();
      this.releaseMotion = undefined;
    }
    this.anchor = next;
    if (!this.anchor) this.hide(true);
    else this.refresh();
  };
  readonly panelRef = (element?: HTMLElement | null): void => {
    const next = element ?? null;
    if (next !== this.panel) {
      this.panel?.removeEventListener('toggle', this.onToggle);
      this.hide(true);
      this.panel = next;
      this.panel?.addEventListener('toggle', this.onToggle);
    }
    if (this.panel) this.refresh();
  };

  private readonly onToggle = (event: Event): void => {
    // Moving a live host during a framework/grid patch can close its native
    // popover. Restore promotion while the owner still wants the panel open.
    if (this.mode === 'popover' && (event as ToggleEvent).newState === 'closed') {
      this.mode = undefined;
      this.refresh();
    }
  };

  setCollapsed(collapsed: boolean): void {
    if (this.disposed || collapsed === this.isCollapsed) return;
    // Move focus out of content before it becomes hidden; preserve native button behavior.
    const focused = this.panel?.ownerDocument.activeElement;
    if (collapsed && focused && this.panel?.contains(focused))
      this.panel
        .querySelector<HTMLButtonElement>('.rv-status-feedback__toggle')
        ?.focus({ preventScroll: true });
    this.animation?.cancel();
    this.isCollapsed = collapsed;
    this.options.onChange();
    this.refresh();
  }

  /** Call after rendering items; sizing is measured after the renderer finishes its patch. */
  readonly refresh = (): void => {
    if (this.disposed || !this.panel || !this.anchor) return;
    const view = this.panel.ownerDocument.defaultView;
    if (!view) return;
    if (this.window !== view) {
      this.stopWatching();
      this.window = view;
      view.addEventListener('resize', this.refresh);
      view.addEventListener('scroll', this.refresh, true);
      if (typeof ResizeObserver !== 'undefined') {
        this.observer = new ResizeObserver(this.refresh);
        this.observer.observe(this.panel);
        this.observer.observe(this.anchor);
        if (this.options.boundary) this.observer.observe(this.options.boundary);
      }
    }
    if (this.frame !== undefined) return;
    this.frame = view.requestAnimationFrame(() => {
      this.frame = undefined;
      this.position();
    });
  };

  hide(animate = false): void {
    if (!animate || this.mode) {
      this.removeExit?.();
      this.removeExit = undefined;
    }
    if (animate && this.panel?.isConnected && this.mode)
      this.removeExit = statusFeedbackExit(this.panel);
    this.animation?.cancel();
    this.animation = undefined;
    this.releaseMotion?.();
    this.releaseMotion = undefined;
    if (this.panel && this.mode) hideTopLayerPopup(this.panel, this.mode);
    this.mode = undefined;
    this.stopWatching();
  }
  destroy(): void {
    this.panel?.removeEventListener('toggle', this.onToggle);
    this.hide();
    this.disposed = true;
    this.panel = null;
    this.anchor = null;
  }

  private position(): void {
    const panel = this.panel;
    const anchor = this.anchor;
    const view = this.window;
    if (!panel?.isConnected || !anchor?.isConnected || !view || this.disposed)
      return;
    const boundary = this.options.boundary?.getBoundingClientRect();
    const size = statusFeedbackSize(
      { width: view.innerWidth, height: view.innerHeight },
      boundary,
      this.collapsed,
      this.options,
    );
    const width = size.width;
    panel.style.width = `${width}px`;
    panel.style.maxHeight = `${size.maxHeight}px`;
    this.releaseMotion ??= inheritUiMotion(anchor, panel);
    // Native promotion can be lost silently when a host is reinserted.
    if (this.mode === 'popover' && !panel.matches(':popover-open'))
      this.mode = undefined;
    const opening = !this.mode;
    if (opening) {
      this.removeExit?.();
      this.removeExit = undefined;
      this.mode = showTopLayerPopup(panel);
    }
    const target = anchor.getBoundingClientRect();
    const location = calculateAnchoredPopoverPosition(
      {
        left: target.right - width,
        right: target.right,
        top: target.bottom,
        bottom: target.bottom,
      },
      { width: panel.offsetWidth, height: panel.offsetHeight },
      { width: view.innerWidth, height: view.innerHeight },
      0,
    );
    panel.style.left = `${location.left}px`;
    const top = this.options.placement === 'above'
      ? Math.min(
          Math.max(8, target.top - panel.offsetHeight),
          Math.max(8, view.innerHeight - panel.offsetHeight - 8),
        )
      : location.top;
    panel.style.top = `${top}px`;
    if (opening) {
      this.animation?.cancel();
      this.animation = animateStatusFeedback(
        panel,
        [{ opacity: 0 }, { opacity: 1 }],
        'rv-status-enter',
      );
    }
  }

  private stopWatching(): void {
    if (this.frame !== undefined) this.window?.cancelAnimationFrame(this.frame);
    this.frame = undefined;
    this.observer?.disconnect();
    this.observer = undefined;
    this.window?.removeEventListener('resize', this.refresh);
    this.window?.removeEventListener('scroll', this.refresh, true);
    this.window = null;
  }
}
