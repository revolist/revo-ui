import { render } from 'preact';
import { act } from 'preact/test-utils';
import { afterEach, expect, it, vi } from 'vitest';
import { DropdownPopup } from './popup';

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  document.body.replaceChildren();
});

it('retains the authored outer height instead of growing to overflowing content', async () => {
  const host = document.body.appendChild(document.createElement('div'));
  const trigger = document.body.appendChild(document.createElement('div'));
  trigger.getBoundingClientRect = () => new DOMRect(20, 100, 160, 40);
  const original = HTMLElement.prototype.getBoundingClientRect;
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(
    function (this: HTMLElement) {
      return this.classList.contains('revo-dropdown-menu')
        ? new DOMRect(0, 0, 200, 180)
        : original.call(this);
    },
  );
  vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(180);
  vi.spyOn(HTMLElement.prototype, 'scrollHeight', 'get').mockReturnValue(900);
  const observers: Array<{
    observe: ReturnType<typeof vi.fn>;
    disconnect: ReturnType<typeof vi.fn>;
  }> = [];
  vi.stubGlobal(
    'MutationObserver',
    class {
      observe = vi.fn();
      disconnect = vi.fn();
      constructor() {
        observers.push(this);
      }
    },
  );
  try {
    await act(async () => {
      render(
        <DropdownPopup triggerRef={{ current: trigger }}>
          <div>Overflowing custom content</div>
        </DropdownPopup>,
        host,
      );
    });
    const popup = host.querySelector<HTMLElement>('.revo-dropdown-menu')!;
    await vi.waitFor(() => expect(popup.style.maxHeight).toBe('180px'));
    const contentObserver = observers.find((observer) =>
      observer.observe.mock.calls.some(([, options]) => options.characterData),
    );
    expect(contentObserver?.observe).toHaveBeenCalledWith(popup, {
      childList: true,
      characterData: true,
      subtree: true,
    });
  } finally {
    act(() => render(null, host));
  }
  for (const observer of observers)
    expect(observer.disconnect).toHaveBeenCalledOnce();
});
