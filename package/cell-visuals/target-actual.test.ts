import { expect, it } from 'vitest';
import { renderTargetActual } from './target-actual';

it('renders formatted target, actual, and variance with independent tones', () => {
  const h = (tag: unknown, props: unknown, children: unknown) => ({ tag, props, children });
  const node = renderTargetActual(h, { target: '14,0', actual: '16,6', actualTone: 'negative', detail: '+2,6', detailTone: 'warning', label: 'Objectif et résultat' }) as any;
  expect(node.props['aria-label']).toBe('Objectif et résultat');
  expect(node.children[0].children[0].children).toBe('14,0');
  expect(node.children[0].children[1].props.class).toContain('is-negative');
  expect(node.children[1].props.class).toContain('is-warning');
  expect(renderTargetActual(h, { target: '—', actual: '—' }).children[1]).toBeNull();
});
