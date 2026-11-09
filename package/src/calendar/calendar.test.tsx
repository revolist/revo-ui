// @vitest-environment happy-dom
import { h, render } from 'preact';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  Calendar,
  DEFAULT_CALENDAR_TRANSLATIONS,
  createCalendarMonth,
  moveCalendarFocus,
} from '.';

const hosts: HTMLElement[] = [];

afterEach(() => {
  hosts.splice(0).forEach((host) => render(null, host));
  document.body.replaceChildren();
});

function mountCalendar(
  overrides: Partial<Parameters<typeof Calendar>[0]> = {},
) {
  const host = document.createElement('div');
  hosts.push(host);
  document.body.append(host);
  const props: Parameters<typeof Calendar>[0] = {
    month: '2026-08-01',
    focusedDate: '2026-08-12',
    referenceDate: '2026-08-12',
    locale: 'en-US',
    weekStartsOn: 1,
    onMonthChange: vi.fn(),
    onFocusedDateChange: vi.fn(),
    onSelect: vi.fn(),
    ...overrides,
  };
  render(<Calendar {...props} />, host);
  return { host, props };
}

describe('independent calendar', () => {
  it('builds natural or fixed month grids without timezone coercion', () => {
    expect(createCalendarMonth('2021-02-01', 1, false)).toHaveLength(28);
    expect(createCalendarMonth('2021-02-01', 1, true)).toHaveLength(42);
    expect(createCalendarMonth('2026-08-01', 1, true)[0]).toBe('2026-07-27');
  });

  it('supports complete keyboard movement, disabled-day skipping, and year paging', () => {
    expect(
      moveCalendarFocus({
        date: '2026-08-12',
        key: 'ArrowRight',
        weekStartsOn: 1,
      }),
    ).toBe('2026-08-13');
    expect(
      moveCalendarFocus({
        date: '2026-08-12',
        key: 'ArrowRight',
        weekStartsOn: 1,
        isDisabled: (date) => date === '2026-08-13',
      }),
    ).toBe('2026-08-14');
    expect(
      moveCalendarFocus({
        date: '2026-08-12',
        key: 'PageDown',
        shiftKey: true,
        weekStartsOn: 1,
      }),
    ).toBe('2027-08-12');
  });

  it('renders decomposed compact calendar parts and configurable date states', () => {
    const { host } = mountCalendar({
      minDate: '2026-08-05',
      maxDate: '2026-08-28',
      selection: { from: '2026-08-10', to: '2026-08-14' },
      preview: { from: '2026-08-20', to: '2026-08-23' },
    });

    expect(host.querySelector('.revo-calendar__header')).not.toBeNull();
    expect(host.querySelector('.revo-calendar__weekdays')).not.toBeNull();
    expect(host.querySelector('.revo-calendar__month-grid')).not.toBeNull();
    expect(host.querySelectorAll('.revo-calendar__day')).toHaveLength(42);
    expect(host.querySelectorAll('.revo-calendar__day.in-range')).toHaveLength(
      5,
    );
    expect(
      host.querySelectorAll('.revo-calendar__day.in-preview'),
    ).toHaveLength(4);
    expect(
      host.querySelector<HTMLButtonElement>('[data-calendar-date="2026-08-04"]')
        ?.disabled,
    ).toBe(true);
    expect(
      host
        .querySelector('[data-calendar-date="2026-08-12"]')
        ?.getAttribute('aria-current'),
    ).toBe('date');
  });

  it('does not expose filter-specific classes from the shared calendar', () => {
    const { host } = mountCalendar();

    expect(host.querySelector('[class*="calendar-range-filter"]')).toBeNull();
  });

  it('keeps one roving tab stop and exposes icon-backed navigation actions', () => {
    const { host, props } = mountCalendar();
    expect(
      host.querySelectorAll('.revo-calendar__day[tabindex="0"]'),
    ).toHaveLength(1);
    expect(
      host.querySelector('[aria-label="Previous month"] svg'),
    ).not.toBeNull();
    expect(host.querySelector('[aria-label="Next month"] svg')).not.toBeNull();

    host.querySelector<HTMLButtonElement>('[aria-label="Next month"]')!.click();
    expect(props.onMonthChange).toHaveBeenCalledWith('2026-09-01');
  });

  it('opens a twelve-month year overview and returns to the selected month', async () => {
    const { host, props } = mountCalendar();

    host
      .querySelector<HTMLButtonElement>(
        '[aria-label="Choose month: August 2026"]',
      )!
      .click();
    await Promise.resolve();

    expect(
      host.querySelector('[role="group"]')?.getAttribute('aria-label'),
    ).toBe('Choose month 2026');
    expect(host.querySelectorAll('.revo-calendar__month')).toHaveLength(12);
    expect(
      host.querySelector('.revo-calendar__month.active')?.textContent,
    ).toBe('August');
    expect(
      host.querySelector('.revo-calendar__month.current')?.textContent,
    ).toBe('August');
    expect(
      host.querySelector('[aria-label="Previous year"] svg'),
    ).not.toBeNull();
    expect(host.querySelector('[aria-label="Next year"] svg')).not.toBeNull();

    host.querySelector<HTMLButtonElement>('[aria-label="Next year"]')!.click();
    expect(props.onMonthChange).toHaveBeenCalledWith('2027-08-01');

    host
      .querySelector<HTMLButtonElement>('[data-calendar-month="2026-05-01"]')!
      .click();
    await Promise.resolve();
    expect(props.onMonthChange).toHaveBeenCalledWith('2026-05-01');
    expect(host.querySelector('.revo-calendar__month-grid')).not.toBeNull();
  });

  it('can disable the year overview', () => {
    const { host } = mountCalendar({ enableYearView: false });

    expect(host.querySelector('[aria-label^="Choose month:"]')).toBeNull();
    expect(host.querySelector('.revo-calendar__month-label')?.tagName).toBe(
      'STRONG',
    );
  });

  it('disables overview months wholly outside the allowed date range', async () => {
    const { host } = mountCalendar({
      minDate: '2026-05-10',
      maxDate: '2026-09-03',
    });
    host
      .querySelector<HTMLButtonElement>(
        '[aria-label="Choose month: August 2026"]',
      )!
      .click();
    await Promise.resolve();

    expect(
      host.querySelector<HTMLButtonElement>(
        '[data-calendar-month="2026-01-01"]',
      )?.disabled,
    ).toBe(true);
    expect(
      host.querySelector<HTMLButtonElement>(
        '[data-calendar-month="2026-05-01"]',
      )?.disabled,
    ).toBe(false);
    expect(
      host.querySelector<HTMLButtonElement>(
        '[data-calendar-month="2026-10-01"]',
      )?.disabled,
    ).toBe(true);
  });

  it('defines and applies one complete typed translation contract', async () => {
    expect(DEFAULT_CALENDAR_TRANSLATIONS).toEqual({
      previousMonth: 'Previous month',
      nextMonth: 'Next month',
      previousYear: 'Previous year',
      nextYear: 'Next year',
      chooseMonth: 'Choose month',
      chooseYear: 'Choose year',
      weekNumber: 'Week number',
      calendar: 'Calendar',
      today: 'Today',
      invalidSelection: 'This date cannot be selected.',
    });

    const { host } = mountCalendar({
      showTodayButton: true,
      translations: {
        previousMonth: 'Mes anterior',
        nextMonth: 'Mes seguinte',
        previousYear: 'Ano anterior',
        nextYear: 'Ano seguinte',
        chooseMonth: 'Escolher mês',
        calendar: 'Calendário',
        today: 'Hoje',
      },
    });

    expect(host.querySelector('[aria-label="Mes anterior"]')).not.toBeNull();
    expect(host.querySelector('[aria-label="Mes seguinte"]')).not.toBeNull();
    host
      .querySelector<HTMLButtonElement>(
        '[aria-label="Escolher mês: August 2026"]',
      )!
      .click();
    await Promise.resolve();
    expect(host.querySelector('[aria-label="Ano anterior"]')).not.toBeNull();
    expect(host.querySelector('[aria-label="Ano seguinte"]')).not.toBeNull();
    expect(
      host.querySelector('[role="group"]')?.getAttribute('aria-label'),
    ).toBe('Escolher mês 2026');
    expect(host.querySelector('.revo-calendar__today')?.textContent).toBe(
      'Hoje',
    );
  });

  it('independently hides the header, weekdays, and navigation actions', () => {
    const hidden = mountCalendar({ showHeader: false, showWeekdays: false });
    expect(hidden.host.querySelector('.revo-calendar__header')).toBeNull();
    expect(hidden.host.querySelector('.revo-calendar__weekdays')).toBeNull();
    expect(
      hidden.host.querySelector('.revo-calendar__month-grid'),
    ).not.toBeNull();

    const selective = mountCalendar({
      showPreviousButton: false,
      showNextButton: true,
      showMonthLabel: false,
    });
    expect(
      selective.host.querySelector('[aria-label="Previous month"]'),
    ).toBeNull();
    expect(
      selective.host.querySelector('[aria-label="Next month"]'),
    ).not.toBeNull();
    expect(
      selective.host.querySelector('.revo-calendar__month-label'),
    ).toBeNull();
  });

  it('supports configured views, initial view, disabled months, and view notifications', async () => {
    const onViewChange = vi.fn();
    const { host } = mountCalendar({
      views: ['month', 'year'],
      defaultView: 'year',
      isMonthDisabled: (month) => month === '2026-05-01',
      onViewChange,
    });

    expect(host.querySelector('.revo-calendar__year-grid')).not.toBeNull();
    expect(
      host.querySelector<HTMLButtonElement>(
        '[data-calendar-month="2026-05-01"]',
      )?.disabled,
    ).toBe(true);
    host
      .querySelector<HTMLButtonElement>('[data-calendar-month="2026-06-01"]')!
      .click();
    await Promise.resolve();
    expect(onViewChange).toHaveBeenCalledWith('month');
    expect(host.querySelector('.revo-calendar__month-grid')).not.toBeNull();
  });

  it('validates mouse and Today selections and supports custom day presentation', () => {
    const onInvalidSelection = vi.fn();
    const { host, props } = mountCalendar({
      showTodayButton: true,
      validateSelection: (date) =>
        date === '2026-08-12' ? 'Blocked by policy' : true,
      onInvalidSelection,
      dayClassName: (date) =>
        date.endsWith('-13') ? 'special-day' : undefined,
      renderDay: (date) => `D${Number(date.slice(-2))}`,
    });

    expect(
      host
        .querySelector('[data-calendar-date="2026-08-13"]')
        ?.classList.contains('special-day'),
    ).toBe(true);
    expect(
      host.querySelector('[data-calendar-date="2026-08-13"]')?.textContent,
    ).toBe('D13');
    host
      .querySelector<HTMLButtonElement>('[data-calendar-date="2026-08-12"]')!
      .click();
    expect(props.onSelect).not.toHaveBeenCalled();
    expect(onInvalidSelection).toHaveBeenCalledWith(
      'Blocked by policy',
      '2026-08-12',
    );
    host.querySelector<HTMLButtonElement>('.revo-calendar__today')!.click();
    expect(props.onSelect).not.toHaveBeenCalled();
    expect(onInvalidSelection).toHaveBeenCalledTimes(2);
  });
});
