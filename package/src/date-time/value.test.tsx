import { h, render } from 'preact';
import { act } from 'preact/test-utils';
import { afterEach, expect, it } from 'vitest';
import { renderTemporalValue } from './value';
const host = document.createElement('div');
afterEach(() => act(() => render(null, host)));
it('shows separate dates, a bounded overflow badge and the full accessible/hover value', () => {
  act(() =>
    render(
      renderTemporalValue(h, {
        values: ['Oct 12', 'Oct 15', 'Oct 20'],
        fullValue: 'Oct 12, 2026; Oct 15, 2026; Oct 20, 2026',
        multiple: true,
      }),
      host,
    ),
  );
  expect(
    [...host.querySelectorAll('.rv-badge')].map((node) => node.textContent),
  ).toEqual(['Oct 12', 'Oct 15', '+1']);
  const value = host.firstElementChild!;
  expect(value.getAttribute('role')).toBe('group');
  expect(value.getAttribute('aria-label')).toBe(value.getAttribute('title'));
  expect(value.getAttribute('data-tooltip')).toContain('Oct 20, 2026');
});
it('bounds invalid limits and renders custom text safely', () => {
  act(() =>
    render(
      renderTemporalValue(h, {
        values: ['<img src=x>', 'B'],
        fullValue: 'All dates',
        multiple: true,
        maxVisibleDates: 0,
      }),
      host,
    ),
  );
  expect(host.querySelector('img')).toBeNull();
  expect(host.textContent).toBe('<img src=x>+1');
});
