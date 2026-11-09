import { render } from 'preact';
import { act } from 'preact/test-utils';
import { afterEach, expect, it, vi } from 'vitest';
import { useRemoteDropdown } from './remote-hook';
import type { DropdownDataSource, RemoteDropdownState } from './remote';

const host = document.createElement('div');
document.body.append(host);
afterEach(() => act(() => render(null, host)));

it('resolves once per selection and restarts open sessions when context or locale changes', async () => {
  const resolve = vi.fn(async () => [{ value: 'a', label: 'A' }]);
  const search = vi.fn(async () => ({ items: [{ value: 'b', label: 'B' }] }));
  const source: DropdownDataSource<string> = { resolve, search };
  const seed: [] = [];
  let state!: RemoteDropdownState<string>;
  function Harness({
    context,
    locale,
    disabled = false,
  }: {
    context: string;
    locale?: string;
    disabled?: boolean;
  }) {
    state = useRemoteDropdown({
      dataSource: source,
      dataContext: context,
      value: 'a',
      source: seed,
      open: true,
      initialQuery: '',
      disabled,
      remoteText: locale === 'de' ? german : undefined,
    });
    return null;
  }
  const german = { empty: 'Leer' };
  await act(async () => render(<Harness context="one" />, host));
  expect(resolve).toHaveBeenCalledTimes(1);
  expect(search).toHaveBeenCalledTimes(1);
  await act(async () => render(<Harness context="two" />, host));
  expect(resolve).toHaveBeenCalledTimes(2);
  expect(search).toHaveBeenCalledTimes(2);
  expect(search.mock.calls[1][0].context).toBe('two');
  await act(async () => render(<Harness context="two" locale="de" />, host));
  expect(search).toHaveBeenCalledTimes(3);
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
  expect(state.items[0]?.value).toBe('b');
  await act(async () =>
    render(<Harness context="two" locale="de" disabled />, host),
  );
  expect(state.items).toEqual([]);
  expect(state.selected).toEqual([]);
});
