import { afterEach, describe, expect, it, vi } from 'vitest';
import { h, render } from 'preact';
import { useState } from 'preact/hooks';
import { act } from 'preact/test-utils';
import { DatePicker, DateRangePicker, Popover } from './pickers';
import type { ISODateString } from '@revolist/ui-dates';

let host: HTMLDivElement;
afterEach(() => {
  if (host) {
    act(() => render(null, host));
    host.remove();
  }
  vi.useRealTimers();
});
function mount(view: preact.VNode) {
  host = document.createElement('div');
  document.body.append(host);
  act(() => render(view, host));
  return host;
}
function type(input: HTMLInputElement, value: string) {
  act(() => {
    input.value = value;
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
}

describe('shared date picker text entry', () => {
  it('keeps partial drafts and commits ISO dates or clearing without a native picker', () => {
    const change = vi.fn();
    function App() {
      const [value, setValue] = useState<ISODateString | undefined>(
        '2026-10-24',
      );
      return (
        <DatePicker
          value={value}
          label="Date"
          openLabel="Choose date"
          onChange={(next) => {
            change(next);
            setValue(next);
          }}
        />
      );
    }
    mount(<App />);
    const input = host.querySelector('input')!;
    expect(input.type).toBe('text');
    act(() => input.focus());
    type(input, '2026-11-');
    expect(input.value).toBe('2026-11-');
    expect(change).not.toHaveBeenCalled();
    type(input, '2026-11-05');
    expect(change).toHaveBeenLastCalledWith('2026-11-05');
    act(() => input.blur());
    expect(input.value).toBe('2026-11-05');
    act(() => input.focus());
    type(input, '');
    expect(change).toHaveBeenLastCalledWith(undefined);
  });
  it('marks out-of-range drafts invalid and keeps the last committed date', () => {
    const change = vi.fn();
    mount(
      <DatePicker
        value="2026-10-24"
        label="Date"
        openLabel="Choose date"
        minDate="2026-10-01"
        maxDate="2026-10-31"
        onChange={change}
      />,
    );
    const input = host.querySelector('input')!;
    act(() => input.focus());
    type(input, '2026-11-05');
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(change).not.toHaveBeenCalled();
    act(() => input.blur());
    expect(input.value).toBe('2026-10-24');
  });
  it('keeps range fields readonly and the calendar trigger disabled', () => {
    const change = vi.fn();
    mount(
      <DateRangePicker
        value={{ from: '2026-10-20', to: '2026-10-24' }}
        readOnly
        label="Dates"
        fromLabel="From"
        toLabel="To"
        openLabel="Choose range"
        onChange={change}
      />,
    );
    for (const input of host.querySelectorAll('input')) {
      expect(input.type).toBe('text');
      expect(input.readOnly).toBe(true);
      type(input, '2026-11-05');
    }
    expect(host.querySelector('button')!.disabled).toBe(true);
    expect(change).not.toHaveBeenCalled();
  });
});

describe('date picker calendar and text agree', () => {
  it('rejects typed disabled dates, disabled months, and custom validation failures', () => {
    const onChange = vi.fn();
    const onInvalidSelection = vi.fn();
    mount(
      <DatePicker
        value="2024-02-29"
        label="Date"
        openLabel="Choose date"
        isDateDisabled={(date) => date === '2024-03-01'}
        isMonthDisabled={(month) => month === '2024-04-01'}
        validateSelection={(date) =>
          date === '2024-05-01' ? 'Jour fermé' : true
        }
        translations={{ invalidSelection: 'Date indisponible' }}
        onInvalidSelection={onInvalidSelection}
        onChange={onChange}
      />,
    );
    const input = host.querySelector('input')!;
    act(() => input.focus());
    for (const date of ['2024-03-01', '2024-04-10', '2024-05-01']) {
      type(input, date);
      expect(input.getAttribute('aria-invalid')).toBe('true');
    }
    expect(onInvalidSelection.mock.calls).toEqual([
      ['Date indisponible', '2024-03-01'],
      ['Date indisponible', '2024-04-10'],
      ['Jour fermé', '2024-05-01'],
    ]);
    expect(onChange).not.toHaveBeenCalled();
    act(() => input.blur());
    expect(input.value).toBe('2024-02-29');
    expect(input.getAttribute('aria-invalid')).not.toBe('true');
  });

  it('rejects a disabled typed range endpoint and orders valid endpoints', () => {
    const onChange = vi.fn();
    mount(
      <DateRangePicker
        value={{ from: '2024-02-26', to: '2024-02-28' }}
        label="Range"
        fromLabel="From"
        toLabel="To"
        openLabel="Choose range"
        isDateDisabled={(date) => date === '2024-02-29'}
        onChange={onChange}
      />,
    );
    const to = host.querySelectorAll('input')[1]!;
    act(() => to.focus());
    type(to, '2024-02-29');
    expect(to.getAttribute('aria-invalid')).toBe('true');
    expect(onChange).not.toHaveBeenCalled();
    type(to, '2024-02-25');
    expect(to.getAttribute('aria-invalid')).not.toBe('true');
    expect(onChange).toHaveBeenCalledWith({
      from: '2024-02-25',
      to: '2024-02-26',
    });
  });

  it.each([
    ['en-GB', 'UTC', '2025-01-01T00:00:00Z', '2025-01-01'],
    ['en-US', 'America/New_York', '2025-01-01T00:00:00Z', '2024-12-31'],
    ['en-IN', 'Asia/Kolkata', '2024-02-29T18:30:00Z', '2024-03-01'],
    ['ar-LB', 'Asia/Beirut', '2024-03-31T21:00:00Z', '2024-04-01'],
    ['ne-NP', 'Asia/Kathmandu', '2024-12-31T18:15:00Z', '2025-01-01'],
    ['en-NZ', 'Pacific/Chatham', '2024-12-31T10:15:00Z', '2025-01-01'],
    ['en-WS', 'Pacific/Apia', '2011-12-30T10:00:00Z', '2011-12-31'],
    ['en-AU', 'Australia/Lord_Howe', '2024-10-05T15:30:00Z', '2024-10-06'],
  ] as const)(
    'opens on and emits the civil reference day for %s in %s',
    (locale, timeZone, instant, date) => {
      const onChange = vi.fn();
      mount(
        <DatePicker
          label="Date"
          openLabel="Choose date"
          locale={locale}
          timeZone={timeZone}
          referenceInstant={new Date(instant)}
          onChange={onChange}
        />,
      );
      const trigger = host.querySelector('button')!;
      act(() => trigger.click());
      const day = document.querySelector<HTMLButtonElement>(
        `[data-calendar-date="${date}"][aria-current="date"]`,
      )!;
      expect(day).not.toBeNull();
      expect(document.activeElement?.getAttribute('data-calendar-date')).toBe(
        date,
      );
      act(() => day.click());
      expect(onChange).toHaveBeenCalledWith(date);
      expect(document.activeElement).toBe(trigger);
    },
  );

  it.each([
    ['Asia/Kolkata', '2024-02-29T18:30:00Z', '2024-03-01'],
    ['Asia/Beirut', '2024-03-31T21:00:00Z', '2024-04-01'],
  ] as const)(
    'uses the current day in %s for Today and the opening month',
    (timeZone, instant, day) => {
      vi.useFakeTimers({ toFake: ['Date'] });
      vi.setSystemTime(new Date(Date.parse(instant) - 1000));
      const onChange = vi.fn();
      mount(
        <DatePicker
          label="Date"
          openLabel="Choose date"
          timeZone={timeZone}
          showTodayButton
          onChange={onChange}
        />,
      );
      vi.setSystemTime(new Date(instant));
      act(() => host.querySelector('button')!.click());
      const dialog = document.querySelector('[role="dialog"]')!;
      expect(
        dialog.querySelector(
          `[data-calendar-date="${day}"][aria-current="date"]:not([aria-hidden])`,
        ),
      ).not.toBeNull();
      expect(document.activeElement?.getAttribute('data-calendar-date')).toBe(
        day,
      );
      const today = dialog.querySelector<HTMLButtonElement>(
        '.revo-calendar__today',
      )!;
      expect(today).not.toBeNull();
      act(() => today.click());
      expect(onChange).toHaveBeenCalledWith(day);
    },
  );

  it('updates Today across Kolkata and Beirut without changing the controlled date', () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2024-03-31T18:30:00Z'));
    const onChange = vi.fn();
    const view = (timeZone: string) => (
      <DatePicker
        label="Date"
        openLabel="Choose date"
        value="2024-04-02"
        timeZone={timeZone}
        weekStartsOn={0}
        showOutsideDays
        onChange={onChange}
      />
    );
    mount(view('Asia/Kolkata'));
    act(() => host.querySelector('button')!.click());
    const today = () =>
      document
        .querySelector('[aria-current="date"]')
        ?.getAttribute('data-calendar-date');
    expect(today()).toBe('2024-04-01');
    act(() => render(view('Asia/Beirut'), host));
    expect(today()).toBe('2024-03-31');
    expect(host.querySelector('input')!.value).toBe('2024-04-02');
    expect(
      document.querySelector(
        '[data-calendar-date="2024-04-02"][aria-selected="true"]',
      ),
    ).not.toBeNull();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('disables malformed presets while keeping Today a civil date', () => {
    const onChange = vi.fn();
    mount(
      <DatePicker
        label="Date"
        openLabel="Choose date"
        referenceDate="2024-02-29"
        showTodayButton
        presets={[{ label: 'Invalid leap day', date: '2023-02-29' }]}
        onChange={onChange}
      />,
    );
    act(() => host.querySelector('button')!.click());
    const dialog = document.querySelector('[role="dialog"]')!;
    const button = (label: string) =>
      [...dialog.querySelectorAll('button')].find(
        (item) => item.textContent === label,
      )!;
    expect(button('Invalid leap day').disabled).toBe(true);
    act(() => button('Today').click());
    expect(onChange).toHaveBeenCalledWith('2024-02-29');
  });

  it('reveals a changed controlled value while the popup is open', () => {
    const props = {
      label: 'Date',
      openLabel: 'Choose date',
      onChange: vi.fn(),
    };
    mount(<DatePicker {...props} value="2024-01-31" />);
    act(() => host.querySelector('button')!.click());
    act(() => render(<DatePicker {...props} value="2024-03-01" />, host));
    expect(
      document.querySelector(
        '[data-calendar-date="2024-03-01"][aria-selected="true"]',
      ),
    ).not.toBeNull();
    expect(document.activeElement?.getAttribute('data-calendar-date')).toBe(
      '2024-03-01',
    );
  });

  it('renders an unfinished range as a preview and commits only after the second selection', () => {
    const onChange = vi.fn();
    mount(
      <DateRangePicker
        label="Range"
        fromLabel="From"
        toLabel="To"
        openLabel="Choose range"
        referenceDate="2024-02-29"
        onChange={onChange}
      />,
    );
    act(() => host.querySelector('button')!.click());
    const day = (date: string) =>
      document.querySelector<HTMLButtonElement>(
        `[data-calendar-date="${date}"]:not([aria-hidden])`,
      )!;
    expect(day('2024-02-29')).not.toBeNull();
    act(() => day('2024-02-29').click());
    act(() => day('2024-02-27').focus());
    expect(day('2024-02-28').classList.contains('in-preview')).toBe(true);
    expect(day('2024-02-28').getAttribute('aria-selected')).toBeNull();
    expect(onChange).not.toHaveBeenCalled();
    act(() => day('2024-02-27').click());
    expect(onChange).toHaveBeenCalledWith({
      from: '2024-02-27',
      to: '2024-02-29',
    });
  });
});

describe('popup date picker options', () => {
  const dialog = () =>
    document.querySelector<HTMLElement>(
      '.rv-popover[role="dialog"]:not([hidden])',
    );
  const day = (date: string) =>
    dialog()?.querySelector<HTMLButtonElement>(
      `[data-calendar-date="${date}"]:not([aria-hidden])`,
    );
  const trigger = () =>
    host.querySelector<HTMLButtonElement>('button[aria-haspopup="dialog"]')!;
  const escape = () =>
    document.activeElement?.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
        cancelable: true,
      }),
    );

  it('requests controlled opening and keeps the live popup focused until dismissal is accepted', () => {
    const onOpenChange = vi.fn();
    const onChange = vi.fn();
    const view = (open: boolean) => (
      <DatePicker
        label="Date"
        openLabel="Choose date"
        value="2024-04-02"
        open={open}
        defaultOpen
        onOpenChange={onOpenChange}
        onChange={onChange}
      />
    );
    mount(view(false));
    act(() => trigger().click());
    expect(onOpenChange.mock.calls).toEqual([[true]]);
    expect(dialog()).toBeNull();
    act(() => render(view(true), host));
    expect(document.activeElement?.getAttribute('data-calendar-date')).toBe(
      '2024-04-02',
    );
    const surface = dialog();
    act(escape);
    expect(dialog()).toBe(surface);
    expect(document.activeElement?.getAttribute('data-calendar-date')).toBe(
      '2024-04-02',
    );
    act(() =>
      document.body.dispatchEvent(new Event('pointerdown', { bubbles: true })),
    );
    expect(dialog()).toBe(surface);
    act(escape);
    act(() => render(view(false), host));
    expect(dialog()).toBeNull();
    expect(document.activeElement).toBe(trigger());
    expect(onOpenChange.mock.calls).toEqual([
      [true],
      [false],
      [false],
      [false],
    ]);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('opens on defaultMonth, navigates locally, and keeps the month across trigger toggles', () => {
    const onMonthChange = vi.fn();
    const onOpenChange = vi.fn();
    mount(
      <DatePicker
        label="Date"
        openLabel="Choose date"
        defaultOpen
        defaultMonth="2024-03-14"
        value="2024-04-02"
        dateInput={false}
        onOpenChange={onOpenChange}
        onMonthChange={onMonthChange}
        onChange={vi.fn()}
      />,
    );
    expect(host.querySelector('input')).toBeNull();
    expect(trigger().textContent).toContain('2024-04-02');
    expect(day('2024-03-14')).not.toBeNull();
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(onMonthChange).not.toHaveBeenCalled();
    act(() =>
      dialog()!
        .querySelector<HTMLButtonElement>('[aria-label="Previous month"]')!
        .click(),
    );
    expect(onMonthChange.mock.calls).toEqual([['2024-02-01']]);
    act(() => trigger().click());
    expect(dialog()).toBeNull();
    act(() => trigger().click());
    expect(day('2024-02-29')).not.toBeNull();
    expect(onOpenChange.mock.calls).toEqual([[false], [true]]);
  });

  it('requests a controlled month change and commits a Kolkata ISO date', () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2024-02-29T18:30:00Z'));
    const onMonthChange = vi.fn();
    const onOpenChange = vi.fn();
    const onChange = vi.fn();
    const view = (month: ISODateString) => (
      <DatePicker
        label="Date"
        openLabel="Choose date"
        open
        timeZone="Asia/Kolkata"
        month={month}
        onOpenChange={onOpenChange}
        onMonthChange={onMonthChange}
        onChange={onChange}
      />
    );
    mount(view('2024-02-05'));
    expect(day('2024-02-29')).not.toBeNull();
    act(() =>
      dialog()!
        .querySelector<HTMLButtonElement>('[aria-label="Next month"]')!
        .click(),
    );
    expect(onMonthChange.mock.calls).toEqual([['2024-03-01']]);
    expect(day('2024-03-01')).toBeNull();
    act(() => render(view('2024-03-01'), host));
    expect(day('2024-03-01')?.getAttribute('aria-current')).toBe('date');
    act(() => day('2024-03-01')!.click());
    expect(onChange).toHaveBeenCalledWith('2024-03-01');
    expect(onOpenChange.mock.calls).toEqual([[false]]);
    expect(dialog()).not.toBeNull();
    expect(onMonthChange).toHaveBeenCalledOnce();
  });

  it('uses localized typed input with an unchanged ISO value in Kolkata', () => {
    const onChange = vi.fn();
    mount(
      <DatePicker
        label="Date"
        openLabel="Choose date"
        locale="en-IN"
        timeZone="Asia/Kolkata"
        dateInput={{ format: 'locale', placeholder: 'DD/MM/YYYY' }}
        value="2024-03-01"
        onChange={onChange}
      />,
    );
    const input = host.querySelector('input')!;
    expect(input.value).toBe('01/03/2024');
    expect(input.placeholder).toBe('DD/MM/YYYY');
    act(() => input.focus());
    type(input, '29/02/2024');
    expect(onChange.mock.calls).toEqual([['2024-02-29']]);
  });

  it('keeps localized Beirut range entry and selection in ISO, even after changing zones', () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2024-03-31T21:00:00Z'));
    const onChange = vi.fn();
    const onOpenChange = vi.fn();
    const view = (
      timeZone: string,
      open: boolean,
      dateInput: boolean | { format: 'locale' },
    ) => (
      <DateRangePicker
        label="Range"
        fromLabel="From"
        toLabel="To"
        openLabel="Choose range"
        open={open}
        timeZone={timeZone}
        locale="fr-LB"
        dateInput={dateInput}
        month="2024-04-01"
        value={{ from: '2024-04-01', to: '2024-04-05' }}
        onOpenChange={onOpenChange}
        onChange={onChange}
      />
    );
    mount(view('Asia/Beirut', false, { format: 'locale' }));
    const to = host.querySelectorAll('input')[1];
    expect(to.value).toBe('05/04/2024');
    act(() => to.focus());
    type(to, '06/04/2024');
    expect(onChange.mock.calls).toEqual([
      [{ from: '2024-04-01', to: '2024-04-06' }],
    ]);
    act(() => render(view('Asia/Beirut', true, false), host));
    expect(host.querySelector('input')).toBeNull();
    expect(trigger().textContent).toContain('2024-04-01 – 2024-04-05');
    expect(day('2024-04-01')?.getAttribute('aria-current')).toBe('date');
    act(() => day('2024-04-04')!.click());
    expect(onOpenChange).not.toHaveBeenCalled();
    act(() => render(view('Asia/Kolkata', false, false), host));
    act(() => render(view('Asia/Kolkata', true, false), host));
    act(() => day('2024-04-03')!.click());
    expect(onChange).toHaveBeenCalledOnce();
    act(() => day('2024-04-05')!.click());
    expect(onChange.mock.calls.at(-1)).toEqual([
      { from: '2024-04-03', to: '2024-04-05' },
    ]);
    expect(onOpenChange.mock.calls).toEqual([[false]]);
  });
});

