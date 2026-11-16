import { afterEach, expect, it, vi } from 'vitest';
import {
  applyPopupPosition,
  getPopupViewport,
  VIEWPORT_POPUP_STYLE,
} from './popup-position';

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
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

it('uses the keyboard and pan bounds of the visual viewport', () => {
  vi.stubGlobal('visualViewport', {
    offsetLeft: 20,
    offsetTop: 100,
    width: 350,
    height: 300,
  });
  expect(getPopupViewport(window)).toEqual({
    left: 20,
    top: 100,
    right: 370,
    bottom: 400,
  });
});
it('falls back to the layout viewport when visualViewport is unavailable', () => {
  vi.stubGlobal('visualViewport', undefined);
  expect(getPopupViewport(window)).toEqual({
    left: 0,
    top: 0,
    right: window.innerWidth,
    bottom: window.innerHeight,
  });
});

it('converts document portal coordinates under inherited CSS zoom', () => {
  const popup = document.body.appendChild(document.createElement('div'));
  popup.style.position = 'absolute';
  Object.defineProperty(popup, 'currentCSSZoom', { value: 2 });
  vi.spyOn(window, 'scrollY', 'get').mockReturnValue(500);
  vi.spyOn(window, 'scrollX', 'get').mockReturnValue(120);
  expect(applyPopupPosition(popup, { top: 240, left: 80 })).toMatchObject({
    top: 370,
    left: 100,
    scaleX: 2,
    scaleY: 2,
  });
});
