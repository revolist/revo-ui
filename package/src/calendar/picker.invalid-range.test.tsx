import { h, render } from 'preact';
import { act } from 'preact/test-utils';
import { afterEach, expect, it, vi } from 'vitest';
import { CalendarPicker } from './picker';

const hosts: HTMLElement[] = [];
afterEach(() =>
  hosts.splice(0).forEach((host) => {
    act(() => render(null, host));
    host.remove();
  }),
);
function setup(overrides: Record<string, unknown> = {}) {
  const host = document.createElement('div');
  document.body.append(host);
  hosts.push(host);
  const change = vi.fn(),
    invalid = vi.fn();
  act(() =>
    render(
      <CalendarPicker
        mode="range"
        selected={{ from: '2026-10-10' }}
        defaultMonth="2026-10-01"
        min={2}
        max={6}
        onSelectionChange={change}
        onInvalidSelection={invalid}
        {...overrides}
      />,
      host,
    ),
  );
  const day = (date: string) =>
    host.querySelector<HTMLButtonElement>(`[data-calendar-date="${date}"]`)!;
  const hover = (date: string) =>
    act(() => day(date).dispatchEvent(new MouseEvent('mouseenter')));
  return { host, day, hover, change, invalid };
}
it('marks short/long hover ranges invalid, describes them, and clears on a valid candidate', () => {
  const { host, day, hover, change } = setup();
  hover('2026-10-11');
  expect(day('2026-10-11').getAttribute('aria-invalid')).toBe('true');
  const status = host.querySelector('[role="status"]')!;
  expect(status.textContent).toBe('This date cannot be selected.');
  expect(day('2026-10-11').getAttribute('aria-describedby')).toBe(status.id);
  hover('2026-10-17');
  expect(day('2026-10-17').getAttribute('aria-invalid')).toBe('true');
  hover('2026-10-12');
  expect(day('2026-10-12').hasAttribute('aria-invalid')).toBe(false);
  expect(status.textContent).toBe('');
  expect(change).not.toHaveBeenCalled();
  hover('2026-10-11');
  act(() =>
    host
      .querySelector<HTMLButtonElement>('[aria-label^="Choose month:"]')!
      .click(),
  );
  expect(status.textContent).toBe('');
});
it('keeps the range start on rejected clicks and clears translated feedback on pointer exit', () => {
  const { host, day, change, invalid } = setup({
    translations: { invalidSelection: 'Cette période est indisponible.' },
  });
  act(() => day('2026-10-11').click());
  expect(change).not.toHaveBeenCalled();
  expect(invalid).toHaveBeenCalledWith(
    'Cette période est indisponible.',
    '2026-10-11',
  );
  expect(host.querySelector('[role="status"]')?.textContent).toBe(
    'Cette période est indisponible.',
  );
  expect(day('2026-10-10').getAttribute('aria-selected')).toBe('true');
  expect(day('2026-10-11').getAttribute('aria-invalid')).toBe('true');
  act(() => day('2026-10-11').dispatchEvent(new MouseEvent('mouseleave')));
  expect(day('2026-10-11').hasAttribute('aria-invalid')).toBe(false);
  expect(host.querySelector('[role="status"]')?.textContent).toBe('');
  act(() => day('2026-10-12').focus());
  expect(host.querySelector('[role="status"]')?.textContent).toBe('');
  act(() => day('2026-10-12').click());
  expect(change).toHaveBeenLastCalledWith({
    from: '2026-10-10',
    to: '2026-10-12',
  });
});
it('previews disabled spans and preserves commit-time custom validation messages', () => {
  const validate = vi.fn((date: string) =>
    date === '2026-10-11' || date === '2026-10-12'
      ? 'Check-out is unavailable'
      : true,
  );
  const { host, day, hover } = setup({
    excludeDisabled: true,
    isDateDisabled: (date: string) => date === '2026-10-13',
    translations: { invalidSelection: 'Unavailable range' },
    validateSelection: validate,
  });
  hover('2026-10-14');
  expect(day('2026-10-14').getAttribute('aria-invalid')).toBe('true');
  expect(host.querySelector('[role="status"]')?.textContent).toBe(
    'Unavailable range',
  );
  hover('2026-10-12');
  expect(host.querySelector('[role="status"]')?.textContent).toBe('');
  expect(validate).not.toHaveBeenCalled();
  act(() => day('2026-10-12').click());
  expect(host.querySelector('[role="status"]')?.textContent).toBe(
    'Check-out is unavailable',
  );
  expect(day('2026-10-12').getAttribute('aria-invalid')).toBe('true');
  hover('2026-10-11');
  act(() => day('2026-10-11').click());
  expect(host.querySelector('[role="status"]')?.textContent).toBe(
    'Check-out is unavailable',
  );
  expect(validate).toHaveBeenCalledTimes(2);
});
