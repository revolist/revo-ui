import { h, render } from 'preact';
import { act } from 'preact/test-utils';
import { expect, it } from 'vitest';
import { HistoryChanges } from '../history-review';
import { HistoryEntryLabel } from './history-parts';

it('uses decorative author initials when a photo is missing or fails to load', () => {
  const host = document.createElement('div');
  const entry = {
    id: '1',
    title: 'Revision',
    author: 'Alex Chen',
    dateLabel: 'Nov 20',
  };
  try {
    act(() => render(<HistoryEntryLabel entry={entry} authorFirst />, host));
    const avatar = () => host.querySelector('.avatar-cell');
    expect(avatar()?.textContent).toBe('AC');
    expect(avatar()?.getAttribute('aria-hidden')).toBe('true');
    act(() =>
      render(
        <HistoryEntryLabel
          entry={{ ...entry, authorAvatarUrl: '/portrait.jpg' }}
          authorFirst
        />,
        host,
      ),
    );
    const photo = avatar()?.querySelector('img');
    expect(photo?.getAttribute('alt')).toBe('');
    act(() => photo?.dispatchEvent(new Event('error')));
    expect(avatar()?.querySelector('img')).toBeNull();
    expect(avatar()?.textContent).toBe('AC');
    expect(host.querySelector('[data-part="author"]')?.textContent).toContain(
      'Alex Chen',
    );
  } finally {
    act(() => render(null, host));
  }
});

it('renders localized comparisons and operation-only rows in the same table', () => {
  const host = document.createElement('div');
  try {
    act(() =>
      render(
        <HistoryChanges
          label="Modifications"
          labels={{
            address: 'Cellule',
            before: 'Avant',
            after: 'Après',
            latest: 'Serveur',
            action: 'Décision',
            emptyValue: 'Vide',
          }}
          rows={[
            {
              id: 'a1',
              address: 'A1',
              sheet: 'Ventes',
              values: { before: '10', after: '20', latest: '15' },
              action: <button type="button">Conserver</button>,
            },
            {
              id: 'b1',
              address: 'B1',
              values: { before: '30', after: null },
            },
            { id: 'insert-1', address: 'Insérer une ligne' },
          ]}
        />,
        host,
      ),
    );
    const table = host.querySelector('table')!;
    expect(table.getAttribute('aria-label')).toBe('Modifications');
    expect(table.querySelector('thead')?.textContent).toBe(
      'CelluleAvantAprèsServeurDécision',
    );
    expect(table.querySelector('tbody small')?.textContent).toBe('Ventes');
    expect(table.querySelector('del')?.textContent).toBe('10');
    expect(table.querySelector('ins')?.textContent).toBe('20');
    expect(table.querySelector('.rv-history-latest-value')?.textContent).toBe(
      '15',
    );
    expect(table.querySelector('button')?.textContent).toBe('Conserver');
    expect(table.rows[2]?.cells[2]?.textContent).toBe('Vide');
    expect(table.rows[3]?.cells[0]?.textContent).toBe('Insérer une ligne');
    expect(table.rows[3]?.cells[1]?.colSpan).toBe(3);
  } finally {
    act(() => render(null, host));
  }
});
