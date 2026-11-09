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
