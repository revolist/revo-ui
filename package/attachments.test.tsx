import { h, render } from 'preact';
import { act } from 'preact/test-utils';
import { expect, it, vi } from 'vitest';
import { Attachments } from './attachments';
it('exposes localized file status and removes through the shared button', () => {
  const host = document.createElement('div');
  const remove = vi.fn();
  act(() =>
    render(
      <Attachments
        label="Fichiers"
        items={[{ id: 'one', name: 'Plan.pdf', state: 'Prêt' }]}
        removeLabel={(item) => `Retirer ${item.name}`}
        onRemove={remove}
      />,
      host,
    ),
  );
  expect(host.querySelector('ul')?.getAttribute('aria-label')).toBe('Fichiers');
  expect(host.textContent).toContain('Prêt');
  const button = host.querySelector('button')!;
  expect(button.getAttribute('aria-label')).toBe('Retirer Plan.pdf');
  act(() => button.click());
  expect(remove).toHaveBeenCalledWith('one');
  act(() => render(null, host));
});
