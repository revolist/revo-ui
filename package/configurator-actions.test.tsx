import { h, render } from 'preact';
import { act } from 'preact/test-utils';
import { expect, it } from 'vitest';
import { ConfiguratorActionTrigger } from './configurator-actions';

it('uses a shared tooltip for each action trigger', () => {
  const host = document.createElement('div');
  document.body.append(host);
  act(() =>
    render(
      <ConfiguratorActionTrigger
        icon="gear"
        title="Column settings"
        aria-label="Column settings"
      />,
      host,
    ),
  );
  const button = host.querySelector('button')!;
  expect(button.hasAttribute('title')).toBe(false);
  act(() =>
    button.dispatchEvent(new PointerEvent('pointerenter', { bubbles: true })),
  );
  expect(document.querySelector('[role="tooltip"]')?.textContent).toContain(
    'Column settings',
  );
  act(() => render(null, host));
  host.remove();
});
