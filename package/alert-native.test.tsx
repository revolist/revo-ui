import { expect, it } from 'vitest';
import {
  createAlertElement,
  renderAlertInto,
  releaseAlertElement,
} from './alert-native';
it('updates native alert tone and content in place and releases external template content', () => {
  const host = createAlertElement(document, {
    children: 'Loading',
    'aria-live': 'polite',
  });
  document.body.append(host);
  const alert = host.firstElementChild;
  renderAlertInto(host, { tone: 'danger', children: 'Request failed' });
  expect(host.firstElementChild).toBe(alert);
  expect(alert?.getAttribute('role')).toBe('alert');
  expect(alert?.textContent).toBe('Request failed');
  const custom = document.createElement('strong');
  custom.textContent = 'Custom empty state';
  renderAlertInto(host, { content: custom });
  expect(host.querySelector('strong')).toBe(custom);
  renderAlertInto(host, { children: 'Recovered' });
  expect(host.querySelector('strong')).toBeNull();
  expect(alert?.getAttribute('role')).toBe('status');
  releaseAlertElement(host);
  expect(host.childNodes.length).toBe(0);
  expect(host.isConnected).toBe(false);
});
