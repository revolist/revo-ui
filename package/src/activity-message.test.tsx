import { h, render } from 'preact';
import { expect, it, vi } from 'vitest';
import { ActivityMessage } from './activity-message';

it('composes independent message slots without nesting interactive controls', () => {
  const host = document.createElement('div');
  const select = vi.fn(),
    action = vi.fn();
  try {
    render(
      <ActivityMessage
        className="product-message"
        avatar={<span>PS</span>}
        timestamp={<time dateTime="2026-10-25T16:01:00Z">4:01 PM</time>}
        actions={<button onClick={action}>Restore</button>}
        details={<aside>Comparison</aside>}
      >
        <button onClick={select}>Priya Shah updated the owner</button>
      </ActivityMessage>,
      host,
    );
    expect(host.querySelector('article.product-message')).not.toBeNull();
    expect(host.querySelector('.rv-activity-message-avatar')?.textContent).toBe(
      'PS',
    );
    expect(host.querySelector('time')?.dateTime).toBe('2026-10-25T16:01:00Z');
    expect(host.querySelector('button button')).toBeNull();
    host
      .querySelector<HTMLButtonElement>('.rv-activity-message-content button')!
      .click();
    host
      .querySelector<HTMLButtonElement>('.rv-activity-message-actions button')!
      .click();
    expect(select).toHaveBeenCalledTimes(1);
    expect(action).toHaveBeenCalledTimes(1);
    expect(
      host.querySelector('.rv-activity-message-details aside')?.textContent,
    ).toBe('Comparison');
    render(
      <ActivityMessage avatar={null} timestamp="Now">
        A short message
      </ActivityMessage>,
      host,
    );
    expect(host.querySelector('.rv-activity-message-actions')).toBeNull();
    expect(host.querySelector('.rv-activity-message-details')).toBeNull();
  } finally {
    render(null, host);
  }
});

it('keeps an optional message header separate from body, timestamp and actions', () => {
  const host = document.createElement('div');
  try {
    render(
      <ActivityMessage
        avatar="PS"
        timestamp="4:01 PM"
        header={<span>Priya Shah updated the owner</span>}
        actions={<button type="button">View change</button>}
      >
        <p>Portfolio ownership transferred to Sam Carter.</p>
      </ActivityMessage>,
      host,
    );
    expect(host.querySelector('.rv-activity-message-header')?.textContent).toBe(
      'Priya Shah updated the owner',
    );
    expect(
      host.querySelector('.rv-activity-message-content--full')?.textContent,
    ).toBe('Portfolio ownership transferred to Sam Carter.');
    expect(host.querySelector('.rv-activity-message-time')?.textContent).toBe(
      '4:01 PM',
    );
    expect(
      host.querySelectorAll('.rv-activity-message-actions button'),
    ).toHaveLength(1);
  } finally {
    render(null, host);
  }
});
