import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  DialogController,
  PopoverController,
  TooltipController,
  attachMenuKeyboard,
  attachResizeHandle,
} from './surfaces';

const disposers: (() => void)[] = [];
afterEach(() => {
  disposers
    .splice(0)
    .reverse()
    .forEach((dispose) => dispose());
  document.body.replaceChildren();
});
const button = (label: string) => {
  const element = document.createElement('button');
  element.textContent = label;
  document.body.append(element);
  return element;
};

describe('standalone surface lifecycle', () => {
  it('preserves subtree motion opt-out across portals and restores reused content', () => {
    const source = document.createElement('section');
    source.setAttribute('data-rv-ui-motion', 'off');
    const anchor = button('Open');
    source.append(anchor);
    document.body.append(source);
    const content = document.createElement('div');
    content.setAttribute('data-rv-ui-motion', 'on');
    content.setAttribute('data-rv-ui-surface', 'original');
    source.append(content);
    const controller = new PopoverController();
    disposers.push(() => controller.destroy());
    controller.open({ anchor, content });
    expect(content.parentElement).toBe(document.body);
    expect(content.getAttribute('data-rv-ui-motion')).toBe('off');
    controller.close();
    expect(content.parentElement).toBe(source);
    expect(content.getAttribute('data-rv-ui-motion')).toBe('on');
    expect(content.getAttribute('data-rv-ui-surface')).toBe('original');
  });

  it('inherits motion opt-out from the modal opener without delaying close', () => {
    const source = document.createElement('section');
    source.setAttribute('data-rv-ui-motion', 'off');
    const trigger = button('Open');
    source.append(trigger);
    document.body.append(source);
    trigger.focus();
    const controller = new DialogController(document);
    disposers.push(() => controller.destroy());
    const handle = controller.open({ title: 'Edit', closeLabel: 'Close' });
    expect(handle.root.getAttribute('data-rv-ui-motion')).toBe('off');
    handle.close();
    expect(handle.root.isConnected).toBe(false);
    expect(document.activeElement).toBe(trigger);
  });
  it('dismisses only the innermost native popover and honors configured focus restoration', () => {
    const anchor = button('Open');
    const content = document.createElement('div');
    const innerAnchor = document.createElement('button');
    content.append(innerAnchor);
    content.hidden = true;
    document.body.append(content);
    const outer = new PopoverController(),
      inner = new PopoverController();
    disposers.push(
      () => outer.destroy(),
      () => inner.destroy(),
    );
    outer.open({ anchor, content, restoreFocus: false });
    expect(content.hidden).toBe(false);
    inner.open({ anchor: innerAnchor, content: document.createElement('div') });
    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', cancelable: true }),
    );
    expect(inner.isOpen).toBe(false);
    expect(outer.isOpen).toBe(true);
    expect(document.activeElement).toBe(innerAnchor);
    const outside = button('Outside');
    outside.focus();
    outer.close();
    expect(document.activeElement).toBe(outside);
    expect(content.hidden).toBe(true);
  });
  it('restores focus and closes only the topmost nested modal exactly once', async () => {
    const trigger = button('Open');
    trigger.focus();
    const first = new DialogController(document),
      second = new DialogController(document);
    disposers.push(
      () => first.destroy(),
      () => second.destroy(),
    );
    const outerClose = vi.fn(),
      innerClose = vi.fn();
    const outer = first.open({
      title: 'Outer',
      closeLabel: 'Close outer',
      onClose: outerClose,
    });
    const nestedTrigger = button('Nested');
    outer.body.append(nestedTrigger);
    nestedTrigger.focus();
    const inner = second.open({
      title: 'Inner',
      closeLabel: 'Close inner',
      onClose: innerClose,
    });
    await Promise.resolve();
    inner.root.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
        cancelable: true,
      }),
    );
    // The focused close button's tooltip consumes Escape before its modal.
    expect(second.isOpen).toBe(true);
    expect(innerClose).not.toHaveBeenCalled();
    inner.root.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
        cancelable: true,
      }),
    );
    expect(innerClose).toHaveBeenCalledOnce();
    expect(first.isOpen).toBe(true);
    expect(document.activeElement).toBe(nestedTrigger);
    inner.close();
    expect(innerClose).toHaveBeenCalledOnce();
    first.close();
    expect(outerClose).toHaveBeenCalledOnce();
    expect(document.activeElement).toBe(trigger);
  });

  it('traps keyboard focus while skipping disabled and hidden dialog controls', async () => {
    const controller = new DialogController(document);
    disposers.push(() => controller.destroy());
    const handle = controller.open({ title: 'Edit', closeLabel: 'Close' });
    const hidden = button('Hidden');
    hidden.hidden = true;
    const disabled = button('Disabled');
    disabled.disabled = true;
    const last = button('Save');
    handle.body.append(hidden, disabled, last);
    await Promise.resolve();
    last.focus();
    last.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Tab',
        bubbles: true,
        cancelable: true,
      }),
    );
    expect(document.activeElement).toBe(handle.header.querySelector('button'));
  });

  it('keeps popovers inside the usable viewport when scrollbars take space', () => {
    disposers.push(() => vi.restoreAllMocks());
    vi.spyOn(document.documentElement, 'clientWidth', 'get').mockReturnValue(
      375,
    );
    vi.spyOn(document.documentElement, 'clientHeight', 'get').mockReturnValue(
      885,
    );
    vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(390);
    vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(900);
    const anchor = button('Steps');
    const content = document.createElement('div');
    vi.spyOn(anchor, 'getBoundingClientRect').mockReturnValue({
      left: 70,
      right: 140,
      top: 640,
      bottom: 670,
    } as DOMRect);
    vi.spyOn(content, 'getBoundingClientRect').mockReturnValue({
      width: 352,
      height: 240,
    } as DOMRect);
    const controller = new PopoverController();
    disposers.push(() => controller.destroy());
    controller.open({ anchor, content });
    expect(Number.parseFloat(content.style.left) + 352).toBeLessThanOrEqual(
      367,
    );
    expect(Number.parseFloat(content.style.top) + 240).toBeLessThanOrEqual(877);
  });

  it('dismisses an owned popup before an ancestor isolates keyboard events', () => {
    const owner = document.createElement('section');
    owner.addEventListener('keydown', (event) => event.stopPropagation());
    document.body.append(owner);
    const anchor = button('View steps');
    owner.append(anchor);
    const content = document.createElement('div');
    const input = document.createElement('input');
    content.append(input);
    owner.append(content);
    const controller = new PopoverController();
    disposers.push(() => controller.destroy());
    controller.open({ anchor, content, appendTo: owner });
    const handled = (event: KeyboardEvent) => event.preventDefault();
    input.addEventListener('keydown', handled);
    input.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
        cancelable: true,
      }),
    );
    expect(controller.isOpen).toBe(true);
    input.removeEventListener('keydown', handled);
    input.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
        cancelable: true,
      }),
    );
    expect(controller.isOpen).toBe(false);
    expect(document.activeElement).toBe(anchor);
  });

  it('cleans popover listeners, restores its DOM position and respects focus decisions', () => {
    const anchor = button('Open'),
      outside = button('Outside');
    const owner = document.createElement('div'),
      content = document.createElement('div');
    owner.append(content);
    document.body.append(owner);
    content.setAttribute('style', 'color: red');
    const controller = new PopoverController(),
      onClose = vi.fn();
    disposers.push(() => controller.destroy());
    controller.open({ anchor, content, onClose });
    expect(content.parentNode).toBe(document.body);
    outside.focus();
    outside.dispatchEvent(new Event('pointerdown', { bubbles: true }));
    expect(document.activeElement).toBe(outside);
    expect(onClose).toHaveBeenCalledOnce();
    expect(content.parentNode).toBe(owner);
    expect(content.getAttribute('style')).toBe('color: red');
    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
    );
    expect(onClose).toHaveBeenCalledOnce();
    controller.open({ anchor, content });
    controller.close(false);
    expect(document.activeElement).toBe(outside);
  });

  it('replaces click-only tooltips on keyboard activation and preserves the active tooltip during unrelated teardown', () => {
    const first = button('First details');
    const second = button('Second details');
    first.setAttribute('aria-describedby', 'existing');
    const firstTooltip = new TooltipController();
    const secondTooltip = new TooltipController();
    disposers.push(
      () => firstTooltip.destroy(),
      () => secondTooltip.destroy(),
    );
    firstTooltip.bind(first, 'First', { trigger: 'click' });
    secondTooltip.bind(second, 'Second', { trigger: 'click' });
    // Native keyboard activation dispatches click without a preceding pointerdown.
    first.click();
    second.click();
    expect(first.getAttribute('aria-expanded')).toBe('false');
    expect(first.getAttribute('aria-describedby')).toBe('existing');
    expect(
      [...document.querySelectorAll<HTMLElement>('[role="tooltip"]')]
        .filter((element) => !element.hidden)
        .map((element) => element.textContent),
    ).toEqual(['Second']);
    firstTooltip.destroy();
    expect(second.getAttribute('aria-expanded')).toBe('true');
    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
    );
    expect(second.getAttribute('aria-expanded')).toBe('false');
  });

  it('adds and removes tooltip descriptions without losing existing descriptions', () => {
    const anchor = button('Help');
    anchor.setAttribute('aria-describedby', 'existing');
    const tooltip = new TooltipController();
    disposers.push(() => tooltip.destroy());
    tooltip.bind(anchor, 'Details');
    anchor.dispatchEvent(new FocusEvent('focus'));
    const surface = document.querySelector<HTMLElement>('[role="tooltip"]')!;
    expect(surface.textContent).toBe('Details');
    expect(anchor.getAttribute('aria-describedby')).toContain(surface.id);
    tooltip.destroy();
    expect(anchor.getAttribute('aria-describedby')).toBe('existing');
    anchor.dispatchEvent(new FocusEvent('focus'));
    expect(document.querySelector('[role="tooltip"]')).toBeNull();
  });
});

