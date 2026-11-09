// @vitest-environment happy-dom
import { h, render } from 'preact';
import { afterEach, expect, it } from 'vitest';
import { BarChart } from './bar-chart';
import { LineChart } from './line-chart';
import { AreaChart } from './area-chart';

afterEach(() => {
  render(null, document.body);
  document.body.replaceChildren();
});
const data = [8, 12, 4].map((value, index) => ({
  key: String(index),
  value,
  selected: index < 2,
  tooltip: { title: `Point ${index + 1}`, details: [`${value} items`] },
}));

it.each([
  ['bar', BarChart],
  ['line', LineChart],
  ['area', AreaChart],
] as const)(
  'renders the independent %s chart without a brush or grid',
  (type, Chart) => {
    render(
      <Chart
        data={data}
        ariaLabel="Independent chart"
        renderTooltip={(datum) => <em>{datum.value} items</em>}
      />,
      document.body,
    );
    const chart = document.querySelector('[role="group"]')!;
    expect(chart.classList.contains(`rv-distribution-chart--${type}`)).toBe(
      true,
    );
    expect(
      document.querySelector('revo-grid, input, [role="slider"]'),
    ).toBeNull();
    const points = [
      ...chart.querySelectorAll<HTMLElement>('[role="listitem"]'),
    ];
    expect(points).toHaveLength(3);
    expect(points[0].getAttribute('aria-label')).toBe('Point 1. 8 items');
    expect(points[0].querySelector('[role="tooltip"]')?.textContent).toBe(
      '8 items',
    );
    points[0].focus();
    points[0].dispatchEvent(
      new KeyboardEvent('keydown', { key: 'End', bubbles: true }),
    );
    expect(document.activeElement).toBe(points[2]);
    points[2].dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Home', bubbles: true }),
    );
    expect(document.activeElement).toBe(points[0]);
    render(<Chart data={[]} ariaLabel="Empty chart" />, document.body);
    expect(document.querySelector('[data-empty="true"]')).not.toBeNull();
  },
);

it('normalizes invalid bar values and keeps geometry finite', () => {
  render(
    <BarChart
      ariaLabel="Values"
      data={[NaN, -10, Infinity, 5].map((value, index) => ({
        key: String(index),
        value,
        tooltip: { title: String(index) },
      }))}
    />,
    document.body,
  );
  const bars = [
    ...document.querySelectorAll<HTMLElement>('.rv-distribution-chart__bar'),
  ];
  expect(bars.map((bar) => bar.style.height)).toEqual([
    '3%',
    '3%',
    '3%',
    '100%',
  ]);
});

it('renders line intervals and hides visual points without removing keyboard targets', () => {
  render(
    <LineChart ariaLabel="Line" data={data} showPoints={false} />,
    document.body,
  );
  const segments = [
    ...document.querySelectorAll('.rv-distribution-chart__segment'),
  ];
  expect(
    segments.map((segment) => segment.classList.contains('is-selected')),
  ).toEqual([true, false]);
  expect(
    document.querySelectorAll('.rv-distribution-chart__point'),
  ).toHaveLength(0);
  expect(document.querySelectorAll('[role="listitem"]')).toHaveLength(3);
});

it('composes grid, formatted values, categories, legend and optional tooltips', () => {
  render(
    <BarChart
      ariaLabel="Options"
      data={data}
      showGrid
      showLabels
      showValues
      legend="Orders"
      formatValue={(value) => `$${value}`}
      tooltip={false}
    />,
    document.body,
  );
  expect(
    document.querySelectorAll('.rv-distribution-chart__grid span'),
  ).toHaveLength(5);
  expect(
    document.querySelector('.rv-distribution-chart__legend')?.textContent,
  ).toBe('Orders');
  expect(
    document.querySelector('.rv-distribution-chart__value')?.textContent,
  ).toBe('$8');
  expect(
    document.querySelectorAll('.rv-distribution-chart__labels span'),
  ).toHaveLength(3);
  expect(document.querySelector('[role="tooltip"]')).toBeNull();
  expect(document.querySelectorAll('[role="listitem"]')).toHaveLength(3);
});

it('renders step paths and collision-free gradient definitions across area instances', () => {
  render(
    <>
      <LineChart ariaLabel="Step" data={data} interpolation="step" />
      <AreaChart
        ariaLabel="Area one"
        data={data}
        interpolation="step"
        areaFill="gradient"
      />
      <AreaChart ariaLabel="Area two" data={data} areaFill="gradient" />
    </>,
    document.body,
  );
  expect(
    document
      .querySelector('.rv-distribution-chart__segment')
      ?.getAttribute('d'),
  ).toContain(' H ');
  const gradients = [...document.querySelectorAll('linearGradient')];
  expect(gradients).toHaveLength(4);
  expect(new Set(gradients.map((gradient) => gradient.id)).size).toBe(4);
  const area = document.querySelector('.rv-distribution-chart__area')!;
  expect(area.getAttribute('d')).toContain(' V ');
  expect(area.getAttribute('style')).toContain(gradients[0].id);
  expect(area.getAttribute('d')).not.toContain('NaN');
});

it('supports arbitrary per-bar color rules and theme fallback', () => {
  render(
    <BarChart
      data={data}
      ariaLabel="Colors"
      barColor={(datum, index) =>
        datum.value > 10 && index === 1 ? '#f97316' : undefined
      }
    />,
    document.body,
  );
  const bars = [
    ...document.querySelectorAll<HTMLElement>('.rv-distribution-chart__bar'),
  ];
  expect(bars[0].style.backgroundColor).toBe('');
  expect(bars[1].style.backgroundColor).toBe('#f97316');
  expect(bars[2].style.backgroundColor).toBe('');
  render(
    <BarChart data={data} ariaLabel="Colors" barColor="purple" />,
    document.body,
  );
  expect(bars[0].style.backgroundColor).toBe('purple');
});
