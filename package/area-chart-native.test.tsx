// @vitest-environment happy-dom
import { act } from 'preact/test-utils';
import { expect, it } from 'vitest';
import { mountAreaChart } from './area-chart-native';

it('mounts smooth interactive area data and releases it', () => {
  const host = document.createElement('div');
  document.body.append(host);
  let chart: ReturnType<typeof mountAreaChart>;
  act(() => { chart = mountAreaChart(host, { ariaLabel: 'Daily totals', interpolation: 'smooth', data: [{ key: '1', value: 1, tooltip: { title: 'Day 1: 1' } }, { key: '2', value: 3, tooltip: { title: 'Day 2: 3' } }] }); });
  expect(host.querySelector('[role="group"]')?.getAttribute('aria-label')).toBe('Daily totals');
  expect(host.querySelector('.rv-distribution-chart__series')?.getAttribute('d')).toContain(' C ');
  expect(host.querySelectorAll('[data-part="item"]')).toHaveLength(2);
  act(() => chart.destroy());
  expect(host.childElementCount).toBe(0);
  host.remove();
});
