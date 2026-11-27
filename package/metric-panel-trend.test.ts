import { expect, it } from 'vitest';
import { renderMiniBarChart } from './metric-panel-trend';

it('scales visual metric bars from zero to their largest value', () => {
  const h = (tag: string, props: Record<string, unknown>, children?: unknown) => ({ tag, props, children });
  const chart = renderMiniBarChart(h, { value: [1, 2, 4], minValue: 0 });
  const bars = chart.children[0].children;
  expect(bars.map((bar: { props: { style: { height: string; width: string } } }) => bar.props.style)).toEqual([
    { width: `${100 / 3}%`, height: '25%' },
    { width: `${100 / 3}%`, height: '50%' },
    { width: `${100 / 3}%`, height: '100%' },
  ]);
  expect(renderMiniBarChart(h, { value: [0], minValue: 0 }).children[0].children[0].props.style.height).toBe('0%');
});
