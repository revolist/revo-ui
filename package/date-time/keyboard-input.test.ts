import { afterEach, expect, it } from 'vitest';
import {
  attachDateInputMask,
  parseTemporalInput,
  formatTemporalInput,
} from './keyboard-input';
const options = { inputMask: 'YYYY-MM-DD' as const };
let dispose = () => {};
afterEach(() => {
  dispose();
  document.body.replaceChildren();
});
function mount(value = '2026-10-12') {
  const input = document.createElement('input');
  input.value = value;
  document.body.append(input);
  dispose = attachDateInputMask(input, options);
  input.focus();
  input.select();
  return input;
}
function edit(
  input: HTMLInputElement,
  data: string | null,
  inputType = 'insertText',
) {
  input.dispatchEvent(
    new InputEvent('beforeinput', {
      bubbles: true,
      cancelable: true,
      inputType,
      data,
    }),
  );
}
it('formats compact digits, preserves caret and supports fixed-slot deletion and undo', () => {
  const input = mount();
  edit(input, '20261111');
  expect(input.value).toBe('2026-11-11');
  expect(input.selectionStart).toBe(10);
  edit(input, null, 'deleteContentBackward');
  expect(input.value).toBe('2026-11-1_');
  expect(
    parseTemporalInput(input.value, { dateInput: options }).error,
  ).toBeTruthy();
  input.dispatchEvent(
    new KeyboardEvent('keydown', {
      key: 'z',
      ctrlKey: true,
      bubbles: true,
      cancelable: true,
    }),
  );
  expect(input.value).toBe('2026-11-11');
  input.select();
  edit(input, null, 'deleteContentBackward');
  expect(parseTemporalInput(input.value, { dateInput: options })).toEqual({
    value: null,
  });
});
it('handles paste and leaves readonly inputs and disposed controls alone', () => {
  const input = mount();
  const paste = new Event('paste', { bubbles: true, cancelable: true });
  Object.defineProperty(paste, 'clipboardData', {
    value: { getData: () => '20261111' },
  });
  input.dispatchEvent(paste);
  expect(input.value).toBe('2026-11-11');
  input.readOnly = true;
  input.select();
  edit(input, '20260101');
  expect(input.value).toBe('2026-11-11');
  input.readOnly = false;
  dispose();
  edit(input, '20260101');
  expect(input.value).toBe('2026-11-11');
});
it('shares bounds, disabled-day and translated validation with the calendar', () => {
  const config = {
    dateInput: options,
    required: true,
    calendar: {
      minDate: '2026-11-01',
      maxDate: '2026-11-30',
      isDateDisabled: (d: string) => d === '2026-11-13',
    },
    text: { invalid: 'Ungültiges Datum' },
  };
  for (const value of [
    '',
    '2026-02-30',
    '2026-10-31',
    '2026-11-13',
    '2026-11-__',
  ]) {
    expect(parseTemporalInput(value, config)).toEqual({
      error: 'Ungültiges Datum',
    });
  }
  expect(parseTemporalInput('2026-11-11', config)).toEqual({
    value: '2026-11-11',
  });
});
it('retains localized/custom formats and validates time and datetime', () => {
  const options = { dateInput: { format: 'eu' as const } };
  expect(parseTemporalInput('11/11/2026', options)).toEqual({
    value: '2026-11-11',
  });
  expect(formatTemporalInput('2026-11-11', options)).toBe('11/11/2026');
  expect(
    parseTemporalInput('launch', { dateInput: { parse: () => '2026-11-11' } }),
  ).toEqual({ value: '2026-11-11' });
  expect(parseTemporalInput('25:00', { kind: 'time' }).error).toBeTruthy();
  expect(parseTemporalInput('2026-11-11T09:30', { kind: 'datetime' })).toEqual({
    value: '2026-11-11T09:30',
  });
});

it('inherits the calendar locale for ambiguous inline dates and formatting', () => {
  const options = {
    calendar: { locale: 'de-DE' },
    dateInput: { format: 'locale' as const },
  };
  expect(parseTemporalInput('11/12/2026', options)).toEqual({
    value: '2026-12-11',
  });
  expect(formatTemporalInput('2026-12-11', options)).toBe('11.12.2026');
});

it('lets an explicit date-input locale override the calendar locale', () => {
  const options = {
    calendar: { locale: 'de-DE' },
    dateInput: { format: 'locale' as const, locale: 'en-US' },
  };
  expect(parseTemporalInput('11/12/2026', options)).toEqual({
    value: '2026-11-12',
  });
  expect(formatTemporalInput('2026-11-12', options)).toBe('11/12/2026');
});
