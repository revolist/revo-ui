import { h } from 'preact';
import { createPreactElement, releasePreactElement } from '../preact-mount';
import { calculateTooltipPosition } from './tooltip-surface';
import { TooltipSession } from './tooltip-session';
import { calculateAnchoredPopoverPosition } from './anchored-popover';
import { createControlId } from './control-id';
import { inheritUiMotion } from './motion';
import {
  hideTopLayerPopup,
  showTopLayerPopup,
  type TopLayerPopupMode,
} from './top-layer-popup';
const popoverStacks = new WeakMap<Document, HTMLElement[]>();

export interface PopoverOptions {
  anchor: HTMLElement | SVGElement;
  placement?: 'above';
  content: HTMLElement;
  /** Defaults to the document body. */
  appendTo?: HTMLElement;
  onClose?: () => void;
  restoreFocus?: boolean;
  closeOnOutside?: boolean;
  closeOnEscape?: boolean;
  display?: string;
}

/** One owner for native top-layer promotion, viewport positioning and disposal. */
export class PopoverController {
  private active?: {
    content: HTMLElement;
    close: (restoreFocus?: boolean) => void;
    position: () => void;
  };
  get isOpen() {
    return !!this.active;
  }
  open(options: PopoverOptions) {
    this.close(false);
    const { anchor, content } = options;
    const document = anchor.ownerDocument;
    const view = document.defaultView;
    const stack = popoverStacks.get(document) ?? [];
    popoverStacks.set(document, stack);
    const previousParent = content.parentNode;
    const previousSibling = content.nextSibling;
    const originalHidden = content.hidden;
    const originalStyle = content.getAttribute('style');
    const originalPopover = content.getAttribute('popover');
    const releaseMotion = inheritUiMotion(anchor, content);
    const position = () => {
      if (!anchor.isConnected) {
        close(false);
        return;
      }
      const point = (
        options.placement === 'above'
          ? calculateTooltipPosition
          : calculateAnchoredPopoverPosition
      )(anchor.getBoundingClientRect(), content.getBoundingClientRect(), {
        width: document.documentElement.clientWidth || view?.innerWidth || 0,
        height: document.documentElement.clientHeight || view?.innerHeight || 0,
      });
      Object.assign(content.style, {
        left: `${point.left}px`,
        top: `${point.top}px`,
      });
    };
    let mode: TopLayerPopupMode | undefined;
    let disposed = false;
    const close = (restoreFocus = options.restoreFocus !== false) => {
      if (disposed) return;
      disposed = true;
      document.removeEventListener('pointerdown', outside, true);
      content.removeEventListener('keydown', keyboard);
      document.removeEventListener('keydown', keyboard);
      view?.removeEventListener('resize', position);
      document.removeEventListener('scroll', position, true);
      observer?.disconnect();
      const index = stack.indexOf(content);
      if (index !== -1) stack.splice(index, 1);
      hideTopLayerPopup(content, mode);
      releaseMotion();
      if (previousParent?.isConnected)
        previousParent.insertBefore(
          content,
          previousSibling?.parentNode === previousParent
            ? previousSibling
            : null,
        );
      else content.remove();
      if (originalStyle === null) content.removeAttribute('style');
      else content.setAttribute('style', originalStyle);
      content.hidden = originalHidden;
      if (originalPopover === null) content.removeAttribute('popover');
      else content.setAttribute('popover', originalPopover);
      if (this.active?.content === content) this.active = undefined;
      if (restoreFocus && anchor.isConnected)
        anchor.focus({ preventScroll: true });
      options.onClose?.();
    };
    const outside = (event: Event) => {
      if (stack.at(-1) !== content) return;
      const path = event.composedPath();
      if (
        options.closeOnOutside !== false &&
        !path.includes(anchor) &&
        !path.includes(content)
      )
        close(false);
    };
    const keyboard = (event: KeyboardEvent) => {
      if (
        stack.at(-1) === content &&
        event.key === 'Escape' &&
        options.closeOnEscape !== false &&
        !event.defaultPrevented
      ) {
        event.preventDefault();
        event.stopPropagation();
        close();
      }
    };
    (options.appendTo ?? document.body).append(content);
    content.hidden = false;
    Object.assign(content.style, {
      position: 'fixed',
      inset: 'auto',
      margin: '0',
    });
    mode = showTopLayerPopup(content, options.display ?? 'block');
    const observer = view?.ResizeObserver
      ? new view.ResizeObserver(position)
      : undefined;
    observer?.observe(anchor);
    observer?.observe(content);
    this.active = { content, close, position };
    stack.push(content);
    document.addEventListener('pointerdown', outside, true);
    // Compositions may isolate keyboard events before they reach document.
    content.addEventListener('keydown', keyboard);
    document.addEventListener('keydown', keyboard);
    view?.addEventListener('resize', position);
    document.addEventListener('scroll', position, true);
    position();
    return { close, refresh: position };
  }
  refresh() {
    this.active?.position();
  }
  close(restoreFocus?: boolean) {
    this.active?.close(restoreFocus);
  }
  destroy() {
    this.close(false);
  }
}

