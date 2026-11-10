import { h } from 'preact';
import type {
  TooltipAnchor,
  TooltipChangeDetails,
  TooltipContent,
  TooltipControllerOptions,
} from './tooltip-options';
import {
  createPreactElement,
  releasePreactElement,
  renderPreactInto,
} from '../preact-mount';
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

/** Imperative/delegated adapter over the shared tooltip session. */
export class TooltipController {
  private session?: TooltipSession;
  private root?: TooltipAnchor;
  private content: TooltipContent = '';
  private options: TooltipControllerOptions = {};
  private release?: () => void;
  private abort?: AbortController;
  private context?: TooltipChangeDetails;
  private generation = 0;
  private loading = false;
  private asyncContent: TooltipContent | undefined;
  private renderedNode?: Node;
  get isOpen() {
    return this.session?.isOpen ?? false;
  }
  get element() {
    return this.session?.element;
  }
  target() {
    return this.session?.target;
  }
  private render(value: TooltipContent) {
    const surface = this.element;
    if (!surface) return;
    this.renderedNode?.parentNode?.removeChild(this.renderedNode);
    this.renderedNode = undefined;
    const node =
      value && typeof value === 'object' && 'nodeType' in value
        ? (value as Node)
        : undefined;
    this.renderedNode = node;
    renderPreactInto(
      surface,
      h(
        'span',
        {
          class: 'rv-tooltip__content',
          ref: node
            ? (host: HTMLSpanElement | null) => {
                if (host && node.parentNode !== host) host.append(node);
              }
            : undefined,
        },
        node ? null : (value as import('preact').ComponentChildren),
      ),
    );
    this.session?.refresh();
  }
  private renderCurrent() {
    if (this.context)
      this.render(
        this.options.loadContent && this.asyncContent !== undefined
          ? this.asyncContent
          : (this.options.renderContent?.(this.context) ?? this.content),
      );
  }
  private load(details: TooltipChangeDetails) {
    this.abort?.abort();
    this.abort = new AbortController();
    const generation = ++this.generation;
    this.asyncContent = undefined;
    const loader = this.options.loadContent;
    if (!loader) {
      this.loading = false;
      this.renderCurrent();
      return;
    }
    this.loading = true;
    this.element?.setAttribute('aria-busy', 'true');
    this.render(this.options.loadingContent ?? this.content);
    const signal = this.abort.signal;
    Promise.resolve()
      .then(() => loader({ ...details, signal }))
      .then(
        (value) => {
          if (signal.aborted || generation !== this.generation || !this.isOpen)
            return;
          this.loading = false;
          this.element?.removeAttribute('aria-busy');
          this.asyncContent = value;
          this.render(value);
          this.options.onContentLoad?.(value, details);
        },
        (error) => {
          if (signal.aborted || generation !== this.generation || !this.isOpen)
            return;
          this.loading = false;
          this.element?.removeAttribute('aria-busy');
          if (this.options.errorContent !== undefined) {
            this.asyncContent = this.options.errorContent;
            this.render(this.options.errorContent);
          } else this.hide();
          this.options.onError?.(error, details);
        },
      );
  }
  private reveal(
    target: TooltipAnchor,
    reason: TooltipChangeDetails['reason'],
    event?: Event,
  ) {
    this.context = { target, reason, event };
    if (!this.isOpen || this.target() !== target) this.renderCurrent();
    this.session?.show(target, reason, event);
  }
  /** Bind one trigger, or a container with options.filter for delegated triggers. */
  bind(
    anchor: TooltipAnchor,
    content: TooltipContent,
    options: TooltipControllerOptions = {},
  ) {
    this.destroy();
    this.root = anchor;
    this.content = content;
    this.options = options;
    // Validate delegated selectors once at binding rather than on pointer events.
    if (options.filter) anchor.querySelector(options.filter);
    const surface =
      options.surface ??
      createTooltipElement(anchor.ownerDocument, 'rv-tooltip');
    if (options.id) surface.id = options.id;
    const session = (this.session = new TooltipSession());
    session.setSurface(surface);
    session.configure(options);
    const expanded = new Map<TooltipAnchor, string | null>();
    const setExpanded = (target: TooltipAnchor, open: boolean) => {
      if (!expanded.has(target))
        expanded.set(target, target.getAttribute('aria-expanded'));
      target.setAttribute('aria-expanded', String(open));
    };
    if (options.trigger === 'click' && !options.filter)
      setExpanded(anchor, false);
    session.onShow = (details) => {
      if (triggers().includes('click')) setExpanded(details.target, true);
      this.context = details;
      this.load(details);
    };
    session.onHide = () => {
      this.abort?.abort();
      this.generation++;
      this.loading = false;
      surface.removeAttribute('aria-busy');
      if (this.target() && expanded.has(this.target()!))
        setExpanded(this.target()!, false);
    };
    const resolve = (event: Event) => {
      if (!this.options.filter) return anchor;
      const target = (event.target as Element | null)?.closest?.(
        this.options.filter,
      );
      return target && anchor.contains(target)
        ? (target as TooltipAnchor)
        : undefined;
    };
    const triggers = () =>
      Array.isArray(this.options.trigger)
        ? this.options.trigger
        : this.options.trigger === 'manual'
          ? []
          : this.options.trigger === 'click'
            ? ['click']
            : this.options.trigger === 'focus'
              ? ['focus']
              : ['hover', 'focus'];
    const enter = (event: Event) => {
      const target = resolve(event);
      const related = (event as PointerEvent).relatedTarget as Node | null;
      if (related && target?.contains(related)) return;
      if (
        target &&
        triggers().includes('hover') &&
        (event as PointerEvent).pointerType !== 'touch'
      )
        this.reveal(target, 'hover', event);
    };
    const leave = (event: Event) => {
      const target = resolve(event);
      if (!target || target !== this.target()) return;
      const related = (event as MouseEvent).relatedTarget as Node | null;
      if (related && target.contains(related)) return;
      session.leave(target, event as MouseEvent);
    };
    const focus = (event: Event) => {
      const target = resolve(event);
      if (target && triggers().includes('focus'))
        this.reveal(target, 'focus', event);
    };
    const blur = (event: Event) => {
      const target = resolve(event);
      if (target && target === this.target()) session.blur(event);
    };
    const pointerDown = (event: Event) => {
      session.pointerDown();
      if (this.options.hideOnClick !== false && !triggers().includes('click'))
        session.hide('press', event);
    };
    const click = (event: Event) => {
      const target = resolve(event);
      if (!target) return;
      if (!triggers().includes('click')) {
        if (this.options.hideOnClick !== false) session.hide('press', event);
        return;
      }
      if (this.isOpen && this.target() === target) session.hide('click', event);
      else this.reveal(target, 'click', event);
    };
    const keyboard = (event: Event) => {
      if (
        !triggers().includes('click') ||
        (event as KeyboardEvent).key === 'Escape'
      )
        session.keyDown(event as KeyboardEvent);
    };
    const entries: [string, EventListener][] = [
      [options.filter ? 'pointerover' : 'pointerenter', enter],
      [options.filter ? 'pointerout' : 'pointerleave', leave],
      ['focus', focus],
      ['blur', blur],
      ['pointerdown', pointerDown],
      ['keydown', keyboard],
      ['click', click],
    ];
    for (const [type, listener] of entries)
      anchor.addEventListener(type, listener, true);
    this.release = () => {
      this.abort?.abort();
      this.generation++;
      for (const [type, listener] of entries)
        anchor.removeEventListener(type, listener, true);
      session.destroy();
      renderPreactInto(surface, null);
      for (const [target, original] of expanded) {
        if (original === null) target.removeAttribute('aria-expanded');
        else target.setAttribute('aria-expanded', original);
      }
      if (!options.surface) releasePreactElement(surface);
    };
    if (!options.filter) {
      this.context = { target: anchor, reason: 'imperative' };
      this.renderCurrent();
    }
    if (
      anchor.ownerDocument.activeElement === anchor &&
      triggers().includes('focus')
    )
      this.reveal(anchor, 'focus');
    return () => this.destroy();
  }
  update(options: TooltipControllerOptions) {
    this.options = options;
    this.session?.configure(options);
    if (options.id && this.element && !this.isOpen)
      this.element.id = options.id;
    if (this.isOpen && !this.loading) this.renderCurrent();
  }
  setContent(content: TooltipContent) {
    this.content = content;
    if (this.isOpen && !this.loading) this.renderCurrent();
  }
  /** Immediate imperative methods; controlled values still authorize visibility. */
  show(target = this.target() ?? this.root) {
    if (target) this.reveal(target, 'imperative');
  }
  hide() {
    this.session?.hide();
  }
  toggle(target = this.target() ?? this.root) {
    if (this.isOpen) this.hide();
    else this.show(target);
  }
  /** Synchronize controlled/default state without emitting another change request. */
  setOpen(open: boolean, target = this.target() ?? this.root) {
    if (open && target) this.reveal(target, 'controlled');
    else this.session?.hide('controlled');
  }
  refresh() {
    if (this.isOpen && this.context) this.load(this.context);
    this.session?.refresh();
  }
  destroy() {
    this.release?.();
    this.release = undefined;
    this.session = undefined;
    this.root = undefined;
    this.context = undefined;
    this.abort = undefined;
    this.asyncContent = undefined;
    this.renderedNode = undefined;
  }
}
