// @vitest-environment happy-dom
import { afterEach, expect, it, vi } from 'vitest';
import { StatusFeedbackPopoverController } from './popover';

afterEach(() => {
  document.body.replaceChildren();
  vi.restoreAllMocks();
});
function fixture(native = true, placement: 'auto' | 'above' = 'auto') {
  const anchor = document.createElement('div');
  const panel = document.createElement('section');
  panel.innerHTML =
    '<button class="rv-status-feedback__toggle">Toggle</button><button class="action">Retry</button>';
  document.body.append(anchor, panel);
  vi.spyOn(anchor, 'getBoundingClientRect').mockReturnValue({
    left: 100,
    right: 700,
    top: 700,
    bottom: 700,
    width: 600,
    height: 0,
  } as DOMRect);
  vi.spyOn(panel, 'getBoundingClientRect').mockImplementation(
    () => ({ width: parseFloat(panel.style.width), height: 160 }) as DOMRect,
  );
  let open = false;
  const show = vi.fn(() => { open = true; });
  const hide = vi.fn(() => { open = false; });
  const matches = panel.matches.bind(panel);
  vi.spyOn(panel, 'matches').mockImplementation(selector => selector === ':popover-open' ? open : matches(selector));
  Object.defineProperties(panel, {
    showPopover: { value: native ? show : undefined },
    hidePopover: { value: hide },
  });
  Object.defineProperty(panel, 'offsetHeight', { configurable: true, value: 160 });
  Object.defineProperty(panel, 'offsetWidth', { configurable: true, get: () => parseFloat(panel.style.width) });
  let frame: FrameRequestCallback | undefined;
  vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
    frame = callback;
    return 1;
  });
  vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {
    frame = undefined;
  });
  const flush = () => {
    const callback = frame;
    frame = undefined;
    callback?.(0);
  };
  const change = vi.fn();
  const controller = new StatusFeedbackPopoverController({ onChange: change, placement });
  controller.anchorRef(anchor);
  controller.panelRef(panel);
  flush();
  return { anchor, panel, show, hide, change, controller, flush, closeSilently: () => { open = false; } };
}
it('opens once in the top layer, resizes when collapsed, preserves focus and cleans up', () => {
  const { panel, show, hide, change, controller, flush } = fixture();
  expect(panel.getAttribute('popover')).toBe('manual');
  expect(show).toHaveBeenCalledOnce();
  expect(panel.style.width).toBe('560px');
  panel.querySelector<HTMLButtonElement>('.action')!.focus();
  controller.setCollapsed(true);
  flush();
  expect(document.activeElement).toBe(
    panel.querySelector('.rv-status-feedback__toggle'),
  );
  expect(controller.collapsed).toBe(true);
  expect(change).toHaveBeenCalledOnce();
  expect(panel.style.width).toBe('260px');
  expect(show).toHaveBeenCalledOnce();
  controller.setCollapsed(true);
  expect(change).toHaveBeenCalledOnce();
  controller.destroy();
  expect(hide).toHaveBeenCalledOnce();
  controller.setCollapsed(false);
  controller.refresh();
  flush();
  expect(show).toHaveBeenCalledOnce();
});
it('supports browsers without popovers and removes pending work when the anchor unmounts', () => {
  const { panel, controller, flush } = fixture(false);
  expect(panel.getAttribute('popover')).toBeNull();
  expect(panel.style.display).toBe('flex');
  controller.refresh();
  controller.anchorRef(null);
  flush();
  expect(panel.style.display).toBe('none');
  controller.destroy();
});

it('keeps body-level feedback within the anchor subtree motion policy', () => {
  const { anchor, panel, controller, flush } = fixture();
  controller.hide();
  const region = document.createElement('section');
  region.dataset.rvUiMotion = 'off';
  document.body.append(region);
  region.append(anchor);
  controller.refresh();
  flush();
  expect(panel.getAttribute('data-rv-ui-motion')).toBe('off');
  controller.destroy();
  expect(panel.hasAttribute('data-rv-ui-motion')).toBe(false);
});

it('keeps an above activity panel above its anchor even when there is room below', () => {
  const { anchor, panel, controller, flush } = fixture(true, 'above');
  vi.spyOn(anchor, 'getBoundingClientRect').mockReturnValue({left: 100, right: 700, top: 300, bottom: 300, width: 600, height: 0} as DOMRect);
  controller.refresh();
  flush();
  expect(parseFloat(panel.style.top) + panel.offsetHeight).toBeLessThanOrEqual(300);
  expect(parseFloat(panel.style.top)).toBeGreaterThanOrEqual(8);
  controller.destroy();
});

it('restores the top layer after its live host is moved by a grid render', () => {
  const { panel, show, controller, flush } = fixture();
  const closed = new Event('toggle');
  Object.defineProperty(closed, 'newState', { value: 'closed' });
  panel.dispatchEvent(closed);
  flush();
  expect(show).toHaveBeenCalledTimes(2);
  controller.destroy();
  panel.dispatchEvent(closed);
  flush();
  expect(show).toHaveBeenCalledTimes(2);
});

it('reopens silent native closures when the owning renderer refreshes', () => {
  const { show, controller, flush, closeSilently } = fixture();
  closeSilently();
  controller.refresh();
  flush();
  expect(show).toHaveBeenCalledTimes(2);
  controller.destroy();
});
