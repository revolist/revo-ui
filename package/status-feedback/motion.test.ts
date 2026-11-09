// @vitest-environment happy-dom
import { afterEach, expect, it, vi } from 'vitest';
import { animateStatusFeedback } from './motion';
import { statusFeedbackExit } from './exit-snapshot';

afterEach(() => {
  document.body.replaceChildren();
  vi.restoreAllMocks();
  Reflect.deleteProperty(HTMLElement.prototype, 'animate');
});
function fixture(reduced = false) {
  const panel = document.createElement('section');
  panel.className = 'rv-status-feedback';
  panel.innerHTML =
    '<div role="alert" aria-live="polite" id="notice">Translated message</div><button id="retry">Retry</button>';
  document.body.append(panel);
  vi.spyOn(window, 'matchMedia').mockReturnValue({
    matches: reduced,
  } as MediaQueryList);
  const animation = {
    cancel: vi.fn(),
    id: '',
    onfinish: null,
    oncancel: null,
    finished: Promise.resolve(),
  };
  const animate = vi.fn<Element['animate']>(
    () => animation as unknown as Animation,
  );
  Object.defineProperty(HTMLElement.prototype, 'animate', {
    configurable: true,
    value: animate,
  });
  return { panel, animate, animation };
}
it('provides short shared enter/resize motion and named animation handles', () => {
  const { panel, animate, animation } = fixture();
  expect(
    animateStatusFeedback(
      panel,
      [{ opacity: 0 }, { opacity: 1 }],
      'rv-status-enter',
    ),
  ).toBe(animation);
  expect(animation.id).toBe('rv-status-enter');
  expect(animate.mock.calls[0][1]).toMatchObject({ duration: 180 });
});
it('keeps exit snapshots inert, without duplicate IDs or announcements, and removes them on finish', () => {
  const { panel, animation } = fixture();
  const cancel = statusFeedbackExit(panel)!;
  const snapshot = document.querySelector<HTMLElement>(
    '[data-status-feedback-exit]',
  )!;
  expect(snapshot.inert).toBe(true);
  expect(snapshot.getAttribute('aria-hidden')).toBe('true');
  expect(snapshot.querySelector('[id], [role], [aria-live]')).toBeNull();
  expect(snapshot.style.pointerEvents).toBe('none');
  expect(animation.id).toBe('rv-status-exit');
  (animation.onfinish as unknown as () => void)();
  expect(snapshot.isConnected).toBe(false);
  expect(panel.isConnected).toBe(true);
  cancel();
  expect(animation.cancel).toHaveBeenCalledOnce();
});
it('skips all animation and exit snapshots when reduced motion is requested', () => {
  const { panel, animate } = fixture(true);
  expect(
    animateStatusFeedback(
      panel,
      [{ opacity: 0 }, { opacity: 1 }],
      'rv-status-enter',
    ),
  ).toBeUndefined();
  expect(statusFeedbackExit(panel)).toBeUndefined();
  expect(document.querySelector('[data-status-feedback-exit]')).toBeNull();
  expect(animate).not.toHaveBeenCalled();
});

it('removes a still-running exit immediately when cleanup interrupts it', () => {
  const { panel, animation } = fixture();
  const cancel = statusFeedbackExit(panel)!;
  expect(document.querySelector('[data-status-feedback-exit]')).toBeTruthy();
  cancel();
  expect(animation.cancel).toHaveBeenCalledOnce();
  expect(document.querySelector('[data-status-feedback-exit]')).toBeNull();
});

it('preserves the visible scroll position in a closing activity snapshot', () => {
  const { panel } = fixture();
  const items = document.createElement('div');
  items.className = 'rv-status-feedback__items';
  items.scrollTop = 125;
  panel.append(items);
  const cleanup = statusFeedbackExit(panel)!;
  expect(
    document.querySelector(
      '[data-status-feedback-exit] .rv-status-feedback__items',
    )?.scrollTop,
  ).toBe(125);
  cleanup();
});

it('allows an enter animation to be interrupted without an unhandled rejection', async () => {
  const { panel, animation } = fixture();
  let rejectFinished!: (reason: unknown) => void;
  animation.finished = new Promise<void>((_, reject) => {
    rejectFinished = reject;
  });
  animation.cancel.mockImplementation(() =>
    rejectFinished(new DOMException('Canceled', 'AbortError')),
  );
  const handle = animateStatusFeedback(
    panel,
    [{ opacity: 0 }, { opacity: 1 }],
    'rv-status-enter',
  )!;
  handle.cancel();
  await new Promise((resolve) => setTimeout(resolve, 0));
  expect(animation.cancel).toHaveBeenCalledOnce();
  expect(panel.isConnected).toBe(true);
});

it('skips Web Animations and exit snapshots inside an explicitly disabled region', () => {
  const { panel, animate } = fixture();
  const region = document.createElement('section');
  region.dataset.rvUiMotion = 'off';
  document.body.append(region);
  region.append(panel);
  expect(
    animateStatusFeedback(
      panel,
      [{ opacity: 0 }, { opacity: 1 }],
      'rv-status-enter',
    ),
  ).toBeUndefined();
  expect(statusFeedbackExit(panel)).toBeUndefined();
  expect(animate).not.toHaveBeenCalled();
});

it('cancels a running animation when motion is disabled and uses shared durations', async () => {
  const { panel, animate, animation } = fixture();
  panel.style.setProperty('--rv-ui-motion-enter', '210ms');
  let finish!: () => void;
  animation.finished = new Promise<void>((resolve) => {
    finish = resolve;
  });
  animateStatusFeedback(
    panel,
    [{ opacity: 0 }, { opacity: 1 }],
    'rv-status-enter',
  );
  expect(animate.mock.calls[0][1]).toMatchObject({ duration: 210 });
  panel.dataset.rvUiMotion = 'off';
  await new Promise((resolve) => setTimeout(resolve, 0));
  expect(animation.cancel).toHaveBeenCalledOnce();
  finish();
  await Promise.resolve();
});
