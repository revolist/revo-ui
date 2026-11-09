import { h, render } from 'preact';
import { act } from 'preact/test-utils';
import { afterEach, expect, it, vi } from 'vitest';
import { ConfiguratorAggregationList } from './configurator-aggregation-list';
const host = document.createElement('div');
afterEach(() => {
  render(null, host);
  host.remove();
});
it('explores registered operations with arrows and commits only an activated choice', async () => {
  document.body.append(host);
  const change = vi.fn();
  await act(() =>
    render(
      <ConfiguratorAggregationList
        value="sum"
        aggregators={['sum', 'avg']}
        i18n={{
          measureAggregation: 'Summary',
          aggregationNames: { sum: 'Total', avg: 'Average' },
          measureCurrentUnavailable: (value) => `Unavailable ${value}`,
        }}
        onChange={change}
      />,
      host,
    ),
  );
  const [sum, avg] = [...host.querySelectorAll<HTMLButtonElement>('button')];
  expect(sum.getAttribute('aria-checked')).toBe('true');
  expect(avg.textContent).toBe('Average');
  sum.focus();
  await act(() => {
    sum.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }),
    );
  });
  expect(document.activeElement).toBe(avg);
  expect(change).not.toHaveBeenCalled();
  avg.click();
  expect(change).toHaveBeenCalledWith('avg', avg);
});
it('preserves an unavailable current operation without allowing it to be selected', () => {
  render(
    <ConfiguratorAggregationList
      value="custom"
      aggregators={['sum']}
      i18n={{
        measureAggregation: 'Summary',
        aggregationNames: {},
        measureCurrentUnavailable: (value) => `Unavailable ${value}`,
      }}
      onChange={vi.fn()}
    />,
    host,
  );
  const current = host.querySelector<HTMLButtonElement>('[data-value=custom]')!;
  expect(current.disabled).toBe(true);
  expect(current.textContent).toBe('Unavailable custom');
  expect(host.querySelector('[data-value=sum]')?.getAttribute('tabindex')).toBe(
    '0',
  );
});
