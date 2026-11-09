import {
  dropdownOptions,
  chooseDropdownOption,
} from '../../../tests/helpers/dropdown.mjs';
import { h, render } from 'preact';
import { act } from 'preact/test-utils';
import { afterEach, expect, it, vi } from 'vitest';
import {
  Calendar,
  CalendarPicker,
  moveCalendarFocus,
  type CalendarProps,
  type CalendarRangeSelection,
} from './index';
import type { ISODateString } from '@revolist/dates';
const hosts: HTMLElement[] = [];
function mount(node: preact.ComponentChildren) {
  const host = document.createElement('div');
  document.body.append(host);
  hosts.push(host);
  act(() => render(node, host));
  return host;
}
afterEach(() => {
  hosts.splice(0).forEach((host) => {
    act(() => render(null, host));
    host.remove();
  });
});
const base: CalendarProps = {
  month: '2026-10-01',
  focusedDate: '2026-10-24',
  onMonthChange: () => {},
  onFocusedDateChange: () => {},
  onSelect: () => {},
};
it('renders two paged months, week numbers and bounded localized caption selectors', async () => {
  const change = vi.fn();
  const host = mount(
    <Calendar
      {...base}
      numberOfMonths={2}
      pagedNavigation
      showWeekNumber
      captionLayout="dropdown"
      startMonth="2026-01-01"
      endMonth="2027-12-01"
      onMonthChange={change}
    />,
  );
  expect(host.querySelectorAll('[role="grid"]')).toHaveLength(2);
  expect(host.querySelectorAll('[role="rowheader"]')).toHaveLength(12);
  const year = host.querySelector<HTMLElement>(
    '[role=combobox][aria-label="Choose year"]',
  )!;
  const years = await dropdownOptions(year);
  expect(years).toHaveLength(2);
  await act(async () => years[0].click());
  act(() =>
    host.querySelector<HTMLButtonElement>('[aria-label="Next month"]')!.click(),
  );
  expect(change).toHaveBeenCalledWith('2026-12-01');
  const select = host.querySelector<HTMLElement>(
    '[role=combobox][aria-label="Choose month"]',
  )!;
  await chooseDropdownOption(select, 'Nov');
  expect(change).toHaveBeenLastCalledWith('2026-11-01');
});
it('moves horizontally in RTL and preserves Persian days when paging', () => {
  expect(
    moveCalendarFocus({
      date: '2026-10-24',
      key: 'ArrowRight',
      weekStartsOn: 1,
      dir: 'rtl',
    }),
  ).toBe('2026-10-23');
  expect(
    moveCalendarFocus({
      date: '2024-03-20',
      key: 'PageDown',
      weekStartsOn: 1,
      calendarSystem: 'persian',
    }),
  ).toBe('2024-04-20');
  const host = mount(
    <Calendar
      {...base}
      month="2024-03-20"
      focusedDate="2024-03-20"
      calendarSystem="persian"
      locale="fa-IR"
      dir="rtl"
    />,
  );
  expect(
    host.querySelector('[data-calendar-date="2024-03-20"]')?.textContent,
  ).toBe('۱');
  expect(
    host.querySelector('.revo-calendar__month-label')?.textContent,
  ).toContain('فروردین');
});
it('uses an instant only to resolve Today, without changing civil selection values', () => {
  const host = mount(
    <Calendar
      {...base}
      referenceInstant={new Date('2026-10-24T00:30:00Z')}
      timeZone="America/Los_Angeles"
    />,
  );
  expect(
    host
      .querySelector('[aria-current="date"]')
      ?.getAttribute('data-calendar-date'),
  ).toBe('2026-10-23');
});
it('limits multiple selection on removal but permits building the minimum', () => {
  const change = vi.fn();
  const host = mount(
    <CalendarPicker
      mode="multiple"
      defaultMonth="2026-10-01"
      selected={[]}
      min={2}
      max={3}
      onSelectionChange={change}
    />,
  );
  const click = (day: string) =>
    act(() =>
      host
        .querySelector<HTMLButtonElement>(`[data-calendar-date="${day}"]`)!
        .click(),
    );
  click('2026-10-10');
  expect(change).toHaveBeenLastCalledWith(['2026-10-10']);
  act(() =>
    render(
      <CalendarPicker
        mode="multiple"
        defaultMonth="2026-10-01"
        selected={['2026-10-10', '2026-10-11']}
        min={2}
        max={2}
        onSelectionChange={change}
      />,
      host,
    ),
  );
  change.mockClear();
  click('2026-10-10');
  click('2026-10-12');
  expect(change).not.toHaveBeenCalled();
});
it('rejects short/long ranges and resets a range crossing a disabled day', () => {
  const change = vi.fn();
  const selected: CalendarRangeSelection = { from: '2026-10-10' };
  const host = mount(
    <CalendarPicker
      mode="range"
      selected={selected}
      defaultMonth="2026-10-01"
      min={2}
      max={6}
      excludeDisabled
      isDateDisabled={(date) => date === '2026-10-13'}
      onSelectionChange={change}
    />,
  );
  const click = (date: ISODateString) =>
    act(() =>
      host
        .querySelector<HTMLButtonElement>(`[data-calendar-date="${date}"]`)!
        .click(),
    );
  click('2026-10-11');
  expect(change).not.toHaveBeenCalled();
  click('2026-10-12');
  expect(change).toHaveBeenLastCalledWith({
    from: '2026-10-10',
    to: '2026-10-12',
  });
  click('2026-10-14');
  expect(change).toHaveBeenLastCalledWith({ from: '2026-10-14' });
  change.mockClear();
  click('2026-10-20');
  expect(change).not.toHaveBeenCalled();
});
it('keeps required dates and applies valid range presets atomically', () => {
  const single = vi.fn(),
    range = vi.fn();
  const host = mount(
    <CalendarPicker
      selected="2026-10-10"
      required
      onSelectionChange={single}
    />,
  );
  act(() =>
    host
      .querySelector<HTMLButtonElement>('[data-calendar-date="2026-10-10"]')!
      .click(),
  );
  expect(single).toHaveBeenCalledWith('2026-10-10');
  act(() =>
    render(
      <CalendarPicker
        mode="range"
        min={2}
        max={5}
        presets={[
          {
            label: 'Week',
            selection: { from: '2026-10-10', to: '2026-10-14' },
          },
        ]}
        onSelectionChange={range}
      />,
      host,
    ),
  );
  act(() =>
    host
      .querySelector<HTMLButtonElement>('.revo-calendar__presets button')!
      .click(),
  );
  expect(range).toHaveBeenCalledWith({ from: '2026-10-10', to: '2026-10-14' });
});

