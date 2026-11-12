export const DEFAULT_TOUCH_GESTURE_THRESHOLD_PX = 8;
export type PointerKind = 'mouse' | 'touch' | 'pen' | 'unknown';
type PointerStart = Pick<PointerEvent, 'button' | 'isPrimary' | 'pointerType'>;
export type PointerListenerTarget = Pick<
  EventTarget,
  'addEventListener' | 'removeEventListener'
>;
export type PointerCaptureTarget = Pick<
  Element,
  'setPointerCapture' | 'releasePointerCapture'
> &
  Partial<
    Pick<
      Element,
      | 'hasPointerCapture'
      | 'addEventListener'
      | 'removeEventListener'
      | 'ownerDocument'
    >
  >;
export interface PointerGestureLifecycleOptions {
  readonly event: PointerEvent;
  readonly onMove: (event: PointerEvent) => void;
  readonly onEnd: (event: PointerEvent) => void;
  readonly onCancel?: (event: Event) => void;
  readonly listenerTarget?: PointerListenerTarget;
  /** Set null when preview rendering replaces the pressed element. */
  readonly captureTarget?: PointerCaptureTarget | null;
}
export interface PointerGestureLifecycle {
  readonly pointerId: number;
  destroy(): void;
}
export interface PointerMovement {
  readonly dx: number;
  readonly dy: number;
  readonly distance: number;
  readonly passed: boolean;
  readonly dominantAxis: 'x' | 'y' | 'none';
}
export function getPointerKind(
  event: Pick<PointerEvent, 'pointerType'>,
): PointerKind {
  return event.pointerType === 'mouse' ||
    event.pointerType === 'touch' ||
    event.pointerType === 'pen'
    ? event.pointerType
    : 'unknown';
}
export function isCoarsePointer(
  event: Pick<PointerEvent, 'pointerType'>,
): boolean {
  const kind = getPointerKind(event);
  return kind === 'touch' || kind === 'pen';
}
export function isPrimaryPointer(event: PointerStart): boolean {
  return (
    event.button === 0 && (!isCoarsePointer(event) || event.isPrimary !== false)
  );
}
/** Coarse contacts may manipulate selected items or explicit handles; other contacts can scroll. */
export function canStartPointerGesture(
  event: PointerStart,
  options: {
    readonly selected?: boolean;
    readonly explicitHandle?: boolean;
  } = {},
): boolean {
  return (
    isPrimaryPointer(event) &&
    (!isCoarsePointer(event) ||
      options.explicitHandle === true ||
      options.selected === true)
  );
}
export function readPointerMovement(
  event: Pick<PointerEvent, 'clientX' | 'clientY'>,
  origin: { readonly clientX: number; readonly clientY: number },
  threshold = DEFAULT_TOUCH_GESTURE_THRESHOLD_PX,
): PointerMovement {
  const dx = event.clientX - origin.clientX;
  const dy = event.clientY - origin.clientY;
  const distance = Math.hypot(dx, dy);
  return {
    dx,
    dy,
    distance,
    passed: distance >= threshold,
    dominantAxis:
      Math.abs(dx) > Math.abs(dy)
        ? 'x'
        : Math.abs(dy) > Math.abs(dx)
          ? 'y'
          : 'none',
  };
}

/** Tracks one gesture, releasing all bindings before a terminal callback runs. */
export function bindPointerGestureLifecycle(
  options: PointerGestureLifecycleOptions,
): PointerGestureLifecycle | null {
  const { event, onMove, onEnd, onCancel } = options;
  const captureTarget =
    options.captureTarget === undefined
      ? getCaptureTarget(event)
      : options.captureTarget;
  const ownerDocument =
    captureTarget?.ownerDocument ??
    (event.target as Node | null)?.ownerDocument;
  const listenerTarget =
    options.listenerTarget ??
    ownerDocument?.defaultView ??
    ownerDocument ??
    getGlobalListenerTarget();
  if (!listenerTarget) return null;
  const pointerId = event.pointerId;
  let active = true;
  let captured = false;
  const cleanup = () => {
    if (!active) return;
    active = false;
    listenerTarget.removeEventListener('pointermove', move as EventListener);
    listenerTarget.removeEventListener('pointerup', end as EventListener);
    listenerTarget.removeEventListener(
      'pointercancel',
      cancel as EventListener,
    );
    listenerTarget.removeEventListener('blur', cancel);
    listenerTarget.removeEventListener(
      'keydown',
      keyDown as EventListener,
      true,
    );
    captureTarget?.removeEventListener?.(
      'lostpointercapture',
      cancel as EventListener,
    );
    if (captured && captureTarget) {
      try {
        if (
          !captureTarget.hasPointerCapture ||
          captureTarget.hasPointerCapture(pointerId)
        )
          captureTarget.releasePointerCapture(pointerId);
      } catch {
        // Capture may already have been released or its element removed.
      }
    }
  };
  const move = (next: PointerEvent) => {
    if (active && next.pointerId === pointerId) onMove(next);
  };
  const end = (next: PointerEvent) => {
    if (!active || next.pointerId !== pointerId) return;
    cleanup();
    onEnd(next);
  };
  const cancel = (next: Event) => {
    if (!active || ('pointerId' in next && next.pointerId !== pointerId))
      return;
    cleanup();
    onCancel?.(next);
  };
  const keyDown = (next: KeyboardEvent) => {
    if (!active || next.key !== 'Escape') return;
    next.preventDefault();
    next.stopPropagation();
    cancel(next);
  };
  try {
    captureTarget?.setPointerCapture(pointerId);
    captured = captureTarget != null;
  } catch {
    // Window/document listeners still track handles that cannot capture.
  }
  captureTarget?.addEventListener?.(
    'lostpointercapture',
    cancel as EventListener,
  );
  listenerTarget.addEventListener('pointermove', move as EventListener);
  listenerTarget.addEventListener('pointerup', end as EventListener);
  listenerTarget.addEventListener('pointercancel', cancel as EventListener);
  listenerTarget.addEventListener('blur', cancel);
  listenerTarget.addEventListener('keydown', keyDown as EventListener, true);
  return { pointerId, destroy: cleanup };
}
function getCaptureTarget(event: PointerEvent): PointerCaptureTarget | null {
  const target = event.currentTarget ?? event.target;
  return target &&
    'setPointerCapture' in target &&
    'releasePointerCapture' in target &&
    typeof target.setPointerCapture === 'function' &&
    typeof target.releasePointerCapture === 'function'
    ? (target as PointerCaptureTarget)
    : null;
}
function getGlobalListenerTarget(): PointerListenerTarget | null {
  const target = globalThis as Partial<PointerListenerTarget>;
  return typeof target.addEventListener === 'function' &&
    typeof target.removeEventListener === 'function'
    ? (target as PointerListenerTarget)
    : null;
}
