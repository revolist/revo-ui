import { expect, it } from 'vitest';
import { renderTrendSummaryHeader } from './trend-summary-header';

it('renders chronological points with clamped fills and localized labels', () => {
  const h = (tag: unknown, props: unknown, children?: unknown) => ({ tag, props, children });
  const result = renderTrendSummaryHeader(h, { label: 'Ventes', value: '31 M€', change: '+3%', color: '#f90', domain: { min: 0, max: 100 }, trendLabel: 'Historique', points: [{ value: 50, label: 'Avril : 50' }, { value: 150, label: 'Mai : 150' }, { value: null, label: 'Juin : indisponible' }] }) as any;
  expect(result.children[1].props['aria-label']).toBe('Historique');
  const points = result.children[1].children;
  expect(points).toHaveLength(3);
  expect(points[0].props['data-tooltip']).toBe('Avril : 50');
  expect(points[0].children[0].props.style.height).toBe('50%');
  expect(points[1].children[0].props.style.height).toBe('100%');
  expect(points[2].children[0].props.style.height).toBe('0%');
  expect(points[2].props.class).toContain('is-latest');
});
