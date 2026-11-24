import { expect, it } from 'vitest';
import { createLegendElement } from './legend-native';

it('renders localized items and marker colors as native elements', () => {
  const legend = createLegendElement(document, { label: 'Séries', items: [{ id: 'a', label: 'Planeado', color: '#123456', marker: 'line' }] });
  expect(legend.getAttribute('aria-label')).toBe('Séries');
  expect(legend.textContent).toBe('Planeado');
  expect(legend.querySelector('[data-part="item"]')?.getAttribute('style')).toContain('#123456');
});
