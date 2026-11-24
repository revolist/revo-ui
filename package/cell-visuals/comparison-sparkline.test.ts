import { describe, expect, it } from 'vitest';
import { renderComparisonSparkline } from './comparison-sparkline';
const h = (tag: string, props: Record<string, any>, children?: any) => ({
  tag,
  props,
  children,
});
const flatten = (node: any): any[] => [
  node,
  ...(Array.isArray(node.children) ? node.children.flatMap(flatten) : []),
];
describe('comparison sparkline', () => {
  it('shares the domain across series and keeps gaps separate', () => {
    const node = renderComparisonSparkline(h, {
      label: 'Données comparées',
      minValue: 0,
      maxValue: 10,
      series: [
        {
          values: [0, 5, null, 10, 5],
          color: 'blue',
          fill: true,
          endpoint: true,
        },
        { values: [5, NaN, 10], color: 'red', dash: '2 3', endpoint: true },
      ],
    });
    expect(node.props).toMatchObject({
      role: 'img',
      'aria-label': 'Données comparées',
    });
    const nodes = flatten(node),
      lines = nodes.filter((n) => n.tag === 'polyline');
    expect(lines.map((line) => line.props.points)).toEqual([
      '0,20 25,10',
      '75,0 100,10',
    ]);
    expect(nodes.filter((n) => n.tag === 'polygon')).toHaveLength(2);
    expect(nodes.filter((n) => n.tag === 'circle')).toHaveLength(2);
    expect(nodes.findIndex((n) => n.tag === 'polygon')).toBeLessThan(
      nodes.findIndex((n) => n.tag === 'polyline'),
    );
    expect(nodes.findIndex((n) => n.tag === 'circle')).toBeGreaterThan(
      nodes.findIndex((n) => n.tag === 'polyline'),
    );
    expect(JSON.stringify(node)).not.toMatch(/NaN|Infinity/);
  });
  it('renders a circular hollow endpoint at the last valid point', () => {
    const nodes = flatten(
      renderComparisonSparkline(h, {
        label: 'Spend',
        series: [{ values: [2, 5, null], color: '#999', endpoint: 'hollow' }],
      }),
    );
    const endpoint = nodes.find(
      (node) => node.props?.class === 'rv-comparison-sparkline__endpoint',
    );
    expect(endpoint.props.style).toMatchObject({
      left: '50%',
      top: '0%',
      borderColor: '#999',
    });
    expect(nodes.filter((node) => node.tag === 'circle')).toHaveLength(0);
  });
  it('creates unique fill IDs, clamps outside values and handles missing or flat data', () => {
    const options = {
      label: 'Trend',
      minValue: 0,
      maxValue: 10,
      series: [{ values: [-5, 15], fill: true }],
    };
    const first = flatten(renderComparisonSparkline(h, options));
    const second = flatten(renderComparisonSparkline(h, options));
    expect(first.find((n) => n.tag === 'linearGradient').props.id).not.toBe(
      second.find((n) => n.tag === 'linearGradient').props.id,
    );
    expect(first.find((n) => n.tag === 'polyline').props.points).toBe(
      '0,20 100,0',
    );
    expect(
      renderComparisonSparkline(h, {
        label: 'Empty',
        series: [{ values: [null, NaN] }],
      }).children,
    ).toBe('');
    expect(
      JSON.stringify(
        renderComparisonSparkline(h, {
          label: 'Flat',
          series: [{ values: [5, 5] }],
        }),
      ),
    ).not.toMatch(/NaN|Infinity/);
  });
  it('can render separate strokes while retaining gaps and fills', () => {
    const nodes = flatten(
      renderComparisonSparkline(h, {
        label: 'Trend',
        minValue: 0,
        maxValue: 2,
        series: [
          {
            values: [0, 1, null, 2, 1],
            color: 'blue',
            segmentLines: true,
            fill: 'solid',
          },
        ],
      }),
    );
    const lines = nodes.filter((node) => node.tag === 'line');
    expect(lines).toHaveLength(2);
    expect(lines[0].props).toMatchObject({
      x1: 0,
      y1: 20,
      x2: 25,
      y2: 10,
      stroke: 'blue',
    });
    expect(lines[1].props).toMatchObject({ x1: 75, y1: 0, x2: 100, y2: 10 });
    expect(nodes.filter((node) => node.tag === 'polygon')).toHaveLength(2);
    expect(nodes.filter((node) => node.tag === 'polyline')).toHaveLength(0);
  });
  it('colors only the part of each continuous line below the threshold', () => {
    const nodes = flatten(
      renderComparisonSparkline(h, {
        label: 'Availability',
        minValue: -10,
        maxValue: 10,
        series: [
          {
            values: [5, -5, 5, null, -5, 5],
            color: 'green',
            fill: 'solid',
            belowThreshold: { value: 0, color: 'red' },
          },
        ],
      }),
    );
    const clips = nodes.filter((node) => node.tag === 'clipPath');
    expect(clips).toHaveLength(2);
    expect(clips[1].children[0].props).toMatchObject({ y: 10, height: 10 });
    const below = nodes.filter(
      (node) => node.props?.['data-sparkline-below-threshold'] !== undefined,
    );
    expect(below).toHaveLength(2);
    expect(below[0].props).toMatchObject({
      stroke: 'red',
      'clip-path': `url(#${clips[1].props.id})`,
    });
    expect(
      nodes.find((node) => node.tag === 'polygon').props['clip-path'],
    ).toBe(`url(#${clips[0].props.id})`);
  });
  it('supports a solid filled area without allocating a gradient', () => {
    const node = renderComparisonSparkline(h, {
      label: 'Solid',
      preserveAspectRatio: 'xMidYMid meet',
      series: [
        { values: [1, 2], color: 'blue', fill: 'solid', fillOpacity: 0.12 },
      ],
    });
    const children = flatten(node);
    expect(
      children.find((n) => n.tag === 'svg').props.preserveAspectRatio,
    ).toBe('xMidYMid meet');
    expect(children.find((n) => n.tag === 'linearGradient')).toBeUndefined();
    expect(children.find((n) => n.tag === 'polygon').props).toMatchObject({
      fill: 'blue',
      'fill-opacity': 0.12,
    });
  });
  it('keeps extreme finite domains and long inputs numerically safe', () => {
    const extreme = renderComparisonSparkline(h, {
      label: 'Extreme',
      series: [{ values: [-Number.MAX_VALUE, 0, Number.MAX_VALUE] }],
    });
    expect(
      flatten(extreme).find((node) => node.tag === 'polyline').props.points,
    ).toBe('0,20 50,10 100,0');
    const many = renderComparisonSparkline(h, {
      label: 'Many',
      series: [{ values: Array.from({ length: 150000 }, (_, i) => i) }],
    });
    expect(many.props['aria-label']).toBe('Many');
  });
});
it('aligns unequal series with tooltip sample positions', () => {
  const nodes = flatten(
    renderComparisonSparkline(h, {
      label: 'Trend',
      minValue: 0,
      maxValue: 10,
      series: [{ values: [1, 2] }, { values: [3, 4, 5] }],
      tooltip: (index, values) => `${index}: ${values.join(',')}`,
    }),
  );
  expect(nodes.filter((node) => node.tag === 'polyline')[0].props.points).toBe(
    '0,18 50,16',
  );
  const target = nodes.filter((node) => node.tag === 'button')[1];
  expect(target.props['aria-label']).toBe('1: 2,4');
  expect(target.children[1].props.style.left).toBe('50%');
});
