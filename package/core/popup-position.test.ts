import { afterEach, expect, it, vi } from 'vitest';
import { applyPopupPosition, VIEWPORT_POPUP_STYLE } from './popup-position';

afterEach(() => {
  vi.restoreAllMocks();
  document.body.replaceChildren();
});

it.each([1, 2])(
  'applies viewport coordinates at CSS zoom %s without page scroll offsets',
  (zoom) => {
    const popup = document.body.appendChild(document.createElement('div'));
    Object.assign(popup.style, VIEWPORT_POPUP_STYLE);
    Object.defineProperty(popup, 'currentCSSZoom', { value: zoom });
    vi.spyOn(window, 'scrollY', 'get').mockReturnValue(500);
    vi.spyOn(window, 'scrollX', 'get').mockReturnValue(120);
    const result = applyPopupPosition(popup, { top: 240, left: 80 });
    expect(popup.style.top).toBe(`${240 / zoom}px`);
    expect(popup.style.left).toBe(`${80 / zoom}px`);
    expect(result).toMatchObject({ scaleX: zoom, scaleY: zoom });
  },
);

it('retains document offsets for ordinary absolute body portals', () => {
  const popup = document.body.appendChild(document.createElement('div'));
  popup.style.position = 'absolute';
  vi.spyOn(window, 'scrollY', 'get').mockReturnValue(500);
  vi.spyOn(window, 'scrollX', 'get').mockReturnValue(120);
  applyPopupPosition(popup, { top: 240, left: 80 });
  expect(popup.style.top).toBe('740px');
  expect(popup.style.left).toBe('200px');
});
