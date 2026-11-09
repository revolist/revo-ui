import { flushSync } from 'preact/compat';
import { act } from 'preact/test-utils';
import { vi } from 'vitest';
export async function dropdownOptions(trigger) {
  if (trigger.getAttribute('aria-expanded') !== 'true')
    await act(async () => {
      trigger.click();
    });
  let list = null;
  await vi.waitFor(() => {
    list = trigger.ownerDocument.getElementById(
      trigger.getAttribute('aria-controls') ?? '',
    );
    if (!list) throw new Error('Dropdown listbox is not mounted');
  });
  return [...list.querySelectorAll('[role=option]')];
}
export async function chooseDropdownOption(trigger, label) {
  const options = await dropdownOptions(trigger);
  const option = options.find((option) => option.textContent?.trim() === label);
  if (!option) throw new Error(`Missing dropdown option: ${label}`);
  await act(async () => {
    option.click();
  });
}
export async function chooseDropdownValue(trigger, value) {
  const options = await dropdownOptions(trigger);
  const option = options.find(
    (option) =>
      (option.getAttribute('data-value') ??
        option
          .querySelector('[data-select-option]')
          ?.getAttribute('data-select-option')) === value,
  );
  if (!option) throw new Error(`Missing dropdown value: ${value}`);
  await act(async () => option.click());
}
export async function dropdownOptionData(trigger) {
  return (await dropdownOptions(trigger)).map((option) => {
    const label = option.textContent?.trim() ?? '';
    return {
      value:
        option.getAttribute('data-value') ??
        option
          .querySelector('[data-select-option]')
          ?.getAttribute('data-select-option') ??
        '',
      label,
      text: label,
      textContent: label,
      disabled: option.getAttribute('aria-disabled') === 'true',
      selected: option.getAttribute('aria-selected') === 'true',
    };
  });
}
export function dropdownOptionDataSync(element) {
  const trigger = element.matches('[role=combobox]')
    ? element
    : element.querySelector('[role=combobox]');
  if (trigger.getAttribute('aria-expanded') !== 'true')
    flushSync(() => trigger.click());
  const listId = trigger.getAttribute('aria-controls') ?? '';
  const list =
    trigger.ownerDocument.getElementById(listId) ??
    trigger.getRootNode().querySelector(`[id="${listId}"]`);
  if (!list) throw new Error('Dropdown listbox is not mounted');
  return [...list.querySelectorAll('[role=option]')].map((option) => ({
    element: option,
    value: option.getAttribute('data-value') ?? '',
    text: option.textContent?.trim() ?? '',
    textContent: option.textContent?.trim() ?? '',
    disabled: option.getAttribute('aria-disabled') === 'true',
    selected: option.getAttribute('aria-selected') === 'true',
    hidden: false,
  }));
}
export function chooseDropdownValueSync(element, value) {
  const trigger = element.matches('[role=combobox]')
    ? element
    : element.querySelector('[role=combobox]');
  if (trigger.getAttribute('aria-disabled') === 'true') {
    trigger.click();
    return;
  }
  const option = dropdownOptionDataSync(element).find(
    (option) => option.value === value,
  );
  if (!option) throw new Error(`Missing dropdown value: ${value}`);
  flushSync(() => option.element.click());
}
export function changeControl(element, value, eventType) {
  if (element.getAttribute('role') === 'combobox') {
    chooseDropdownValueSync(element, String(value));
    return;
  }
  const input = element;
  act(() => {
    if (typeof value === 'boolean') input.checked = value;
    else input.value = value;
    input.dispatchEvent(
      new Event(
        eventType ?? (typeof value === 'boolean' ? 'change' : 'input'),
        { bubbles: true },
      ),
    );
  });
}
export function setControlValue(element, value) {
  if (element.getAttribute('role') === 'combobox') {
    chooseDropdownValueSync(element, String(value));
    return;
  }
  if (typeof value === 'boolean') element.checked = value;
  else element.value = String(value);
}
