import { expect, it } from 'vitest';
import { renderChangeBar } from './change-bar';
const h = (tag: string, props: Record<string, unknown>, children?: unknown) => ({ tag, props, children });
it('limits the magnitude while preserving the formatted label', () => {
  const cell = renderChangeBar(h, { fraction: 2, text: '+200%', tone: 'up' });
  expect(cell.children[0].children.props.style.width).toBe('100%');
  expect(cell.children[1].children).toBe('+200%');
});
