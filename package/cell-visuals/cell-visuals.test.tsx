// @vitest-environment happy-dom
import { describe, it, expect, vi } from 'vitest';
import { h, render } from 'preact';
import { act } from 'preact/test-utils';
import {
  renderSparkline,
  renderTimeline,
  formatTimelineEvents,
  renderBadgeValue,
  renderPie,
  renderChange,
  renderProgressLineValue,
  renderMiniBarChart,
} from './index';
const factory = (tag: string, props: any, ...children: any[]): any => ({
  tag,
  props,
  children: children.flat(Infinity),
});
describe('renderer-neutral cell visuals', () => {
  it('preserves sparkline gaps and finite geometry', () => {
    const tree = renderSparkline(factory, {
      value: [1, null, 4, 5],
      classesForValue: () => ({ high: true }),
    });
    const lines = tree.children[0].children;
    expect(lines).toHaveLength(1);
    expect(lines[0].props.class).toBe('sparkline-segment high');
    expect(Object.values(lines[0].props).join(' ')).not.toMatch(/NaN|Infinity/);
    expect(renderSparkline(factory, { value: [] }).children).toEqual(['']);
  });
  it('clips timeline intervals while retaining readable labels and defaults', () => {
    const tree = renderTimeline(factory, {
      value: [
        { start: -10, end: 30, label: 'Build' },
        { start: 80, end: 120, label: 'Review' },
        { start: 70, end: 60 },
      ],
      range: { start: 0, end: 100 },
    });
    expect(formatTimelineEvents([{ start: 1, end: 2, label: 'Task' }])).toBe(
      'Task: 1–2',
    );
    expect(tree.props['aria-label']).toContain('Build: -10–30');
    const bars = tree.children[0].children.slice(1);
    expect(bars.map((bar: any) => bar.props.style.width)).toEqual([
      '30%',
      '20%',
    ]);
  });
  it('renders shared classes and literal values through the Preact factory', () => {
    const host = document.createElement('div');
    act(() =>
      render(
        h('div', {}, [
          renderBadgeValue(h, {
            value: '<b>Literal</b>',
            rectangular: true,
            classes: { high: true },
          }),
          renderProgressLineValue(h, { percent: 40, label: '40' }),
          renderChange(h, { value: -8, label: '8%' }),
          renderMiniBarChart(h, { value: [1, 4, 2] }),
        ]),
        host,
      ),
    );
    expect(
      host.querySelector('.badge-cell.rectangular.high')?.textContent,
    ).toBe('<b>Literal</b>');
    expect(host.querySelector('b')).toBeNull();
    expect(
      host.querySelector('.progress-line-cell .cell-value')?.textContent,
    ).toBe('40');
    expect(host.querySelector('.change-negative')?.textContent).toContain(
      '(8%)',
    );
    expect(host.querySelectorAll('.bar-chart-bar')).toHaveLength(3);
    act(() => render(null, host));
    expect(host.childNodes).toHaveLength(0);
  });
  it('draws pie data in native Canvas and safely handles a missing context', () => {
    const clearRect = vi.fn(),
      arc = vi.fn();
    const context = {
      clearRect,
      arc,
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      fill: vi.fn(),
      fillText: vi.fn(),
    };
    const canvas = { width: 300, height: 150, getContext: () => context };
    const tree = renderPie(factory, [30, 70]);
    tree.props.ref(canvas);
    expect(clearRect).toHaveBeenCalledOnce();
    expect(arc).toHaveBeenCalledTimes(2);
    expect(() => tree.props.ref(undefined)).not.toThrow();
    expect(() => tree.props.ref({ getContext: () => null })).not.toThrow();
  });
});