it('skips disabled menu items and keeps submenu navigation scoped to its owner', () => {
  const menu = document.createElement('div');
  menu.setAttribute('role', 'menu');
  document.body.append(menu);
  const first = button('First'),
    disabled = button('Disabled'),
    last = button('Last');
  [first, disabled, last].forEach((element) =>
    element.setAttribute('role', 'menuitem'),
  );
  disabled.disabled = true;
  menu.append(first, disabled, last);
  disposers.push(attachMenuKeyboard(menu));
  first.focus();
  first.dispatchEvent(
    new KeyboardEvent('keydown', {
      key: 'ArrowDown',
      bubbles: true,
      cancelable: true,
    }),
  );
  expect(document.activeElement).toBe(last);
});

it('resizes using bounded RTL keyboard input and releases active pointer listeners', () => {
  const handle = document.createElement('div');
  document.body.append(handle);
  const change = vi.fn();
  const dispose = attachResizeHandle(handle, {
    value: 150,
    min: 100,
    max: 160,
    label: 'Width',
    direction: 'rtl',
    onChange: change,
  });
  handle.dispatchEvent(
    new KeyboardEvent('keydown', { key: 'ArrowLeft', cancelable: true }),
  );
  expect(change).toHaveBeenLastCalledWith(160);
  handle.dispatchEvent(
    new KeyboardEvent('keydown', { key: 'ArrowLeft', cancelable: true }),
  );
  expect(handle.getAttribute('aria-valuenow')).toBe('160');
  dispose();
  change.mockClear();
  handle.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home' }));
  expect(change).not.toHaveBeenCalled();
});