export function createTooltipElement(
  document: Document,
  className = 'grid-tooltip',
) {
  return createPreactElement<HTMLDivElement>(
    document,
    <div
      id={createControlId('rv-tooltip')}
      class={className}
      role="tooltip"
      hidden
    />,
  );
}

/** Imperative binding adapter over the same session used by useTooltip. */
export class TooltipController {
  private release?: () => void;
  bind(
    anchor: HTMLElement | SVGElement,
    text: string,
    options: {
      trigger?: 'hover' | 'click';
      surface?: HTMLElement;
      onEscape?: () => void;
    } = {},
  ) {
    this.destroy();
    const surface =
      options.surface ??
      createTooltipElement(anchor.ownerDocument, 'rv-tooltip');
    surface.textContent = text;
    const session = new TooltipSession();
    session.setSurface(surface);
    session.onEscape = options.onEscape;
    const clickOnly = options.trigger === 'click';
    const expanded = anchor.getAttribute('aria-expanded');
    if (clickOnly) anchor.setAttribute('aria-expanded', 'false');
    session.onHide = () => {
      if (clickOnly) anchor.setAttribute('aria-expanded', 'false');
    };
    const show = () => {
      session.show(anchor);
      if (clickOnly)
        anchor.setAttribute('aria-expanded', String(session.isOpen));
    };
    const toggle = () => (session.isOpen ? session.hide() : show());
    const focus = () => session.focus(anchor);
    const blur = () => session.blur();
    const leave = () => session.leave(anchor);
    const pointerDown = () => {
      session.pointerDown();
      session.hide();
    };
    const keyboard = (event: Event) => session.keyDown(event as KeyboardEvent);
    if (clickOnly) anchor.addEventListener('click', toggle);
    else {
      anchor.addEventListener('pointerenter', show);
      anchor.addEventListener('pointerleave', leave);
      anchor.addEventListener('focus', focus);
      anchor.addEventListener('blur', blur);
      anchor.addEventListener('pointerdown', pointerDown);
      anchor.addEventListener('keydown', keyboard);
    }
    this.release = () => {
      session.destroy();
      anchor.removeEventListener('click', toggle);
      anchor.removeEventListener('pointerenter', show);
      anchor.removeEventListener('pointerleave', leave);
      anchor.removeEventListener('focus', focus);
      anchor.removeEventListener('blur', blur);
      anchor.removeEventListener('pointerdown', pointerDown);
      anchor.removeEventListener('keydown', keyboard);
      if (clickOnly) {
        if (expanded === null) anchor.removeAttribute('aria-expanded');
        else anchor.setAttribute('aria-expanded', expanded);
      }
      if (!options.surface) releasePreactElement(surface);
    };
    return () => this.destroy();
  }
  destroy() {
    this.release?.();
    this.release = undefined;
  }
}
