import { h, render } from 'preact';
import { act } from 'preact/test-utils';
import { expect, it, vi } from 'vitest';
import { Stepper } from './stepper';
it('marks current step and supports keyboard focus and activation', () => {
  const host = document.createElement('div');
  document.body.append(host);
  const change = vi.fn();
  act(() =>
    render(
      <Stepper
        label="Setup"
        value="one"
        steps={[
          { id: 'one', label: 'One' },
          { id: 'two', label: 'Two' },
          { id: 'three', label: 'Three', disabled: true },
        ]}
        onValueChange={change}
      />,
      host,
    ),
  );
  const [one, two] = host.querySelectorAll('button');
  expect(one.getAttribute('aria-current')).toBe('step');
  act(() => {
    one.focus();
    one.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }),
    );
  });
  expect(document.activeElement).toBe(two);
  act(() => two.click());
  expect(change).toHaveBeenCalledWith('two');
  act(() => render(null, host));
  host.remove();
});
