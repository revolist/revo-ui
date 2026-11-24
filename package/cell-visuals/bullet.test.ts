import { describe, expect, it } from 'vitest';
import { renderBulletChart } from './bullet';
const h = (tag: string, props: Record<string, any>, children?: any) => ({ tag, props, children });
describe('bullet chart', () => {
  it('uses a shared domain, clamps positions, and compares the original values', () => {
    const node = renderBulletChart(h, { outlook: 14, actual: 2, target: 6, min: 0, max: 10, label: '14 against 6' });
    expect(node.props).toMatchObject({ role: 'img', 'aria-label': '14 against 6', class: 'rv-bullet-chart is-on-target' });
    expect(node.children.map((child: any) => child.props.style)).toEqual([{ width: '100%' }, { width: '20%' }, { left: '60%' }, { left: '100%' }]);
  });
  it('renders caller-owned missing text and avoids invalid geometry', () => {
    expect(renderBulletChart(h, { outlook: NaN, max: 1, label: 'Pas de données' }).children).toBe('Pas de données');
    const node = renderBulletChart(h, { outlook: -2, actual: NaN, target: Infinity, min: 5, max: 2, label: 'Localized' });
    expect(node.props.class).toBe('rv-bullet-chart');
    expect(JSON.stringify(node)).not.toMatch(/NaN|Infinity/);
    expect(node.children).toHaveLength(2);
  });
  it('compares below target and preserves a custom displayed value', () => {
    const node = renderBulletChart(h, { outlook: 2, target: 4, max: 10, label: '2 vs 4', display: '2×' });
    expect(node.children[0].props.class).toBe('rv-bullet-chart is-below-target');
    expect(node.children[1].children).toBe('2×');
  });
  it('exposes row details to the tooltip for charts and missing values', () => {
    const tooltip = { title: 'Outlook', rows: [{ label: 'Plan', value: '$100' }] };
    for (const outlook of [4, NaN]) {
      const node = renderBulletChart(h, { outlook, max: 10, label: 'Forecast', tooltip });
      expect(node.props.tabIndex).toBe(0);
      expect(node.props['tooltip-type']).toBe('metric-tile-history');
      expect(JSON.parse(node.props['data-tooltip'])).toEqual({ history: tooltip, index: -1 });
    }
  });
});
