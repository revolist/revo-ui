import { expect, it } from 'vitest';
import { renderMetricTrend } from './metric-trend';
const h = (tag: string, props: Record<string, unknown>, children?: unknown) => ({ tag, props, children });
it('renders the formatted metric and optional supplied visual', () => {
  const cell = renderMetricTrend(h, { value: '€12', detail: '+2', tone: 'positive', visual: () => 'chart' });
  expect(cell.children[0].children[0].children).toBe('€12');
  expect(cell.children[1]).toBe('chart');
});
