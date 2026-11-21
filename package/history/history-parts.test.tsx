import { h, render } from 'preact';
import { act } from 'preact/test-utils';
import { expect, it } from 'vitest';
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