it('retains an enabled tab stop when focus is disabled and Today never deselects itself', () => {
  const change = vi.fn();
  const host = mount(
    <Calendar {...base} isDateDisabled={(date) => date === '2026-10-24'} />,
  );
  expect(
    host.querySelectorAll('.revo-calendar__day[tabindex="0"]:not(:disabled)'),
  ).toHaveLength(1);
  act(() =>
    render(
      <CalendarPicker
        selected="2026-10-24"
        referenceDate="2026-10-24"
        showTodayButton
        onSelectionChange={change}
      />,
      host,
    ),
  );
  act(() =>
    host.querySelector<HTMLButtonElement>('.revo-calendar__today')!.click(),
  );
  expect(change).toHaveBeenCalledWith('2026-10-24');
});

it('opens a native date picker in the selected calendar system without changing its ISO value', async () => {
  const { DatePicker } = await import('../pickers');
  const change = vi.fn();
  const host = mount(
    <DatePicker
      value="2024-03-20"
      onChange={change}
      label="Date"
      openLabel="Choose date"
      calendarSystem="persian"
      locale="fa-IR"
    />,
  );
  act(() =>
    host
      .querySelector<HTMLButtonElement>('[aria-label="Choose date"]')!
      .click(),
  );
  expect(
    document.querySelector(
      '[data-calendar-date="2024-03-20"][aria-selected="true"]',
    )?.textContent,
  ).toBe('۱');
  expect(change).not.toHaveBeenCalled();
});

