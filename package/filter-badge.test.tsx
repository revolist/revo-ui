import { h, render } from 'preact';
import { act } from 'preact/test-utils';
import { afterEach, expect, it, vi } from 'vitest';
import { FilterBadge } from './filter-badge';
afterEach(() => {
  act(() => render(null, document.body));
  document.body.replaceChildren();
});
it('links details accessibly and delegates removal without owning filter state', () => {
  const remove = vi.fn();
  act(() =>
    render(
      <FilterBadge
        label="Priority: 2 selected"
        details="Critical, High"
        detailsLabel="Filter details"
        descriptionId="priority-details"
        removeLabel="Remove priority"
        onRemove={remove}
      />,
      document.body,
    ),
  );
  const info = document.querySelector<HTMLButtonElement>(
    '.rv-filter-badge-info',
  )!;
  expect(info.getAttribute('aria-describedby')).toBe('priority-details');
  expect(info.hasAttribute('data-tooltip')).toBe(false);
  expect(document.getElementById('priority-details')?.textContent).toBe(
    'Critical, High',
  );
  document.querySelector<HTMLButtonElement>('.rv-chip-remove')!.click();
  expect(remove).toHaveBeenCalledOnce();
  expect(document.querySelector('.rv-filter-badge-label')?.textContent).toBe(
    'Priority: 2 selected',
  );
});
it('omits unavailable details and read-only removal actions', () => {
  act(() => render(<FilterBadge label="Read-only filter" />, document.body));
  expect(document.querySelector('button')).toBeNull();
});

it('opens info details only on activation and dismisses on toggle, Escape and outside click', () => {
  act(() =>
    render(
      <FilterBadge
        label="Priority"
        details="Critical, High"
        detailsLabel="Filter details"
      />,
      document.body,
    ),
  );
  const info = document.querySelector<HTMLButtonElement>(
    '.rv-filter-badge-info',
  )!;
  const tooltip = () => document.querySelector<HTMLElement>('.rv-tooltip');
  info.dispatchEvent(new Event('pointerenter'));
  info.focus();
  expect(tooltip()).toBeNull();
  info.click();
  expect(tooltip()?.textContent).toBe('Critical, High');
  expect(info.getAttribute('aria-expanded')).toBe('true');
  info.click();
  expect(tooltip()).toBeNull();
  info.click();
  document.dispatchEvent(
    new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
  );
  expect(tooltip()).toBeNull();
  expect(info.getAttribute('aria-expanded')).toBe('false');
  info.click();
  document.body.dispatchEvent(new Event('pointerdown', { bubbles: true }));
  expect(tooltip()).toBeNull();
  info.click();
  act(() => render(null, document.body));
  expect(tooltip()).toBeNull();
});
