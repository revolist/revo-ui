import { afterEach, expect, it, vi } from 'vitest';
import { h, render } from 'preact';
import { StatusFeedbackPanel } from './render';
import { act } from 'preact/test-utils';

const host = document.createElement('div');
afterEach(() => {
  render(null, host);
  vi.useRealTimers();
});

it('animates settled items after their own delay and asks the owner to remove them', async () => {
  vi.useFakeTimers();
  const dismiss = vi.fn();
  const item = { id: 'saved', title: 'Saved', tone: 'success' as const };
  await act(() =>
    render(
      <StatusFeedbackPanel
        title="Activity"
        items={[item]}
        autoDismissMs={8000}
        onDismissItem={dismiss}
      />,
      host,
    ),
  );
  await act(() => vi.advanceTimersByTime(4000));
  await act(() =>
    render(
      <StatusFeedbackPanel
        title="Activity"
        items={[item, { id: 'second', title: 'Second' }]}
        autoDismissMs={8000}
        onDismissItem={dismiss}
      />,
      host,
    ),
  );
  await act(() => vi.advanceTimersByTime(4000));
  expect(host.querySelectorAll('[data-exiting="true"]')).toHaveLength(1);
  expect(dismiss).not.toHaveBeenCalled();
  await act(() => vi.advanceTimersByTime(160));
  expect(dismiss).toHaveBeenCalledExactlyOnceWith('saved');
});

it('keeps running and important items and cancels stale timers on update or unmount', async () => {
  vi.useFakeTimers();
  const dismiss = vi.fn();
  const items = [
    { id: 'busy', title: 'Working', busy: true },
    { id: 'error', title: 'Failed', tone: 'danger' as const },
    { id: 'warning', title: 'Review', tone: 'warning' as const },
    { id: 'updated', title: 'Saved' },
  ];
  const draw = (value = items) =>
    render(
      <StatusFeedbackPanel
        title="Activity"
        items={value}
        autoDismissMs={8000}
        onDismissItem={dismiss}
      />,
      host,
    );
  await act(() => draw());
  await act(() => vi.advanceTimersByTime(4000));
  await act(() =>
    draw(
      items.map((item) =>
        item.id === 'updated' ? { ...item, busy: true } : item,
      ),
    ),
  );
  await act(() => vi.advanceTimersByTime(10000));
  expect(dismiss).not.toHaveBeenCalled();
  await act(() => draw([{ id: 'new', title: 'Saved' }]));
  await act(() => render(null, host));
  await act(() => vi.advanceTimersByTime(10000));
  expect(dismiss).not.toHaveBeenCalled();
});

it('preserves default panel presentation without a close control', () => {
  render(
    <StatusFeedbackPanel
      title="Activity"
      items={[{ id: 'saved', title: 'Saved' }]}
    />,
    host,
  );
  expect(host.querySelector('.rv-status-feedback--compact')).toBeNull();
  expect(host.querySelector('.rv-status-feedback__close')).toBeNull();
});

it('supports compact presentation and a labeled close callback independently of collapse', () => {
  const onClose = vi.fn();
  const onCollapsedChange = vi.fn();
  render(
    <StatusFeedbackPanel
      title="Activity"
      compact
      onClose={onClose}
      closeLabel="Dismiss activity"
      onCollapsedChange={onCollapsedChange}
      items={[{ id: 'saved', title: 'Saved' }]}
    />,
    host,
  );
  expect(host.querySelector('.rv-status-feedback--compact')).not.toBeNull();
  const close = host.querySelector<HTMLButtonElement>(
    '.rv-status-feedback__close',
  )!;
  expect(close.getAttribute('aria-label')).toBe('Dismiss activity');
  close.click();
  expect(onClose).toHaveBeenCalledOnce();
  expect(onCollapsedChange).not.toHaveBeenCalled();
  host.querySelector<HTMLButtonElement>('.rv-status-feedback__toggle')!.click();
  expect(onCollapsedChange).toHaveBeenCalledWith(true);
});
