/** @jsxRuntime automatic */
/** @jsxImportSource preact */
import { render } from 'preact';
import { act } from 'preact/test-utils';
import { afterEach, expect, it, vi } from 'vitest';
import { NumberDraft } from './index';

const host = document.createElement('div');
document.body.append(host);
afterEach(() => act(() => render(null, host)));
const button = (text: string) =>
  [...host.querySelectorAll('button')].find(
    (node) => node.textContent === text,
  )!;
const type = async (value: string) =>
  act(async () => {
    const input = host.querySelector('input')!;
    input.value = value;
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });

it('stages localized currency, reports invalid drafts and commits only valid numeric source values', async () => {
  const apply = vi.fn();
  await act(async () =>
    render(
      <NumberDraft
        value={12}
        options={{
          kind: 'currency',
          locale: 'de-DE',
          currency: 'EUR',
          label: 'Preis',
          min: 0,
          max: 100,
        }}
        apply={apply}
        cancel={() => {}}
      />,
      host,
    ),
  );
  expect(host.querySelector('label')!.textContent).toBe('Preis');
  await type('12,345 €');
  expect(host.querySelector('[role="alert"]')).toBeTruthy();
  expect(button('Apply').disabled).toBe(true);
  await type('14,50 €');
  expect(apply).not.toHaveBeenCalled();
  await act(async () => button('Apply').click());
  expect(apply).toHaveBeenCalledExactlyOnceWith(14.5);
});
it('supports decimal-stable arrow stepping, bounds and keyboard apply', async () => {
  const apply = vi.fn();
  await act(async () =>
    render(
      <NumberDraft
        value={0.2}
        options={{ locale: 'en-US', step: 0.1, min: 0, max: 0.3 }}
        apply={apply}
        cancel={() => {}}
      />,
      host,
    ),
  );
  const input = host.querySelector('input')!;
  await act(async () =>
    input.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }),
    ),
  );
  expect(input.value).toBe('0.3');
  await act(async () =>
    input.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }),
    ),
  );
  expect(input.value).toBe('0.3');
  await act(async () =>
    input.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Enter',
        ctrlKey: true,
        bubbles: true,
      }),
    ),
  );
  expect(apply).toHaveBeenLastCalledWith(0.3);
});
it('converts percent drafts to ratios and translates actions, labels and errors', async () => {
  const apply = vi.fn(),
    cancel = vi.fn();
  await act(async () =>
    render(
      <NumberDraft
        value={0.125}
        options={{
          kind: 'percent',
          locale: 'fr-FR',
          precision: 1,
          required: true,
          label: 'Taux',
          text: { required: 'Obligatoire' },
          actions: { apply: 'Valider', cancel: 'Annuler' },
        }}
        apply={apply}
        cancel={cancel}
      />,
      host,
    ),
  );
  expect(host.querySelector('input')!.value).toContain('12,5');
  expect(
    [...host.querySelectorAll('button')].some(
      (node) => node.textContent === 'Clear',
    ),
  ).toBe(false);
  await type('');
  expect(host.querySelector('[role="alert"]')!.textContent).toBe('Obligatoire');
  await type('25,5 %');
  await act(async () => button('Valider').click());
  expect(apply).toHaveBeenLastCalledWith(0.255);
  await act(async () => button('Annuler').click());
  expect(cancel).toHaveBeenCalledOnce();
});
it('clears invalid optional drafts to null and keeps configuration errors visible', async () => {
  const apply = vi.fn();
  await act(async () =>
    render(
      <NumberDraft
        value={null}
        options={{ locale: 'en-US' }}
        apply={apply}
        cancel={() => {}}
      />,
      host,
    ),
  );
  await type('bad');
  await act(async () => button('Clear').click());
  expect(host.querySelector('input')!.value).toBe('');
  await act(async () => button('Apply').click());
  expect(apply).toHaveBeenLastCalledWith(null);
  await act(async () =>
    render(
      <NumberDraft
        value={null}
        options={{ precision: 21 }}
        apply={apply}
        cancel={() => {}}
      />,
      host,
    ),
  );
  expect(host.querySelector('[role="alert"]')).toBeTruthy();
  expect(button('Apply').disabled).toBe(true);
});
it('does not round existing excessive precision merely by opening and applying', async () => {
  const apply = vi.fn();
  await act(async () =>
    render(
      <NumberDraft
        value={1.2345}
        options={{ locale: 'en-US', precision: 2 }}
        apply={apply}
        cancel={() => {}}
      />,
      host,
    ),
  );
  expect(host.querySelector('input')!.value).toBe('1.2345');
  expect(button('Apply').disabled).toBe(true);
  await type('1.23');
  await act(async () => button('Apply').click());
  expect(apply).toHaveBeenLastCalledWith(1.23);
});
it('keeps invalid drafts disabled even if an error translation is empty', async () => {
  const apply = vi.fn();
  await act(async () =>
    render(
      <NumberDraft
        value={12}
        options={{ text: { invalid: '' } }}
        apply={apply}
        cancel={() => {}}
      />,
      host,
    ),
  );
  await type('bad');
  expect(button('Apply').disabled).toBe(true);
  expect(host.querySelector('input')!.getAttribute('aria-invalid')).toBe(
    'true',
  );
  await act(async () =>
    host
      .querySelector('input')!
      .dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }),
      ),
  );
  expect(apply).not.toHaveBeenCalled();
});
it('keeps printable-key drafts at the end instead of replacing the initiating character', async () => {
  await act(async () =>
    render(
      <NumberDraft
        value="7"
        options={{}}
        initialSelection="end"
        apply={() => {}}
        cancel={() => {}}
      />,
      host,
    ),
  );
  const input = host.querySelector('input')!;
  expect(input.selectionStart).toBe(1);
  expect(input.selectionEnd).toBe(1);
});
it('selects an existing value on ordinary open and defers commit and stepping through IME composition', async () => {
  const apply = vi.fn();
  await act(async () =>
    render(
      <NumberDraft
        value={12}
        options={{ locale: 'en-US' }}
        apply={apply}
        cancel={() => {}}
      />,
      host,
    ),
  );
  const input = host.querySelector('input')!;
  expect(input.selectionStart).toBe(0);
  expect(input.selectionEnd).toBe(2);
  await act(async () =>
    input.dispatchEvent(new Event('compositionstart', { bubbles: true })),
  );
  await act(async () =>
    input.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }),
    ),
  );
  expect(input.value).toBe('12');
  await act(async () =>
    input.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }),
    ),
  );
  expect(apply).not.toHaveBeenCalled();
  await act(async () =>
    input.dispatchEvent(new Event('compositionend', { bubbles: true })),
  );
  await act(async () =>
    input.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }),
    ),
  );
  expect(apply).toHaveBeenLastCalledWith(12);
});
