// @vitest-environment happy-dom
import { afterEach, expect, it, vi } from 'vitest';
import { focusConfiguratorOrigin } from '@revolist/ui/configurator-focus';
afterEach(() => {
  vi.restoreAllMocks();
  document.body.replaceChildren();
});
function fixture() {
  const origin = document.createElement('div');
  const root = document.createElement('section');
  const input = document.createElement('input');
  root.append(input);
  document.body.append(origin, root);
  input.focus();
  // Characterize Chromium's nonfocusable DIV, which happyDOM itself permits focusing.
  const nativeFocus = origin.focus.bind(origin);
  vi.spyOn(origin, 'focus').mockImplementation((options) => {
    if (origin.hasAttribute('tabindex')) nativeFocus(options);
  });
  return { origin, root, input };
}
it('returns focus using an owned attribute lease released on blur', () => {
  const { origin, root, input } = fixture();
  const release = focusConfiguratorOrigin(origin, root);
  expect(document.activeElement).toBe(origin);
  expect(origin.getAttribute('tabindex')).toBe('-1');
  input.focus();
  expect(origin.hasAttribute('tabindex')).toBe(false);
  release();
  root.remove();
  expect(origin.hasAttribute('tabindex')).toBe(false);
});
it('does not steal outside focus, cross-document focus or focus a removed origin', () => {
  const { origin, root } = fixture();
  const outside = document.createElement('button');
  document.body.append(outside);
  outside.focus();
  focusConfiguratorOrigin(origin, root);
  expect(document.activeElement).toBe(outside);
  expect(origin.focus).not.toHaveBeenCalled();
  origin.remove();
  focusConfiguratorOrigin(origin, root);
  expect(origin.focus).not.toHaveBeenCalled();
});
it('does not clobber an application attribute update during focus', () => {
  const { origin, root } = fixture();
  origin.addEventListener('focus', () => origin.setAttribute('tabindex', '3'));
  focusConfiguratorOrigin(origin, root);
  expect(document.activeElement).toBe(origin);
  expect(origin.getAttribute('tabindex')).toBe('3');
});
it('cleans the attribute if focusing throws or still fails', () => {
  const { origin, root } = fixture();
  vi.mocked(origin.focus).mockImplementation(() => {});
  focusConfiguratorOrigin(origin, root);
  expect(origin.hasAttribute('tabindex')).toBe(false);
  vi.mocked(origin.focus).mockImplementation(() => {
    if (origin.hasAttribute('tabindex')) throw new Error('focus failed');
  });
  expect(() => focusConfiguratorOrigin(origin, root)).toThrow('focus failed');
  expect(origin.hasAttribute('tabindex')).toBe(false);
});
it('keeps an authored tabindex and uses normal focus without a temporary lease', () => {
  const { origin, root } = fixture();
  origin.setAttribute('tabindex', '0');
  focusConfiguratorOrigin(origin, root);
  expect(document.activeElement).toBe(origin);
  expect(origin.getAttribute('tabindex')).toBe('0');
});
