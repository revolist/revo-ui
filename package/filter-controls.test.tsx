import { h, render } from 'preact';
import { act } from 'preact/test-utils';
import { afterEach, expect, it, vi } from 'vitest';
import { OptionButton, HighlightedTextInput } from './filter-controls';

afterEach(() => {
  act(() => render(null, document.body));
  document.body.replaceChildren();
});
it('activates a preset without a grid and respects native disabling', () => {
  const activate = vi.fn();
  act(() =>
    render(
      <>
        <OptionButton
          label="Top 10%"
          detail="≥ 19%"
          selected
          onClick={activate}
        />
        <OptionButton label="Unavailable" disabled onClick={activate} />
      </>,
      document.body,
    ),
  );
  const buttons = document.querySelectorAll('button');
  expect(buttons[0].getAttribute('aria-pressed')).toBe('true');
  buttons[0].click();
  buttons[1].click();
  expect(activate).toHaveBeenCalledTimes(1);
});
it('synchronizes highlighted input scrolling and preserves consumer keyboard handling', () => {
  const keyboard = vi.fn();
  act(() =>
    render(
      <HighlightedTextInput
        aria-label="Expression"
        value="value > 100"
        highlight={<strong>value &gt; 100</strong>}
        onKeyDown={keyboard}
      />,
      document.body,
    ),
  );
  const input = document.querySelector('textarea')!;
  input.scrollTop = 35;
  input.scrollLeft = 12;
  input.dispatchEvent(new Event('scroll'));
  const highlight = document.querySelector('pre')!;
  expect(highlight.scrollTop).toBe(35);
  expect(highlight.scrollLeft).toBe(12);
  input.dispatchEvent(
    new KeyboardEvent('keydown', {
      key: 'Enter',
      ctrlKey: true,
      bubbles: true,
    }),
  );
  expect(keyboard).toHaveBeenCalledOnce();
  expect(highlight.getAttribute('aria-hidden')).toBe('true');
});
