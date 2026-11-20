// @vitest-environment happy-dom
import { h, render } from 'preact';
import { afterEach, expect, it } from 'vitest';
import { PreactRangeSlider } from './preact';

afterEach(() => render(null, document.body));
it('applies range preset options and respects explicit overrides', () => {
  render(
    <PreactRangeSlider
      min={0}
      max={10}
      fromValue={2}
      toValue={8}
      onRangeChange={() => {}}
      preset={{
        className: 'range-theme',
        props: { disabled: true, showRangeInputs: true },
      }}
      disabled={false}
    />,
    document.body,
  );
  expect(document.querySelector('.range-theme')).not.toBeNull();
  expect(document.querySelectorAll('input[type="range"]')).toHaveLength(2);
  expect(
    [
      ...document.querySelectorAll<HTMLInputElement>('input[type="range"]'),
    ].every((input) => !input.disabled),
  ).toBe(true);
  expect(
    document.querySelectorAll('input:not([type="range"])').length,
  ).toBeGreaterThanOrEqual(2);
});
