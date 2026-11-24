import { describe, expect, it, vi } from 'vitest';
import { renderActionStrip } from './action-strip';
const h = (tag: string, props: Record<string, any>, children?: any) => ({
  tag,
  props,
  children,
});
describe('action strip', () => {
  it('previews slots on hover and focus, and clears when leaving', () => {
    const preview = vi.fn();
    const node = renderActionStrip(h, {
      label: 'Weeks', items: [{ label: 'Week 1' }, { label: 'Week 2', dividerBefore: true }],
      onActivate: vi.fn(), onPreview: preview,
    });
    expect(node.children[1].props.class).toContain('rv-action-strip__item--divider');
    node.children[1].children[0].props.onMouseEnter();
    expect(preview).toHaveBeenLastCalledWith(1);
    node.children[0].children[0].props.onFocus();
    expect(preview).toHaveBeenLastCalledWith(0);
    node.props.onMouseLeave();
    expect(preview).toHaveBeenLastCalledWith(undefined);
  });
  it('exposes localized group and item names and guards disabled actions', () => {
    const activate = vi.fn();
    const node = renderActionStrip(h, {
      label: 'Calendrier',
      items: [
        { label: 'Semaine 1', className: 'promo' },
        { label: 'Semaine 2', disabled: true },
      ],
      onActivate: activate,
    });
    expect(node.props).toMatchObject({
      role: 'group',
      'aria-label': 'Calendrier',
    });
    const first = node.children[0].children[0],
      second = node.children[1].children[0];
    expect(first.props['aria-label']).toBe('Semaine 1');
    expect(second.props.disabled).toBe(true);
    const event = { stopPropagation: vi.fn() };
    first.props.onMouseDown(event);
    expect(event.stopPropagation).toHaveBeenCalledOnce();
    first.props.onClick(event);
    second.props.onClick(event);
    expect(activate).toHaveBeenCalledOnce();
    expect(activate).toHaveBeenCalledWith(0, event);
  });
});
