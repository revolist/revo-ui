import { render } from 'preact';
import { act } from 'preact/test-utils';
import { afterEach, expect, it, vi } from 'vitest';
import { TemporalPicker } from './picker';
const host = document.createElement('div');
document.body.append(host);
afterEach(() =>
  act(() => {
    render(null, host);
  }),
);
it('forwards multiple-month, caption, week-number, disabled-day and localization options', () => {
  const change = vi.fn();
  act(() =>
    render(
      <TemporalPicker
        value="2026-10-12"
        onChange={change}
        calendar={{
          numberOfMonths: 2,
          showWeekNumber: true,
          captionLayout: 'dropdown',
          defaultMonth: '2026-10-01',
          isDateDisabled: (date) => date === '2026-10-13',
          locale: 'en-GB',
        }}
      />,
      host,
    ),
  );
  expect(host.querySelectorAll('.revo-calendar__month-panel')).toHaveLength(2);
  expect(host.querySelector('.revo-calendar__week-number')).toBeTruthy();
  expect(
    (
      host.querySelector(
        '[data-calendar-date="2026-10-13"]',
      ) as HTMLButtonElement
    ).disabled,
  ).toBe(true);
  expect(
    host.querySelector('.revo-calendar__caption [role=combobox]'),
  ).toBeTruthy();
});
it('allows clear and rejects incomplete range drafts', () => {
  const validity = vi.fn();
  act(() =>
    render(
      <TemporalPicker
        selection="range"
        value={{ from: '2026-10-12' }}
        onChange={() => {}}
        onValidityChange={validity}
      />,
      host,
    ),
  );
  expect(validity).toHaveBeenLastCalledWith(false);
  act(() =>
    render(
      <TemporalPicker
        selection="range"
        value={null}
        onChange={() => {}}
        onValidityChange={validity}
      />,
      host,
    ),
  );
  expect(validity).toHaveBeenLastCalledWith(true);
});
it('keeps time ranges date-free and validates bounds', () => {
  const validity = vi.fn();
  act(() =>
    render(
      <TemporalPicker
        kind="time"
        selection="range"
        value={{ from: '09:00', to: '17:00' }}
        minTime="10:00"
        onChange={() => {}}
        onValidityChange={validity}
      />,
      host,
    ),
  );
  expect(host.querySelector('.revo-calendar')).toBeNull();
  expect(host.querySelectorAll('input[type="time"]')).toHaveLength(2);
  expect(validity).toHaveBeenLastCalledWith(false);
});
it('validates saved ranges and custom validation before enabling Apply', () => {
  const validity = vi.fn();
  act(() =>
    render(
      <TemporalPicker
        selection="range"
        value={{ from: '2026-10-12', to: '2026-10-15' }}
        onChange={() => {}}
        onValidityChange={validity}
        calendar={{
          excludeDisabled: true,
          isDateDisabled: (date) => date === '2026-10-13',
        }}
      />,
      host,
    ),
  );
  expect(validity).toHaveBeenLastCalledWith(false);
  act(() =>
    render(
      <TemporalPicker
        value="2026-10-12"
        onChange={() => {}}
        onValidityChange={validity}
        calendar={{ validateSelection: () => 'Unavailable' }}
      />,
      host,
    ),
  );
  expect(validity).toHaveBeenLastCalledWith(false);
});

it('keeps time-only ranges free of date endpoint controls', () => {
  act(() =>
    render(
      <TemporalPicker
        kind="time"
        selection="range"
        value={{ from: '09:00', to: '17:00' }}
        onChange={() => {}}
      />,
      host,
    ),
  );
  expect(host.querySelector('.rv-temporal-picker__endpoints')).toBeNull();
});

it('exposes keyboard fields for single, range and multiple dates and permits calendar-only mode', () => {
  const change = vi.fn();
  act(() =>
    render(<TemporalPicker value="2026-10-12" onChange={change} />, host),
  );
  expect(host.querySelector('input[aria-label="Date"]')).toBeTruthy();
  act(() =>
    render(
      <TemporalPicker
        selection="range"
        value={{ from: '2026-10-12', to: '2026-10-15' }}
        onChange={change}
      />,
      host,
    ),
  );
  expect(
    host.querySelectorAll('.rv-temporal-picker__dates input'),
  ).toHaveLength(2);
  act(() =>
    render(
      <TemporalPicker
        selection="multiple"
        value={['2026-10-12', '2026-10-15']}
        onChange={change}
      />,
      host,
    ),
  );
  expect(
    (host.querySelector('input[aria-label="Dates"]') as HTMLInputElement).value,
  ).toBe('2026-10-12; 2026-10-15');
  act(() =>
    render(
      <TemporalPicker dateInput={false} value="2026-10-12" onChange={change} />,
      host,
    ),
  );
  expect(host.querySelector('.rv-temporal-picker__dates')).toBeNull();
});

it('composes a single time-selection panel beside the calendar and keeps range fields compact', () => {
  const change = vi.fn();
  act(() =>
    render(
      <TemporalPicker
        kind="datetime"
        selection="single"
        timeFormat="24h"
        value="2026-10-12T09:00"
        onChange={change}
        text={{ time: 'Heure' }}
        calendar={{ defaultMonth: '2026-10-01', numberOfMonths: 2 }}
      />,
      host,
    ),
  );
  const header = host.querySelector('.rv-temporal-picker__header')!;
  const time = host.querySelector<HTMLInputElement>(
    '.rv-time-selection [aria-label="Heure"]',
  )!;
  expect(time).toBeTruthy();
  expect(time.closest('label')?.querySelector('span')?.textContent).toBe(
    'Heure',
  );
  expect(
    host.querySelectorAll('.rv-time-selection [role="listbox"]'),
  ).toHaveLength(0);
  const toggle = host.querySelector<HTMLButtonElement>(
    '.rv-time-selection__toggle',
  )!;
  expect(toggle.getAttribute('aria-expanded')).toBe('false');
  act(() => toggle.click());
  expect(toggle.getAttribute('aria-expanded')).toBe('true');
  expect(
    host.querySelectorAll('.rv-time-selection [role="listbox"]'),
  ).toHaveLength(2);
  act(() => toggle.click());
  expect(
    host.querySelectorAll('.rv-time-selection [role="listbox"]'),
  ).toHaveLength(0);
  expect(header.contains(time)).toBe(false);
  expect(host.querySelector('.rv-temporal-picker__body')?.contains(time)).toBe(
    true,
  );
  time.value = '10:30';
  act(() => time.dispatchEvent(new Event('input', { bubbles: true })));
  expect(change).toHaveBeenCalledWith('2026-10-12T10:30');
  act(() =>
    render(
      <TemporalPicker
        kind="datetime"
        selection="range"
        value={{ from: '2026-10-12T09:00', to: '2026-10-13T10:00' }}
        onChange={change}
      />,
      host,
    ),
  );
  expect(
    host.querySelectorAll(
      '.rv-temporal-picker__header .rv-temporal-picker__time',
    ),
  ).toHaveLength(2);
  expect(host.querySelector('.rv-temporal-picker__times')).toBeNull();
  expect(
    host.querySelector('[aria-label="Start date"] [aria-label="Start time"]'),
  ).toBeTruthy();
  expect(
    host.querySelector('[aria-label="End date"] [aria-label="End time"]'),
  ).toBeTruthy();
});
