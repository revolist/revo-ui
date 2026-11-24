import { describe, expect, it } from 'vitest';
import { renderSegmentedBar } from './segmented-bar';
const h = (tag: string, props: Record<string, any>, children?: any) => ({
  tag,
  props,
  children,
});
describe('segmented bar', () => {
  it('keeps order, colors, and a shared total while clipping excess', () => {
    const result = renderSegmentedBar(h, {
      label: 'Dos sí, uno no',
      total: 4,
      parts: [
        { value: 2, color: 'green' },
        { value: 1, className: 'unknown' },
        { value: 3, color: 'red' },
      ],
    });
    expect(result.props).toMatchObject({
      role: 'img',
      'aria-label': 'Dos sí, uno no',
    });
    expect(result.children.map((p: any) => p.props.style.width)).toEqual([
      '50%',
      '25%',
      '25%',
    ]);
    expect(result.children[1].props.class).toContain('unknown');
  });
  it('ignores invalid parts and safely normalizes very large values', () => {
    const result = renderSegmentedBar(h, {
      label: 'Spread',
      parts: [
        { value: Number.MAX_VALUE },
        { value: Number.MAX_VALUE },
        { value: NaN },
        { value: -1 },
      ],
    });
    expect(result.children.map((p: any) => p.props.style.width)).toEqual([
      '50%',
      '50%',
    ]);
    expect(
      renderSegmentedBar(h, { label: 'Empty', parts: [] }).children,
    ).toEqual([]);
    expect(
      renderSegmentedBar(h, {
        label: 'Zeros',
        parts: [{ value: 0 }, { value: 0 }],
      }).children.map((part: any) => part.props.style.width),
    ).toEqual(['0%', '0%']);
  });
});
