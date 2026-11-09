import type { DropdownOption } from './dropdown.types';

export type LookupId = string | number;
export type LookupCursor = string | number;
export interface DropdownDataSource<T = LookupId> {
  search(request: {
    query: string;
    cursor?: LookupCursor;
    pageSize: number;
    signal: AbortSignal;
    context: unknown;
  }): Promise<{
    items: readonly DropdownOption<T>[];
    nextCursor?: LookupCursor | null;
  }>;
  resolve(request: {
    ids: readonly T[];
    signal: AbortSignal;
    context: unknown;
  }): Promise<readonly DropdownOption<T>[]>;
}
export interface DropdownRemoteText {
  loading: string;
  empty: string;
  error: string;
  retry: string;
  loadMore: string;
  unavailable: (id: unknown) => string;
}
export const defaultDropdownRemoteText: DropdownRemoteText = {
  loading: 'Loading…',
  empty: 'No results found',
  error: 'Unable to load options.',
  retry: 'Retry',
  loadMore: 'Load more',
  unavailable: (id) => `Unavailable (${String(id)})`,
};
export interface RemoteDropdownState<T> {
  items: DropdownOption<T>[];
  selected: DropdownOption<T>[];
  loading: boolean;
  error: boolean;
  hasMore: boolean;
}

/** One contextual session. Aborts and generation checks protect against non-cooperative adapters. */
export class RemoteDropdownController<T> {
  private cache = new Map<T, DropdownOption<T>>();
  private ids: T[] = [];
  private items: DropdownOption<T>[] = [];
  private query = '';
  private cursor?: LookupCursor;
  private seen = new Set<LookupCursor | undefined>();
  private searchAbort?: AbortController;
  private resolveAbort?: AbortController;
  private timer?: ReturnType<typeof setTimeout>;
  private generation = 0;
  private resolution = 0;
  private disposed = false;
  private loading = false;
  private searchFailed = false;
  private failedCursor?: LookupCursor;
  private resolveFailed = false;
  private opened = false;
  constructor(
    private source: DropdownDataSource<T>,
    private context: unknown,
    private changed: (state: RemoteDropdownState<T>) => void,
    private text: DropdownRemoteText = defaultDropdownRemoteText,
    private settings: { debounceMs?: number; pageSize?: number } = {},
  ) {}

  private remember(options: readonly DropdownOption<T>[]) {
    for (const option of options) {
      if (
        typeof option.value !== 'string' &&
        (typeof option.value !== 'number' || !Number.isFinite(option.value))
      )
        throw new TypeError(
          'Remote dropdown values must be finite numeric or string IDs.',
        );
      this.cache.set(option.value, option);
    }
  }
  private emit() {
    if (!this.disposed)
      this.changed({
        items: [...this.items],
        selected: this.ids.map(
          (id) =>
            this.cache.get(id) ?? {
              value: id,
              label: this.text.unavailable(id),
              unresolved: true,
            },
        ),
        loading: this.loading,
        error: this.searchFailed || this.resolveFailed,
        hasMore: this.cursor !== undefined,
      });
  }
  setSelected(ids: readonly T[], seed: readonly DropdownOption<T>[] = []) {
    this.remember(seed);
    this.ids = [...new Set(ids)];
    this.resolveAbort?.abort();
    const generation = ++this.resolution;
    const missing = this.ids.filter((id) => !this.cache.has(id));
    this.resolveFailed = false;
    this.emit();
    if (!missing.length || this.disposed) return;
    const abort = (this.resolveAbort = new AbortController());
    Promise.resolve()
      .then(() =>
        this.source.resolve({
          ids: missing,
          signal: abort.signal,
          context: this.context,
        }),
      )
      .then((options) => {
        if (
          this.disposed ||
          abort.signal.aborted ||
          generation !== this.resolution
        )
          return;
        this.remember(options);
        this.emit();
      })
      .catch(() => {
        if (
          this.disposed ||
          abort.signal.aborted ||
          generation !== this.resolution
        )
          return;
        this.resolveFailed = true;
        this.emit();
      });
  }
  search(query: string, immediate = false) {
    if (this.disposed) return;
    this.opened = true;
    this.query = query;
    this.searchAbort?.abort();
    clearTimeout(this.timer);
    ++this.generation;
    this.items = [];
    this.cursor = undefined;
    this.seen.clear();
    this.loading = true;
    this.searchFailed = false;
    this.emit();
    if (immediate) void this.page(undefined, this.generation);
    else
      this.timer = setTimeout(
        () => void this.page(undefined, this.generation),
        this.settings.debounceMs ?? 200,
      );
  }
  private async page(cursor: LookupCursor | undefined, generation: number) {
    if (
      this.disposed ||
      generation !== this.generation ||
      this.seen.has(cursor)
    )
      return;
    this.seen.add(cursor);
    this.loading = true;
    this.searchFailed = false;
    this.emit();
    const abort = (this.searchAbort = new AbortController());
    try {
      const result = await this.source.search({
        query: this.query,
        cursor,
        pageSize: this.settings.pageSize ?? 50,
        signal: abort.signal,
        context: this.context,
      });
      if (
        this.disposed ||
        abort.signal.aborted ||
        generation !== this.generation
      )
        return;
      this.remember(result.items);
      const merged = new Map(this.items.map((item) => [item.value, item]));
      result.items.forEach((item) => merged.set(item.value, item));
      this.items = [...merged.values()];
      this.cursor = result.nextCursor ?? undefined;
      if (this.seen.has(this.cursor)) this.cursor = undefined;
    } catch {
      if (
        this.disposed ||
        abort.signal.aborted ||
        generation !== this.generation
      )
        return;
      this.seen.delete(cursor);
      this.failedCursor = cursor;
      this.searchFailed = true;
    } finally {
      if (
        !this.disposed &&
        !abort.signal.aborted &&
        generation === this.generation
      ) {
        this.loading = false;
        this.emit();
      }
    }
  }
  loadMore() {
    if (!this.loading && !this.searchFailed && this.cursor !== undefined)
      void this.page(this.cursor, this.generation);
  }
  retry() {
    if (this.resolveFailed) this.setSelected(this.ids);
    if (this.searchFailed && this.opened)
      void this.page(this.failedCursor, this.generation);
  }
  close() {
    this.opened = false;
    this.searchAbort?.abort();
    clearTimeout(this.timer);
    ++this.generation;
    this.loading = false;
    this.emit();
  }
  destroy() {
    this.disposed = true;
    this.close();
    this.resolveAbort?.abort();
    ++this.resolution;
  }
}
