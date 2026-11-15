import { describe, expect, it } from 'vitest';
import { createEventTooltipContent } from './event-tooltip';

describe('event tooltip content', () => {
  it('renders supplied translated labels, people and details as text', () => {
    const node = createEventTooltipContent(document, {
      title: '<Revisão>',
      dates: [{ label: 'Início', month: 'nov.', day: '16', value: '16 nov. 2026, 09:00' }],
      description: 'Notas', peopleLabel: 'Equipa',
      people: [{ name: 'Iris', avatarUrl: '/iris.webp' }, { name: 'Zoe' }],
      details: ['Confirmado'],
    });
    expect(node.textContent).toContain('<Revisão>');
    expect(node.querySelector('revisão')).toBeNull();
    expect(node.textContent).toContain('Início');
    expect(node.querySelector('[aria-label="Equipa"] img')?.getAttribute('alt')).toBe('Iris');
    expect(node.textContent).toContain('Confirmado');
  });
});
