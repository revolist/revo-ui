import { expect, it } from 'vitest';
import { renderMetricStack } from './metric-stack';
const h = (
  tag: string,
  props: Record<string, unknown>,
  children?: unknown,
) => ({ tag, props, children });
it('renders localized values and a caller-selected tone', () => {
  const cell = renderMetricStack(h, {
    value: '12 €',
    detail: '+3 %',
    tone: 'positive',
  });
  expect(cell.children[0].children).toBe('12 €');
  expect(cell.children[1].props.class).toBe(
    'rv-metric-stack__detail is-positive',
  );
  expect(renderMetricStack(h, { value: '—' }).children[1]).toBeNull();
});
it('renders inline change text with a localized accessible label', () => {
  const cell = renderMetricStack(h, {
    value: '12 €',
    detail: '3 %',
    detailLabel: 'Baisse de 3 %',
    trend: 'down',
    tone: 'negative',
    layout: 'inline',
  });
  expect(cell.props.class).toContain('rv-metric-stack--inline');
  expect(cell.children[1].props['aria-label']).toBe('Baisse de 3 %');
  expect(cell.children[1].children[0].props['aria-hidden']).toBe('true');
  expect(
    renderMetricStack(h, { value: 'Sin ventas', valueTone: 'muted' })
      .children[0].props.class,
  ).toContain('is-muted');
});
