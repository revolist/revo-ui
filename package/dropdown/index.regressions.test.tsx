/** @jsxImportSource preact */
import { render } from 'preact';
import { act } from 'preact/test-utils';
import { expect, it, vi } from 'vitest';
import { Dropdown } from './index';
import { LookupField } from './lookup-field';

it.each([false, true])(
  'preserves input received before passive opening effects (remote: %s, #1023)',
  async (remote) => {
    const host = document.createElement('div');
    document.body.append(host);
    const items = [{ value: 'a', label: 'Office' }];
    const search = vi.fn(async ({ query }: { query: string }) => ({
      items: items.filter((item) => item.label.toLowerCase().includes(query)),
    }));
    try {
      await act(async () =>
        render(
          remote ? (
            <LookupField
              initial="a"
              context={null}
              options={{
                dataSource: { search, resolve: async () => items },
                required: true,
              }}
              apply={() => {}}
              cancel={() => {}}
            />
          ) : (
            <Dropdown source={items} config={{ search: true }} />
          ),
          host,
        ),
      );
      for (let attempt = 0; attempt < 2; attempt++) {
        // Do not use act here: it would flush the passive opening effects
        // before the first input and hide the race reported in #1023.
        host.querySelector<HTMLElement>('[role="combobox"]')!.click();
        await Promise.resolve();
        const input = document.querySelector<HTMLInputElement>(
          '.dropdown-search-input',
        )!;
        expect(input.value).toBe('');
        input.value = 'no matching target';
        input.dispatchEvent(new Event('input', { bubbles: true }));
        await act(async () => {
          await new Promise((resolve) => setTimeout(resolve, 250));
        });
        expect(input.isConnected).toBe(true);
        expect(input.value).toBe('no matching target');
        if (remote) {
          expect(search).toHaveBeenLastCalledWith(
            expect.objectContaining({ query: 'no matching target' }),
          );
        }
        await act(async () =>
          input.dispatchEvent(
            new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
          ),
        );
        expect(input.isConnected).toBe(false);
      }
    } finally {
      act(() => render(null, host));
      host.remove();
    }
  },
);

it('resets search only when the host changes initialSearch', async () => {
  const host = document.createElement('div');
  document.body.append(host);
  const source = [{ value: 'a', label: 'Office' }];
  const view = (initialSearch: string) => (
    <Dropdown
      source={source}
      config={{ search: true, autoOpen: true, initialSearch }}
    />
  );
  try {
    await act(async () => render(view('office'), host));
    const input = document.querySelector<HTMLInputElement>(
      '.dropdown-search-input',
    )!;
    expect(input.value).toBe('office');
    await act(async () => {
      input.value = 'edited';
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await act(async () => render(view('office'), host));
    expect(input.value).toBe('edited');
    await act(async () => render(view('travel'), host));
    expect(input.value).toBe('travel');
  } finally {
    act(() => render(null, host));
    host.remove();
  }
});
