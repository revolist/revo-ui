// @vitest-environment happy-dom
import { expect, it } from 'vitest';
import { PopoverController } from './popover-controller';

it('keeps the popover open for an owned portalled popup', () => {
  const anchor = document.body.appendChild(document.createElement('button'));
  const content = document.createElement('div');
  const trigger = content.appendChild(document.createElement('button'));
  trigger.setAttribute('aria-controls', 'nested-popover-test');
  const nested = document.body.appendChild(document.createElement('div'));
  nested.id = 'nested-popover-test';
  const option = nested.appendChild(document.createElement('button'));
  const popover = new PopoverController();
  try {
    popover.open({ anchor, content });
    option.dispatchEvent(new Event('pointerdown', { bubbles: true }));
    expect(popover.isOpen).toBe(true);
    document.body.dispatchEvent(new Event('pointerdown', { bubbles: true }));
    expect(popover.isOpen).toBe(false);
  } finally {
    popover.destroy();
    anchor.remove();
    nested.remove();
  }
});

it('allows horizontal RTL scrolling until its boundary', () => {
  const anchor = document.body.appendChild(document.createElement('button'));
  const content = document.createElement('div');
  const scroll = content.appendChild(document.createElement('div'));
  scroll.style.cssText = 'overflow-x: auto; direction: rtl';
  Object.defineProperties(scroll, {
    scrollWidth: { configurable: true, value: 300 },
    clientWidth: { configurable: true, value: 100 },
    scrollLeft: { configurable: true, writable: true, value: -100 },
  });
  const popover = new PopoverController();
  const wheel = (deltaX: number) => {
    const event = new WheelEvent('wheel', { deltaX, bubbles: true, cancelable: true });
    scroll.dispatchEvent(event);
    return event.defaultPrevented;
  };
  try {
    popover.open({ anchor, content });
    expect(wheel(-10)).toBe(false);
    expect(wheel(10)).toBe(false);
    scroll.scrollLeft = -200;
    expect(wheel(-10)).toBe(true);
    scroll.scrollLeft = 0;
    expect(wheel(10)).toBe(true);
  } finally {
    popover.destroy();
    anchor.remove();
  }
});
