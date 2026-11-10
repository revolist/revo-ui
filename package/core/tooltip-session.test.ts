import { afterEach, expect, it, vi } from 'vitest';
import { TooltipSession } from './tooltip-session';
import { TooltipController } from './popover-controller';

const sessions: TooltipSession[] = [];
afterEach(() => {
  sessions.splice(0).forEach((session) => session.destroy());
  document.body.replaceChildren();
  vi.useRealTimers();
});
function fixture() {
  const anchor = document.createElement('button');
  const surface = document.createElement('span');
  surface.id = 'session-hint';
  surface.hidden = true;
  document.body.append(anchor, surface);
  const session = new TooltipSession();
  session.setSurface(surface);
  sessions.push(session);
  return { anchor, surface, session };
}
it('preserves unrelated descriptions added while a tooltip is visible', () => {
  const { anchor, surface, session } = fixture();
  anchor.setAttribute('aria-describedby', 'original');
  session.show(anchor);
  expect(session.isOpen).toBe(true);
  anchor.setAttribute(
    'aria-describedby',
    `${anchor.getAttribute('aria-describedby')} newer`,
  );
  session.hide();
  expect(anchor.getAttribute('aria-describedby')).toBe('original newer');
  expect(surface.hidden).toBe(true);
});
it('cancels pending hints on Escape and destroys their timers', () => {
  vi.useFakeTimers();
  const { anchor, surface, session } = fixture();
  session.delay = 500;
  session.show(anchor);
  document.dispatchEvent(
    new KeyboardEvent('keydown', {
      key: 'Escape',
      bubbles: true,
      cancelable: true,
    }),
  );
  vi.advanceTimersByTime(600);
  expect(surface.hidden).toBe(true);
  expect(session.isPending).toBe(false);
  session.show(anchor);
  session.destroy();
  expect(vi.getTimerCount()).toBe(0);
});
it('retires a removed anchor and releases its listeners', async () => {
  const { anchor, surface, session } = fixture();
  session.show(anchor);
  anchor.remove();
  await Promise.resolve();
  expect(session.isOpen).toBe(false);
  expect(surface.hidden).toBe(true);
});
it('leaves native keyboard click toggling to the imperative adapter', () => {
  const anchor = document.createElement('button');
  document.body.append(anchor);
  const controller = new TooltipController();
  const dispose = controller.bind(anchor, 'Details', { trigger: 'click' });
  try {
    anchor.click();
    expect(anchor.getAttribute('aria-expanded')).toBe('true');
    anchor.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }),
    );
    anchor.click();
    expect(anchor.getAttribute('aria-expanded')).toBe('false');
  } finally {
    dispose();
  }
});

it('keeps slow pointer travel between an anchor and tooltip open until exit or Escape', () => {
  const { anchor, surface, session } = fixture();
  vi.spyOn(anchor, 'getBoundingClientRect').mockReturnValue(
    new DOMRect(40, 100, 60, 24),
  );
  vi.spyOn(surface, 'getBoundingClientRect').mockReturnValue(
    new DOMRect(20, 60, 100, 32),
  );
  session.show(anchor);
  session.leave(
    anchor,
    new MouseEvent('mouseleave', { clientX: 70, clientY: 96 }),
  );
  expect(session.isOpen).toBe(true);
  surface.dispatchEvent(new PointerEvent('pointerenter'));
  document.dispatchEvent(
    new PointerEvent('pointermove', { clientX: 50, clientY: 75 }),
  );
  expect(session.isOpen).toBe(true);
  document.dispatchEvent(
    new PointerEvent('pointermove', { clientX: 500, clientY: 500 }),
  );
  expect(session.isOpen).toBe(false);
  session.show(anchor);
  session.leave(
    anchor,
    new MouseEvent('mouseleave', { clientX: 70, clientY: 96 }),
  );
  document.dispatchEvent(
    new KeyboardEvent('keydown', {
      key: 'Escape',
      bubbles: true,
      cancelable: true,
    }),
  );
  expect(surface.hidden).toBe(true);
});
