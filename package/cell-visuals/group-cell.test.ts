import { expect, it, vi } from 'vitest';
import { renderGroupCell } from './group-cell';
const h = (
  tag: string,
  props: Record<string, unknown>,
  children?: unknown,
) => ({ tag, props, children });
it('renders caller-provided trailing group content', () => {
  const cell = renderGroupCell(h, { label: 'Group', trailing: () => '3' });
  expect(cell.children[0].children.at(-1)).toBe('3');
});
it('renders a localized expandable group and its supplied summary', () => {
  const onActivate = vi.fn();
  const cell = renderGroupCell(h, {
    label: 'Región',
    actionLabel: 'Cerrar región',
    expanded: true,
    onActivate,
    summary: {
      label: 'Índice',
      value: '61',
      map: { paths: ['M0 0'], activeIndex: 0 },
    },
    fields: [{ label: 'Capital', value: 'Madrid' }],
  });
  expect(cell.children[0].children[2].props['aria-expanded']).toBe('true');
  expect(cell.children[0].children[2].props.title).toBe('Cerrar región');
  expect(cell.children[0].children[2].children[1].props.class).toContain('rv-expand-icon');
  expect(cell.children[0].children[2].children[1].props.class).toContain('is-collapse');
  cell.children[0].children[2].props.onClick({});
  expect(onActivate).toHaveBeenCalledOnce();
  expect(cell.children[1].children[0].children[1].children[0].children).toBe(
    'Índice',
  );
  expect(cell.children[1].children[1].children[1].children).toBe('Madrid');
});

it('renders a tree group with a leading toggle and localized label', () => {
  const onActivate = vi.fn();
  const cell = renderGroupCell(h, {
    variant: 'tree',
    label: 'Diseño',
    actionLabel: 'Cerrar Diseño',
    expanded: true,
    detail: '3',
    onActivate,
    leading: () => h('span', { 'aria-hidden': 'true' }, 'D'),
  });
  const heading = cell.children[0];
  expect(heading.children[1].children.props.class).toContain('rv-expand-icon');
  expect(heading.children[1].props['aria-label']).toBe('Cerrar Diseño');
  expect(heading.children[3].children).toBe('Diseño');
  heading.children[1].props.onClick({});
  expect(onActivate).toHaveBeenCalledOnce();
});

it('supports a state-aware chevron for nested groups', () => {
  const render = (expanded: boolean) => renderGroupCell(h, { variant: 'tree', label: 'Core', expanded, expandIcon: 'chevron', onActivate: () => {} }).children[0].children[1].children;
  expect(render(true).props.class).toContain('rv-expand-icon--chevron');
  expect(render(true).children[0].props.d).toBe('M2.5 4.5 6 8 9.5 4.5');
  expect(render(false).children[0].props.d).toBe('M4.5 2.5 8 6 4.5 9.5');
});
