import { expect, it } from 'vitest';
import { renderRangeComparison } from './range-comparison';

it('places peer range, floor, and previous/current marks on one domain', () => {
  const h = (tag: unknown, props: unknown, children?: unknown) => ({ tag, props, children });
  const node = renderRangeComparison(h, { domain: { min: 80, max: 100 }, current: 95, previous: 90, range: { min: 88, max: 96 }, floor: 92, goal: 95, ticks: [80, 90, 100], display: '95%', label: 'Current 95 percent' }) as any;
  expect(node.props['aria-label']).toBe('Current 95 percent');
  const marks = node.children[0].children;
  expect(marks.find((item: any) => item.props.class === 'rv-range-comparison__previous').props.style.left).toBe('50%');
  expect(marks.find((item: any) => item.props.class.includes('rv-range-comparison__current')).props.style.left).toBe('75%');
  expect(marks.find((item: any) => item.props.class === 'rv-range-comparison__range').props.style).toEqual({ left: '40%', right: '20%' });
  expect(renderRangeComparison(h, { domain: { min: 1, max: 1 }, current: 1, display: '', label: '' })).toBeNull();
});
