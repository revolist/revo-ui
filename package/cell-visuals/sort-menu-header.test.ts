import { expect, it } from 'vitest';
import { renderSortMenuHeader } from './sort-menu-header';
const h = (tag: string, props: Record<string, unknown>, children?: unknown) => ({ tag, props, children });
it('renders a localized menu trigger and all sort states', () => {
  const header = (direction?: 'asc' | 'desc') => renderSortMenuHeader(h, { label: 'Montant', ariaLabel: 'Menu montant', direction });
  const neutral = header();
  expect(neutral.props).toMatchObject({ 'aria-label': 'Menu montant', 'aria-haspopup': 'menu', 'data-column-menu-trigger': '' });
  const path = (node: any) => node.children[1].children[0].props.d;
  expect(new Set([path(neutral), path(header('asc')), path(header('desc'))]).size).toBe(3);
});
