// @vitest-environment happy-dom
import { h, render } from 'preact';
import { expect, it, vi } from 'vitest';
import { ReorderList } from './reorder-list';

it('routes nested row and gap drops only to their owning list with original-list boundaries', () => {
  const host = document.createElement('div');
  document.body.append(host);
  const outer = vi.fn(),
    inner = vi.fn();
  try {
    render(
      h(ReorderList, {
        items: [1],
        itemKey: (n: number) => n,
        onDragOver: vi.fn(),
        onDrop: outer,
        renderItem: () =>
          h(ReorderList, {
            items: [2, 3],
            itemKey: (n: number) => n,
            onDragOver: vi.fn(),
            onDrop: inner,
            renderItem: (n: number) => String(n),
          }),
      }),
      host,
    );
    const nested = host.querySelectorAll('.rv-reorder-list')[1];
    const row = nested.querySelector<HTMLElement>('.rv-reorder-row')!;
    vi.spyOn(row, 'getBoundingClientRect').mockReturnValue({
      top: 10,
      height: 20,
    } as DOMRect);
    // Happy DOM exposes the Preact drag handler under its capitalized event name.
    const event = new MouseEvent('Drop', { bubbles: true, clientY: 29 });
    row.dispatchEvent(event);
    expect(inner).toHaveBeenLastCalledWith(event, 1);
    expect(outer).not.toHaveBeenCalled();
    const gap = new MouseEvent('Drop', { bubbles: true });
    nested.querySelector('.rv-reorder-drop-end')!.dispatchEvent(gap);
    expect(inner).toHaveBeenLastCalledWith(gap, 2);
    expect(outer).not.toHaveBeenCalled();
  } finally {
    render(null, host);
    host.remove();
  }
});

it('resolves a drop in the margin between rows to that gap instead of list end', () => {
  const host = document.createElement('div');
  document.body.append(host);
  const commit = vi.fn();
  try {
    render(
      h(ReorderList, {
        items: [1, 2, 3],
        itemKey: (n: number) => n,
        onDragOver: vi.fn(),
        onDrop: commit,
        renderItem: (n: number) => String(n),
      }),
      host,
    );
    const list = host.querySelector<HTMLElement>('.rv-reorder-list')!;
    list
      .querySelectorAll<HTMLElement>('.rv-reorder-row')
      .forEach((row, index) => {
        vi.spyOn(row, 'getBoundingClientRect').mockReturnValue({
          top: 10 + index * 30,
          height: 20,
          bottom: 30 + index * 30,
        } as DOMRect);
      });
    const event = new MouseEvent('Drop', { bubbles: true, clientY: 35 });
    list.dispatchEvent(event);
    expect(commit).toHaveBeenCalledWith(event, 1);
  } finally {
    render(null, host);
    host.remove();
  }
});
