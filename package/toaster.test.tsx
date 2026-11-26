import { act } from 'preact/test-utils';
import { expect, it, vi } from 'vitest';
import { createToaster, mountToaster } from './toaster';

it('expires actionable toasts by default while honoring persistent and loading toasts', () => {
  vi.useFakeTimers();
  const host = document.createElement('div');
  document.body.append(host);
  const toaster = createToaster();
  let view!: ReturnType<typeof mountToaster>;
  try {
    act(() => {
      view = mountToaster(host, { toaster, position: 'inline', visibleCount: 6 });
      toaster.show({ title: 'Saved' });
      toaster.show({ title: 'Deleted', action: { label: 'Undo', onClick: vi.fn() } });
      toaster.show({ title: 'Persistent', duration: 0 });
      toaster.show({ title: 'Infinite', duration: Infinity });
      toaster.show({ title: 'Custom', duration: 8000 });
      toaster.show({ title: 'Loading', tone: 'loading' });
    });
    act(() => vi.advanceTimersByTime(4000));
    expect(toaster.getSnapshot().map(entry => entry.title)).toEqual(['Persistent', 'Infinite', 'Custom', 'Loading']);
    act(() => vi.advanceTimersByTime(4000));
    expect(toaster.getSnapshot().map(entry => entry.title)).toEqual(['Persistent', 'Infinite', 'Loading']);
  } finally {
    act(() => view.destroy());
    host.remove();
    vi.useRealTimers();
  }
});

it('runs an undo action immediately before the default timeout', () => {
  vi.useFakeTimers();
  const host = document.createElement('div');
  document.body.append(host);
  const toaster = createToaster();
  const undo = vi.fn();
  let view!: ReturnType<typeof mountToaster>;
  try {
    act(() => {
      view = mountToaster(host, { toaster, position: 'inline' });
      toaster.show({ title: 'Deleted', action: { label: 'Undo', onClick: undo } });
    });
    act(() => vi.advanceTimersByTime(3999));
    act(() => host.querySelector<HTMLButtonElement>('[data-part="action"] button')!.click());
    act(() => vi.advanceTimersByTime(1));
    expect(undo).toHaveBeenCalledOnce();
    expect(toaster.getSnapshot()).toHaveLength(0);
  } finally {
    act(() => view.destroy());
    host.remove();
    vi.useRealTimers();
  }
});

it('mounts a native toaster with actionable notifications and cleans up', () => {
  const host = document.createElement('div');
  document.body.append(host);
  const toaster = createToaster();
  const undo = vi.fn();
  let view!: ReturnType<typeof mountToaster>;
  act(() => {
    view = mountToaster(host, { toaster, position: 'inline' });
  });
  act(() => {
    toaster.show({
      title: 'Deleted',
      action: { label: 'Undo', onClick: undo },
    });
  });
  expect(host.querySelector('.rv-toast')?.textContent).toContain('Deleted');
  act(() => {
    [...host.querySelectorAll('button')]
      .find((button) => button.textContent === 'Undo')
      ?.click();
  });
  expect(undo).toHaveBeenCalledOnce();
  expect(toaster.getSnapshot()).toHaveLength(0);
  act(() => view.destroy());
  expect(host.childElementCount).toBe(0);
  host.remove();
});

it('shows the newest notifications first and keeps their actions independent', () => {
  const host = document.createElement('div');
  document.body.append(host);
  const toaster = createToaster();
  const firstUndo = vi.fn();
  const secondUndo = vi.fn();
  let view!: ReturnType<typeof mountToaster>;
  act(() => {
    view = mountToaster(host, { toaster, position: 'inline', visibleCount: 2 });
    toaster.show({
      title: 'First',
      action: { label: 'Undo', onClick: firstUndo },
    });
    toaster.show({
      title: 'Second',
      action: { label: 'Undo', onClick: secondUndo },
    });
    toaster.show({ title: 'Third', duration: 0 });
  });
  const titles = () =>
    [...host.querySelectorAll('.rv-toast [data-part="title"]')].map(
      (node) => node.textContent,
    );
  expect(titles()).toEqual(['Third', 'Second']);
  act(() => {
    [...host.querySelectorAll('.rv-toast')][1]
      .querySelector<HTMLButtonElement>('[data-part="action"] button')
      ?.click();
  });
  expect(secondUndo).toHaveBeenCalledOnce();
  expect(firstUndo).not.toHaveBeenCalled();
  expect(titles()).toEqual(['Third', 'First']);
  act(() => view.destroy());
  host.remove();
});
