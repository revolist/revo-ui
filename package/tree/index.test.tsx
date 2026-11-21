import { h, render } from 'preact';
import { act } from 'preact/test-utils';
import { afterEach, expect, it, vi } from 'vitest';
import { Tree } from './index';
const host = document.createElement('div');
document.body.append(host);
afterEach(() => act(() => render(null, host)));
it('expands, navigates and selects nested nodes with the keyboard', () => {
  const change = vi.fn();
  act(() =>
    render(
      <Tree
        label="Folders"
        nodes={[
          { id: 'a', label: 'Folder', children: [{ id: 'b', label: 'File' }] },
          { id: 'c', label: 'Disabled', disabled: true },
        ]}
        onValueChange={change}
      />,
      host,
    ),
  );
  const folder = host.querySelector<HTMLElement>('[role=treeitem]')!;
  expect(folder.getAttribute('aria-expanded')).toBe('false');
  act(() => {
    folder.focus();
    folder.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }),
    );
  });
  expect(folder.getAttribute('aria-expanded')).toBe('true');
  act(() =>
    folder.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }),
    ),
  );
  expect(document.activeElement?.textContent).toContain('File');
  act(() =>
    document.activeElement?.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }),
    ),
  );
  expect(change).toHaveBeenCalledWith('b');
  expect(document.activeElement?.getAttribute('aria-selected')).toBe('true');
  act(() =>
    document.activeElement?.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }),
    ),
  );
  expect(document.activeElement?.textContent).toContain('Folder');
});
