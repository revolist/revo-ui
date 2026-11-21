import { describe, expect, it, vi } from 'vitest';
import { createToaster } from './toast-store';

const messages = {
  loading: { title: 'Exporting' },
  success: (file: string) => ({ title: 'Ready', description: file }),
  error: { title: 'Export failed' },
};

describe('createToaster', () => {
  it('updates an entry in place and keeps queues independent', () => {
    const toaster = createToaster();
    const listener = vi.fn();
    const unsubscribe = toaster.subscribe(listener);
    const first = toaster.show({ title: 'First' });
    const second = toaster.show({ title: 'Second' });
    const original = toaster.getSnapshot();
    toaster.update(first, { title: 'Updated' });
    expect(original[0]?.title).toBe('First');
    expect(toaster.getSnapshot()).toEqual([
      { id: first, title: 'Updated' },
      { id: second, title: 'Second' },
    ]);
    expect(createToaster().getSnapshot()).toEqual([]);
    expect(listener).toHaveBeenCalledTimes(4);
    unsubscribe();
    toaster.dismiss();
    expect(toaster.getSnapshot()).toEqual([]);
    expect(listener).toHaveBeenCalledTimes(4);
  });

  it('settles the loading entry with the same ID and preserves the task outcome', async () => {
    const toaster = createToaster();
    const result = toaster.promise(Promise.resolve('Orders.csv'), messages);
    const pending = toaster.getSnapshot()[0];
    expect(pending).toMatchObject({ tone: 'loading', duration: 0 });
    await expect(result).resolves.toBe('Orders.csv');
    expect(toaster.getSnapshot()).toEqual([
      {
        id: pending.id,
        title: 'Ready',
        description: 'Orders.csv',
        tone: 'success',
      },
    ]);
    const failure = new Error('Offline');
    await expect(
      toaster.promise(Promise.reject(failure), messages),
    ).rejects.toBe(failure);
    expect(toaster.getSnapshot()[1]).toMatchObject({
      tone: 'error',
      title: 'Export failed',
    });
  });

  it('leaves dismissed and explicitly replaced notifications alone when promises settle', async () => {
    const toaster = createToaster();
    const task = Promise.resolve('Orders.csv');
    const dismissed = toaster.promise(task, messages);
    const replaced = toaster.promise(task, messages);
    const [first, second] = toaster.getSnapshot();
    toaster.dismiss(first.id);
    toaster.update(second.id, { title: 'Export canceled', tone: 'neutral' });
    await Promise.all([dismissed, replaced]);
    expect(toaster.getSnapshot()).toEqual([
      { id: second.id, title: 'Export canceled', tone: 'neutral', duration: 0 },
    ]);
  });
});
