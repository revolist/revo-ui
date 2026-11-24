import { act } from 'preact/test-utils';
import { expect, it, vi } from 'vitest';
import { mountActionBar } from './action-bar';

it('mounts, updates and disposes an action bar in a native host', () => {
  const host = document.createElement('div');
  document.body.append(host);
  const onAction = vi.fn();
  const base = { label: 'Selected rows', count: 0, selectionLabel: '' };
  let bar!: ReturnType<typeof mountActionBar>;
  act(() => {
    bar = mountActionBar(host, base);
  });
  expect(host.querySelector('.rv-action-bar')?.hasAttribute('hidden')).toBe(
    true,
  );
  act(() =>
    bar.update({
      ...base,
      count: 2,
      selectionLabel: '2 selected',
      actions: [{ id: 'clear', label: 'Clear' }],
      onAction,
    }),
  );
  expect(host.querySelector('[role="toolbar"]')?.textContent).toContain(
    '2 selected',
  );
  host.querySelector('button')?.click();
  expect(onAction).toHaveBeenCalledWith('clear');
  act(() => bar.destroy());
  expect(host.childElementCount).toBe(0);
  host.remove();
});
