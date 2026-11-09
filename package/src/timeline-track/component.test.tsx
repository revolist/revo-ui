import { h, render } from 'preact';
import { expect, it, vi } from 'vitest';
import { TimelineTrack } from './component';

it('renders an accessible controlled track and changes only the requested event on keyboard input', () => {
  const host = document.createElement('div');
  document.body.append(host);
  const event = { start: 8, end: 12, label: 'Build', project: 'a' };
  const onSelect = vi.fn(),
    onEventChange = vi.fn();
  try {
    render(
      <TimelineTrack
        rows={[{ id: 'build', event }]}
        range={{ start: 0, end: 24 }}
        selected="build"
        labels={{
          preview: 'Project preview',
          resizeEnd: (label) => `Finish ${label}`,
        }}
        onSelect={onSelect}
        onEventChange={onEventChange}
      />,
      host,
    );
    expect(
      host
        .querySelector('.rv-timeline-control__track')
        ?.getAttribute('aria-label'),
    ).toBe('Project preview');
    expect(
      host.querySelector('.rv-timeline-control__bar--selected'),
    ).not.toBeNull();
    const move = host.querySelector<HTMLButtonElement>(
      '.rv-timeline-control__bar-move',
    )!;
    expect(move.classList.contains('rv-btn')).toBe(false);
    expect(move.getAttribute('aria-label')).toContain('Build');
    move.focus();
    expect(onSelect).toHaveBeenCalledWith('build');
    move.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'ArrowRight',
        bubbles: true,
        cancelable: true,
      }),
    );
    expect(onEventChange).toHaveBeenLastCalledWith('build', {
      ...event,
      start: 9,
      end: 13,
    });
    const end = host.querySelector<HTMLButtonElement>(
      '[aria-label="Finish Build"]',
    )!;
    expect(end.getAttribute('aria-valuenow')).toBe('12');
    end.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'ArrowLeft',
        bubbles: true,
        cancelable: true,
      }),
    );
    expect(onEventChange).toHaveBeenLastCalledWith('build', {
      ...event,
      end: 11,
    });
    expect(event).toEqual({ start: 8, end: 12, label: 'Build', project: 'a' });
  } finally {
    render(null, host);
    host.remove();
  }
});
