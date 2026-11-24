import { expect, it, vi } from 'vitest';
import { renderGroupRail } from './group-rail';
const h = (tag: string, props: Record<string, any>, children?: any) => ({
  tag,
  props,
  children,
});
it('renders an accessible expandable rail with caller-composed editable details', () => {
  const onToggle = vi.fn();
  const rail = renderGroupRail(h, {
    title: 'Chaussures',
    actionLabel: 'Replier',
    expanded: true,
    details: (h) => [h('input', { value: '5', 'aria-label': 'Croissance' })],
    onToggle,
  });
  expect(rail.children[0].props).toMatchObject({
    'aria-expanded': 'true',
    'aria-label': 'Replier',
  });
  expect(rail.children[1].children[0].props['aria-label']).toBe('Croissance');
  rail.children[0].props.onClick({});
  expect(onToggle).toHaveBeenCalledOnce();
});
it('does not render or evaluate details while collapsed', () => {
  const details = vi.fn(() => 'Hidden');
  const rail = renderGroupRail(h, {
    title: 'Group',
    actionLabel: 'Open',
    expanded: false,
    details,
    onToggle: vi.fn(),
  });
  expect(rail.children[0].props['aria-expanded']).toBe('false');
  expect(details).not.toHaveBeenCalled();
  expect(rail.children[1]).toBeNull();
});
