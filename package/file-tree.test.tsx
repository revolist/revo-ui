import { h, render } from 'preact';
import { act } from 'preact/test-utils';
import { expect, it, vi } from 'vitest';
import { FileTree } from './file-tree';

it('reports the selected path and honors localized change labels', () => {
  const host = document.createElement('div');
  const select = vi.fn();
  act(() =>
    render(
      <FileTree
        label="Fichiers"
        nodes={[
          {
            type: 'file',
            name: 'notes.md',
            path: 'docs/notes.md',
            status: 'added',
          },
        ]}
        value=""
        onValueChange={select}
        statusLabels={{ added: { label: 'Ajouté', marker: '+' } }}
      />,
      host,
    ),
  );
  const button = host.querySelector('button')!;
  expect(button.getAttribute('aria-description')).toBe('Ajouté');
  expect(button.querySelector('[data-part=status]')?.textContent).toBe('+');
  act(() => button.click());
  expect(select).toHaveBeenCalledWith('docs/notes.md');
  expect(button.hasAttribute('aria-current')).toBe(false);
  act(() => render(null, host));
});
