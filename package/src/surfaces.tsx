import { h } from 'preact';
import { createPreactElement, releasePreactElement } from './preact-mount';
import { inheritUiMotion } from './core/motion';
import {
  hideTopLayerPopup,
  showTopLayerPopup,
  type TopLayerPopupMode,
} from './core/top-layer-popup';
import {
  createDialogElements,
  getDialogFocusableElements,
  trapDialogFocus,
} from './dialog/dialog.dom';
import { attachDialogDrag } from './dialog/dialog.drag';
import type { DialogHandle, DialogOpenOptions } from './dialog/dialog.types';

const dialogStacks = new WeakMap<Document, HTMLElement[]>();
export interface DialogEnvironment {
  beforeMount?: (root: HTMLElement) => void;
  onOpen?: (options: DialogOpenOptions) => void;
  restoreFocus?: (explicit?: HTMLElement, previous?: HTMLElement) => void;
}

/** Standalone modal lifecycle. Integration hooks belong to the host application. */
export class DialogController {
  private active?: DialogHandle;
  constructor(
    private readonly document: Document,
    private readonly environment: DialogEnvironment = {},
  ) {}
  get isOpen() {
    return !!this.active;
  }
  open(options: DialogOpenOptions): DialogHandle {
    this.close();
    const document = this.document;
    const previous = document.activeElement as HTMLElement | null;
    let closed = false;
    let disposeDrag: (() => void) | undefined;
    let releaseMotion: (() => void) | undefined;
    const stack = dialogStacks.get(document) ?? [];
    dialogStacks.set(document, stack);
    const close = () => {
      if (closed) return;
      closed = true;
      disposeDrag?.();
      releaseMotion?.();
      releasePreactElement(elements.root);
      const index = stack.indexOf(elements.root);
      const wasTop = index === stack.length - 1;
      if (index !== -1) stack.splice(index, 1);
      if (this.active?.root === elements.root) this.active = undefined;
      try {
        options.onClose?.();
      } finally {
        if (wasTop) {
          if (this.environment.restoreFocus)
            this.environment.restoreFocus(
              options.returnFocus,
              previous ?? undefined,
            );
          else {
            const target = [options.returnFocus, previous].find(
              (element) => element?.isConnected,
            );
            target?.focus?.({ preventScroll: true });
          }
        }
      }
    };
    const elements = createDialogElements(document, options, close);
    const handle = { ...elements, close };
    this.environment.beforeMount?.(elements.root);
    releaseMotion = inheritUiMotion(
      options.returnFocus ?? previous,
      elements.root,
    );
    elements.root.addEventListener('mousedown', (event) => {
      if (event.target === elements.root && stack.at(-1) === elements.root)
        close();
    });
    elements.root.addEventListener('keydown', (event) => {
      if (stack.at(-1) !== elements.root) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        close();
      } else if (event.key === 'Tab') trapDialogFocus(elements.root, event);
    });
    document.body.append(elements.root);
    stack.push(elements.root);
    if (options.draggable !== false)
      disposeDrag = attachDialogDrag({
        target: elements.surface,
        handle: elements.header,
      });
    this.active = handle;
    this.environment.onOpen?.(options);
    queueMicrotask(() => {
      if (!closed && stack.at(-1) === elements.root)
        (getDialogFocusableElements(elements.root)[0] ?? elements.root).focus({
          preventScroll: true,
        });
    });
    return handle;
  }
  close(root?: HTMLElement) {
    if (!root || this.active?.root === root) this.active?.close();
  }
  destroy() {
    this.close();
  }
}

export {
  PopoverController,
  TooltipController,
  createTooltipElement,
  type PopoverOptions,
} from './core/popover-controller';