it('clamps a paged multi-month window so the bounded last month stays reachable', () => {
  const change = vi.fn();
  const host = mount(
    <Calendar
      {...base}
      numberOfMonths={2}
      pagedNavigation
      startMonth="2026-10-01"
      endMonth="2026-12-01"
      onMonthChange={change}
    />,
  );
  act(() =>
    host.querySelector<HTMLButtonElement>('[aria-label="Next month"]')!.click(),
  );
  expect(change).toHaveBeenCalledWith('2026-11-01');
  act(() =>
    render(
      <Calendar
        {...base}
        month="2026-11-01"
        numberOfMonths={2}
        pagedNavigation
        startMonth="2026-10-01"
        endMonth="2026-12-01"
        onMonthChange={change}
      />,
      host,
    ),
  );
  expect(
    host.querySelector<HTMLButtonElement>('[aria-label="Next month"]')!
      .disabled,
  ).toBe(true);
});

it.each([
  { mode: 'single', selection: '2026-11-10', rejected: '2026-11-10' },
  {
    mode: 'multiple',
    selection: ['2026-11-10', '2026-11-12'],
    rejected: '2026-11-12',
  },
  {
    mode: 'range',
    selection: { from: '2026-11-10', to: '2026-11-12' },
    rejected: '2026-11-12',
  },
] as const)(
  'validates $mode presets before committing atomically',
  ({ mode, selection, rejected }) => {
    const change = vi.fn(),
      invalid = vi.fn(),
      monthChange = vi.fn();
    const validate = vi.fn((date: ISODateString) =>
      date === rejected ? 'Unavailable' : true,
    );
    const host = mount(
      <CalendarPicker
        {...({
          mode,
          presets: [{ label: 'Preset', selection }],
          onSelectionChange: change,
        } as any)}
        defaultMonth="2026-10-01"
        validateSelection={validate}
        onInvalidSelection={invalid}
        onMonthChange={monthChange}
      />,
    );
    const click = () =>
      act(() =>
        host
          .querySelector<HTMLButtonElement>('.revo-calendar__presets button')!
          .click(),
      );
    click();
    expect(change).not.toHaveBeenCalled();
    expect(monthChange).not.toHaveBeenCalled();
    expect(invalid).toHaveBeenCalledWith('Unavailable', rejected);
    expect(validate).toHaveBeenCalledWith(
      rejected,
      expect.objectContaining({ month: '2026-10-01', view: 'month' }),
    );
    validate.mockImplementation(() => true);
    click();
    expect(change).toHaveBeenCalledExactlyOnceWith(selection);
    expect(monthChange).toHaveBeenCalledWith('2026-11-01');
  },
);

it('reports boolean preset rejection with the active view and timezone context', () => {
  const change = vi.fn(),
    invalid = vi.fn(),
    validate = vi.fn(() => false);
  const host = mount(
    <CalendarPicker
      selected="2026-10-10"
      month="2026-10-15"
      defaultView="year"
      referenceInstant={new Date('2026-10-24T00:30:00Z')}
      timeZone="America/Los_Angeles"
      translations={{ invalidSelection: 'Not permitted' }}
      validateSelection={validate}
      onInvalidSelection={invalid}
      onSelectionChange={change}
      presets={[{ label: 'Preset', selection: '2026-11-10' }]}
    />,
  );
  act(() =>
    host
      .querySelector<HTMLButtonElement>('.revo-calendar__presets button')!
      .click(),
  );
  expect(change).not.toHaveBeenCalled();
  expect(invalid).toHaveBeenCalledWith('Not permitted', '2026-11-10');
  expect(validate).toHaveBeenCalledWith('2026-11-10', {
    month: '2026-10-01',
    view: 'year',
    selection: { from: '2026-10-10', to: '2026-10-10' },
    preview: undefined,
    referenceDate: '2026-10-23',
  });
});
