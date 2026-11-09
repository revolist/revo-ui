import { act } from 'preact/test-utils';
// @vitest-environment happy-dom
import { afterEach, expect, it, vi } from 'vitest';
import { mountColorPicker, mountDialogActionFooter } from './native';
afterEach(() => document.body.replaceChildren());
it('mounts and disposes shared color and footer controls in DOM-owned surfaces', () => {
  const host = document.body.appendChild(document.createElement('div'));
  const onChange = vi.fn();
  const picker = mountColorPicker(host, {
    label: 'Color',
    value: '#000000',
    optional: false,
    defaultLabel: 'Automatic',
    customLabel: 'Custom color',
    colorLabels: { '#e53935': 'Red' },
    onChange,
  });
  expect(host.querySelector('.rv-format-color-picker')).not.toBeNull();
  const red = host.querySelector<HTMLButtonElement>('[aria-label="Red"]')!;
  expect(red.style.getPropertyValue('--rv-color-palette-color')).toBe(
    '#e53935',
  );
  act(() => red.click());
  expect(onChange).toHaveBeenCalledWith('#e53935');
  expect(
    host.querySelector('.rv-format-color-picker__trigger-value')?.textContent,
  ).toBe('#E53935');
  picker.destroy();
  picker.destroy();
  expect(host.childNodes).toHaveLength(0);
  const save = vi.fn();
  const footer = mountDialogActionFooter(host, { save: { onClick: save } });
  expect(
    host
      .querySelector('[data-dialog-action="save"]')
      ?.classList.contains('rv-btn-primary'),
  ).toBe(true);
  host.querySelector<HTMLButtonElement>('[data-dialog-action="save"]')!.click();
  expect(save).toHaveBeenCalledTimes(1);
  footer.destroy();
  expect(host.childNodes).toHaveLength(0);
});

it('validates custom colors, keeps disabled choices inert and releases popup listeners', () => {
  const host = document.body.appendChild(document.createElement('div'));
  const onChange = vi.fn();
  const picker = mountColorPicker(host, {
    label: 'Color',
    value: '#000000',
    optional: false,
    defaultLabel: 'Automatic',
    customLabel: 'Custom color',
    invalidColor: 'Invalid color',
    colorLabels: {},
    onChange,
  });
  act(() =>
    host
      .querySelector<HTMLButtonElement>('.rv-format-color-picker__trigger')!
      .click(),
  );
  act(() =>
    host
      .querySelector<HTMLButtonElement>(
        '.rv-format-color-picker__custom-action',
      )!
      .click(),
  );
  const input = host.querySelector<HTMLInputElement>('input[type=text]')!;
  input.value = 'bad';
  act(() => input.dispatchEvent(new Event('change')));
  expect(input.getAttribute('aria-invalid')).toBe('true');
  expect(onChange).not.toHaveBeenCalled();
  input.value = '#abc';
  act(() => input.dispatchEvent(new Event('change')));
  expect(onChange).toHaveBeenCalledWith('#aabbcc');
  picker.destroy();
  const disabled = mountColorPicker(host, {
    label: 'Color',
    disabled: true,
    value: '#000000',
    defaultLabel: 'Automatic',
    customLabel: 'Custom color',
    colorLabels: {},
    onChange,
  });
  host
    .querySelector<HTMLButtonElement>('[data-rv-color-palette-value]')!
    .click();
  expect(onChange).toHaveBeenCalledTimes(1);
  disabled.destroy();
  expect(host.childNodes).toHaveLength(0);
});