describe('date picker form and selection options', () => {
  it('restores the initial uncontrolled range on native form reset', async () => {
    const onChange = vi.fn();
    mount(
      <form>
        <DateRangePicker
          label="Range"
          fromLabel="From"
          toLabel="To"
          openLabel="Choose range"
          defaultValue={{ from: '2026-11-02', to: '2026-11-04' }}
          fromName="from"
          toName="to"
          required
          onChange={onChange}
        />
      </form>,
    );
    const form = host.querySelector('form')!;
    const to = () => form.querySelector<HTMLInputElement>('[aria-label="To"]')!;
    act(() => to().focus());
    type(to(), '2026-11-06');
    expect(new FormData(form).get('to')).toBe('2026-11-06');
    await act(async () => form.reset());
    expect(to().value).toBe('2026-11-04');
    expect(new FormData(form).get('to')).toBe('2026-11-04');
    expect(form.checkValidity()).toBe(true);
    expect(onChange).toHaveBeenCalledOnce();
  });

  it.each(['from', 'to'] as const)(
    'can replace a constrained typed range starting with %s',
    (first) => {
      const onChange = vi.fn();
      mount(
        <form>
          <DateRangePicker
            label="Range"
            fromLabel="From"
            toLabel="To"
            openLabel="Choose range"
            defaultValue={{ from: '2026-11-02', to: '2026-11-04' }}
            fromName="from"
            toName="to"
            min={2}
            max={4}
            onChange={onChange}
          />
        </form>,
      );
      const from = host.querySelector<HTMLInputElement>('[aria-label="From"]')!;
      const to = host.querySelector<HTMLInputElement>('[aria-label="To"]')!;
      const inputs = first === 'from' ? [from, to] : [to, from];
      const dates =
        first === 'from'
          ? ['2026-11-20', '2026-11-22']
          : ['2026-11-22', '2026-11-20'];
      const submitted = () =>
        Object.fromEntries(new FormData(host.querySelector('form')!));
      act(() => inputs[0].focus());
      type(inputs[0], dates[0]);
      act(() => inputs[0].blur());
      expect(inputs[0].value).toBe(dates[0]);
      expect(submitted()).toEqual({ from: '2026-11-02', to: '2026-11-04' });
      expect(onChange).not.toHaveBeenCalled();
      act(() => inputs[1].focus());
      type(inputs[1], dates[1]);
      expect(onChange).toHaveBeenCalledExactlyOnceWith({
        from: '2026-11-20',
        to: '2026-11-22',
      });
      expect(submitted()).toEqual({ from: '2026-11-20', to: '2026-11-22' });
    },
  );

  const button = (label: string, scope: ParentNode = host) =>
    [...scope.querySelectorAll('button')].find(
      (item) => item.textContent === label,
    )!;
  const day = (date: string) =>
    document.querySelector<HTMLButtonElement>(
      `[data-calendar-date="${date}"]:not([aria-hidden])`,
    )!;

  it('submits ISO values from localized uncontrolled input and requires a committed date', () => {
    const onChange = vi.fn();
    mount(
      <form>
        <DatePicker
          label="Date"
          openLabel="Choose date"
          timeZone="Asia/Kolkata"
          defaultValue="2024-03-01"
          dateInput={{ format: 'eu' }}
          required
          name="due"
          clearable
          clearLabel="Effacer"
          onChange={onChange}
        />
      </form>,
    );
    const form = host.querySelector('form')!;
    const input = host.querySelector<HTMLInputElement>(
      'input[aria-label="Date"]',
    )!;
    expect(input.value).toBe('01/03/2024');
    expect(new FormData(form).get('due')).toBe('2024-03-01');
    act(() => button('Effacer').click());
    expect(onChange).toHaveBeenLastCalledWith(undefined);
    expect(form.checkValidity()).toBe(false);
    act(() => input.focus());
    type(input, '29/02/2024');
    expect(form.checkValidity()).toBe(true);
    expect(new FormData(form).get('due')).toBe('2024-02-29');
    expect(onChange).toHaveBeenLastCalledWith('2024-02-29');
  });

  it('forwards the custom trigger ref and dismissal policy, and keeps the popup open after selection', () => {
    const scope = document.createElement('section');
    document.body.append(scope);
    try {
      mount(
        <DatePicker
          label="Date"
          openLabel="Choose date"
          defaultMonth="2024-04-01"
          dateInput={false}
          closeOnSelect={false}
          renderTrigger={({ children, ...props }) => (
            <button {...props}>Custom {children}</button>
          )}
          popup={{
            appendTo: scope,
            closeOnOutside: false,
            closeOnEscape: false,
          }}
        />,
      );
      const trigger = host.querySelector('button')!;
      act(() => trigger.click());
      expect(scope.querySelector('[role="dialog"]')).not.toBeNull();
      expect(trigger.getAttribute('aria-expanded')).toBe('true');
      act(() =>
        document.body.dispatchEvent(
          new Event('pointerdown', { bubbles: true }),
        ),
      );
      act(() =>
        document.activeElement?.dispatchEvent(
          new KeyboardEvent('keydown', {
            key: 'Escape',
            bubbles: true,
            cancelable: true,
          }),
        ),
      );
      act(() => day('2024-04-02').click());
      expect(trigger.textContent).toContain('2024-04-02');
      expect(trigger.getAttribute('aria-expanded')).toBe('true');
    } finally {
      scope.remove();
    }
  });

  it('enforces Beirut range rules for day selection, typed entry, and complete presets', () => {
    const onChange = vi.fn();
    const rejected = vi.fn();
    mount(
      <form>
        <DateRangePicker
          label="Range"
          fromLabel="From"
          toLabel="To"
          openLabel="Choose range"
          timeZone="Asia/Beirut"
          defaultMonth="2024-03-01"
          defaultValue={undefined}
          fromName="start"
          toName="end"
          required
          min={2}
          max={4}
          excludeDisabled
          closeOnSelect={false}
          onChange={onChange}
          onInvalidSelection={rejected}
          isDateDisabled={(date) => date === '2024-03-28'}
          presets={[
            {
              label: 'Blocked range',
              selection: { from: '2024-03-27', to: '2024-03-30' },
            },
            {
              label: 'Valid range',
              selection: { from: '2024-03-29', to: '2024-03-31' },
            },
            { label: 'Start on March 29', date: '2024-03-29' },
          ]}
        />
      </form>,
    );
    const form = host.querySelector('form')!;
    const from = host.querySelector<HTMLInputElement>(
      'input[aria-label="From"]',
    )!;
    const to = host.querySelector<HTMLInputElement>('input[aria-label="To"]')!;
    act(() => from.focus());
    type(from, '2024-03-27');
    act(() => to.focus());
    type(to, '2024-03-30');
    expect(form.checkValidity()).toBe(false);
    expect(onChange).not.toHaveBeenCalled();
    expect(rejected).toHaveBeenLastCalledWith(expect.any(String), '2024-03-30');
    act(() =>
      host
        .querySelector<HTMLButtonElement>('[aria-label="Choose range"]')!
        .click(),
    );
    act(() => button('Blocked range', document).click());
    expect(onChange).not.toHaveBeenCalled();
    act(() => button('Start on March 29', document).click());
    act(() => day('2024-03-30').click());
    expect(onChange).not.toHaveBeenCalled();
    act(() => button('Valid range', document).click());
    expect(new FormData(form).get('start')).toBe('2024-03-29');
    expect(new FormData(form).get('end')).toBe('2024-03-31');
    expect(form.checkValidity()).toBe(true);
    expect(onChange).toHaveBeenCalledExactlyOnceWith({
      from: '2024-03-29',
      to: '2024-03-31',
    });
    expect(
      document.querySelector('[role="dialog"]:not([hidden])'),
    ).not.toBeNull();
  });

  it('requests clearing a controlled range without emitting a partial range', () => {
    const onChange = vi.fn();
    const onClear = vi.fn();
    mount(
      <DateRangePicker
        label="Range"
        fromLabel="From"
        toLabel="To"
        openLabel="Choose range"
        value={{ from: '2024-03-01', to: '2024-03-03' }}
        clearable
        onClear={onClear}
        onChange={onChange}
      />,
    );
    act(() => button('Clear date range').click());
    expect(onClear).toHaveBeenCalledOnce();
    expect(onChange).not.toHaveBeenCalled();
  });
});

