import { expect, it, vi } from 'vitest';
import {
  renderCellAction,
  renderIdentityCell,
  renderStatusSegments,
} from './cell-content';
const h = (
  tag: string,
  props: Record<string, unknown>,
  children?: unknown,
) => ({ tag, props, children });
it('exposes expanded state and caller content on a cell action', () => {
  const action = renderCellAction(h, { label: 'Expandir', expanded: false, content: () => '+', onActivate: vi.fn() });
  expect(action.props['aria-expanded']).toBe('false');
  expect(action.children).toBe('+');
});
it('renders localized identity and invokes the supplied action', () => {
  const onActivate = vi.fn();
  const cell = renderIdentityCell(h, {
    label: 'Bota',
    detail: 'Código 42',
    image: '/shoe.png',
    actionLabel: 'Abrir Bota',
    onActivate,
  });
  expect(cell.children[0].props.alt).toBe('');
  const action = cell.children[1].children[0];
  expect(action.props['aria-label']).toBe('Abrir Bota');
  expect(action.props.title).toBe('Abrir Bota');
  action.props.onClick({});
  expect(onActivate).toHaveBeenCalledOnce();
  expect(
    renderIdentityCell(h, { label: 'Bota' }).children[1].children[0].tag,
  ).toBe('strong');
});
it('renders caller-owned status and accessible actions', () => {
  const cell = renderStatusSegments(h, {
    label: 'En riesgo',
    detail: '2 de 3',
    segments: [{ tone: 'warning', label: 'Próximo' }, {}],
  });
  expect(cell.children[0].children[0].children).toBe('En riesgo');
  expect(cell.children[1].children[0].props['aria-label']).toBe('Próximo');
  expect(cell.children[1].children[1].props['aria-hidden']).toBe('true');
  expect(
    renderCellAction(h, { label: 'Editar', onActivate: () => {} }).props[
      'aria-label'
    ],
  ).toBe('Editar');
});

it('supports a host icon and status badge in an identity cell', () => {
  const cell = renderIdentityCell(h, {
    label: 'Empresa',
    leading: () => h('span', { 'aria-hidden': 'true' }, 'E'),
    badge: { text: 'En curso', tone: 'positive' },
  });
  expect(cell.children[0].children).toBe('E');
  expect(cell.children[1].children[0].children[1].children).toBe('En curso');
});

it('supports an indentation prefix for an actionable tree item', () => {
  const cell = renderIdentityCell(h, {
    label: 'Tarea',
    prefix: () => h('span', { 'aria-hidden': 'true' }),
    actionClassName: 'item-action',
    onActivate: () => {},
  });
  expect(cell.children[0].props['aria-hidden']).toBe('true');
  expect(cell.children[2].children[0].props.class).toContain('item-action');
});

it('renders an inline localized detail and optional un-emphasized label', () => {
  const cell = renderIdentityCell(h, {
    label: 'Lisboa',
    detail: '3 lojas',
    detailPosition: 'inline',
    labelElement: 'span',
  });
  expect(cell.props.class).toContain('rv-identity-cell--inline');
  expect(cell.children[1].children[0].tag).toBe('span');
  expect(cell.children[1].children[1].children).toBe('3 lojas');
});

it('uses the Font Awesome ellipsis for the default action and preserves custom text', () => {
  const onActivate = vi.fn();
  const action = renderCellAction(h, { label: 'Mais ações', onActivate });
  expect(action.props['aria-label']).toBe('Mais ações');
  expect(action.children.props['aria-hidden']).toBe('true');
  expect(action.children.props.innerHTML).toContain('Font Awesome Free');
  expect(action.children.props.innerHTML).toContain('<svg');
  const stopPropagation = vi.fn();
  action.props.onMouseDown({ stopPropagation });
  action.props.onClick('event');
  expect(stopPropagation).toHaveBeenCalledOnce();
  expect(onActivate).toHaveBeenCalledWith('event');
  expect(
    renderCellAction(h, { label: 'Editar', text: 'Editar', onActivate })
      .children,
  ).toBe('Editar');
});
