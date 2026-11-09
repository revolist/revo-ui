import { h, render } from 'preact';
import { act } from 'preact/test-utils';
import { afterEach, expect, it, vi } from 'vitest';
import { useFieldReorder } from './field-reorder.hook';
const host = document.createElement('div');
afterEach(() => act(() => render(null, host)));
it('shares gestures and button moves, and rejects stale, disabled and ended gestures', () => {
  let api!: ReturnType<typeof useFieldReorder<string>>;
  const commit = vi.fn();
  function Example({
    items,
    enabled = true,
  }: {
    items: string[];
    enabled?: boolean;
  }) {
    api = useFieldReorder(items, commit, enabled);
    return null;
  }
  const items = ['A', 'B', 'C'];
  const target = { getBoundingClientRect: () => ({ top: 0, height: 40 }) };
  const event = (clientY = 39) =>
    ({
      clientY,
      currentTarget: target,
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      dataTransfer: { setData: vi.fn() },
    }) as unknown as DragEvent;
  act(() => render(<Example items={items} />, host));
  api.row(0).onDragStart(event());
  api.row(2).onDragOver(event());
  api.row(2).onDrop(event());
  expect(commit).toHaveBeenLastCalledWith(['B', 'C', 'A']);
  api.move(2, 0);
  expect(commit).toHaveBeenLastCalledWith(['C', 'A', 'B']);
  commit.mockClear();
  api.row(0).onDragStart(event());
  act(() => render(<Example items={['B', 'A', 'C']} />, host));
  api.row(2).onDrop(event());
  expect(commit).not.toHaveBeenCalled();
  api.row(0).onDragStart(event());
  api.row(0).onDragEnd();
  api.row(2).onDrop(event());
  expect(commit).not.toHaveBeenCalled();
  act(() => render(<Example items={items} enabled={false} />, host));
  api.row(0).onDragStart(event());
  api.row(2).onDrop(event());
  api.move(2, 0);
  expect(api.row(0).draggable).toBe(false);
  expect(commit).not.toHaveBeenCalled();
});

it('uses shared insertion feedback for list gaps and clears it on drop and disable', async () => {
  const { useFieldDropTarget } = await import('./field-reorder.hook');
  let target!: ReturnType<typeof useFieldDropTarget>;
  const commit = vi.fn();
  function Example({ enabled = true }) {
    target = useFieldDropTarget(3, { enabled, onDrop: commit });
    return null;
  }
  const list = document.createElement('ul');
  for (let index = 0; index < 3; index++) {
    const row = document.createElement('li');
    row.className = 'rv-configurator-field-row';
    row.getBoundingClientRect = () =>
      ({ top: index * 44, bottom: index * 44 + 40, height: 40 }) as DOMRect;
    list.append(row);
  }
  const event = {
    currentTarget: list,
    clientY: 86,
    preventDefault: vi.fn(),
    stopPropagation: vi.fn(),
    dataTransfer: { dropEffect: 'none' },
  } as unknown as DragEvent;
  act(() => render(<Example />, host));
  target.start(0);
  act(() => target.list.onDragOver(event));
  expect(target.row(2).dropPosition).toBe('before');
  act(() => target.list.onDrop(event));
  expect(commit).toHaveBeenCalledWith(2, event);
  expect(event.dataTransfer!.dropEffect).toBe('move');
  expect(target.row(2).dropPosition).toBeUndefined();
  act(() => target.list.onDragOver(event));
  act(() => render(<Example enabled={false} />, host));
  expect(target.row(2).dropPosition).toBeUndefined();
});

it('shares resolved-boundary commits, keyboard moves and moved-item notifications', () => {
  const first = { id: 1 },
    second = { id: 2 },
    third = { id: 3 };
  const items = [first, second, third];
  const commit = vi.fn(),
    moved = vi.fn();
  let api!: ReturnType<typeof useFieldReorder<{ id: number }>>;
  function Example() {
    api = useFieldReorder(items, commit, true, { onMove: moved });
    return null;
  }
  act(() => render(<Example />, host));
  const trigger = document.createElement('button');
  document.body.append(trigger);
  const event = {
    currentTarget: trigger,
    preventDefault: vi.fn(),
    stopPropagation: vi.fn(),
    dataTransfer: { setData: vi.fn() },
  } as unknown as DragEvent;
  act(() => api.row(2).onDragStart(event));
  expect(api.draggedIndex).toBe(2);
  act(() => api.overBoundary(event, 1));
  expect(api.dropIndex).toBe(1);
  act(() => api.dropBoundary(event, 1));
  expect(commit).toHaveBeenLastCalledWith([first, third, second]);
  expect(moved).toHaveBeenLastCalledWith(third);
  expect(api.draggedIndex).toBeNull();
  expect(api.dropIndex).toBeUndefined();
  act(() =>
    api.row(1).onKeyDown({
      currentTarget: trigger,
      altKey: true,
      key: 'ArrowUp',
      preventDefault: vi.fn(),
    } as unknown as KeyboardEvent),
  );
  expect(commit).toHaveBeenLastCalledWith([second, first, third]);
  expect(moved).toHaveBeenLastCalledWith(second);
  trigger.remove();
});
