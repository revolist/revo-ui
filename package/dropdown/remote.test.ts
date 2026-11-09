import { describe, it, expect, vi } from 'vitest';
import {
  RemoteDropdownController,
  type DropdownDataSource,
  type RemoteDropdownState,
} from './remote';
function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => (resolve = done));
  return { promise, resolve };
}
const tick = async () => {
  await Promise.resolve();
  await Promise.resolve();
};
describe('remote dropdown sessions', () => {
  it('aborts obsolete searches, rejects stale responses and debounces typing', async () => {
    vi.useFakeTimers();
    const first = deferred<{ items: { value: string; label: string }[] }>();
    let signal!: AbortSignal;
    const source: DropdownDataSource<string> = {
      resolve: async () => [],
      search: vi.fn((request) => {
        signal = request.signal;
        return request.query === 'a'
          ? first.promise
          : Promise.resolve({ items: [{ value: 'b', label: 'Bravo' }] });
      }),
    };
    let state!: RemoteDropdownState<string>;
    const session = new RemoteDropdownController(
      source,
      {},
      (next) => (state = next),
    );
    session.search('a', true);
    const originalSignal = signal;
    session.search('bb');
    session.search('b');
    expect(originalSignal.aborted).toBe(true);
    await vi.advanceTimersByTimeAsync(200);
    first.resolve({ items: [{ value: 'a', label: 'Old' }] });
    await tick();
    expect(state.items.map((item) => item.value)).toEqual(['b']);
    expect(source.search).toHaveBeenCalledTimes(2);
    session.destroy();
    vi.useRealTimers();
  });
  it('pages once per cursor and preserves resolved and unresolved selection', async () => {
    const page = deferred<{ items: { value: number; label: string }[] }>();
    const source: DropdownDataSource<number> = {
      resolve: async () => [{ value: 1, label: 'One' }],
      search: vi.fn(async ({ cursor }) =>
        cursor === undefined
          ? { items: [{ value: 2, label: 'Two' }], nextCursor: 'next' }
          : page.promise,
      ),
    };
    let state!: RemoteDropdownState<number>;
    const session = new RemoteDropdownController(
      source,
      'row-a',
      (next) => (state = next),
    );
    session.setSelected([1, 99]);
    await tick();
    session.search('', true);
    await tick();
    session.loadMore();
    session.loadMore();
    page.resolve({ items: [{ value: 3, label: 'Three' }] });
    await tick();
    expect(source.search).toHaveBeenCalledTimes(2);
    expect(state.items.map((item) => item.value)).toEqual([2, 3]);
    expect(state.selected.map((item) => item.label)).toEqual([
      'One',
      'Unavailable (99)',
    ]);
    session.destroy();
  });
  it('retries a failed page and never emits after disposal', async () => {
    let attempts = 0;
    const source: DropdownDataSource<string> = {
      resolve: async () => [],
      search: async () => {
        if (!attempts++) throw new Error('offline');
        return { items: [{ value: 'a', label: 'A' }] };
      },
    };
    const changed = vi.fn();
    const session = new RemoteDropdownController(source, undefined, changed);
    session.search('', true);
    await tick();
    expect(changed.mock.lastCall?.[0].error).toBe(true);
    session.retry();
    await tick();
    expect(changed.mock.lastCall?.[0].items).toHaveLength(1);
    const calls = changed.mock.calls.length;
    session.destroy();
    await tick();
    expect(changed).toHaveBeenCalledTimes(calls);
  });
});

it('retries the failed cursor after an empty earlier page', async () => {
  let attempts = 0;
  const source: DropdownDataSource<string> = {
    resolve: async () => [],
    search: vi.fn(async ({ cursor }) => {
      if (cursor === undefined) return { items: [], nextCursor: 'next' };
      if (!attempts++) throw new Error('offline');
      return { items: [{ value: 'a', label: 'A' }] };
    }),
  };
  let state!: RemoteDropdownState<string>;
  const session = new RemoteDropdownController(
    source,
    undefined,
    (next) => (state = next),
  );
  session.search('', true);
  await tick();
  session.loadMore();
  await tick();
  expect(state.error).toBe(true);
  session.retry();
  await tick();
  expect(state.items.map((item) => item.value)).toEqual(['a']);
  expect(source.search).toHaveBeenCalledTimes(3);
  session.destroy();
});

it('ignores late ID resolution and page results after the editor is destroyed', async () => {
  const resolved = deferred<{ value: string; label: string }[]>();
  const page = deferred<{ items: { value: string; label: string }[] }>();
  let resolveSignal!: AbortSignal, searchSignal!: AbortSignal;
  const changed = vi.fn();
  const session = new RemoteDropdownController<string>(
    {
      resolve: ({ signal }) => {
        resolveSignal = signal;
        return resolved.promise;
      },
      search: ({ signal }) => {
        searchSignal = signal;
        return page.promise;
      },
    },
    'row-a',
    changed,
  );
  session.setSelected(['a']);
  session.search('', true);
  await tick();
  const calls = changed.mock.calls.length;
  session.destroy();
  expect(resolveSignal.aborted).toBe(true);
  expect(searchSignal.aborted).toBe(true);
  resolved.resolve([{ value: 'a', label: 'A' }]);
  page.resolve({ items: [{ value: 'b', label: 'B' }] });
  await tick();
  expect(changed).toHaveBeenCalledTimes(calls);
});
