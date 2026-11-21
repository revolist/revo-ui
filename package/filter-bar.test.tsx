import { h, render } from 'preact';
import { act } from 'preact/test-utils';
import { expect, it, vi } from 'vitest';
import { FilterBar } from './filter-bar';
it('removes an active filter using a localized accessible name', () => {
  const host = document.createElement('div');
  const remove = vi.fn();
  act(() =>
    render(
      <FilterBar
        label="Filtres"
        filters={[{ id: 'status', label: 'Statut', value: 'Ouvert' }]}
        removeLabel={(f) => `Retirer ${f.label}`}
        onRemove={remove}
      />,
      host,
    ),
  );
  const button = host.querySelector('button')!;
  expect(button.getAttribute('aria-label')).toBe('Retirer Statut');
  act(() => button.click());
  expect(remove).toHaveBeenCalledWith('status');
  act(() => render(null, host));
});
