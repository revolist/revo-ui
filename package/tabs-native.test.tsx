// @vitest-environment happy-dom
import { act } from 'preact/test-utils';
import { expect, it, vi } from 'vitest';
import { mountTabs } from './tabs-native';

it('mounts controlled tabs, handles keyboard selection, and releases the host', () => {
  const host = document.createElement('div');
  document.body.append(host);
  const onChange = vi.fn();
  const props = { value: 'Overview', options: [{ value: 'Overview', label: 'Overview' }, { value: 'Details', label: 'Details' }], onChange, ariaLabel: 'Details' };
  let tabs: ReturnType<typeof mountTabs<string>>;
  act(() => { tabs = mountTabs(host, props); });
  const buttons = host.querySelectorAll<HTMLButtonElement>('[role="tab"]');
  expect(host.querySelector('[role="tablist"]')?.getAttribute('aria-label')).toBe('Details');
  expect(buttons[0].getAttribute('aria-selected')).toBe('true');
  act(() => buttons[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true })));
  expect(onChange).toHaveBeenCalledWith('Details', expect.anything(), expect.anything());
  act(() => tabs.update({ ...props, value: 'Details' }));
  expect(buttons[1].getAttribute('aria-selected')).toBe('true');
  act(() => tabs.destroy());
  expect(host.childElementCount).toBe(0);
  host.remove();
});
