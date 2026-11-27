import type { ElementFactory } from './native-controls';

/** Render the non-negative trend values used by a visual metric tile. */
export function renderMiniBarChart(h: ElementFactory, options: { value: readonly number[]; minValue?: number }) {
  const values = options.value;
  const max = Math.max(...values) || 1;
  return h('div', { class: 'bar-chart-container' }, [
    h('div', { class: 'bar-chart bottom' }, values.map(value =>
      h('div', {
        class: 'bar-chart-bar',
        style: { width: `${100 / values.length}%`, height: `${value / max * 100}%` },
      }),
    )),
  ]);
}
