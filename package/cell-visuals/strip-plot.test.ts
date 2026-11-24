import { describe, expect, it } from 'vitest';
import { renderStripPlot } from './strip-plot';
const h = (tag: string, props: Record<string, any>, children?: any) => ({
  tag,
  props,
  children,
});
describe('strip plot', () => {
  it('maps and clamps individual points with a reference and zero region', () => {
    const result = renderStripPlot(h, {
      points: [
        { value: -5, size: 8, color: 'red', borderColor: 'black', title: 'A' },
        { value: 20 },
        { value: NaN },
      ],
      domain: { min: -10, max: 10 },
      label: 'Comparación',
      zero: 0,
      reference: 5,
    });
    expect(result.props).toMatchObject({
      role: 'img',
      'aria-label': 'Comparación',
    });
    expect(result.children).toHaveLength(4);
    expect(result.children[0].props.style.width).toBe('50%');
    expect(result.children[1].props.style.left).toBe('75%');
    expect(result.children[2].props).toMatchObject({
      title: 'A',
      style: {
        left: '25%',
        width: '8px',
        height: '8px',
        backgroundColor: 'red',
        border: '1px solid black',
      },
    });
    expect(result.children[3].props.style.left).toBe('100%');
  });
  it('reverses the zero region and handles invalid domains and references', () => {
    const result = renderStripPlot(h, {
      points: [{ value: 2 }],
      domain: { min: -2, max: 2 },
      label: 'Spread',
      zero: 0,
      reference: NaN,
      reverse: true,
    });
    expect(result.children[0].props.style).toEqual({
      left: '50%',
      width: '50%',
    });
    expect(result.children[1].props.style.left).toBe('0%');
    expect(
      renderStripPlot(h, {
        points: [],
        domain: { min: 1, max: 1 },
        label: 'Empty',
      }).props.class,
    ).toContain('--empty');
  });
});
