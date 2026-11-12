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
