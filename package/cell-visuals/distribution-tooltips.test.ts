// @vitest-environment happy-dom
import { expect, it } from 'vitest';
import { renderStripPlot } from './strip-plot';
import { renderTimeline } from './timeline';
import { createMetricTileHistoryTooltip, METRIC_TILE_HISTORY_TOOLTIP } from './metric-tile-history';
const h = (tag: string, props: Record<string, any>, children?: any) => ({ tag, props, children });
const details = { title: 'Lote A', rows: [{ label: 'Puntuación', value: '7,7' }], footer: { text: 'Aceptado', color: 'green' } };
it('makes only tooltip-enabled plot points keyboard accessible', () => {
  const node = renderStripPlot(h, { label: 'Lotes', domain: { min: 0, max: 10 }, points: [{ value: 7.7, tooltip: details }, { value: 8 }] });
  expect(node.props.role).toBe('group');
  expect(node.children[0].tag).toBe('button');
  expect(node.children[0].props['tooltip-type']).toBe(METRIC_TILE_HISTORY_TOOLTIP);
  expect(node.children[1].props['aria-hidden']).toBe('true');
  const body = createMetricTileHistoryTooltip(document, node.children[0].props['data-tooltip'])!;
  expect(body.textContent).toContain('Puntuación7,7');
  expect(body.querySelector('.rv-metric-history__footer')?.textContent).toBe('Aceptado');
});
it('exposes the full timeline summary on hover and focus without nested event tooltips', () => {
  const node = renderTimeline(h, { value: [{ start: 1, end: 3, label: 'Spread' }], tooltip: details });
  expect(node.props.tabIndex).toBe(0);
  expect(node.props['tooltip-type']).toBe(METRIC_TILE_HISTORY_TOOLTIP);
  expect(node.children[0].children[1].props['data-tooltip']).toBeUndefined();
  expect(JSON.parse(node.props['data-tooltip']).history.title).toBe('Lote A');
});
