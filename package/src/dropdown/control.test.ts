// @vitest-environment happy-dom
import { afterEach, expect, it, vi } from 'vitest';
import { createDropdownControl, renderDropdownControl } from './control';
import {
  chooseDropdownOption,
  dropdownOptions,
} from '../../../tests/helpers/dropdown.mjs';

const controls: ReturnType<typeof createDropdownControl>[] = [];
const renderedRefs: Array<(host: HTMLElement | null) => void> = [];
afterEach(() => {
  renderedRefs.splice(0).forEach((ref) => ref(null));
  controls.splice(0).forEach((control) => control.destroy());
  document.body.replaceChildren();
});

it('owns DOM selection, raw form values, disabled options and teardown', async () => {
  const changed = vi.fn();
  const control = createDropdownControl(document, {
    source: [
      { value: 'a', label: 'Alpha' },
      { value: 'b', label: 'Beta' },
      { value: 'c', label: 'Unavailable', disabled: true },
    ],
    value: 'a',
    name: 'choice',
    config: { ariaLabel: 'Choice' },
    onChange: changed,
  });
  controls.push(control);
  const form = document.createElement('form');
  form.append(control.element);
  document.body.append(form);
  const trigger =
    control.element.querySelector<HTMLElement>('[role=combobox]')!;
  expect(form.querySelector('select')).toBeNull();
  expect(new FormData(form).get('choice')).toBe('a');
  await chooseDropdownOption(trigger, 'Beta');
  expect(control.value).toBe('b');
  expect(changed).toHaveBeenCalledWith('b');
  expect(new FormData(form).get('choice')).toBe('b');
  const options = await dropdownOptions(trigger);
  options[2].click();
  expect(control.value).toBe('b');
  control.destroy();
  expect(document.querySelector('[role=listbox]')).toBeNull();
});

it('updates stored choices without emitting changes and omits disabled form fields', () => {
  const changed = vi.fn();
  const control = createDropdownControl(document, {
    source: [{ value: 'a', label: 'Alpha' }],
    value: 'a',
    name: 'choice',
    onChange: changed,
  });
  controls.push(control);
  const form = document.createElement('form');
  form.append(control.element);
  document.body.append(form);
  control.update({
    source: [{ value: 'b', label: 'Beta' }],
    value: 'b',
    disabled: true,
  });
  expect(control.value).toBe('b');
  expect(control.element.textContent).toContain('Beta');
  expect(new FormData(form).has('choice')).toBe(false);
  expect(changed).not.toHaveBeenCalled();
});

function renderRef(props: Parameters<typeof createDropdownControl>[1]) {
  const ref = renderDropdownControl(
    (_tag, attributes) =>
      attributes as {
        ref(host: HTMLElement | null): void;
      },
    props,
  ).ref;
  renderedRefs.push(ref);
  return ref;
}

it('reuses a VNode host across new refs and ignores delayed cleanup from its previous owner', async () => {
  const firstChanged = vi.fn();
  const nextChanged = vi.fn();
  const source = [
    { value: 'a', label: 'Alpha' },
    { value: 'b', label: 'Beta' },
  ];
  const host = document.createElement('span');
  document.body.append(host);
  const first = renderRef({
    source,
    value: 'a',
    config: { ariaLabel: 'First choice' },
    onChange: firstChanged,
  });
  first(host);
  const element = host.firstElementChild;
  const next = renderRef({
    source,
    value: 'b',
    config: { ariaLabel: 'Updated choice' },
    onChange: nextChanged,
  });
  next(host);
  expect(host.querySelectorAll('[role=combobox]')).toHaveLength(1);
  expect(host.firstElementChild).toBe(element);
  expect(
    host.querySelector('[role=combobox]')?.getAttribute('aria-label'),
  ).toBe('Updated choice');
  expect(host.textContent).toContain('Beta');
  first(null);
  expect(host.querySelectorAll('[role=combobox]')).toHaveLength(1);
  await chooseDropdownOption(
    host.querySelector<HTMLElement>('[role=combobox]')!,
    'Alpha',
  );
  expect(nextChanged).toHaveBeenCalledWith('a');
  expect(firstChanged).not.toHaveBeenCalled();
  next(null);
  next(null);
  expect(host.childElementCount).toBe(0);
  expect(document.querySelector('[role=listbox]')).toBeNull();
});

it('clears removed VNode props and releases the old host when its current ref moves', async () => {
  const changed = vi.fn();
  const source = [
    { value: 'a', label: 'Alpha' },
    { value: 'b', label: 'Beta' },
  ];
  const firstHost = document.createElement('span');
  const secondHost = document.createElement('span');
  document.body.append(firstHost, secondHost);
  const previous = renderRef({
    source,
    value: 'a',
    name: 'choice',
    disabled: true,
    onChange: changed,
  });
  previous(firstHost);
  const current = renderRef({ source, value: 'b' });
  current(firstHost);
  expect(firstHost.querySelectorAll('[role=combobox]')).toHaveLength(1);
  const trigger = firstHost.querySelector<HTMLElement>('[role=combobox]')!;
  expect(trigger.getAttribute('aria-disabled')).toBe('false');
  expect(
    firstHost.querySelector<HTMLInputElement>('input[type=hidden]')?.disabled,
  ).toBe(true);
  await chooseDropdownOption(trigger, 'Alpha');
  expect(changed).not.toHaveBeenCalled();
  current(secondHost);
  expect(firstHost.childElementCount).toBe(0);
  expect(secondHost.querySelectorAll('[role=combobox]')).toHaveLength(1);
  previous(null);
  expect(secondHost.querySelectorAll('[role=combobox]')).toHaveLength(1);
  current(null);
  expect(secondHost.childElementCount).toBe(0);
});
