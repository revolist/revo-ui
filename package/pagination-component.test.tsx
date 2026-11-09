import { h, render } from 'preact';
import { act } from 'preact/test-utils';
import { afterEach, expect, it, vi } from 'vitest';
import { Pagination } from './controls';

const host = document.createElement('div');
afterEach(() => act(() => render(null, host)));
it('shows and hides boundary buttons without hiding adjacent page controls or page fields', () => {
  const onChange = vi.fn();
  const props = {
    page: 2,
    pageCount: 8,
    onChange,
    label: 'Pages',
    previousLabel: 'Previous',
    nextLabel: 'Next',
    firstLabel: 'Début',
    lastLabel: 'Fin',
    variant: 'icons' as const,
  };
  act(() =>
    render(
      <Pagination {...props} boundaryButtons>
        <input aria-label="Go to page" />
      </Pagination>,
      host,
    ),
  );
  act(() =>
    host.querySelector<HTMLButtonElement>('[aria-label="Début"]')!.click(),
  );
  expect(onChange).toHaveBeenLastCalledWith(0);
  act(() =>
    host.querySelector<HTMLButtonElement>('[aria-label="Fin"]')!.click(),
  );
  expect(onChange).toHaveBeenLastCalledWith(7);
  act(() =>
    render(
      <Pagination {...props} boundaryButtons={false}>
        <input aria-label="Go to page" />
      </Pagination>,
      host,
    ),
  );
  expect(
    [...host.querySelectorAll('button')].map((button) =>
      button.getAttribute('aria-label'),
    ),
  ).toEqual(['Previous', 'Next']);
  expect(host.querySelector('input')).not.toBeNull();
});
it('honors boundary, disabled and individual visibility rules', () => {
  const onChange = vi.fn();
  const props = {
    page: 0,
    pageCount: 3,
    onChange,
    label: 'Pages',
    previousLabel: 'Previous',
    nextLabel: 'Next',
    boundaryButtons: true,
  };
  act(() =>
    render(
      <Pagination
        {...props}
        buttons={{ next: false, last: { disabled: true } }}
      />,
      host,
    ),
  );
  expect(host.querySelector('[aria-label="Next"]')).toBeNull();
  expect(
    [...host.querySelectorAll('button')].every((button) => button.disabled),
  ).toBe(true);
  act(() =>
    host.querySelectorAll('button').forEach((button) => button.click()),
  );
  expect(onChange).not.toHaveBeenCalled();
  act(() => render(<Pagination {...props} pageCount={0} />, host));
  expect(
    [...host.querySelectorAll('button')].every((button) => button.disabled),
  ).toBe(true);
});