/** Keyboard behavior for menu surfaces; activation stays on native buttons. */
export function attachMenuKeyboard(
  menu: HTMLElement,
  onClose: () => void = () => {},
  options: { closeOnEscape?: boolean } = {},
) {
  const listener = (event: KeyboardEvent) => {
    const items = Array.from(
      menu.querySelectorAll<HTMLElement>(
        '[role="menuitem"], [role="menuitemcheckbox"], [role="menuitemradio"]',
      ),
    ).filter(
      (item) =>
        item.closest('[role="menu"]') === menu &&
        item.getAttribute('aria-disabled') !== 'true' &&
        !item.hasAttribute('disabled') &&
        !item.hidden,
    );
    const current = items.indexOf(
      menu.ownerDocument.activeElement as HTMLElement,
    );
    if (
      ['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key) &&
      items.length
    ) {
      event.preventDefault();
      event.stopPropagation();
      const index =
        event.key === 'Home'
          ? 0
          : event.key === 'End'
            ? items.length - 1
            : (current + (event.key === 'ArrowUp' ? -1 : 1) + items.length) %
              items.length;
      items[index]?.focus();
    } else if (event.key === 'Escape' && options.closeOnEscape !== false) {
      event.preventDefault();
      event.stopPropagation();
      onClose();
    }
  };
  menu.addEventListener('keydown', listener);
  return () => menu.removeEventListener('keydown', listener);
}

export interface ResizeOptions {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  label: string;
  /** Rejects a proposed width without changing the handle's current value. */
  acceptValue?: (value: number) => boolean;
  onChange: (value: number) => void;
  direction?: 'ltr' | 'rtl';
}
/** Width resize controller. An options reader keeps controlled updates from interrupting a drag. */
export function attachResizeHandle(
  handle: HTMLElement,
  options: ResizeOptions | (() => ResizeOptions),
) {
  const readOptions = typeof options === 'function' ? options : () => options;
  let value = readOptions().value;
  let externalValue = value;
  const currentOptions = () => {
    const current = readOptions();
    if (current.value !== externalValue) {
      externalValue = current.value;
      value = current.value;
    }
    return current;
  };
  let disposeDrag = () => {};
  const set = (next: number) => {
    const current = currentOptions();
    const proposed = Math.min(
      current.max ?? Infinity,
      Math.max(current.min ?? 0, next),
    );
    if (current.acceptValue?.(proposed) === false) return;
    value = proposed;
    handle.setAttribute('aria-valuenow', String(value));
    current.onChange(value);
  };
  const initialOptions = readOptions();
  handle.setAttribute('role', 'separator');
  handle.setAttribute('aria-orientation', 'vertical');
  handle.setAttribute('aria-label', initialOptions.label);
  handle.tabIndex = 0;
  handle.setAttribute('aria-valuenow', String(value));
  if (initialOptions.min !== undefined)
    handle.setAttribute('aria-valuemin', String(initialOptions.min));
  if (initialOptions.max !== undefined)
    handle.setAttribute('aria-valuemax', String(initialOptions.max));
  const keyboard = (event: KeyboardEvent) => {
    const current = currentOptions();
    const sign = current.direction === 'rtl' ? -1 : 1;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      set(
        value +
          (event.key === 'ArrowLeft' ? -1 : 1) * sign * (current.step ?? 10),
      );
    } else if (event.key === 'Home' && current.min !== undefined) {
      event.preventDefault();
      set(current.min);
    } else if (event.key === 'End' && current.max !== undefined) {
      event.preventDefault();
      set(current.max);
    }
  };
  const pointer = (event: PointerEvent) => {
    if (event.button !== 0) return;
    event.preventDefault();
    disposeDrag();
    const current = currentOptions();
    const sign = current.direction === 'rtl' ? -1 : 1;
    handle.focus({ preventScroll: true });
    const start = event.clientX,
      initial = value,
      document = handle.ownerDocument;
    const move = (next: PointerEvent) => {
      if (next.pointerId === event.pointerId)
        set(initial + (next.clientX - start) * sign);
    };
    const end = (next: PointerEvent) => {
      if (next.pointerId === event.pointerId) disposeDrag();
    };
    document.addEventListener('pointermove', move);
    document.addEventListener('pointerup', end);
    document.addEventListener('pointercancel', end);
    const blur = () => disposeDrag();
    document.defaultView?.addEventListener('blur', blur);
    disposeDrag = () => {
      document.removeEventListener('pointermove', move);
      document.removeEventListener('pointerup', end);
      document.removeEventListener('pointercancel', end);
      document.defaultView?.removeEventListener('blur', blur);
    };
  };
  handle.addEventListener('keydown', keyboard);
  handle.addEventListener('pointerdown', pointer);
  return () => {
    disposeDrag();
    handle.removeEventListener('keydown', keyboard);
    handle.removeEventListener('pointerdown', pointer);
  };
}

export { useTooltip, ControlTooltip } from './core/tooltip';
export {
  prepareTooltipSurface,
  ensureTooltipStyles,
} from './core/tooltip-surface';
export { TooltipText } from './core/tooltip-text';
