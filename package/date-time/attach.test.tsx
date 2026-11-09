import { afterEach, expect, it, vi } from 'vitest';
import { act } from 'preact/test-utils';
import { attachTemporalPicker } from './attach';

let dispose: (() => void) | undefined;
afterEach(() => {
  act(() => dispose?.());
  document.body.replaceChildren();
  vi.unstubAllGlobals();
});
it('closes an attached picker and disables its trigger when the input becomes read-only', async () => {
  const input = document.createElement('input');
  input.value = '2026-10-12';
  document.body.append(input);
  act(() => {
    dispose = attachTemporalPicker(input, { kind: 'date' }, () => {});
  });
  const trigger = input.nextElementSibling as HTMLButtonElement;
  act(() => trigger.click());
  expect(document.querySelector('.rv-editor-popup')).toBeTruthy();
  await act(async () => {
    input.readOnly = true;
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
  expect(trigger.disabled).toBe(true);
  expect(document.querySelector('.rv-editor-popup')).toBeNull();
});

it('toggles the picker without committing an incomplete date', () => {
  const input = document.createElement('input');
  input.value = '2026-10-12';
  document.body.append(input);
  const commit = vi.fn();
  act(() => {
    dispose = attachTemporalPicker(input, { kind: 'date' }, commit);
  });
  const trigger = input.nextElementSibling as HTMLButtonElement;
  act(() => trigger.click());
  const draft = document.querySelector<HTMLInputElement>(
    '.rv-editor-popup input',
  )!;
  act(() => {
    draft.value = '2026-10-';
    draft.dispatchEvent(new Event('input', { bubbles: true }));
  });
  expect(draft.getAttribute('aria-invalid')).toBe('true');

  const pointerDown = new Event('pointerdown', {
    bubbles: true,
    cancelable: true,
  });
  act(() => {
    trigger.dispatchEvent(pointerDown);
  });
  expect(pointerDown.defaultPrevented).toBe(false);
  act(() => trigger.click());
  expect(document.querySelector('.rv-editor-popup')).toBeNull();
  expect(input.value).toBe('2026-10-12');
  expect(commit).not.toHaveBeenCalled();

  act(() => trigger.click());
  expect(
    document.querySelector<HTMLInputElement>('.rv-editor-popup input')?.value,
  ).toBe('2026-10-12');
});

it('attaches and disposes without a browser observer and still guards read-only input', () => {
  vi.stubGlobal('MutationObserver', undefined);
  const input = document.createElement('input');
  input.value = '2026-10-12';
  document.body.append(input);
  act(() => {
    dispose = attachTemporalPicker(input, { kind: 'date' }, () => {});
  });
  const trigger = input.nextElementSibling as HTMLButtonElement;
  expect(trigger).toBeTruthy();
  input.readOnly = true;
  act(() => trigger.click());
  expect(document.querySelector('.rv-editor-popup')).toBeNull();
  act(() => dispose?.());
  expect(input.nextElementSibling).toBeNull();
});

it('replaces an existing picker attachment without letting stale cleanup remove the new one', () => {
  const input = document.createElement('input');
  input.value = '2026-10-12';
  document.body.append(input);
  let disposeFirst!: () => void;
  act(() => {
    disposeFirst = attachTemporalPicker(input, { kind: 'date' }, vi.fn());
  });
  const firstTrigger = input.nextElementSibling as HTMLButtonElement;
  act(() => firstTrigger.click());
  expect(document.querySelector('.rv-editor-popup')).toBeTruthy();

  act(() => {
    dispose = attachTemporalPicker(input, { kind: 'date' }, vi.fn());
  });
  const secondTrigger = input.nextElementSibling as HTMLButtonElement;
  expect(document.querySelector('.rv-editor-popup')).toBeNull();
  expect(firstTrigger.isConnected).toBe(false);
  expect(
    document.querySelectorAll('button[aria-label="Choose date"]'),
  ).toHaveLength(1);

  act(() => disposeFirst());
  expect(input.nextElementSibling).toBe(secondTrigger);
  act(() => secondTrigger.click());
  expect(document.querySelector('.rv-editor-popup')).toBeTruthy();
});
