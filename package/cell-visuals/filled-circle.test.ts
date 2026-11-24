import { expect, it } from 'vitest';
import { renderFilledCircle } from './filled-circle';

it('clamps the indicator fill while preserving host-formatted text', () => {
  const h = (tag: unknown, props: unknown, children?: unknown) => ({ tag, props, children });
  const render = (value: number | null) => renderFilledCircle(h, { value, min: 80, max: 120, display: `${value}%`, label: 'Rythme', tone: 'positive' }) as any;
  const node = render(100);
  expect(node.props['aria-label']).toBe('Rythme');
  expect(node.children[0].children[0].children[0].props.style.height).toBe('50%');
  expect(node.children[1].children).toBe('100%');
  expect(render(140).children[0].children[0].children[0].props.style.height).toBe('100%');
  expect(render(70).children[0].children[0].children[0].props.style.height).toBe('0%');
  expect(render(null).props.class).toContain('is-neutral');
});
