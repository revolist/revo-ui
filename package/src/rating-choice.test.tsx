import { h, render } from 'preact';
import { expect, it, vi } from 'vitest';
import { RatingChoice } from './rating-choice';

it('renders shared SVG states and preserves native rating choice interactions', () => {
  const host = document.createElement('div');
  const click = vi.fn();
  render(
    <RatingChoice
      label="0.5 stars"
      filled={false}
      selected={false}
      tabIndex={0}
      onClick={click}
    />,
    host,
  );
  const button = host.querySelector('button')!;
  expect(button.classList.contains('rv-rating-choice')).toBe(true);
  expect(button.getAttribute('aria-checked')).toBe('false');
  expect(button.querySelector('[data-filled="false"] svg')).not.toBeNull();
  button.click();
  expect(click).toHaveBeenCalledOnce();
  render(<RatingChoice label="0.5 stars" filled selected disabled />, host);
  expect(button.getAttribute('aria-checked')).toBe('true');
  expect(button.querySelector('[data-filled="true"] svg')).not.toBeNull();
  expect(button.disabled).toBe(true);
  render(null, host);
});
