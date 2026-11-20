import { h, render } from 'preact';
import { act } from 'preact/test-utils';
import { afterEach, expect, it, vi } from 'vitest';
import { TimeControl } from './time-control';

const host = document.createElement('div');
afterEach(() => act(() => render(null, host)));

it('uses localized text entry and emits ISO time without a native picker', () => {
  const change = vi.fn();
  act(() =>
    render(
      <TimeControl
        label="Heure"
        value="13:45:20"
        locale="fr-FR"
        precision="second"
        onChange={change}
      />,
      host,
    ),
  );
  const input = host.querySelector('input')!;
  expect(input.type).toBe('text');
  expect(input.value).toBe('13:45:20');
  act(() => {
    input.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
    input.value = '14:10:30';
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
  expect(change).toHaveBeenLastCalledWith('14:10:30');
});
