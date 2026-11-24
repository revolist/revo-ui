import { expect, it } from 'vitest';
import { createCheckboxElement } from './native';

it('creates the shared checkbox with its accessible name and state', () => {
  const checkbox = createCheckboxElement(document, { checked: true, 'aria-label': 'Nettoyage' });
  expect(checkbox.type).toBe('checkbox');
  expect(checkbox.classList.contains('rv-checkbox')).toBe(true);
  expect(checkbox.checked).toBe(true);
  expect(checkbox.getAttribute('aria-label')).toBe('Nettoyage');
});
