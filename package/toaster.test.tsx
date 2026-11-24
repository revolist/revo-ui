import { act } from 'preact/test-utils';
import { expect, it, vi } from 'vitest';
import { createToaster, mountToaster } from './toaster';

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
