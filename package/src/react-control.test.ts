import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { expect, it, vi } from 'vitest';
import { ButtonControl, Input, Select } from './react-control';

it('shares standard presentation and forwards native React refs, values and handlers', () => {
  const host = document.createElement('div');
  document.body.append(host);
  const root = createRoot(host);
  const onClick = vi.fn();
  const ref = vi.fn();
  flushSync(() =>
    root.render(
      createElement(
        'div',
        null,
        createElement(Input, {
          type: 'checkbox',
          checked: true,
          readOnly: true,
          className: 'local',
          ref,
        }),
        createElement(ButtonControl, { onClick }, 'Save'),
      ),
    ),
  );
  const input = host.querySelector('input')!;
  expect(ref).toHaveBeenCalledWith(input);
  expect(input.className).toBe('rv-checkbox local');
  expect(input.checked).toBe(true);
  const button = host.querySelector('button')!;
  expect(button.type).toBe('button');
  expect(button.className).toBe('rv-btn');
  button.click();
  expect(onClick).toHaveBeenCalledOnce();
  flushSync(() => root.unmount());
  expect(ref.mock.calls.at(-1)?.[0]).toBeNull();
  host.remove();
});

it('retains the native Select adapter used by existing React examples', () => {
  const host = document.createElement('div');
  document.body.append(host);
  const root = createRoot(host);
  const ref = vi.fn();
  const onChange = vi.fn();
  flushSync(() =>
    root.render(
      createElement(
        Select,
        { defaultValue: 'b', ref, onChange },
        createElement('option', { value: 'a' }, 'Alpha'),
        createElement('option', { value: 'b' }, 'Beta'),
      ),
    ),
  );
  const select = host.querySelector('select')!;
  expect(ref).toHaveBeenCalledWith(select);
  expect(select.className).toBe('rv-control');
  expect(select.value).toBe('b');
  select.value = 'a';
  select.dispatchEvent(new Event('change', { bubbles: true }));
  expect(onChange).toHaveBeenCalledOnce();
  expect(onChange.mock.calls[0][0].target.value).toBe('a');
  flushSync(() => root.unmount());
  expect(ref.mock.calls.at(-1)?.[0]).toBeNull();
  host.remove();
});
