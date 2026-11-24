import { expect, it } from 'vitest';
import { renderCapacityDots } from './capacity-dots';
const h = (tag: string, props: Record<string, any>, children?: any) => ({ tag, props, children });
it('renders bounded capacity and makes localized tooltip content keyboard accessible', () => {
  const chart = renderCapacityDots(h, { value: 3, capacity: 10, text: '18 h', label: '3 de 10 reservas', tooltip: '3 de 10 reservas, 18 h' });
  expect(chart.props).toMatchObject({ role: 'img', 'aria-label': '3 de 10 reservas', tabIndex: 0, 'data-tooltip': '3 de 10 reservas, 18 h' });
  expect(chart.children[0].children).toHaveLength(10);
  expect(chart.children[0].children.filter((dot: any) => dot.props.class === 'is-filled')).toHaveLength(3);
  expect(chart.children[1].children).toBe('18 h');
  expect(renderCapacityDots(h, { value: NaN, capacity: Infinity, text: '', label: '' }).children[0].children).toHaveLength(0);
});
