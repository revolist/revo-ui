import { afterEach, expect, it } from 'vitest';
import { ensureComponentStyles } from './component-styles';

afterEach(() => {
  document
    .querySelectorAll('[data-rv-component-styles], [data-test-style]')
    .forEach((node) => node.remove());
});

it('deduplicates styles across mounts and inserts families in stable order before application overrides', () => {
  const custom = document.createElement('style');
  custom.dataset.testStyle = '';
  custom.setAttribute('nonce', 'application-nonce');
  document.head.append(custom);
  const host = document.createElement('div');
  document.body.append(host);
  const base = { id: 'test-base', order: 0, css: '.control {color:red}' };
  const family = { id: 'test-family', order: 4, css: '.panel {display:flex}' };
  ensureComponentStyles(host, [family]);
  ensureComponentStyles(host, [base, family]);
  ensureComponentStyles(host, [base]);
  const sheets = Array.from(
    document.head.querySelectorAll<HTMLStyleElement>(
      '[data-rv-component-styles]',
    ),
  );
  expect(sheets.map((node) => node.dataset.rvComponentStyles)).toEqual([
    'test-base',
    'test-family',
  ]);
  expect(sheets[0].getAttribute('nonce')).toBe('application-nonce');
  expect(
    sheets[1].compareDocumentPosition(custom) &
      Node.DOCUMENT_POSITION_FOLLOWING,
  ).toBeTruthy();
  host.remove();
});

it('installs into the owning shadow root and document for portalled controls', () => {
  const shadow = document.createElement('div').attachShadow({ mode: 'open' });
  const host = document.createElement('div');
  shadow.append(host);
  const sheets = [{ id: 'test-shadow', order: 0, css: '.control {color:red}' }];
  ensureComponentStyles(host, sheets);
  ensureComponentStyles(host, sheets);
  expect(shadow.querySelectorAll('[data-rv-component-styles]')).toHaveLength(1);
  expect(
    document.head.querySelectorAll('[data-rv-component-styles]'),
  ).toHaveLength(1);
});
