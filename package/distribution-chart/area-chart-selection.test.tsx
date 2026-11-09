// @vitest-environment happy-dom
import { h, render } from 'preact';
import { afterEach, expect, it } from 'vitest';
import { AreaChart } from './area-chart';

const values = [3, 8, 4, 10, 6];
const data = (selection: readonly boolean[]) =>
  values.map((value, index) => ({
    key: String(index),
    value,
    selected: selection[index],
    tooltip: { title: `Day ${index + 1}` },
  }));
afterEach(() => {
  render(null, document.body);
  document.body.replaceChildren();
});
const selectionOf = (selector: string) =>
  [...document.querySelectorAll(selector)].map((node) =>
    node.classList.contains('is-selected'),
  );

it.each(['linear', 'step'] as const)(
  'mutes outside line and fill intervals with %s interpolation and hidden points',
  (interpolation) => {
    render(
      <AreaChart
        data={data([false, true, true, true, false])}
        ariaLabel="Range"
        interpolation={interpolation}
        showPoints={false}
      />,
      document.body,
    );
    expect(selectionOf('.rv-distribution-chart__series')).toEqual([
      false,
      true,
      true,
      false,
    ]);
    expect(selectionOf('.rv-distribution-chart__area')).toEqual([
      false,
      true,
      true,
      false,
    ]);
    expect(
      document.querySelectorAll('.rv-distribution-chart__point'),
    ).toHaveLength(0);
    expect(document.querySelectorAll('[role="listitem"]')).toHaveLength(5);
    for (const path of document.querySelectorAll(
      '.rv-distribution-chart__area',
    ))
      expect(path.getAttribute('d')).toMatch(/ Z$/);
    expect(
      document
        .querySelector('.rv-distribution-chart__series')
        ?.getAttribute('d'),
    ).toContain(interpolation === 'step' ? 'H ' : 'L ');
  },
);

it('updates both line and fill after the range changes and can mute all intervals', () => {
  const draw = (selected: boolean[]) =>
    render(
      <AreaChart data={data(selected)} ariaLabel="Range" />,
      document.body,
    );
  draw([true, true, false, false, false]);
  expect(selectionOf('.rv-distribution-chart__area')).toEqual([
    true,
    false,
    false,
    false,
  ]);
  draw([false, false, true, true, true]);
  expect(selectionOf('.rv-distribution-chart__series')).toEqual([
    false,
    false,
    true,
    true,
  ]);
  expect(selectionOf('.rv-distribution-chart__area')).toEqual([
    false,
    false,
    true,
    true,
  ]);
  draw([false, false, false, false, false]);
  expect(selectionOf('.rv-distribution-chart__area')).toEqual([
    false,
    false,
    false,
    false,
  ]);
});

it('uses separate selected and muted gradients with a shared vertical scale', () => {
  render(
    <AreaChart
      data={data([true, true, false, false, false])}
      ariaLabel="Range"
      areaFill="gradient"
    />,
    document.body,
  );
  const areas = [
    ...document.querySelectorAll<SVGPathElement>(
      '.rv-distribution-chart__area',
    ),
  ];
  expect(areas).toHaveLength(4);
  expect(areas[0].style.fill).not.toBe(areas[1].style.fill);
  for (const area of areas) {
    const id = area.style.fill.match(/url\(#([^)]*)\)/)?.[1];
    const gradient = document.getElementById(id!);
    expect(gradient?.getAttribute('gradientUnits')).toBe('userSpaceOnUse');
    expect(
      gradient?.querySelector('stop')?.getAttribute('stop-color'),
    ).toContain(
      area.classList.contains('is-selected')
        ? '--rv-distribution-accent'
        : '--rv-distribution-muted',
    );
  }
});

it('keeps an ordinary area chart accented when no selection is supplied', () => {
  render(
    <AreaChart
      data={values.map((value, index) => ({
        key: String(index),
        value,
        tooltip: { title: String(index) },
      }))}
      ariaLabel="Ordinary"
    />,
    document.body,
  );
  expect(selectionOf('.rv-distribution-chart__area')).toEqual([
    true,
    true,
    true,
    true,
  ]);
});

it('handles empty and single-point data without invalid geometry', () => {
  render(<AreaChart data={[]} ariaLabel="Empty" />, document.body);
  expect(document.querySelector('[data-empty="true"]')).not.toBeNull();
  render(
    <AreaChart data={data([true]).slice(0, 1)} ariaLabel="One" />,
    document.body,
  );
  expect(document.querySelectorAll('[role="listitem"]')).toHaveLength(1);
  for (const path of document.querySelectorAll('path'))
    expect(path.getAttribute('d')).not.toMatch(/NaN|undefined|Infinity/);
});
