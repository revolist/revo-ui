import { h, render } from 'preact';
import { act } from 'preact/test-utils';
import { afterEach, expect, it, vi } from 'vitest';
import {
  Button,
  IconButton,
  MenuItem,
  NumberStepper,
  RadioGroup,
  Tabs,
  TabPanel,
  ToggleButton,
} from './controls';
import { DateInput, DateTimeInput } from './controls';
import { DateRangePicker, Popover } from './pickers';

const hosts: HTMLElement[] = [];
function mount(node: preact.ComponentChildren) {
  const host = document.createElement('div');
  document.body.append(host);
  hosts.push(host);
  act(() => render(node, host));
  return host;
}
afterEach(() => {
  hosts.splice(0).forEach((host) => render(null, host));
  document.body.replaceChildren();
});

it('preserves native disabling and lets consumers cancel toggle activation', () => {
  const change = vi.fn();
  const host = mount(
    <>
      <Button disabled onClick={change}>
        Disabled
      </Button>
      <ToggleButton
        pressed
        onPressedChange={change}
        onClick={(event) => event.preventDefault()}
      >
        Pinned
      </ToggleButton>
    </>,
  );
  host.querySelectorAll('button').forEach((button) => button.click());
  expect(change).not.toHaveBeenCalled();
  expect(
    host.querySelector('[aria-pressed]')?.getAttribute('aria-pressed'),
  ).toBe('true');
});
it('bounds numeric changes and provides a read-only stepper state', () => {
  const change = vi.fn();
  const host = mount(
    <NumberStepper
      label="Quantity"
      value={9}
      min={0}
      max={10}
      step={3}
      decreaseLabel="Less"
      increaseLabel="More"
      onChange={change}
    />,
  );
  host.querySelector<HTMLButtonElement>('[aria-label="More"]')!.click();
  expect(change).toHaveBeenLastCalledWith(10);
  act(() =>
    render(
      <NumberStepper
        label="Quantity"
        value={9}
        readOnly
        decreaseLabel="Less"
        increaseLabel="More"
        onChange={change}
      />,
      host,
    ),
  );
  expect(host.querySelector('input')?.readOnly).toBe(true);
  expect(
    [...host.querySelectorAll('button')].every((button) => button.disabled),
  ).toBe(true);
});
it('isolates unnamed radio groups across independent instances', () => {
  const props = {
    label: 'Choice',
    value: 'a',
    options: [
      { value: 'a', label: 'A' },
      { value: 'b', label: 'B' },
    ],
    onChange: vi.fn(),
  };
  const first = mount(<RadioGroup {...props} />),
    second = mount(<RadioGroup {...props} />);
  expect(first.querySelector('input')?.name).not.toBe(
    second.querySelector('input')?.name,
  );
});
it('connects tab and panel semantics and leaves native dates in caller-owned representation', () => {
  const host = mount(
    <>
      <Tabs
        value="a"
        options={[
          {
            value: 'a',
            label: 'Details',
            id: 'details',
            ariaControls: 'panel',
          },
        ]}
        onChange={() => {}}
      />
      <TabPanel id="panel" labelledBy="details" active>
        Content
      </TabPanel>
      <DateInput value="2026-10-24" />
      <DateTimeInput value="2026-10-24T10:30" />
    </>,
  );
  expect(
    host.querySelector('[role="tab"]')?.getAttribute('aria-controls'),
  ).toBe('panel');
  expect(
    host.querySelector('[role="tabpanel"]')?.getAttribute('aria-labelledby'),
  ).toBe('details');
  expect(
    host.querySelector<HTMLInputElement>('input[type="date"]')?.value,
  ).toBe('2026-10-24');
});
it('selects an ordered range through two calendar clicks', () => {
  const change = vi.fn();
  const host = mount(
    <DateRangePicker
      value={{ from: '2026-10-20', to: '2026-10-24' }}
      onChange={change}
      label="Dates"
      fromLabel="From"
      toLabel="To"
      openLabel="Choose range"
    />,
  );
  act(() =>
    host
      .querySelector<HTMLButtonElement>('[aria-label="Choose range"]')!
      .click(),
  );
  const days = [
    ...document.querySelectorAll<HTMLButtonElement>(
      '.revo-calendar__day:not(:disabled)',
    ),
  ].filter((day) => !day.classList.contains('outside'));
  act(() => days.find((day) => day.textContent === '24')!.click());
  act(() => days.find((day) => day.textContent === '20')!.click());
  expect(change).toHaveBeenLastCalledWith({
    from: '2026-10-20',
    to: '2026-10-24',
  });
});

