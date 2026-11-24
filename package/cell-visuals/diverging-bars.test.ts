import { describe, expect, it } from 'vitest';
import { renderDivergingBars } from './diverging-bars';
const h = (tag: string, props: Record<string, any>, children?: any) => ({
  tag,
  props,
  children,
});
describe('diverging bars', () => {
  it('places positive and negative values around zero, clamps and preserves missing slots', () => {
    const node = renderDivergingBars(h, {
      value: [-10, 0, 5, null, NaN, 20],
      maxAbs: 10,
      highlightIndex: 5,
      label: 'Écart mensuel',
    });
    expect(node.props).toMatchObject({
      role: 'img',
      'aria-label': 'Écart mensuel',
    });
    expect(node.children.map((bar: any) => bar.props.style.height)).toEqual([
      '50%',
      '0%',
      '25%',
      '0%',
      '0%',
      '50%',
    ]);
    expect(node.children.map((bar: any) => bar.props.class)).toEqual([
      'rv-diverging-bars__bar is-negative',
      'rv-diverging-bars__bar is-zero',
      'rv-diverging-bars__bar is-positive',
      'rv-diverging-bars__bar is-missing',
      'rv-diverging-bars__bar is-missing',
      'rv-diverging-bars__bar is-positive is-highlighted',
    ]);
  });
  it('uses a computed domain when the requested maximum is invalid and accepts large arrays', () => {
    const node = renderDivergingBars(h, {
      value: [1, -2],
      maxAbs: -1,
      label: 'Variance',
    });
    expect(node.children.map((bar: any) => bar.props.style.height)).toEqual([
      '25%',
      '50%',
    ]);
    expect(
      renderDivergingBars(h, { value: Array(150000).fill(1), label: 'Large' })
        .children,
    ).toHaveLength(150000);
    expect(
      renderDivergingBars(h, { value: [null, NaN], label: 'Empty' }).props
        .class,
    ).toContain('--empty');
  });
});
