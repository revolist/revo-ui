import { chooseDropdownOption } from '../../tests/helpers/dropdown.mjs';
import { h, render } from 'preact';
import { act } from 'preact/test-utils';
import { afterEach, expect, it, vi } from 'vitest';
import {
  controlAttributes,
  createControl,
  nativeControlTag,
  renderControl,
} from './control-presentation';
import { Input, ButtonControl } from './native-control';
import { TextInput } from './controls';
import { renderCounter } from './native-controls';
import { PaginationPanel } from './pagination';
import { FormField } from './form-controls/presentation';

const host = document.createElement('div');
afterEach(() => {
  act(() => render(null, host));
  host.remove();
});
it('keeps factory VNodes, class maps and callbacks native to the supplied renderer', () => {
  const callback = vi.fn();
  const factory = vi.fn((tag, props, ...children) => ({
    $tag$: tag,
    $attrs$: props,
    $children$: children,
  }));
  const node = renderControl(
    factory,
    'button',
    {
      class: { selected: true, hidden: false },
      className: 'selected local',
      onClick: callback,
    },
    'Save',
  );
  expect(node.$tag$).toBe('button');
  expect(node.$attrs$).toMatchObject({
    type: 'button',
    class: 'rv-btn selected local',
    onClick: callback,
  });
  node.$attrs$.onClick();
  expect(callback).toHaveBeenCalledOnce();
});
it('creates native checkboxes and preserves false ARIA values and native disabling', () => {
  const input = createControl(document, 'input', {
    type: 'checkbox',
    disabled: true,
    'aria-invalid': false,
  });
  expect(input.className).toBe('rv-checkbox');
  expect(input.disabled).toBe(true);
  expect(input.getAttribute('aria-invalid')).toBe('false');
  expect(controlAttributes('button', { type: 'submit' }).type).toBe('submit');
});
it('forwards actual element refs and input events through Preact adapters', () => {
  const ref = vi.fn(),
    onInput = vi.fn();
  document.body.append(host);
  act(() =>
    render(
      <>
        <Input ref={ref} onInput={onInput} class={{ local: true }} />
        <ButtonControl disabled>Save</ButtonControl>
      </>,
      host,
    ),
  );
  const input = host.querySelector('input')!;
  expect(ref).toHaveBeenCalledWith(input);
  expect(input.classList.contains('rv-control')).toBe(true);
  act(() => input.dispatchEvent(new Event('input', { bubbles: true })));
  expect(onInput.mock.calls[0][0].target).toBe(input);
  expect(host.querySelector('button')!.disabled).toBe(true);
  act(() => render(null, host));
  expect(ref).toHaveBeenLastCalledWith(null);
});
it('associates hints through shared native and composed input adapters', () => {
  act(() =>
    render(
      <FormField label="Project" hint="Use a short name" hintId="project-hint">
        <TextInput />
      </FormField>,
      host,
    ),
  );
  expect(host.querySelector('input')!.getAttribute('aria-describedby')).toBe(
    'project-hint',
  );
  expect(nativeControlTag(TextInput)).toBe('input');
  expect(nativeControlTag(Input)).toBe('input');
});
it('keeps native commit changes separate from live input even with compat loaded', () => {
  const live = vi.fn(),
    commit = vi.fn();
  act(() =>
    render(<Input type="number" onInput={live} onChange={commit} />, host),
  );
  const input = host.querySelector('input')!;
  act(() => input.dispatchEvent(new Event('input', { bubbles: true })));
  expect(live).toHaveBeenCalledOnce();
  expect(commit).not.toHaveBeenCalled();
  act(() => input.dispatchEvent(new Event('change', { bubbles: true })));
  expect(commit).toHaveBeenCalledOnce();
});
it('renders legacy counter classes correctly through the Preact factory', () => {
  const onChange = vi.fn();
  act(() =>
    render(
      renderCounter(h, { value: 0, min: 0, max: 2, step: 1, onChange }),
      host,
    ),
  );
  const buttons = host.querySelectorAll<HTMLButtonElement>(
    '.revo-counter-button',
  );
  expect(buttons).toHaveLength(2);
  expect(buttons[0].disabled).toBe(true);
  buttons[1].click();
  expect(onChange).toHaveBeenCalledWith(1, expect.any(MouseEvent));
});
it('keeps shared dropdown page values through the Preact factory', async () => {
  const change = vi.fn();
  const panel = new PaginationPanel(
    { itemsPerPage: 10, initialPage: 0, total: 50 },
    change,
    h,
  );
  act(() => render(panel.render(), host));
  const select = host.querySelector<HTMLElement>('[role=combobox]')!;
  await chooseDropdownOption(select, '2');
  expect(change).toHaveBeenCalledWith(1);
});
it('allows component-owned button surfaces without command styling or leaking the option to DOM', () => {
  expect(
    controlAttributes('button', { unstyled: true, class: 'track-handle' }),
  ).toEqual({ type: 'button', class: 'track-handle' });
  const click = vi.fn();
  act(() =>
    render(
      <ButtonControl unstyled class="track-handle" onClick={click}>
        Move
      </ButtonControl>,
      host,
    ),
  );
  const button = host.querySelector('button')!;
  expect(button.className).toBe('track-handle');
  expect(button.hasAttribute('unstyled')).toBe(false);
  button.click();
  expect(click).toHaveBeenCalledOnce();
});

it('renders busy state through the native factory without leaking busy attributes', () => {
  const click = vi.fn();
  const button = createControl(document, 'button', {
    busy: true,
    children: 'Save',
    onClick: click,
  });
  expect(button.disabled).toBe(true);
  expect(button.getAttribute('aria-busy')).toBe('true');
  expect(button.textContent).toBe('Save');
  expect(button.querySelector('.rv-button-spinner')).toBeTruthy();
  expect(button.hasAttribute('busy')).toBe(false);
  button.click();
  expect(click).not.toHaveBeenCalled();
});