it('mounts a popover in an explicit scope so it retains local theme and direction', () => {
  const scope = document.createElement('section');
  scope.dir = 'rtl';
  document.body.append(scope);
  const anchor = document.createElement('button');
  scope.append(anchor);
  try {
    mount(
      <Popover
        open
        anchor={anchor}
        appendTo={scope}
        onClose={() => {}}
        label="Scoped tools"
      >
        <span>Tools</span>
      </Popover>,
    );
    expect(scope.querySelector('[role="dialog"]')).not.toBeNull();
  } finally {
    scope.remove();
  }
});

describe('popover dismissal policy', () => {
  for (const role of ['dialog', 'menu'] as const) {
    it.each([
      [false, false],
      [false, true],
      [true, false],
      [true, true],
      [undefined, undefined],
    ])(
      `honors independent outside/Escape options for ${role}: %s, %s`,
      (outside, escape) => {
        const anchor = document.createElement('button');
        document.body.append(anchor);
        const close = vi.fn();
        const view = () => (
          <Popover
            open
            anchor={anchor}
            role={role}
            onClose={close}
            closeOnOutside={outside}
            closeOnEscape={escape}
          >
            <button role="menuitem">Action</button>
          </Popover>
        );
        try {
          mount(view());
          act(() =>
            document.body.dispatchEvent(
              new Event('pointerdown', { bubbles: true }),
            ),
          );
          expect(close).toHaveBeenCalledTimes(outside === false ? 0 : 1);
          // Reopen for the separate Escape assertion.
          act(() => render(null, host));
          act(() => render(view(), host));
          close.mockClear();
          const action =
            document.querySelector<HTMLButtonElement>('.rv-popover button')!;
          action.focus();
          const event = new KeyboardEvent('keydown', {
            key: 'Escape',
            bubbles: true,
            cancelable: true,
          });
          act(() => action.dispatchEvent(event));
          expect(close).toHaveBeenCalledTimes(escape === false ? 0 : 1);
          expect(event.defaultPrevented).toBe(escape !== false);
        } finally {
          anchor.remove();
        }
      },
    );
  }

  it('updates dismissal policy while open without notifying onClose during rebinding or controlled close', () => {
    const anchor = document.createElement('button');
    document.body.append(anchor);
    const close = vi.fn();
    const view = (outside: boolean, escape: boolean, open = true) => (
      <Popover
        open={open}
        anchor={anchor}
        closeOnOutside={outside}
        closeOnEscape={escape}
        onClose={close}
      >
        Content
      </Popover>
    );
    try {
      mount(view(true, true));
      act(() => render(view(false, false), host));
      act(() => {
        document.body.dispatchEvent(
          new Event('pointerdown', { bubbles: true }),
        );
        document.dispatchEvent(
          new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
        );
      });
      expect(close).not.toHaveBeenCalled();
      act(() => render(view(false, true), host));
      expect(close).not.toHaveBeenCalled();
      act(() =>
        document.dispatchEvent(
          new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
        ),
      );
      expect(close).toHaveBeenCalledOnce();
      act(() => render(view(false, false, false), host));
      expect(host.querySelector<HTMLElement>('.rv-popover')!.hidden).toBe(true);
      expect(close).toHaveBeenCalledOnce();
    } finally {
      anchor.remove();
    }
  });
});
