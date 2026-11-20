import { h, render } from 'preact';
import { act } from 'preact/test-utils';
import { expect, it, vi } from 'vitest';
import type { ISODateString } from '@revolist/ui-dates';
import { CalendarPicker } from './picker';

it.each([undefined, '2026-10-01'] as const)(
  'follows a changed selection only when the calendar month is uncontrolled (%s)',
  (month) => {
    const host = document.createElement('div');
    const onSelectionChange = vi.fn();
    const view = (selected: ISODateString) => (
      <CalendarPicker
        month={month}
        defaultMonth="2026-10-01"
        selected={selected}
        onSelectionChange={onSelectionChange}
      />
    );
    const heading = () =>
      host.querySelector('[role="grid"]')?.getAttribute('aria-label');
    act(() => render(view('2026-10-24'), host));
    expect(heading()).toContain('October 2026');
    act(() => render(view('2027-02-14'), host));
    expect(heading()).toContain(month ? 'October 2026' : 'February 2027');
    expect(onSelectionChange).not.toHaveBeenCalled();
    act(() => render(null, host));
  },
);

it('keeps the current month when removing a selected date in multiple mode', () => {
  const host = document.createElement('div');
  const view = (selected: readonly ISODateString[]) => (
    <CalendarPicker
      mode="multiple"
      defaultMonth="2026-10-01"
      selected={selected}
      onSelectionChange={vi.fn()}
    />
  );
  act(() => render(view(['2026-10-24', '2026-11-10']), host));
  act(() => render(view(['2026-11-10']), host));
  expect(
    host.querySelector('[role="grid"]')?.getAttribute('aria-label'),
  ).toContain('October 2026');
  act(() => render(null, host));
});
