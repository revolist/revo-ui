// @vitest-environment happy-dom
import { h, render } from 'preact';
import { afterEach, expect, it } from 'vitest';
import { PreactRangeSlider } from './preact';

afterEach(() => render(null, document.body));
it('names editable range bounds as textboxes and disables them with the handles', () => {
  render(
    <PreactRangeSlider
      min={0}
      max={100}
      fromValue={20}
      toValue={80}
      showRangeInputs
      disabled
      fromAriaLabel="Minimum amount"
      toAriaLabel="Maximum amount"
      onRangeChange={() => {}}
    />,
    document.body,
  );
  const inputs = [
    ...document.querySelectorAll<HTMLInputElement>('input[type="text"]'),
  ];
  expect(inputs.map((input) => input.getAttribute('aria-label'))).toEqual([
    'Minimum amount',
    'Maximum amount',
  ]);
  for (const input of inputs) {
    expect(input.disabled).toBe(true);
    expect(input.hasAttribute('aria-valuemin')).toBe(false);
    expect(input.hasAttribute('aria-valuemax')).toBe(false);
  }
});
