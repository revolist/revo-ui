import { h, render } from 'preact';
import { act } from 'preact/test-utils';
import { expect, it } from 'vitest';
import { ActivityTimeline } from './activity-timeline';
it('renders chronological entries with shared activity content and actions', () => {
  const host = document.createElement('div');
  act(() =>
    render(
      <ActivityTimeline
        label="Activity"
        entries={[
          {
            id: '1',
            avatar: 'A',
            timestamp: 'Today',
            header: 'Alex',
            content: 'Updated',
            actions: <button>Open</button>,
          },
        ]}
      />,
      host,
    ),
  );
  expect(host.querySelector('ol')?.getAttribute('aria-label')).toBe('Activity');
  expect(host.querySelectorAll('li')).toHaveLength(1);
  expect(host.querySelector('.rv-activity-message')?.textContent).toContain(
    'Updated',
  );
  expect(host.querySelector('button')?.textContent).toBe('Open');
  act(() => render(null, host));
});
