/** @jsxRuntime automatic */
/** @jsxImportSource preact */
import { render } from 'preact';
import { act } from 'preact/test-utils';
import { afterEach, expect, it, vi } from 'vitest';
import { MaskedDraft } from './index';

const host = document.createElement('div');
document.body.append(host);
afterEach(() => act(() => render(null, host)));
const button = (label: string) =>
  [...host.querySelectorAll('button')].find(
    (item) => item.textContent === label,
  )!;
async function type(value: string) {
  await act(async () => {
    const input = host.querySelector('input')!;
    input.value = value;
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
}

it('formats raw or formatted input while staging string saves', async () => {
  const apply = vi.fn();
  await act(async () =>
    render(
      <MaskedDraft
        value="001234"
        options={{ mask: '00-0000' }}
        apply={apply}
        cancel={() => {}}
      />,
      host,
    ),
  );
  expect(host.querySelector('input')!.value).toBe('00-1234');
  expect(host.querySelector('input')!.classList.contains('rv-control')).toBe(
    true,
  );
  await type('009876');
  expect(host.querySelector('input')!.value).toBe('00-9876');
  expect(host.querySelector('output')!.textContent).toBe('00-9876');
  expect(apply).not.toHaveBeenCalled();
  await act(async () =>
    host
      .querySelector('input')!
      .dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }),
      ),
  );
  expect(apply).toHaveBeenCalledExactlyOnceWith('009876');
});

it('keeps invalid pasted characters visible, disables Apply, and connects translated errors', async () => {
  const apply = vi.fn();
  await act(async () =>
    render(
      <MaskedDraft
        value={null}
        options={{
          mask: '00-00',
          label: 'Code',
          text: { invalid: 'Code invalide' },
        }}
        apply={apply}
        cancel={() => {}}
      />,
      host,
    ),
  );
  await type('00x12');
  const input = host.querySelector('input')!;
  expect(input.value).toBe('00x12');
  expect(input.getAttribute('aria-label')).toBe('Code');
  expect(input.getAttribute('aria-invalid')).toBe('true');
  expect(host.querySelector('[role="alert"]')!.textContent).toBe(
    'Code invalide',
  );
  expect(input.getAttribute('aria-describedby')).toContain(
    host.querySelector('[role="alert"]')!.id,
  );
  expect(button('Apply').disabled).toBe(true);
  await act(async () =>
    host.firstElementChild!.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Enter',
        ctrlKey: true,
        bubbles: true,
      }),
    ),
  );
  expect(apply).not.toHaveBeenCalled();
});

it('clears invalid drafts to null, stages cancellation, and supports formatted storage', async () => {
  const apply = vi.fn(),
    cancel = vi.fn();
  await act(async () =>
    render(
      <MaskedDraft
        value={null}
        options={{ mask: '00-00', store: 'formatted' }}
        apply={apply}
        cancel={cancel}
      />,
      host,
    ),
  );
  await type('bad');
  await act(async () => button('Clear').click());
  expect(host.querySelector('input')!.value).toBe('__-__');
  await act(async () => button('Apply').click());
  expect(apply).toHaveBeenLastCalledWith(null);
  await type('0012');
  await act(async () => button('Apply').click());
  expect(apply).toHaveBeenLastCalledWith('00-12');
  await act(async () => button('Cancel').click());
  expect(cancel).toHaveBeenCalledOnce();
});

it('enforces required completion, translates actions, and avoids commits during composition', async () => {
  const apply = vi.fn();
  await act(async () =>
    render(
      <MaskedDraft
        value={null}
        options={{
          mask: 'AA-00',
          required: true,
          actions: { apply: 'Save', cancel: 'Dismiss' },
          text: { required: 'Required code' },
        }}
        apply={apply}
        cancel={() => {}}
      />,
      host,
    ),
  );
  expect(button('Save').disabled).toBe(true);
  expect(host.querySelector('[role="alert"]')).toBeNull();
  expect(host.querySelector('input')!.value).toBe('__-__');
  expect(host.querySelector('input')!.getAttribute('aria-invalid')).toBe(
    'false',
  );
  await act(async () =>
    host
      .querySelector('input')!
      .dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }),
      ),
  );
  expect(host.querySelector('[role="alert"]')!.textContent).toBe(
    'Required code',
  );
  expect(
    [...host.querySelectorAll('button')].some(
      (item) => item.textContent === 'Clear',
    ),
  ).toBe(false);
  const input = host.querySelector('input')!;
  await act(async () =>
    input.dispatchEvent(new Event('compositionstart', { bubbles: true })),
  );
  await type('AB12');
  await act(async () =>
    input.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Enter',
        ctrlKey: true,
        bubbles: true,
      }),
    ),
  );
  expect(apply).not.toHaveBeenCalled();
  await act(async () =>
    input.dispatchEvent(new Event('compositionend', { bubbles: true })),
  );
  await act(async () =>
    input.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Enter',
        ctrlKey: true,
        bubbles: true,
      }),
    ),
  );
  expect(apply).toHaveBeenCalledExactlyOnceWith('AB12');
});
