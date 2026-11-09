import { act } from 'preact/test-utils';
import { afterEach, expect, it, vi } from 'vitest';
import { mountAiAssistant } from './mount';

const mounts: Array<ReturnType<typeof mountAiAssistant>> = [];
afterEach(async () => {
  await act(() => mounts.splice(0).forEach((mount) => mount.destroy()));
  document.body.replaceChildren();
});

for (const mode of ['toolbar', 'chat'] as const) {
  it(`preserves the first native draft entered before mount effects in ${mode} mode`, async () => {
    const host = document.createElement('div');
    document.body.append(host);
    const onSubmit = vi.fn();
    const ui = mountAiAssistant(host, { mode, onSubmit });
    mounts.push(ui);
    // A visible composer can receive input before its first passive effects.
    // Deliberately mount outside act rather than flushing them before typing.
    ui.update({ phase: 'idle', message: '', chatKey: 0 });
    const input = host.querySelector('textarea')!;
    await act(() => {
      input.value = 'Inspect';
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
    expect(input.value).toBe('Inspect');
    expect(
      host.querySelector<HTMLButtonElement>('[aria-label="Send"]')!.disabled,
    ).toBe(false);
    await act(() =>
      input.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'Enter',
          bubbles: true,
          cancelable: true,
        }),
      ),
    );
    expect(onSubmit).toHaveBeenCalledExactlyOnceWith('Inspect');
  });

  it(`preserves a draft for the same chat key and clears it for an explicit new key in ${mode} mode`, async () => {
    const host = document.createElement('div');
    document.body.append(host);
    const onSubmit = vi.fn();
    const ui = mountAiAssistant(host, { mode, onSubmit });
    mounts.push(ui);
    await act(() => ui.update({ phase: 'idle', message: '', chatKey: 0 }));
    const input = host.querySelector('textarea')!;
    await act(() => {
      input.value = 'Keep this draft';
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await act(() =>
      ui.update({ phase: 'idle', message: 'Refreshed', chatKey: 0 }),
    );
    expect(input.value).toBe('Keep this draft');
    await act(() => ui.update({ phase: 'idle', message: '', chatKey: 1 }));
    expect(input.value).toBe('');
    expect(
      host.querySelector<HTMLButtonElement>('[aria-label="Send"]')!.disabled,
    ).toBe(true);
    expect(onSubmit).not.toHaveBeenCalled();
  });
}
