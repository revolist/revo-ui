// @vitest-environment happy-dom
import { h, render } from 'preact';
import { act } from 'preact/test-utils';
import { afterEach, expect, it, vi } from 'vitest';
import { CalendarNavigator } from './navigator';
let host: HTMLDivElement;
afterEach(() => {
  if (host) {
    act(() => render(null, host));
    host.remove();
  }
});
it('navigates by the configured civil-date step with localized labels', () => {
  host = document.createElement('div');
  document.body.append(host);
  const change = vi.fn();
  act(() =>
    render(
      <CalendarNavigator
        value="2024-02-28"
        today="2024-02-27"
        stepDays={2}
        onChange={change}
        labels={{
          previous: 'Anterior',
          next: 'Siguiente',
          today: 'Hoy',
          calendar: 'Elegir fecha',
          dialog: 'Calendario',
        }}
      />,
      host,
    ),
  );
  const buttons = [...host.querySelectorAll('button')];
  act(() => buttons[0].click());
  expect(change).toHaveBeenLastCalledWith('2024-02-26');
  act(() => buttons[2].click());
  expect(change).toHaveBeenLastCalledWith('2024-03-01');
  act(() => buttons[1].click());
  expect(change).toHaveBeenLastCalledWith('2024-02-27');
  expect(buttons[3].getAttribute('aria-label')).toBe('Elegir fecha');
});
it('disables today when already selected and exposes the calendar popup', () => {
  host = document.createElement('div');
  document.body.append(host);
  const change = vi.fn();
  act(() =>
    render(
      <CalendarNavigator
        value="2026-10-12"
        today="2026-10-12"
        onChange={change}
        labels={{ dialog: 'Choose start date', calendar: 'Start date' }}
      />,
      host,
    ),
  );
  expect(host.querySelectorAll('button')[1].disabled).toBe(true);
  act(() =>
    host.querySelector<HTMLButtonElement>('[aria-label="Start date"]')!.click(),
  );
  expect(
    document.querySelector('[role="dialog"][aria-label="Choose start date"]'),
  ).not.toBeNull();
  act(() =>
    document
      .querySelector<HTMLButtonElement>('[data-calendar-date="2026-10-19"]')!
      .click(),
  );
  expect(change).toHaveBeenCalledWith('2026-10-19');
});

it('unmounts an open navigator popup through the native adapter', async () => {
  const { mountCalendarNavigator } = await import('./navigator-native');
  host = document.createElement('div');
  document.body.append(host);
  let control: ReturnType<typeof mountCalendarNavigator>;
  act(() => {
    control = mountCalendarNavigator(host, {
      value: '2026-10-12',
      today: '2026-10-12',
      onChange: () => {},
      labels: { calendar: 'Open', dialog: 'Dates' },
    });
  });
  act(() =>
    host.querySelector<HTMLButtonElement>('[aria-label="Open"]')!.click(),
  );
  expect(
    document.querySelector('[role="dialog"][aria-label="Dates"]'),
  ).not.toBeNull();
  act(() => control.destroy());
  expect(
    document.querySelector('[role="dialog"][aria-label="Dates"]'),
  ).toBeNull();
  expect(host.childElementCount).toBe(0);
});

it('keeps navigation and today within configured date bounds', () => {
  host = document.createElement('div');
  document.body.append(host);
  const change = vi.fn();
  const draw = (value: string) =>
    act(() =>
      render(
        <CalendarNavigator
          value={value}
          today="2024-02-01"
          stepDays={7}
          calendar={{ minDate: '2024-02-10', maxDate: '2024-02-20' }}
          onChange={change}
        />,
        host,
      ),
    );
  draw('2024-02-15');
  const buttons = [...host.querySelectorAll('button')];
  expect(buttons[1].disabled).toBe(true);
  act(() => buttons[0].click());
  expect(change).toHaveBeenLastCalledWith('2024-02-10');
  act(() => buttons[2].click());
  expect(change).toHaveBeenLastCalledWith('2024-02-20');
  draw('2024-02-10');
  expect(buttons[0].disabled).toBe(true);
  draw('2024-02-20');
  expect(buttons[2].disabled).toBe(true);
});

it('disables every navigation control when the calendar is disabled', () => {
  host = document.createElement('div');
  document.body.append(host);
  const change = vi.fn();
  act(() =>
    render(
      <CalendarNavigator
        value="2024-02-15"
        today="2024-02-14"
        calendar={{ disabled: true }}
        onChange={change}
      />,
      host,
    ),
  );
  const buttons = [...host.querySelectorAll('button')];
  expect(buttons.every((button) => button.disabled)).toBe(true);
  buttons.forEach((button) => button.click());
  expect(change).not.toHaveBeenCalled();
});
