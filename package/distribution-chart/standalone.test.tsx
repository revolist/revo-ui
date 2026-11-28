// @vitest-environment happy-dom
import { h, render } from 'preact';
import { act } from 'preact/test-utils';
import { afterEach, expect, it } from 'vitest';
import { BarChart } from './bar-chart';
import { LineChart } from './line-chart';
import { AreaChart } from './area-chart';
import { DonutChart } from './donut-chart';

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

it('applies per-bar, per-series and per-slice patterns with unique SVG IDs', () => {
  render(
    <>
      <BarChart ariaLabel="Dotted" data={data} barPattern="dots" />
      <BarChart
        ariaLabel="Striped"
        data={data}
        series={[
          {
            key: 'a',
            label: 'A',
            values: [1, 2, 3],
            color: 'red',
            pattern: 'stripes',
          },
        ]}
      />
      <DonutChart
        ariaLabel="First"
        data={data}
        slicePatterns={['stripes', 'dots']}
      />
      <DonutChart
        ariaLabel="Second"
        data={data}
        slicePatterns={['stripes', 'dots']}
      />
    </>,
    document.body,
  );
  expect(
    document.querySelector('[aria-label="Dotted"] [data-pattern="dots"]'),
  ).not.toBeNull();
  const stripe = document.querySelector(
    '[aria-label="Striped"] [data-series="a"]',
  )!;
  const seriesPattern = document.querySelector(
    '[aria-label="Striped"] pattern',
  )!;
  expect(stripe.getAttribute('fill')).toBe(`url(#${seriesPattern.id})`);
  const first = document.querySelector('[aria-label="First"]')!;
  const second = document.querySelector('[aria-label="Second"]')!;
  const firstPatterns = first.querySelectorAll('pattern');
  expect(firstPatterns).toHaveLength(2);
  expect(firstPatterns[0].id).not.toBe(second.querySelector('pattern')?.id);
  expect(
    first.querySelector('circle[stroke-dasharray]')?.getAttribute('stroke'),
  ).toBe(`url(#${firstPatterns[0].id})`);
  expect(firstPatterns[1].querySelector('circle')).not.toBeNull();
});

it('shows doughnut label swatches using the same colors and patterns as their slices', () => {
  render(
    <DonutChart
      ariaLabel="Legend"
      data={data}
      showLabels
      sliceColors={['red', 'blue', 'orange']}
      slicePatterns={['stripes', undefined, 'dots']}
    />,
    document.body,
  );
  const slices = [
    ...document.querySelectorAll(
      '.rv-distribution-chart__donut-plot circle[stroke-dasharray]',
    ),
  ];
  const swatches = [
    ...document.querySelectorAll('.rv-distribution-chart__label-swatch rect'),
  ];
  expect(swatches).toHaveLength(data.length);
  expect(swatches.map((swatch) => swatch.getAttribute('fill'))).toEqual(
    slices.map((slice) => slice.getAttribute('stroke')),
  );
  expect(
    document
      .querySelector('.rv-distribution-chart__labels')
      ?.getAttribute('aria-hidden'),
  ).toBe('true');
});

