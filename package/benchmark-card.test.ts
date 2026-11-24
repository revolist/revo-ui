import { describe, expect, it } from 'vitest';
import { createBenchmarkCardContent } from './benchmark-card';

describe('benchmark card presentation', () => {
  it('renders localized text safely in the requested document', () => {
    const doc = document.implementation.createHTMLDocument('benchmark');
    const node = createBenchmarkCardContent(doc, {
      title: '<Résultat>',
      description: 'Dossier',
      badge: 'Confirmé',
      value: '85 %',
      detail: '548 sur 642',
      change: '+10 points',
      changeTone: 'positive',
      benchmark: 'Moyenne 75 %',
      progress: { value: 85, label: 'Taux 85 %' },
    });
    expect(node.ownerDocument).toBe(doc);
    expect(node.textContent).toContain('<Résultat>');
    expect(node.querySelector('résultat')).toBeNull();
    expect(node.textContent).toContain('548 sur 642');
    expect(
      node.querySelector('[role="progressbar"]')?.getAttribute('aria-label'),
    ).toBe('Taux 85 %');
    expect(
      (node.querySelector('.rv-progress-bar__fill') as HTMLElement).style.width,
    ).toBe('85%');
  });
  it('omits optional content and clamps the progress without rendering invalid geometry', () => {
    const node = createBenchmarkCardContent(document, {
      title: 'Result',
      value: '—',
      progress: { value: Infinity, label: 'No value' },
    });
    expect(node.querySelector('.rv-benchmark-card__badge')).toBeNull();
    expect(node.textContent).toBe('Result—');
    expect(
      node.querySelector('[role="progressbar"]')?.getAttribute('aria-valuenow'),
    ).toBe('0');
    expect(node.outerHTML).not.toMatch(/NaN|Infinity/);
  });
});
