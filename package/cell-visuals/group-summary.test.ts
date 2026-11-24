import { expect, it, vi } from 'vitest';
import { renderGroupSummary } from './group-summary';
const h = (tag: string, props: Record<string, any>, children?: any) => ({ tag, props, children });
it('renders a localized expandable summary and dispatches segment identity', () => {
  const toggle = vi.fn(), segment = vi.fn();
  const node = renderGroupSummary(h, { title: 'Europe', actionLabel: 'Replier Europe', expanded: true, value: '7', segments: [{ id: 'ok', label: 'Acceptés 2', percent: 120, pressed: true }], onToggle: toggle, onSegment: segment });
  expect(node.children[0].props).toMatchObject({ 'aria-expanded': 'true', 'aria-label': 'Replier Europe' });
  expect(node.children[3].children[0].props.style.width).toBe('100%');
  expect(node.children[4].props['aria-pressed']).toBe('true');
  node.children[4].props.onClick({});
  expect(segment).toHaveBeenCalledWith('ok', {});
});
