// @vitest-environment happy-dom
import { h, render } from 'preact';
import { afterEach, expect, it, vi } from 'vitest';
import { SingleValueSlider, SliderField } from './single';
afterEach(() => {
  render(null, document.body);
});
it('retains the bare slider contract without composition markup', () => {
  render(
    <SingleValueSlider
      min={0}
      max={100}
      value={50}
      ariaLabel="Bare"
      onChange={() => {}}
    />,
    document.body,
  );
  expect(document.body.firstElementChild?.tagName).toBe('INPUT');
});
it('formats accessible values and reports native input and commit independently', () => {
  const change = vi.fn(),
    commit = vi.fn();
  render(
    <SliderField
      label="Volume"
      ariaLabel="Volume"
      min={0}
      max={10}
      value={7}
      ticks={11}
      formatValue={(value) => `${value} dB`}
      onChange={change}
      onCommit={commit}
    />,
    document.body,
  );
  const input = document.querySelector('input')!;
  expect(input.getAttribute('aria-valuetext')).toBe('7 dB');
  expect(document.querySelector('.rv-slider-field__value')?.textContent).toBe(
    '7 dB',
  );
  expect(document.querySelectorAll('.rv-slider-field__ticks i')).toHaveLength(
    11,
  );
  input.value = '8';
  input.dispatchEvent(new Event('input', { bubbles: true }));
  expect(change.mock.calls[0][0]).toBe(8);
  expect(commit).not.toHaveBeenCalled();
  input.dispatchEvent(new Event('change', { bubbles: true }));
  expect(commit.mock.calls[0][0]).toBe(8);
});
it('supports disabled thumb values, stacked labels and bounded ticks', () => {
  render(
    <SliderField
      label="Budget"
      ariaLabel="Budget"
      min={0}
      max={100}
      value={70}
      layout="stacked"
      valuePlacement="thumb"
      ticks={10000}
      disabled
      onChange={() => {}}
    />,
    document.body,
  );
  expect(document.querySelector('input')?.disabled).toBe(true);
  expect(
    document.querySelector('.rv-slider-field__thumb-value')?.textContent,
  ).toBe('70');
  expect(document.querySelectorAll('.rv-slider-field__ticks i')).toHaveLength(
    101,
  );
  expect(
    document.querySelector('.rv-slider-field--stacked.is-disabled'),
  ).not.toBeNull();
});
