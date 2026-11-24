import { describe, expect, it } from 'vitest';
import { renderVarianceBar } from './variance-bar';
const h = (tag: string, props: Record<string, any>, children?: any) => ({
  tag,
  props,
  children,
});
describe('variance bar', () => {
  it('positions negative values and references on a shared domain', () => {
    const bar = renderVarianceBar(h, {
      value: -10,
      min: -25,
      max: 25,
      reference: 5,
      label: 'Marge négative',
    });
    expect(bar.props).toMatchObject({
      role: 'img',
      'aria-label': 'Marge négative',
    });
    expect(bar.children[0].props.style.left).toBe('50%');
    expect(bar.children[1].props).toMatchObject({
      class: 'rv-variance-bar__value is-negative',
      style: { left: '30%', width: '20%' },
    });
    expect(bar.children[2].props.style.left).toBe('60%');
  });
  it('clamps values and omits invalid references', () => {
    const bar = renderVarianceBar(h, {
      value: 500,
      min: -25,
      max: 25,
      reference: NaN,
      label: 'Variance',
    });
    expect(bar.children[1].props.style).toEqual({ left: '50%', width: '50%' });
    expect(bar.children).toHaveLength(2);
    expect(
      renderVarianceBar(h, { value: 2, min: 1, max: 1, label: 'Invalid' }).props
        .class,
    ).toContain('--empty');
  });
});
