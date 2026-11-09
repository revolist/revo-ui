import { describe, it, expect, vi } from 'vitest';
import { paginationItems, PaginationPanel } from './pagination';
const h = (tag: string, props: any, ...children: any[]): any => ({
  tag,
  props,
  children: children.flat(Infinity),
});
const buttons = (panel: PaginationPanel<any>) =>
  panel
    .render()
    .children[0].children.filter((node: any) => node.tag === 'button');
describe('pagination boundaries and page windows', () => {
  it('anchors first and last pages around a bounded middle window', () => {
    expect(paginationItems(9, 20, 3)).toEqual([
      0,
      'ellipsis',
      8,
      9,
      10,
      'ellipsis',
      19,
    ]);
    expect(paginationItems(0, 3)).toEqual([0, 1, 2]);
    expect(paginationItems(19, 20, 3)).toEqual([0, 'ellipsis', 17, 18, 19]);
    expect(paginationItems(0, 0)).toEqual([]);
    expect(paginationItems(0, Infinity)).toEqual([]);
  });
  it('clamps external page values and emits zero-based callbacks', () => {
    const changed = vi.fn();
    const panel = new PaginationPanel(
      { itemsPerPage: 10, total: 95, initialPage: 999 },
      changed,
      h,
    );
    expect(buttons(panel).map((button: any) => button.props.disabled)).toEqual([
      false,
      false,
      true,
      true,
    ]);
    panel.setPage(-4);
    expect(changed).toHaveBeenLastCalledWith(0);
    panel.update({ itemsPerPage: 10, total: 0, initialPage: 0 });
    expect(buttons(panel).every((button: any) => button.props.disabled)).toBe(
      true,
    );
  });
  it('keeps selector text in one unit and honors navigation and info flags', () => {
    const panel = new PaginationPanel(
      {
        itemsPerPage: 10,
        total: 95,
        initialPage: 0,
        navigation: false,
        info: false,
        totalInfo: false,
      },
      vi.fn(),
      h,
    );
    expect(buttons(panel)).toHaveLength(0);
    const selector = panel.render().children[0].children[0];
    expect(selector.props.class).toBe('rv-pagination-selector');
    expect(selector.children).toHaveLength(1);
    expect(selector.children[0].props.ref).toBeTypeOf('function');
  });
});

describe('inclusive pagination ranges', () => {
  it.each([
    [0, 102, '1-10 of 102 items'],
    [1, 102, '11-20 of 102 items'],
    [10, 102, '101-102 of 102 items'],
    [0, 0, '0-0 of 0 items'],
  ])('labels page %i with total %i', (page, total, expected) => {
    const panel = new PaginationPanel(
      { itemsPerPage: 10, initialPage: page, total },
      vi.fn(),
      h,
    );
    expect(panel.render().children[1].children[0].children[0]).toBe(expected);
  });
});

it('announces remote loading with localized text and refreshes only on transitions', () => {
  const panel = new PaginationPanel(
    {
      itemsPerPage: 10,
      total: 20,
      initialPage: 0,
      locales: { loading: 'Fetching rows' },
    },
    vi.fn(),
    h,
  );
  const refresh = vi.fn();
  panel.setRefresh(refresh);
  panel.setLoading(true);
  panel.setLoading(true);
  expect(refresh).toHaveBeenCalledTimes(1);
  const status = panel
    .render()
    .children[0].children.find((node: any) => node.props?.role === 'status');
  expect(status.props['aria-live']).toBe('polite');
  expect(status.children).toEqual(['Fetching rows']);
  panel.setLoading(false);
  expect(refresh).toHaveBeenCalledTimes(2);
  expect(
    panel
      .render()
      .children[0].children.some((node: any) => node.props?.role === 'status'),
  ).toBe(false);
});

it('hides only first and last buttons when boundaryButtons is false', () => {
  const panel = new PaginationPanel(
    { itemsPerPage: 10, total: 95, initialPage: 2, boundaryButtons: false },
    vi.fn(),
    h,
  );
  expect(
    buttons(panel).map((button: any) => button.props['aria-label']),
  ).toEqual(['Previous page', 'Next page']);
  panel.update({
    itemsPerPage: 10,
    total: 95,
    initialPage: 2,
    boundaryButtons: true,
  });
  expect(buttons(panel)).toHaveLength(4);
});

it.each([
  { first: 'First', previous: 'Previous', next: 'Next', last: 'Last' },
  { first: 'Anfang', previous: 'Zurück', next: '«', last: 'Ende' },
])(
  'preserves navigation direction and compact controls with localized labels %j',
  (locales) => {
    const changed = vi.fn();
    const panel = new PaginationPanel(
      { itemsPerPage: 10, total: 30, initialPage: 1, locales },
      changed,
      h,
    );
    const navigation = buttons(panel);
    expect(navigation.map((button: any) => button.props['aria-label'])).toEqual(
      [locales.first, locales.previous, locales.next, locales.last],
    );
    for (const button of navigation) {
      expect(button.props.class).toContain('rv-pagination-button--icon');
      expect(button.children[0].tag).toBe('svg');
    }
    expect(navigation[2].children[0].children[0].props.d).toBe('M9 6l6 6-6 6');
    navigation[2].props.onClick();
    expect(changed).toHaveBeenLastCalledWith(2);
  },
);
