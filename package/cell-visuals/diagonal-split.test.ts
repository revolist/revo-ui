import { expect, it } from 'vitest';
import { renderDiagonalSplit } from './diagonal-split';

it('renders independently colored values, including zero and missing halves', () => {
  const h = (tag: unknown, props: unknown, children?: unknown) => ({ tag, props, children });
  const node = renderDiagonalSplit(h, { upper: { value: 0, tone: 'warning' }, lower: { value: 16, tone: 'muted' }, label: 'Aller 0, retour 16' }) as any;
  expect(node.props['aria-label']).toBe('Aller 0, retour 16');
  expect(node.children[1].props.class).toContain('is-warning');
  expect(node.children[2].children).toBe('0');
  expect(node.children[3].children).toBe('16');
  expect(renderDiagonalSplit(h, { label: 'No data' })).toBeNull();
  const partial = renderDiagonalSplit(h, { upper: { value: 13 }, label: 'Aller 13' }) as any;
  expect(partial.children[0]).toBeNull();
  expect(partial.children[3]).toBeNull();
});
