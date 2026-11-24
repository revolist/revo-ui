import { expect, it, vi } from 'vitest';
import { renderVisualCell } from './visual-cell';
const h = (
  tag: string,
  props: Record<string, unknown>,
  children?: unknown,
) => ({ tag, props, children });
it('renders a localized section with an accessible action and supplied leaders', () => {
  const activate = vi.fn();
  const node = renderVisualCell(
    h,
    {
      kind: 'section',
      title: 'VENTAS',
      label: 'Superar la cartera',
      value: '1 de 3',
      expanded: true,
      actionLabel: 'Cerrar ventas',
      leaders: [{ rank: '1º', label: 'Marca', color: '#f00', path: 'M0 0' }],
    },
    activate,
  ) as any;
  expect(node.children[1].children[0].props['aria-label']).toBe(
    'Cerrar ventas',
  );
  expect(node.children[1].children[0].props.title).toBe('Cerrar ventas');
  node.children[1].children[0].props.onClick('event');
  expect(activate).toHaveBeenCalledWith('event');
  expect(node.children[1].children[3].children[0].children[2].children).toBe(
    'Marca',
  );
});
it('renders a compact section with a named expand action', () => {
  const activate = vi.fn();
  const node = renderVisualCell(
    h,
    {
      kind: 'section',
      layout: 'compact',
      title: 'Ventas',
      label: 'Cartera',
      value: '1 de 3',
      expanded: false,
      actionLabel: 'Abrir ventas',
    },
    activate,
  ) as any;
  expect(node.children[0].props['aria-expanded']).toBe('false');
  expect(node.children[0].props['aria-label']).toBe('Abrir ventas');
  expect(node.children[0].children.props.class).toContain('rv-expand-icon');
  expect(node.children[0].children.props.class).toContain('is-expand');
  expect(node.children[1].children).toBe('Ventas');
  expect(node.children[2].children).toBe('1 de 3');
  node.children[0].props.onClick('event');
  expect(activate).toHaveBeenCalledWith('event');
});
it('clamps ranges, skips invalid bubbles and provides localized labels', () => {
  const range = renderVisualCell(h, {
    kind: 'range',
    values: [-20, 50, 120],
    color: '#f00',
    label: 'Rango',
  }) as any;
  expect(range.props['aria-label']).toBe('Rango');
  expect(range.props.style['--low']).toBe('0%');
  expect(range.props.style['--high']).toBe('100%');
  const bubbles = renderVisualCell(h, {
    kind: 'bubbles',
    label: 'Estilos',
    points: [
      { x: 50, y: 20, size: 8, tone: 'negative' },
      { x: NaN, y: 2, size: 4, tone: 'positive' },
    ],
  }) as any;
  expect(bubbles.children).toHaveLength(1);
  expect(bubbles.children[0].props.class).toBe('loss');
});
it('composes shared strip plots and caller-formatted summaries', () => {
  const plot = renderVisualCell(h, {
    kind: 'strip',
    options: {
      label: 'Dispersión',
      domain: { min: 0, max: 1 },
      points: [{ value: 0.5 }],
    },
  }) as any;
  expect(plot.props['aria-label']).toBe('Dispersión');
  const summary = renderVisualCell(h, {
    kind: 'stat-list',
    items: [{ label: 'Mediana', value: '12 €' }],
  }) as any;
  expect(summary.children[1].children).toBe('12 €');
});

it('renders badges, formatted comparisons and accessible value actions', () => {
  const badge = renderVisualCell(h, {
    kind: 'badge',
    text: '42 %',
    tone: 'warning',
  }) as any;
  expect(badge.props.class).toContain('is-warning');
  const delta = renderVisualCell(h, {
    kind: 'value-delta',
    text: '−12 €',
    detail: '+2 h',
    tone: 'negative',
  }) as any;
  expect(delta.children[0].children).toBe('+2 h');
  expect(delta.children[1].children).toBe('−12 €');
  const activate = vi.fn();
  const value = renderVisualCell(
    h,
    { kind: 'value-action', text: '20 €', actionLabel: 'Editar importe' },
    activate,
  ) as any;
  expect(value.children[0].props['aria-label']).toBe('Editar importe');
  expect(value.children[0].props.key).toBe('Editar importe');
  value.children[0].props.onClick({});
  expect(activate).toHaveBeenCalledOnce();
  const complete = renderVisualCell(h, {
    kind: 'value-action',
    text: '20 €',
    suffix: { text: '✓', label: 'Completado' },
  }) as any;
  expect(complete.children[1].props['aria-label']).toBe('Completado');
});

it('renders a heat value and a keyboard-actionable localized region rail', () => {
  const heat = renderVisualCell(h, {
    kind: 'heat-value',
    text: '108 %',
    tone: 'very-positive',
  }) as any;
  expect(heat.props.class).toContain('is-very-positive');
  expect(heat.children).toBe('108 %');
  const activate = vi.fn();
  const rail = renderVisualCell(
    h,
    {
      kind: 'rail',
      text: 'Europe',
      actionLabel: 'Fermer Europe',
      expanded: true,
    },
    activate,
  ) as any;
  expect(rail.children[0].props['aria-label']).toBe('Fermer Europe');
  expect(rail.children[0].props['aria-expanded']).toBe('true');
  rail.children[0].props.onClick({});
  expect(activate).toHaveBeenCalledOnce();
  expect((renderVisualCell(h, { kind: 'rail' }) as any).children).toHaveLength(
    0,
  );
});
it('exposes localized chart data through focusable tooltip targets', () => {
  const history = {
    title: 'Marca',
    subtitle: 'Por mes',
    rows: [{ label: 'Máximo', value: '12%', color: '#0a8' }],
  };
  const range = renderVisualCell(h, {
    kind: 'range',
    label: 'Rango',
    color: '#0a8',
    values: [10, 20, 30],
    tooltip: history,
  }) as any;
  expect(range.props.tabIndex).toBe(0);
  expect(JSON.parse(range.props['data-tooltip']).history.rows[0].value).toBe(
    '12%',
  );
  const bubbles = renderVisualCell(h, {
    kind: 'bubbles',
    label: 'Estilos',
    points: [
      {
        x: 50,
        y: 50,
        size: 8,
        tone: 'positive',
        title: 'Producto',
        tooltip: history,
      },
    ],
  }) as any;
  expect(bubbles.props.role).toBe('group');
  expect(bubbles.children[0].props['aria-label']).toBe('Producto');
  expect(bubbles.children[0].props.tabIndex).toBe(0);
});

it('keeps rail text and value suffix when actions are optional', () => {
  const rail = renderVisualCell(h, { kind: 'rail', text: 'Europa' }) as any;
  expect(rail.children[0].children).toBe('Europa');
  const value = renderVisualCell(
    h,
    {
      kind: 'value-action',
      text: '20 €',
      actionLabel: 'Editar',
      suffix: { text: '✓', label: 'Completado' },
    },
    vi.fn(),
  ) as any;
  expect(value.children[1].children).toBe('✓');
  expect(value.children[1].props['aria-label']).toBe('Completado');
});
