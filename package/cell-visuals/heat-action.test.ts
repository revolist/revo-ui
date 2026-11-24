import { expect, it, vi } from 'vitest';
import { renderHeatAction } from './heat-action';
const h = (tag: string, props: Record<string, any>, children?: any) => ({ tag, props, children });
it('renders a localized actionable heat value with caller metadata', () => {
  const activate = vi.fn();
  const node = renderHeatAction(h, { label: 'Réservations 2 sur 4', value: '2', detail: '50 %', className: 'warm', tooltip: 'Deux', data: { 'benchmark-rate': '50' }, onActivate: activate });
  expect(node.tag).toBe('button');
  expect(node.props).toMatchObject({ type: 'button', 'aria-label': 'Réservations 2 sur 4', 'data-tooltip': 'Deux', 'data-benchmark-rate': '50' });
  expect(node.children.map((child: any) => child.children)).toEqual(['2', '50 %']);
  node.props.onClick({});
  expect(activate).toHaveBeenCalledOnce();
});
