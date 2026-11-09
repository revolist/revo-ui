import { render } from 'preact';
import { act } from 'preact/test-utils';
import { afterEach, expect, it, vi } from 'vitest';
import { DropdownPopup } from './popup';

afterEach(() => {
  vi.restoreAllMocks();
  document.body.replaceChildren();
});

it.each([
  ['fixed', 1, 200, 144, 160],
  ['fixed', 2, 100, 72, 80],
  ['absolute', 2, 50, 47, 80],
] as const)(
  'positions a %s popup in its actual coordinate space at scale %s',
  async (position, scale, left, top, width) => {
    const style = document.body.appendChild(document.createElement('style'));
    style.textContent = `.revo-dropdown-menu { position: ${position}; }`;
    const host = document.body.appendChild(document.createElement('div'));
    const parent = document.body.appendChild(document.createElement('div'));
    const trigger = document.body.appendChild(document.createElement('div'));
    trigger.getBoundingClientRect = () => new DOMRect(200, 100, 160, 40);
    parent.getBoundingClientRect = () => new DOMRect(100, 50, 600, 400);
    Object.defineProperty(parent, 'offsetWidth', { value: 300 });
    Object.defineProperty(parent, 'offsetHeight', { value: 200 });
    const original = HTMLElement.prototype.getBoundingClientRect;
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(
      function (this: HTMLElement) {
        return this.classList.contains('revo-dropdown-menu')
          ? new DOMRect(0, 0, 200 * scale, 100 * scale)
          : original.call(this);
      },
    );
    vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockImplementation(
      function (this: HTMLElement) {
        return this === parent ? 300 : 200;
      },
    );
    vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockImplementation(
      function (this: HTMLElement) {
        return this === parent ? 200 : 100;
      },
    );
    vi.spyOn(HTMLElement.prototype, 'scrollHeight', 'get').mockReturnValue(100);
    Object.defineProperty(HTMLElement.prototype, 'offsetParent', {
      configurable: true,
      get: () => (position === 'absolute' ? parent : null),
    });
    // Happy DOM has no layout engine; these are the browser's independently
    // observed painted bounds and effective CSS zoom, not computed expectations.
    Object.defineProperty(HTMLElement.prototype, 'currentCSSZoom', {
      configurable: true,
      get: () => scale,
    });
    try {
      await act(async () => {
        render(
          <DropdownPopup
            triggerRef={{ current: trigger }}
            portalTarget={parent}
            matchTriggerWidth
          >
            <button>Choice</button>
          </DropdownPopup>,
          host,
        );
        await new Promise((resolve) => setTimeout(resolve, 25));
      });
      const popup = parent.querySelector<HTMLElement>('.revo-dropdown-menu')!;
      await vi.waitFor(() => {
        expect(popup.style.left).toBe(`${left}px`);
        expect(popup.style.top).toBe(`${top}px`);
        expect(popup.style.width).toBe(`${width}px`);
      });
    } finally {
      act(() => render(null, host));
      delete (HTMLElement.prototype as unknown as Record<string, unknown>)
        .currentCSSZoom;
      delete (HTMLElement.prototype as unknown as Record<string, unknown>)
        .offsetParent;
    }
  },
);
