import { h } from 'preact';
import { AreaChart, type AreaChartProps } from './distribution-chart/area-chart';
import { renderPreactInto } from './preact-mount';

/** Mount the shared area chart in a native DOM host. */
export function mountAreaChart(host: HTMLElement, initial: AreaChartProps) {
  let destroyed = false;
  const update = (props: AreaChartProps) => {
    if (!destroyed) renderPreactInto(host, <AreaChart {...props} />);
  };
  update(initial);
  return { update, destroy() { if (!destroyed) { destroyed = true; renderPreactInto(host, null); } } };
}
