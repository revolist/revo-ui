import { controlClassName } from '../control-presentation';
import type { ElementFactory, ValueClasses } from './types';
export function renderMiniBarChart(
  h: ElementFactory,
  options: {
    value: unknown;
    minValue?: number;
    maxValue?: number;
    barPosition?: 'top' | 'bottom';
    classesForValue?: ValueClasses;
  },
) {
  const { value } = options;
  const barChartData = Array.isArray(value) ? value : []; // Ensure value is an array
  if (barChartData.length === 0)
    return h('div', { class: 'bar-chart-container' }, ''); // Handle empty data

  const maxValue = options.maxValue ?? Math.max(...barChartData); // Use column maxValue or data max
  const minValue = options.minValue ?? Math.min(...barChartData); // Use column minValue or data min

  // Normalize the data points to the range of the container (0 to 100%)
  const normalizedData = barChartData.map(
    (val) => ((val - minValue) / (maxValue - minValue || 1)) * 100, // Scale to fit 100% width/height
  );

  return h('div', { class: 'bar-chart-container' }, [
    h('div', { class: `bar-chart ${options.barPosition || 'bottom'}` }, [
      // Render a div for each data point (bar)
      ...normalizedData.map((height, index) => {
        const thresholdClasses = options.classesForValue?.(height) ?? {};
        return h('div', {
          class: controlClassName('bar-chart-bar', thresholdClasses),
          style: {
            width: `${100 / barChartData.length}%`, // Set width of each bar based on total number of bars
            height: `${height}%`, // Height of each bar relative to normalized data
          },
        });
      }),
    ]),
  ]);
}
