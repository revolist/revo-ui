// @vitest-environment happy-dom
import { Fragment, h, render } from 'preact';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DistributionChart, type DistributionChartDatum } from '.';

const data: readonly DistributionChartDatum[] = [
  {
    key: 'apr-27',
    value: 12,
    selected: true,
    tooltip: { title: 'Apr 27 – May 3', details: ['12 orders', 'Selected'] },
  },
  {
    key: 'may-4',
    value: 7,
    selected: false,
    tooltip: {
      title: 'May 4 – May 10',
      details: ['7 orders', 'Outside selection'],
    },
  },
  {
    key: 'may-11',
    value: 9,
    selected: true,
    tooltip: { title: 'May 11 – May 17', details: ['9 orders', 'Selected'] },
  },
];

afterEach(() => {
  render(null, document.body);
  document.body.replaceChildren();
});

function mount(type: 'bar' | 'line' | 'area' = 'bar') {
  const host = document.createElement('div');
  document.body.append(host);
  render(
    <DistributionChart
      ariaLabel="Order distribution"
      type={type}
      data={data}
    />,
    host,
  );
  return host;
}

describe('DistributionChart', () => {
  it.each(['bar', 'line', 'area'] as const)(
    'renders the %s presentation from one control',
    (type) => {
      const host = mount(type);
      const chart = host.querySelector('.rv-distribution-chart');
      expect(chart?.classList.contains(`rv-distribution-chart--${type}`)).toBe(
        true,
      );
      expect(chart?.getAttribute('aria-label')).toBe('Order distribution');
      expect(
        host.querySelectorAll('.rv-distribution-chart__datum'),
      ).toHaveLength(data.length);
      expect(
        host.querySelectorAll('.rv-distribution-chart__datum.is-selected'),
      ).toHaveLength(2);
      expect(
        type === 'bar'
          ? host.querySelectorAll('.rv-distribution-chart__bar').length
          : host.querySelectorAll('.rv-distribution-chart__series').length,
      ).toBeGreaterThan(0);
    },
  );

  it('keeps every line interval outside a selected range muted', () => {
    const host = document.createElement('div');
    document.body.append(host);
    render(
      <DistributionChart
        ariaLabel="Selected distribution"
        type="line"
        data={data.map((datum, index) => ({ ...datum, selected: index < 2 }))}
      />,
      host,
    );
    const segments = [
      ...host.querySelectorAll<SVGPathElement>(
        '.rv-distribution-chart__segment',
      ),
    ];

    expect(segments).toHaveLength(2);
    expect(
      segments.map((segment) => segment.classList.contains('is-selected')),
    ).toEqual([true, false]);
  });

  it('provides rich per-datum tooltips and roving keyboard navigation', () => {
    const host = mount('area');
    const items = [
      ...host.querySelectorAll<HTMLElement>('.rv-distribution-chart__datum'),
    ];
    expect(items.map((item) => item.tabIndex)).toEqual([0, -1, -1]);
    expect(items[0].getAttribute('aria-label')).toBe(
      'Apr 27 – May 3. 12 orders. Selected',
    );
    expect(items[0].querySelector('[role="tooltip"]')?.textContent).toBe(
      'Apr 27 – May 312 ordersSelected',
    );

    items[0].focus();
    items[0].dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }),
    );
    expect(document.activeElement).toBe(items[1]);
    items[1].dispatchEvent(
      new KeyboardEvent('keydown', { key: 'End', bubbles: true }),
    );
    expect(document.activeElement).toBe(items[2]);
    items[2].dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Home', bubbles: true }),
    );
    expect(document.activeElement).toBe(items[0]);
  });

  it('allows completely different tooltip content per datum and stays safe for empty data', () => {
    const host = document.createElement('div');
    document.body.append(host);
    const renderTooltip = vi.fn((datum: DistributionChartDatum) => (
      <>
        <strong>{datum.tooltip.title}</strong>
        <em>Custom metric</em>
      </>
    ));
    render(
      <DistributionChart
        ariaLabel="Custom distribution"
        data={data.slice(0, 1)}
        renderTooltip={renderTooltip}
      />,
      host,
    );
    expect(host.querySelector('[role="tooltip"]')?.textContent).toBe(
      'Apr 27 – May 3Custom metric',
    );
    expect(renderTooltip).toHaveBeenCalledWith(data[0], 0);

    render(
      <DistributionChart ariaLabel="Empty distribution" data={[]} />,
      host,
    );
    expect(
      host.querySelector('.rv-distribution-chart')?.getAttribute('data-empty'),
    ).toBe('true');
    expect(host.querySelectorAll('.rv-distribution-chart__datum')).toHaveLength(
      0,
    );
  });
});
