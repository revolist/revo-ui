const DEFAULT_IGNORE_SELECTOR = [
  'a',
  'button',
  'input',
  'select',
  'textarea',
  '[contenteditable="true"]',
  '[data-dialog-drag-ignore]',
].join(',');

export interface DialogDragOptions {
  readonly target: HTMLElement;
  readonly handle: HTMLElement;
  readonly margin?: number;
  readonly ignoreSelector?: string;
}

interface DragState {
  readonly clientX: number;
  readonly clientY: number;
  readonly pointerId: number;
  readonly rect: DOMRect;
  readonly translateX: number;
  readonly translateY: number;
}

/**
 * Makes a dialog movable from a dedicated header without owning its rendering.
 */
export function attachDialogDrag({
  target,
  handle,
  margin = 8,
  ignoreSelector = DEFAULT_IGNORE_SELECTOR,
}: DialogDragOptions): () => void {
  const view = target.ownerDocument.defaultView;
  if (!view) {
    return () => undefined;
  }

  let translateX = 0;
  let translateY = 0;
  let drag: DragState | undefined;

  const renderPosition = () => {
    target.style.setProperty('--rv-dialog-translate-x', `${translateX}px`);
    target.style.setProperty('--rv-dialog-translate-y', `${translateY}px`);
  };
  const stop = (event?: Event) => {
    if (!drag) {
      return;
    }
    if (
      event &&
      'pointerId' in event &&
      typeof event.pointerId === 'number' &&
      event.pointerId !== drag.pointerId
    ) {
      return;
    }
    const pointerId = drag.pointerId;
    drag = undefined;
    target.classList.remove('rv-dialog__dragging');
    view.removeEventListener('pointermove', move);
    view.removeEventListener('pointerup', stop);
    view.removeEventListener('pointercancel', stop);
    view.removeEventListener('blur', stop);
    handle.removeEventListener('lostpointercapture', stop);
    if (handle.hasPointerCapture?.(pointerId)) {
      handle.releasePointerCapture(pointerId);
    }
  };
  const move = (event: PointerEvent) => {
    if (!drag || event.pointerId !== drag.pointerId) {
      return;
    }
    const xBounds = getDragBounds(
      drag.rect.left,
      drag.rect.right,
      view.innerWidth,
      margin,
    );
    const yBounds = getDragBounds(
      drag.rect.top,
      drag.rect.bottom,
      view.innerHeight,
      margin,
    );
    const nextTranslateX =
      drag.translateX +
      clamp(event.clientX - drag.clientX, xBounds.min, xBounds.max);
    const nextTranslateY =
      drag.translateY +
      clamp(event.clientY - drag.clientY, yBounds.min, yBounds.max);
    event.preventDefault();
    if (nextTranslateX === translateX && nextTranslateY === translateY) {
      return;
    }
    translateX = nextTranslateX;
    translateY = nextTranslateY;
    renderPosition();
  };
  const start = (event: PointerEvent) => {
    if (
      event.button !== 0 ||
      event.isPrimary === false ||
      isIgnoredTarget(event.target, handle, ignoreSelector)
    ) {
      return;
    }
    stop();
    drag = {
      clientX: event.clientX,
      clientY: event.clientY,
      pointerId: event.pointerId,
      rect: target.getBoundingClientRect(),
      translateX,
      translateY,
    };
    target.classList.add('rv-dialog__dragging');
    view.addEventListener('pointermove', move, { passive: false });
    view.addEventListener('pointerup', stop);
    view.addEventListener('pointercancel', stop);
    view.addEventListener('blur', stop);
    handle.addEventListener('lostpointercapture', stop);
    try {
      handle.setPointerCapture?.(event.pointerId);
    } catch {
      // Synthetic events and detached test nodes may not be capturable.
    }
    event.preventDefault();
  };
  const keepInViewport = () => {
    stop();
    const rect = target.getBoundingClientRect();
    const correctionX = getViewportCorrection(
      rect.left,
      rect.right,
      view.innerWidth,
      margin,
    );
    const correctionY = getViewportCorrection(
      rect.top,
      rect.bottom,
      view.innerHeight,
      margin,
    );
    if (!correctionX && !correctionY) {
      return;
    }
    translateX += correctionX;
    translateY += correctionY;
    renderPosition();
  };

  target.classList.add('rv-dialog__draggable');
  handle.classList.add('rv-dialog__drag-handle');
  handle.addEventListener('pointerdown', start);
  view.addEventListener('resize', keepInViewport);
  view.visualViewport?.addEventListener('resize', keepInViewport);
  const resizeObserver = view.ResizeObserver
    ? new view.ResizeObserver(keepInViewport)
    : undefined;
  resizeObserver?.observe(target);

  return () => {
    stop();
    handle.removeEventListener('pointerdown', start);
    view.removeEventListener('resize', keepInViewport);
    view.visualViewport?.removeEventListener('resize', keepInViewport);
    resizeObserver?.disconnect();
    handle.classList.remove('rv-dialog__drag-handle');
    target.classList.remove('rv-dialog__draggable', 'rv-dialog__dragging');
    target.style.removeProperty('--rv-dialog-translate-x');
    target.style.removeProperty('--rv-dialog-translate-y');
  };
}

function isIgnoredTarget(
  target: EventTarget | null,
  handle: HTMLElement,
  selector: string,
): boolean {
  const ElementCtor = handle.ownerDocument.defaultView?.Element;
  if (!ElementCtor || !(target instanceof ElementCtor)) {
    return false;
  }
  const ignored = target.closest(selector);
  return !!ignored && handle.contains(ignored);
}

function getDragBounds(
  start: number,
  end: number,
  viewportSize: number,
  margin: number,
): { min: number; max: number } {
  if (end - start >= viewportSize - margin * 2) {
    return {
      min: -start,
      max: viewportSize - end,
    };
  }
  return {
    min: margin - start,
    max: viewportSize - margin - end,
  };
}

function getViewportCorrection(
  start: number,
  end: number,
  viewportSize: number,
  margin: number,
): number {
  if (end - start >= viewportSize - margin * 2) {
    return -start;
  }
  if (start < margin) {
    return margin - start;
  }
  return end > viewportSize - margin ? viewportSize - margin - end : 0;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, Math.min(min, max)), Math.max(min, max));
}
