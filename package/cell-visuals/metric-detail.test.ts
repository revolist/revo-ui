import { expect, it, vi } from 'vitest';
import {
  renderChoiceStatus,
  renderMetricDetail,
  renderSplitValue,
} from './metric-detail';
const h = (
  tag: string,
  props: Record<string, unknown>,
  children?: unknown,
) => ({ tag, props, children });
it('renders localized metric values and clamps benchmark position', () => {
  const cell = renderMetricDetail(h, {
    value: '12 €',
    detail: '+3 %',
    track: {
      kind: 'meter',
      value: 12,
      max: 20,
      reference: 40,
      label: 'Escala',
    },
  });
  expect(cell.children[0].children[0].children).toBe('12 €');
  expect(cell.children[1].children[1].props.style.left).toBe('100%');
  expect(cell.children[1].children[0].props['aria-label']).toBe('Escala');
});
it('renders tile and split values with caller-owned semantics', () => {
  const cell = renderMetricDetail(h, {
    value: '8',
    track: {
      kind: 'tiles',
      items: ['positive', 'negative', 'neutral'],
      label: 'Tendencia',
    },
  });
  expect(cell.children[1].props['aria-label']).toBe('Tendencia');
  expect(
    cell.children[1].children.map((item: any) => item.props.class),
  ).toEqual(['is-positive', 'is-negative', 'is-neutral']);
  expect(
    renderSplitValue(h, { value: '42', detail: 'Nuevo', badge: true })
      .children[1].props.class,
  ).toBe('rv-split-value__badge');
});
it('renders summary segments and an accessible actionable choice', () => {
  const activate = vi.fn();
  const choice = renderChoiceStatus(h, {
    kind: 'choice',
    text: 'Sí',
    label: 'Editar respuesta',
    tone: 'positive',
    onActivate: activate,
  });
  expect(choice.children[0].props['aria-label']).toBe('Editar respuesta');
  choice.children[0].props.onClick({});
  expect(activate).toHaveBeenCalledOnce();
  const summary = renderChoiceStatus(h, {
    kind: 'summary',
    text: '2 de 3',
    segments: { parts: [{ value: 2 }], total: 3, label: 'Dos sí' },
  });
  expect(summary.children[1].props['aria-label']).toBe('Dos sí');
});

it('makes history tiles focusable with independently highlighted tooltip rows', async () => {
  const { createMetricTileHistoryTooltip } = await import('./metric-tile-history');
  const cell = renderMetricDetail(h, { value: '3', track: { kind: 'tiles', label: 'Personal', items: ['positive', 'negative'], history: { title: 'Empresa, personal', subtitle: 'Dos trimestres', rows: [{ label: 'T1', value: '10' }, { label: 'T2', value: '8' }] } } });
  const tile = cell.children[1].children[1];
  expect(tile.tag).toBe('button');
  expect(tile.props['aria-label']).toContain('T2, 8');
  const content = createMetricTileHistoryTooltip(document, tile.props['data-tooltip'])!;
  expect(content.querySelectorAll('.rv-metric-history__row')).toHaveLength(2);
  expect(content.querySelector('.rv-metric-history__row.is-active')?.textContent).toBe('T28');
  expect(createMetricTileHistoryTooltip(document, '{')).toBeUndefined();
});


it('distinguishes unknown tiles while retaining localized tooltip labels', () => {
  const cell = renderMetricDetail(h, { value: '—', track: { kind: 'tiles', label: 'Personal', items: ['unknown', 'neutral'], history: { title: 'Personal', rows: [{ label: 'T1', value: '—' }, { label: 'T2', value: '10, sin cambio' }] } } });
  const tiles = cell.children[1].children;
  expect(tiles[0].props.class).toBe('is-unknown');
  expect(tiles[0].props['aria-label']).toBe('Personal, T1, —');
  expect(tiles[1].props.class).toBe('is-neutral');
});
