export type ToastTone =
  | 'neutral'
  | 'info'
  | 'success'
  | 'warning'
  | 'error'
  | 'loading';

export interface ToastOptions {
  title: string;
  description?: string;
  tone?: ToastTone;
  /** Milliseconds before dismissal. Defaults to 4000; use 0 or Infinity to keep it visible. Loading toasts stay visible by default. */
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export type ToastEntry = Readonly<ToastOptions & { id: number }>;

type ToastResult = Omit<ToastOptions, 'tone'>;

export interface ToastPromiseMessages<T> {
  loading: ToastResult;
  success: ToastResult | ((value: T) => ToastResult);
  error: ToastResult | ((reason: unknown) => ToastResult);
}

export interface ToastController {
  show(options: ToastOptions): number;
  update(id: number, options: Partial<ToastOptions>): void;
  /** Dismiss a single notification, or clear the queue when omitted. */
  dismiss(id?: number): void;
  promise<T>(task: Promise<T>, messages: ToastPromiseMessages<T>): Promise<T>;
  getSnapshot(): readonly ToastEntry[];
  subscribe(listener: (entries: readonly ToastEntry[]) => void): () => void;
}

/** Create a notification queue local to one app or themed surface. */
export function createToaster(): ToastController {
  let entries: readonly ToastEntry[] = [];
  let nextId = 0;
  const listeners = new Set<(entries: readonly ToastEntry[]) => void>();

  function publish(next: readonly ToastEntry[]) {
    entries = next;
    listeners.forEach((listener) => listener(entries));
  }

  function add(options: ToastOptions) {
    const entry = { ...options, id: ++nextId };
    publish([...entries, entry]);
    return entry;
  }

  return {
    show: (options) => add(options).id,
    update(id, options) {
      if (!entries.some((entry) => entry.id === id)) return;
      publish(
        entries.map((entry) =>
          entry.id === id ? { ...entry, ...options, id } : entry,
        ),
      );
    },
    dismiss(id) {
      const next =
        id === undefined ? [] : entries.filter((entry) => entry.id !== id);
      if (entries.length !== next.length) publish(next);
    },
    promise(task, messages) {
      const pending = add({
        ...messages.loading,
        tone: 'loading',
        duration: 0,
      });
      function settle<T>(
        result: ToastResult | ((value: T) => ToastResult),
        value: T,
        tone: ToastTone,
      ) {
        if (!entries.includes(pending)) return;
        const options = typeof result === 'function' ? result(value) : result;
        publish(
          entries.map((entry) =>
            entry === pending ? { ...options, tone, id: pending.id } : entry,
          ),
        );
      }

      return task.then(
        (value) => {
          settle(messages.success, value, 'success');
          return value;
        },
        (reason: unknown) => {
          settle(messages.error, reason, 'error');
          throw reason;
        },
      );
    },
    getSnapshot: () => entries,
    subscribe(listener) {
      listeners.add(listener);
      listener(entries);
      return () => listeners.delete(listener);
    },
  };
}
