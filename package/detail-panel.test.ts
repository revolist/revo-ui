import { describe, expect, it } from 'vitest';
import { createDetailPanel } from './detail-panel';

describe('detail panel', () => {
  it('renders host-provided labels and exposes the content surface', () => {
    const { card, body } = createDetailPanel('Detalhes', 'Por trimestre', {
      card: 'card', heading: 'heading', body: 'body',
    });
    expect(card.getAttribute('aria-label')).toBe('Detalhes');
    expect(card.textContent).toBe('DetalhesPor trimestre');
    expect(card.lastElementChild).toBe(body);
  });
});