it.each([
  ['bar', BarChart],
  ['line', LineChart],
  ['area', AreaChart],
  ['donut', DonutChart],
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

it('renders proportional doughnut slices and handles nonpositive values', () => {
  const values = [3, 1, -1, NaN, Infinity];
  const items = values.map((value, index) => ({
    key: String(index),
    value,
    tooltip: { title: `Slice ${index}` },
  }));
  render(
    <DonutChart
      ariaLabel="Share"
      data={items}
      centerLabel="Total"
      sliceColors={['red', 'blue']}
    />,
    document.body,
  );
  const circles = document.querySelectorAll(
    '.rv-distribution-chart__donut-plot circle',
  );
  expect(circles).toHaveLength(3);
  expect(circles[1].getAttribute('stroke-dasharray')).toBe('75 25');
  expect(circles[2].getAttribute('stroke-dasharray')).toBe('25 75');
  expect(circles[2].getAttribute('stroke-dashoffset')).toBe('-75');
  expect(
    document.querySelector('.rv-distribution-chart__donut-label')?.textContent,
  ).toBe('Total');
  render(
    <DonutChart ariaLabel="Empty values" data={items.slice(2)} />,
    document.body,
  );
  expect(
    document.querySelectorAll('.rv-distribution-chart__donut-plot circle'),
  ).toHaveLength(1);
  expect(
    document.querySelector('.rv-distribution-chart__donut-plot')?.innerHTML,
  ).not.toMatch(/NaN|Infinity/);
  render(
    <DonutChart
      ariaLabel="Large values"
      data={items
        .slice(0, 2)
        .map((item) => ({ ...item, value: Number.MAX_VALUE }))}
    />,
    document.body,
  );
  expect(
    document
      .querySelectorAll('.rv-distribution-chart__donut-plot circle')[1]
      .getAttribute('stroke-dasharray'),
  ).toBe('50 50');
});

it('keeps doughnut click targets attached to the right data after reordering', async () => {
  await act(() =>
    render(<DonutChart ariaLabel="Reordered" data={data} />, document.body),
  );
  document
    .querySelector(
      '.rv-distribution-chart__donut-plot circle[stroke-dasharray]',
    )!
    .dispatchEvent(new MouseEvent('click', { bubbles: true }));
  expect(document.activeElement?.getAttribute('aria-label')).toContain(
    'Point 1',
  );
  await act(() =>
    render(
      <DonutChart ariaLabel="Reordered" data={[...data].reverse()} />,
      document.body,
    ),
  );
  const firstArc = document.querySelector(
    '.rv-distribution-chart__donut-plot circle[stroke-dasharray]',
  )!;
  firstArc.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  expect(document.activeElement?.getAttribute('aria-label')).toContain(
    'Point 3',
  );
});

it('renders stacked bars on one scale with accessible series values', () => {
  render(
    <BarChart
      ariaLabel="Visitors"
      data={data.slice(0, 2)}
      showLabels
      seriesMode="stacked"
      series={[
        { key: 'desktop', label: 'Desktop', values: [30, 20], color: 'red' },
        { key: 'mobile', label: 'Mobile', values: [10, 20], color: 'blue' },
      ]}
    />,
    document.body,
  );
  const desktop = document.querySelector('[data-series="desktop"]')!;
  const mobile = document.querySelector('[data-series="mobile"]')!;
  const first = desktop.querySelector('rect')!;
  const second = mobile.querySelector('rect')!;
  expect(Number(first.getAttribute('height'))).toBeCloseTo(66);
  expect(Number(second.getAttribute('height'))).toBeCloseTo(22);
  expect(Number(second.getAttribute('y'))).toBeCloseTo(8);
  expect(
    document.querySelector('[role="listitem"]')?.getAttribute('aria-label'),
  ).toContain('Desktop: 30. Mobile: 10');
  expect(
    document.querySelector('.rv-distribution-multiseries__legend')?.textContent,
  ).toContain('DesktopMobile');
});

it('retains selected-category emphasis in multi-series charts', () => {
  render(
    <BarChart
      ariaLabel="Selection"
      data={data}
      series={[{ key: 'one', label: 'One', values: [1, 2, 3] }]}
    />,
    document.body,
  );
  const bars = document.querySelectorAll('[data-series="one"] rect');
  expect(bars[0].getAttribute('opacity')).toBe('1');
  expect(bars[2].getAttribute('opacity')).toBe('0.3');
  render(
    <LineChart
      ariaLabel="Selection"
      data={data}
      series={[{ key: 'one', label: 'One', values: [1, 2, 3] }]}
    />,
    document.body,
  );
  const paths = document.querySelectorAll('[data-series="one"] path');
  expect(paths).toHaveLength(2);
  expect(paths[0].getAttribute('opacity')).toBe('1');
  expect(paths[1].getAttribute('opacity')).toBe('0.3');
});

it('overlays bar, line and area series and preserves custom tooltip datum identity', () => {
  const seen: unknown[] = [];
  render(
    <BarChart
      ariaLabel="Mixed"
      data={data}
      series={[
        { key: 'bar', label: 'Bar', type: 'bar', values: [1, 2, 3] },
        { key: 'line', label: 'Line', type: 'line', values: [2, 3, 4] },
        { key: 'area', label: 'Area', type: 'area', values: [3, 1, 2] },
      ]}
      renderTooltip={(datum) => {
        seen.push(datum);
        return <span>Custom</span>;
      }}
    />,
    document.body,
  );
  expect(
    document.querySelector('[data-series-type="bar"] rect'),
  ).not.toBeNull();
  expect(
    document.querySelector('[data-series-type="line"] path'),
  ).not.toBeNull();
  expect(
    document.querySelector('[data-series-type="area"] path'),
  ).not.toBeNull();
  expect(seen).toEqual(data);
});

it('normalizes missing, negative, nonfinite and extremely large series values', () => {
  render(
    <AreaChart
      ariaLabel="Values"
      data={data}
      seriesMode="stacked"
      series={[
        { key: 'a', label: 'A', values: [Number.MAX_VALUE, -1, NaN] },
        { key: 'b', label: 'B', values: [Number.MAX_VALUE] },
      ]}
    />,
    document.body,
  );
  const svg = document.querySelector('.rv-distribution-chart__plot')!;
  expect(svg.innerHTML).not.toMatch(/NaN|Infinity/);
  expect(document.querySelectorAll('[role="listitem"]')).toHaveLength(3);
});

it('closes stacked step areas along the step-shaped lower boundary', () => {
  render(
    <AreaChart
      ariaLabel="Stacked steps"
      data={data}
      interpolation="step"
      seriesMode="stacked"
      series={[
        { key: 'base', label: 'Base', values: [1, 3, 2] },
        { key: 'top', label: 'Top', values: [2, 2, 2] },
      ]}
    />,
    document.body,
  );
  const path =
    document.querySelector('[data-series="top"] path')?.getAttribute('d') ?? '';
  expect(path).toMatch(/ H .* V /);
  expect(path).toMatch(/ V .* H .* Z$/);
});

it('honors gradient fill for multi-series area charts without sharing IDs', () => {
  const series = [{ key: 'a', label: 'A', values: [1, 2, 3] }];
  render(
    <>
      <AreaChart
        ariaLabel="One"
        data={data}
        series={series}
        areaFill="gradient"
      />
      <AreaChart
        ariaLabel="Two"
        data={data}
        series={series}
        areaFill="gradient"
      />
    </>,
    document.body,
  );
  const gradients = document.querySelectorAll('linearGradient');
  expect(gradients).toHaveLength(2);
  expect(gradients[0].getAttribute('gradientUnits')).toBe('userSpaceOnUse');
  expect(gradients[0].id).not.toBe(gradients[1].id);
  expect(
    document
      .querySelector('[aria-label="One"] [data-series="a"] path')
      ?.getAttribute('fill'),
  ).toBe(`url(#${gradients[0].id})`);
});

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
