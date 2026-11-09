// @vitest-environment happy-dom
/** @jsxImportSource preact */
import { h, render } from 'preact';
import { act } from 'preact/test-utils';
import { afterEach, expect, it, vi } from 'vitest';
import { ResourcePickerPopup } from './resource-picker-popup';

afterEach(() => {
  vi.unstubAllGlobals();
  document.body.replaceChildren();
});

it('repositions the resource popup when its dialog surface resizes', () => {
  let onResize: ResizeObserverCallback | undefined;
  const observe = vi.fn();
  const disconnect = vi.fn();
  vi.stubGlobal(
    'ResizeObserver',
    class {
      constructor(callback: ResizeObserverCallback) {
        onResize = callback;
      }
      observe = observe;
      disconnect = disconnect;
    },
  );
  const overlay = document.createElement('div');
  overlay.className = 'rv-dialog-overlay';
  const surface = document.createElement('div');
  surface.className = 'rv-dialog__surface';
  const trigger = document.createElement('div');
  surface.append(trigger);
  overlay.append(surface);
  document.body.append(overlay);
  let top = 100;
  vi.spyOn(trigger, 'getBoundingClientRect').mockImplementation(() => ({
    top,
    bottom: top + 40,
    left: 20,
    right: 220,
    width: 200,
    height: 40,
    x: 20,
    y: top,
    toJSON() {},
  }));
  const host = document.createElement('div');
  document.body.append(host);
  act(() =>
    render(
      <ResourcePickerPopup
        triggerRef={{ current: trigger }}
        portalTarget={overlay}
        popupId="picker-popup"
      >
        Resources
      </ResourcePickerPopup>,
      host,
    ),
  );
  expect(observe).toHaveBeenCalledWith(surface);
  const popup = document.getElementById('picker-popup')!;
  const before = parseFloat(popup.style.top);
  top += 60;
  act(() => onResize!([], {} as ResizeObserver));
  expect(parseFloat(popup.style.top) - before).toBe(60);
  act(() => render(null, host));
  expect(disconnect).toHaveBeenCalledOnce();
});