it('keeps a controlled popover hidden after native teardown restores its parent', () => {
  const anchor = document.createElement('button');
  document.body.append(anchor);
  const host = mount(
    <Popover open anchor={anchor} onClose={() => {}}>
      Content
    </Popover>,
  );
  const popup = document.querySelector<HTMLElement>('.rv-popover')!;
  expect(popup.hidden).toBe(false);
  act(() =>
    render(
      <Popover open={false} anchor={anchor} onClose={() => {}}>
        Content
      </Popover>,
      host,
    ),
  );
  expect(popup.parentElement).toBe(host);
  expect(popup.hidden).toBe(true);
});

it('uses shared menu navigation and restores the popup trigger on Escape', () => {
  const anchor = document.createElement('button');
  document.body.append(anchor);
  const close = vi.fn();
  const host = mount(
    <Popover open anchor={anchor} role="menu" label="Actions" onClose={close}>
      <MenuItem>Restore cell</MenuItem>
      <MenuItem disabled>Unavailable</MenuItem>
      <MenuItem>Restore row</MenuItem>
    </Popover>,
  );
  const popup = document.querySelector<HTMLElement>('.rv-popover.rv-menu')!;
  const items = popup.querySelectorAll<HTMLButtonElement>('[role="menuitem"]');
  expect(popup.getAttribute('aria-label')).toBe('Actions');
  expect(popup.style.display).toBe('grid');
  items[0].focus();
  act(() => {
    items[0].dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }),
    );
  });
  expect(document.activeElement).toBe(items[2]);
  act(() => {
    items[2].dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Home', bubbles: true }),
    );
  });
  expect(document.activeElement).toBe(items[0]);
  act(() => {
    items[0].dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
    );
  });
  expect(close).toHaveBeenCalledOnce();
  expect(document.activeElement).toBe(anchor);
  expect(popup.parentElement).toBe(host);
});

it('keeps icon commands named, counted and disabled with decorative SVG and tooltip', () => {
  const action = vi.fn();
  const host = mount(
    <IconButton
      label="Undo"
      icon='<svg viewBox="0 0 16 16"><path d="M1 1h5" /></svg>'
      badge={4}
      onClick={action}
    />,
  );
  const button = host.querySelector('button')!;
  expect(button.getAttribute('aria-label')).toBe('Undo 4');
  expect(button.hasAttribute('aria-description')).toBe(false);
  expect(button.querySelector('.rv-badge')?.textContent).toBe('4');
  expect(button.querySelector('.rv-control-tooltip')?.textContent).toBe('Undo');
  button.click();
  expect(action).toHaveBeenCalledTimes(1);
  act(() =>
    render(
      <IconButton label="Undo" badge={0} disabled onClick={action} />,
      host,
    ),
  );
  button.click();
  expect(action).toHaveBeenCalledTimes(1);
});

it('blocks busy button actions and restores the original state when cleared', () => {
  const clicked = vi.fn(),
    changed = vi.fn(),
    keyed = vi.fn();
  const view = (busy: boolean) => (
    <>
      <Button type="submit" busy={busy} onClick={clicked} onKeyDown={keyed}>
        Save
      </Button>
      <IconButton label="Sync" busy={busy} onClick={clicked} />
      <ToggleButton pressed busy={busy} onPressedChange={changed}>
        Pinned
      </ToggleButton>
      <Button busy={busy} disabled>
        Unavailable
      </Button>
    </>
  );
  const host = mount(view(true));
  const buttons = [...host.querySelectorAll('button')];
  for (const button of buttons) {
    expect(button.disabled).toBe(true);
    expect(button.getAttribute('aria-busy')).toBe('true');
    expect(
      button.querySelector('.rv-button-spinner')?.getAttribute('aria-hidden'),
    ).toBe('true');
    expect(button.hasAttribute('busy')).toBe(false);
    button.click();
    button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    button.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }),
    );
  }
  expect(buttons[0].textContent).toBe('Save');
  expect(buttons[1].getAttribute('aria-label')).toBe('Sync');
  expect(clicked).not.toHaveBeenCalled();
  expect(changed).not.toHaveBeenCalled();
  expect(keyed).not.toHaveBeenCalled();
  act(() => render(view(false), host));
  expect(host.querySelectorAll('.rv-button-spinner')).toHaveLength(0);
  expect(buttons[0].hasAttribute('aria-busy')).toBe(false);
  expect(buttons[0].disabled).toBe(false);
  expect(buttons[3].disabled).toBe(true);
  act(() => buttons[0].click());
  act(() => buttons[2].click());
  expect(clicked).toHaveBeenCalledOnce();
  expect(changed).toHaveBeenCalledWith(false);
});

it('renders rounded buttons without leaking the prop to HTML', () => {
  render(<Button rounded>Rounded</Button>, document.body);
  const button = document.body.querySelector('button')!;
  expect(button.classList.contains('rv-btn-rounded')).toBe(true);
  expect(button.hasAttribute('rounded')).toBe(false);
});
