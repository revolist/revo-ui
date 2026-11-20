import { describe, expect, it, vi } from 'vitest';
import {
  hideTopLayerPopup,
  showTopLayerPopup,
  popupOwnsTarget,
} from './top-layer-popup';

describe('top-layer surface presentation lifecycle', () => {
  it('restores the caller marker after fallback presentation and repeated show calls', () => {
    const element = document.createElement('div');
    element.setAttribute('data-rv-ui-surface', 'custom');
    const popup = Object.assign(element, {
      showPopover: vi.fn(() => {
        throw new Error('unsupported');
      }),
    });
    expect(showTopLayerPopup(popup)).toBe('fallback');
    expect(element.getAttribute('data-rv-ui-surface')).toBe('');
    showTopLayerPopup(popup);
    hideTopLayerPopup(popup);
    expect(element.getAttribute('data-rv-ui-surface')).toBe('custom');
    expect(element.style.display).toBe('none');
  });

  it('removes its marker when a native popover closes', () => {
    const popup = Object.assign(document.createElement('div'), {
      showPopover: vi.fn(),
      hidePopover: vi.fn(),
    });
    const mode = showTopLayerPopup(popup);
    expect(mode).toBe('popover');
    hideTopLayerPopup(popup, mode);
    expect(popup.hidePopover).toHaveBeenCalledOnce();
    expect(popup.hasAttribute('data-rv-ui-surface')).toBe(false);
    hideTopLayerPopup(popup);
    expect(popup.hasAttribute('data-rv-ui-surface')).toBe(false);
  });
});

describe('popup content ownership', () => {
  it('includes a portalled list linked by aria-controls, while excluding unrelated content', () => {
    const panel = document.createElement('div');
    const trigger = document.createElement('button');
    const list = document.createElement('div');
    const option = document.createElement('button');
    list.id = 'owned-popup-list';
    trigger.setAttribute('aria-controls', 'missing-list owned-popup-list');
    panel.append(trigger);
    list.append(option);
    document.body.append(panel, list);
    try {
      expect(popupOwnsTarget(panel, trigger)).toBe(true);
      expect(popupOwnsTarget(panel, option)).toBe(true);
      expect(popupOwnsTarget(panel, document.body)).toBe(false);
      expect(popupOwnsTarget(panel, null)).toBe(false);
      trigger.removeAttribute('aria-controls');
      expect(popupOwnsTarget(panel, option)).toBe(false);
    } finally {
      panel.remove();
      list.remove();
    }
  });
});

it.each(['popover', 'fallback'] as const)(
  'uses shared viewport positioning for %s surfaces',
  (mode) => {
    const popup = Object.assign(document.createElement('div'), {
      showPopover: vi.fn(() => {
        if (mode === 'fallback') throw new Error('unsupported');
      }),
    });
    popup.style.cssText =
      'position:absolute;margin:20px;right:0;bottom:0;top:123px;left:45px';
    expect(showTopLayerPopup(popup)).toBe(mode);
    expect(popup.style.position).toBe('fixed');
    expect(popup.style.margin).toBe('0px');
    expect(popup.style.right).toBe('auto');
    expect(popup.style.bottom).toBe('auto');
    expect(popup.style.top).toBe('123px');
    expect(popup.style.left).toBe('45px');
    hideTopLayerPopup(popup, mode);
  },
);
