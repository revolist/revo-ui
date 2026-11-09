// @vitest-environment happy-dom
/** @jsxRuntime automatic */
/** @jsxImportSource preact */
import { render } from 'preact';
import { act } from 'preact/test-utils';
import { afterEach, expect, it, vi } from 'vitest';
import { Select } from './select';
import { FormField } from './form-controls/presentation';
import {
  chooseDropdownValue,
  dropdownOptions,
  chooseDropdownValueSync,
} from '../tests/helpers/dropdown.mjs';

afterEach(() => {
  act(() => render(null, document.body));
  document.body.replaceChildren();
});

it('uses option descriptors without native selects and preserves controlled values and disabled choices', async () => {
  const change = vi.fn();
  act(() =>
    render(
      <Select aria-label="Status" value="a" onValueChange={change}>
        <option value="a">Alpha</option>
        <option value="b">Beta</option>
        <option value="c" disabled>
          Unavailable
        </option>
      </Select>,
      document.body,
    ),
  );
  const trigger = document.querySelector<HTMLElement>('[role=combobox]')!;
  expect(document.querySelector('select, option')).toBeNull();
  const focus = vi.spyOn(trigger, 'focus');
  await chooseDropdownValue(trigger, 'b');
  await vi.waitFor(() =>
    expect(focus).toHaveBeenCalledWith({ preventScroll: true }),
  );
  expect(change).toHaveBeenCalledWith('b');
  expect(trigger.textContent).toContain('Alpha');
  const options = await dropdownOptions(trigger);
  expect(options[2].getAttribute('aria-disabled')).toBe('true');
  act(() => options[2].click());
  expect(change).toHaveBeenCalledTimes(1);
});

it('supports multiple values and submits one raw form value per selection', async () => {
  const change = vi.fn();
  act(() =>
    render(
      <form>
        <Select
          multiple
          name="choice"
          defaultValue={['a']}
          onValueChange={change}
          aria-label="Choices"
        >
          <option value="a">Alpha</option>
          <option value="b">Beta</option>
        </Select>
      </form>,
      document.body,
    ),
  );
  await chooseDropdownValue(
    document.querySelector<HTMLElement>('[role=combobox]')!,
    'b',
  );
  expect(change).toHaveBeenCalledWith(['a', 'b']);
  expect(
    new FormData(document.querySelector('form')!).getAll('choice'),
  ).toEqual(['a', 'b']);
});

it('inherits field labels through opaque editor components and keeps descriptions', () => {
  const Editor = () => (
    <Select value="a">
      <option value="a">Alpha</option>
    </Select>
  );
  act(() =>
    render(
      <FormField label="Priority" hint="Choose a priority">
        <Editor />
      </FormField>,
      document.body,
    ),
  );
  const trigger = document.querySelector('[role=combobox]')!;
  expect(
    document.getElementById(trigger.getAttribute('aria-labelledby')!)
      ?.textContent,
  ).toBe('Priority');
  expect(
    document.getElementById(trigger.getAttribute('aria-describedby')!)
      ?.textContent,
  ).toBe('Choose a priority');
});

it('retains authored hidden values while applying domain option policy', async () => {
  act(() =>
    render(
      <Select
        aria-label="Totals"
        value="grand"
        optionPolicy={(option) => ({
          ...option,
          hidden: option.value === 'grand',
          disabled: option.value === 'grand',
        })}
      >
        <option value="none">None</option>
        <option value="grand">Grand total</option>
        <option value="other" hidden>
          Other
        </option>
      </Select>,
      document.body,
    ),
  );
  const trigger = document.querySelector<HTMLElement>('[role=combobox]')!;
  expect(trigger.textContent).toContain('Grand total');
  const options = await dropdownOptions(trigger);
  expect(options).toHaveLength(2);
  expect(options[1].getAttribute('aria-disabled')).toBe('true');
});

it('supports synchronous option interaction for DOM integration tests', () => {
  const change = vi.fn();
  act(() =>
    render(
      <Select value="a" onValueChange={change}>
        <option value="a">A</option>
        <option value="b">B</option>
      </Select>,
      document.body,
    ),
  );
  chooseDropdownValueSync(
    document.querySelector<HTMLElement>('[role=combobox]')!,
    'b',
  );
  expect(change).toHaveBeenCalledWith('b');
});

it('passes host pointer-release integration through the portalled options', async () => {
  const release = vi.fn();
  act(() =>
    render(
      <Select aria-label="Scope" environment={{ onPointerRelease: release }}>
        <option value="all">All</option>
        <option value="row">Row</option>
      </Select>,
      document.body,
    ),
  );
  const trigger = document.querySelector<HTMLElement>('[role=combobox]')!;
  const options = await dropdownOptions(trigger);
  act(() =>
    options[1].dispatchEvent(
      new MouseEvent('mouseup', { bubbles: true, cancelable: true }),
    ),
  );
  expect(release).toHaveBeenCalledOnce();
});
