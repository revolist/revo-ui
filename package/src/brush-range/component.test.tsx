// @vitest-environment happy-dom
import { h, render } from 'preact';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { BrushRange } from './component';

afterEach(() => {
  render(null, document.body);
  document.body.replaceChildren();
});

function renderBrush(
  chart: Parameters<typeof BrushRange>[0]['chart'] = {
    ariaLabel: 'Distribution',
    data: [{ key: 'one', value: 1, tooltip: { title: 'One' } }],
  },
) {
  const host = document.createElement('div');
  document.body.append(host);
  render(
    <BrushRange
      chart={chart}
      slider={{
        min: 0,
        max: 100,
        fromValue: 20,
        toValue: 80,
        onRangeChange: vi.fn(),
      }}
      startLabel="Low"
      selectionLabel="Selected"
      endLabel="High"
    />,
    host,
  );
  return host;
}

describe('shared brush range', () => {
  it('owns the chart, dual slider, and range summary using canonical shared selectors', () => {
    const host = renderBrush();

    expect(host.querySelector('.brush-range')).toBeTruthy();
    expect(
      host.querySelector('.brush-range__chart.rv-distribution-chart'),
    ).toBeTruthy();
    expect(host.querySelector('.brush-range__range')).toBeTruthy();
    expect(host.querySelector('.brush-range__controls')).toBeTruthy();
    expect(host.querySelectorAll('input[type="range"]')).toHaveLength(2);
    expect(host.querySelector('.fromSlider')).toBeTruthy();
    expect(host.querySelector('.toSlider')).toBeTruthy();
    expect(host.querySelector('.brush-range__labels')?.textContent).toBe(
      'LowSelectedHigh',
    );
    expect(
      host.querySelector('.brush-range__selection')?.getAttribute('role'),
    ).toBe('status');
  });

  it('keeps the range and summary available when a domain disables its chart', () => {
    const host = renderBrush(null);

    expect(host.querySelector('.rv-distribution-chart')).toBeNull();
    expect(host.querySelectorAll('input[type="range"]')).toHaveLength(2);
    expect(host.querySelector('[role="status"]')?.textContent).toBe('Selected');
  });

  it('keeps complete long range labels available while exposing shrinkable label roles', () => {
    const host = document.createElement('div');
    document.body.append(host);
    render(
      <BrushRange
        chart={null}
        slider={{
          min: 0,
          max: 100,
          fromValue: 10,
          toValue: 90,
          onRangeChange: vi.fn(),
        }}
        startLabel="September 3, 1900 at 12:00:00 AM Western European Summer Time"
        selectionLabel="September 3, 1900 – September 3, 2900"
        endLabel="September 3, 2900 at 11:59:59 PM Western European Summer Time"
      />,
      host,
    );

    const labels = host.querySelectorAll<HTMLElement>('.brush-range__label');
    expect([...labels].map((label) => label.className)).toEqual([
      'brush-range__label brush-range__label--start',
      'brush-range__label brush-range__selection',
      'brush-range__label brush-range__label--end',
    ]);
    expect(
      [...labels].map((label) => {
        label.dispatchEvent(new Event('pointerenter'));
        const text = document.querySelector(
          '.rv-tooltip:not([hidden])',
        )?.textContent;
        label.dispatchEvent(new Event('pointerleave'));
        expect(label.hasAttribute('title')).toBe(false);
        return text;
      }),
    ).toEqual([
      'September 3, 1900 at 12:00:00 AM Western European Summer Time',
      'September 3, 1900 – September 3, 2900',
      'September 3, 2900 at 11:59:59 PM Western European Summer Time',
    ]);
  });
});
