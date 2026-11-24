// @vitest-environment happy-dom
import { expect, it, vi } from 'vitest';
import { createDotHistogramElement, createSegmentedSummaryElement, releaseSummaryChartElement } from './summary-charts-native';

it('renders finite distribution values with localized bounds and bounded stacks', () => {
  const chart = createDotHistogramElement(document, { values: [1, 1, 1, 4, NaN, Infinity], label: 'Distribución', maxStack: 2, formatValue: n => `${n} €`, isHighlighted: (_value, _index, level) => level === 1 });
  expect(chart.getAttribute('aria-label')).toBe('Distribución');
  expect(chart.querySelectorAll('i')).toHaveLength(3);
  expect(chart.querySelectorAll('.is-highlighted')).toHaveLength(1);
  expect(chart.querySelector('.rv-dot-histogram__axis')?.textContent).toBe('1 €4 €');
  releaseSummaryChartElement(chart);
});
it('renders ordered composition and independently ordered localized legend', () => {
  const chart = createSegmentedSummaryElement(document, { label: 'Résultats', parts: [{ label: 'Oui', value: 2, color: 'green' }, { label: 'Indisponible', value: 1, color: 'gray' }, { label: 'Non', value: 1, color: 'red' }], legendOrder: [0, 2, 1] });
  expect(chart.querySelector('[role="img"]')?.getAttribute('aria-label')).toBe('Résultats');
  expect(chart.querySelectorAll('.rv-segmented-bar__part')).toHaveLength(3);
  expect(chart.querySelector('.rv-segmented-summary__legend')?.textContent).toBe('Oui 2Non 1Indisponible 1');
  releaseSummaryChartElement(chart);
});
it('shows and releases company detail tooltips for interactive dots', () => {
  vi.useFakeTimers();
  const chart = createDotHistogramElement(document, { values: [NaN, 17], label: 'Ingresos', tooltip: (value, index) => ({ title: `Empresa ${index}`, subtitle: 'Madrid', metricLabel: 'Ingresos', metricValue: `${value} €` }) });
  document.body.append(chart);
  const dot = chart.querySelector<HTMLButtonElement>('button')!;
  expect(dot.getAttribute('aria-label')).toContain('Empresa 1');
  dot.dispatchEvent(new Event('focusin', { bubbles: true }));
  expect(document.querySelector('[role="tooltip"]')).toBeNull();
  vi.advanceTimersByTime(200);
  expect(document.querySelector('[role="tooltip"]')?.textContent).toContain('Empresa 1');
  expect(document.querySelector('[role="tooltip"]')?.textContent).toContain('17 €');
  releaseSummaryChartElement(chart);
  expect(document.querySelector('[role="tooltip"]')).toBeNull();
  vi.useRealTimers();
});
it('renders reusable dotted comparison and positioned distribution charts', async () => {
  const { createDottedComparisonElement, createStackedDotPlotElement } = await import('./summary-charts-native');
  const bars = createDottedComparisonElement(document, { label: 'Ventas', values: [50, 200], references: [25, 75], maximum: 100, columnWidth: 40 });
  expect(bars.getAttribute('aria-label')).toBe('Ventas');
  expect(bars.querySelectorAll('.rv-dotted-comparison__column')).toHaveLength(2);
  expect((bars.querySelectorAll<HTMLElement>('.rv-dotted-comparison__bar')[1]).style.height).toBe('100%');
  expect((bars.querySelector<HTMLElement>('.rv-dotted-comparison__marker')!).style.bottom).toBe('25%');
  const plot = createStackedDotPlotElement(document, { label: 'Previsión', reference: 80, points: [{ x: 30, y: 4 }, { x: 110, y: 10, tone: 'secondary' }, { x: NaN, y: 0 }] });
  expect(plot.getAttribute('aria-label')).toBe('Previsión');
  expect(plot.querySelectorAll('.rv-stacked-dot-plot__point')).toHaveLength(2);
  expect(plot.querySelector<HTMLElement>('.is-secondary')?.style.left).toBe('100%');
  releaseSummaryChartElement(bars); releaseSummaryChartElement(plot);
});
it('shows and cleans up comparison and overall chart tooltips', async () => {
  vi.useFakeTimers();
  const { createDottedComparisonElement, createStackedDotPlotElement } = await import('./summary-charts-native');
  const tooltip = { title: 'Diciembre', subtitle: 'Real', rows: [{ label: 'Año actual', value: '100 €' }, { label: 'Anterior', value: '90 €' }] };
  const chart = createDottedComparisonElement(document, { label: 'Ventas', values: [100], references: [90], maximum: 100, tooltip: () => tooltip });
  document.body.append(chart);
  const button = chart.querySelector('button')!;
  expect(button.getAttribute('aria-label')).toBe('Diciembre');
  button.dispatchEvent(new Event('focusin', { bubbles: true }));
  vi.advanceTimersByTime(200);
  expect(document.querySelector('[role="tooltip"]')?.textContent).toContain('100 €');
  releaseSummaryChartElement(chart);
  expect(document.querySelector('[role="tooltip"]')).toBeNull();
  const plot = createStackedDotPlotElement(document, { label: 'Resumen', points: [], tooltip });
  document.body.append(plot);
  plot.dispatchEvent(new Event('focusin', { bubbles: true }));
  vi.advanceTimersByTime(200);
  expect(document.querySelector('[role="tooltip"]')?.textContent).toContain('Anterior');
  releaseSummaryChartElement(plot);
  expect(document.querySelector('[role="tooltip"]')).toBeNull();
  vi.useRealTimers();
});
it('cancels a pending chart tooltip when the pointer leaves', () => {
  vi.useFakeTimers();
  const chart = createDotHistogramElement(document, { values: [1], label: 'Distribution', tooltip: () => ({ title: 'One', metricLabel: 'Value', metricValue: '1' }) });
  document.body.append(chart);
  const dot = chart.querySelector('button')!;
  dot.dispatchEvent(new Event('pointerover', { bubbles: true }));
  vi.advanceTimersByTime(100);
  dot.dispatchEvent(new Event('pointerout', { bubbles: true }));
  vi.advanceTimersByTime(200);
  expect(document.querySelector('[role="tooltip"]')).toBeNull();
  releaseSummaryChartElement(chart);
  vi.useRealTimers();
});
it('shows individual stacked-dot details with original indexes and cleans up', async () => {
  vi.useFakeTimers();
  const { createStackedDotPlotElement } = await import('./summary-charts-native');
  const pointTooltip = vi.fn((_point, index) => ({ title: `Línea ${index}`, rows: [{ label: 'Plan', value: `${index} €` }] }));
  const plot = createStackedDotPlotElement(document, {
    label: 'Distribución',
    points: [{ x: NaN, y: 0 }, { x: 20, y: 4 }, { x: 50, y: 8 }],
    tooltip: { title: 'Total', rows: [] },
    pointTooltip,
  });
  document.body.append(plot);
  const dots = plot.querySelectorAll<HTMLButtonElement>('button[data-point-index]');
  expect(dots).toHaveLength(2);
  expect(dots[0].dataset.pointIndex).toBe('1');
  expect(dots[0].getAttribute('aria-label')).toContain('Línea 1');
  dots[0].dispatchEvent(new Event('focusin', { bubbles: true }));
  vi.advanceTimersByTime(200);
  expect(document.querySelector('[role="tooltip"]')?.textContent).toContain('Línea 1');
  expect(document.querySelector('[role="tooltip"]')?.textContent).toContain('1 €');
  dots[1].dispatchEvent(new Event('focusin', { bubbles: true }));
  vi.advanceTimersByTime(200);
  expect(document.querySelector('[role="tooltip"]')?.textContent).toContain('Línea 2');
  releaseSummaryChartElement(plot);
  expect(document.querySelector('[role="tooltip"]')).toBeNull();
  vi.useRealTimers();
});
