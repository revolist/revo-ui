import { afterEach, expect, it, vi } from 'vitest';
import { Window } from 'happy-dom';
import {
  bindPointerGestureLifecycle,
  canStartPointerGesture,
  getPointerKind,
  isCoarsePointer,
  isPrimaryPointer,
  readPointerMovement,
  type PointerGestureLifecycle,
} from '@revolist/ui/core/pointer-gesture';

const gestures: PointerGestureLifecycle[] = [];
afterEach(() => {
  gestures.splice(0).forEach((gesture) => gesture.destroy());
  document.body.replaceChildren();
});
function pointer(type: string, init: PointerEventInit = {}) {
  return new PointerEvent(type, {
    pointerId: 1,
    pointerType: 'touch',
    isPrimary: true,
    button: 0,
    bubbles: true,
    cancelable: true,
    ...init,
  });
}
function fixture() {
  const target = document.createElement('div');
  document.body.append(target);
  Object.assign(target, {
    setPointerCapture: vi.fn(),
    hasPointerCapture: () => true,
    releasePointerCapture: vi.fn(() =>
      target.dispatchEvent(pointer('lostpointercapture')),
    ),
  });
  const onMove = vi.fn(),
    onEnd = vi.fn(),
    onCancel = vi.fn();
  const gesture = bindPointerGestureLifecycle({
    event: pointer('pointerdown'),
    captureTarget: target,
    listenerTarget: window,
    onMove,
    onEnd,
    onCancel,
  })!;
  gestures.push(gesture);
  return { target, gesture, onMove, onEnd, onCancel };
}

it('classifies pointers and requires selection or a handle for coarse manipulation', () => {
  for (const pointerType of ['touch', 'pen']) {
    const event = pointer('pointerdown', { pointerType });
    expect(getPointerKind(event)).toBe(pointerType);
    expect(isCoarsePointer(event)).toBe(true);
    expect(canStartPointerGesture(event)).toBe(false);
    expect(canStartPointerGesture(event, { selected: true })).toBe(true);
    expect(canStartPointerGesture(event, { explicitHandle: true })).toBe(true);
    expect(
      isPrimaryPointer(
        pointer('pointerdown', { pointerType, isPrimary: false }),
      ),
    ).toBe(false);
  }
  expect(
    canStartPointerGesture(pointer('pointerdown', { pointerType: 'mouse' })),
  ).toBe(true);
  expect(
    canStartPointerGesture(pointer('pointerdown', { button: 2 }), {
      explicitHandle: true,
    }),
  ).toBe(false);
  expect(getPointerKind(pointer('pointerdown', { pointerType: '' }))).toBe(
    'unknown',
  );
});

it('uses an inclusive eight-pixel tolerance and exposes the dominant movement axis', () => {
  expect(
    readPointerMovement({ clientX: 7, clientY: 0 }, { clientX: 0, clientY: 0 }),
  ).toMatchObject({ passed: false });
  expect(
    readPointerMovement({ clientX: 8, clientY: 0 }, { clientX: 0, clientY: 0 }),
  ).toMatchObject({ passed: true, dominantAxis: 'x', distance: 8 });
  expect(
    readPointerMovement(
      { clientX: 2, clientY: -10 },
      { clientX: 0, clientY: 0 },
    ),
  ).toMatchObject({ dx: 2, dy: -10, dominantAxis: 'y' });
});

it('routes one pointer and cleans up before completion, including capture-release reentrancy', () => {
  const { onMove, onEnd, onCancel, target } = fixture();
  window.dispatchEvent(pointer('pointermove', { pointerId: 2 }));
  window.dispatchEvent(pointer('pointerup', { pointerId: 2 }));
  expect(onMove).not.toHaveBeenCalled();
  expect(onEnd).not.toHaveBeenCalled();
  window.dispatchEvent(pointer('pointermove'));
  window.dispatchEvent(pointer('pointerup'));
  expect(onMove).toHaveBeenCalledOnce();
  expect(onEnd).toHaveBeenCalledOnce();
  expect(onCancel).not.toHaveBeenCalled();
  expect(target.releasePointerCapture).toHaveBeenCalledWith(1);
  window.dispatchEvent(pointer('pointermove'));
  expect(onMove).toHaveBeenCalledOnce();
});

it.each(['pointercancel', 'lostpointercapture', 'blur', 'Escape'])(
  'cancels exactly once on %s without committing',
  (reason) => {
    const { target, onMove, onEnd, onCancel } = fixture();
    if (reason === 'lostpointercapture') target.dispatchEvent(pointer(reason));
    else if (reason === 'Escape')
      window.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'Escape',
          bubbles: true,
          cancelable: true,
        }),
      );
    else if (reason === 'blur') window.dispatchEvent(new Event('blur'));
    else window.dispatchEvent(pointer(reason));
    window.dispatchEvent(pointer('pointerup'));
    window.dispatchEvent(pointer('pointermove'));
    expect(onCancel).toHaveBeenCalledOnce();
    expect(onEnd).not.toHaveBeenCalled();
    expect(onMove).not.toHaveBeenCalled();
  },
);

it('ignores other pointer capture losses and keys', () => {
  const { target, onEnd, onCancel } = fixture();
  target.dispatchEvent(pointer('lostpointercapture', { pointerId: 2 }));
  window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
  expect(onCancel).not.toHaveBeenCalled();
  window.dispatchEvent(pointer('pointerup'));
  expect(onEnd).toHaveBeenCalledOnce();
});

it('tracks replacement-rendered gestures without capture and survives unavailable capture', () => {
  for (const captureTarget of [
    null,
    {
      setPointerCapture: () => {
        throw new Error('Detached');
      },
      releasePointerCapture: vi.fn(),
    },
  ]) {
    const onEnd = vi.fn();
    const gesture = bindPointerGestureLifecycle({
      event: pointer('pointerdown'),
      listenerTarget: window,
      captureTarget,
      onMove: vi.fn(),
      onEnd,
    })!;
    gestures.push(gesture);
    window.dispatchEvent(pointer('pointerup'));
    expect(onEnd).toHaveBeenCalledOnce();
  }
});

it('uses the capture element owner window instead of the ambient window', () => {
  const view = new Window();
  const target = view.document.createElement('div') as unknown as HTMLElement;
  const onMove = vi.fn();
  const gesture = bindPointerGestureLifecycle({
    event: pointer('pointerdown'),
    captureTarget: target,
    onMove,
    onEnd: vi.fn(),
  })!;
  gestures.push(gesture);
  window.dispatchEvent(pointer('pointermove'));
  expect(onMove).not.toHaveBeenCalled();
  view.dispatchEvent(pointer('pointermove'));
  expect(onMove).toHaveBeenCalledOnce();
});

it('destroy releases ownership without invoking a terminal callback', () => {
  const { gesture, onEnd, onCancel } = fixture();
  gesture.destroy();
  gesture.destroy();
  window.dispatchEvent(pointer('pointerup'));
  expect(onEnd).not.toHaveBeenCalled();
  expect(onCancel).not.toHaveBeenCalled();
});
