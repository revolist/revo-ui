// @vitest-environment happy-dom
import { h, render } from 'preact';
import { afterEach, expect, it } from 'vitest';
import { BarChart } from './bar-chart';

afterEach(() => {
  render(null, document.body);
  document.body.replaceChildren();
});

it.each(['none', 'dot', 'line', 'dashed'] as const)(
  'preserves the %s indicator in the shared datum tooltip',
  (indicator) => {
    render(
      <BarChart
        ariaLabel="Expenses"
        data={[
          {
            key: 'rent',
            value: 12,
            tooltip: { title: 'Rent', details: ['12 dollars'] },
          },
        ]}
        barColor="#f97316"
        tooltipIndicator={indicator}
      />,
      document.body,
    );
    const tooltip = document.querySelector('[role="tooltip"]')!;
    expect(
      tooltip.classList.contains(
        `rv-distribution-chart__tooltip--${indicator}`,
      ),
    ).toBe(true);
    expect(tooltip.querySelectorAll('i[aria-hidden="true"]')).toHaveLength(
      indicator === 'none' ? 0 : 1,
    );
    expect(tooltip.textContent).toBe('Rent12 dollars');
  },
);
