// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest';
import {
  applyMaskedEdit,
  editMaskedInput,
  formatMaskedDraft,
  handleMaskedHistory,
  parseMaskedDraft,
} from './edit';

const dots = { mask: '00.00.00' };
const edit = (
  value: string,
  start: number,
  end: number,
  inputType: string,
  data: string | null,
  options = dots,
) => editMaskedInput(value, start, end, inputType, data, options);

describe('fixed-slot masked drafts', () => {
  it('shows the complete template for empty and partial drafts', () => {
    expect(formatMaskedDraft('', dots)).toBe('__.__.__');
    expect(formatMaskedDraft('12', dots)).toBe('12.__.__');
    expect(formatMaskedDraft('1234', dots)).toBe('12.34.__');
    expect(formatMaskedDraft('12.3', dots)).toBe('12.3_.__');
    expect(formatMaskedDraft('12x', dots)).toBe('12x');
    expect(formatMaskedDraft('123', { mask: '00\\' })).toBe('123');
  });

  it('fills slots sequentially and skips fixed dots', () => {
    let value = '__.__.__',
      caret = 0;
    for (const [data, expected, position] of [
      ['1', '1_.__.__', 1],
      ['2', '12.__.__', 3],
      ['3', '12.3_.__', 4],
      ['4', '12.34.__', 6],
      ['5', '12.34.5_', 7],
      ['6', '12.34.56', 8],
    ] as const) {
      const result = edit(value, caret, caret, 'insertText', data);
      expect(result).toEqual({
        value: expected,
        caret: position,
        accepted: true,
      });
      ({ value, caret } = result);
    }
  });

  it('overwrites occupied slots without shifting subsequent characters', () => {
    expect(edit('12.34.56', 1, 1, 'insertText', '9')).toEqual({
      value: '19.34.56',
      caret: 3,
      accepted: true,
    });
    expect(
      edit('AB-1234', 0, 0, 'insertText', 'C', { mask: 'AA-0000' }),
    ).toEqual({ value: 'CB-1234', caret: 1, accepted: true });
  });

  it('backspace and delete clear slots across literals while preserving position', () => {
    expect(edit('12.34.56', 3, 3, 'deleteContentBackward', null)).toEqual({
      value: '1_.34.56',
      caret: 1,
      accepted: true,
    });
    expect(edit('12.34.56', 2, 2, 'deleteContentForward', null)).toEqual({
      value: '12._4.56',
      caret: 3,
      accepted: true,
    });
    expect(
      edit('AB-1234', 1, 1, 'deleteContentBackward', null, { mask: 'AA-0000' }),
    ).toEqual({ value: '_B-1234', caret: 0, accepted: true });
    expect(
      edit('AB-1234', 1, 1, 'deleteContentForward', null, { mask: 'AA-0000' }),
    ).toEqual({ value: 'A_-1234', caret: 1, accepted: true });
  });

  it('clears only selected slots and inserts into the first selected position', () => {
    expect(edit('12.34.56', 1, 4, 'insertText', '9')).toEqual({
      value: '19._4.56',
      caret: 3,
      accepted: true,
    });
    expect(edit('12.34.56', 1, 4, 'deleteByCut', null)).toEqual({
      value: '1_._4.56',
      caret: 1,
      accepted: true,
    });
    expect(edit('12.34.56', 2, 3, 'deleteByCut', null)).toEqual({
      value: '12.34.56',
      caret: 3,
      accepted: true,
    });
    expect(edit('12.34.56', 0, 8, 'deleteByCut', null)).toEqual({
      value: '__.__.__',
      caret: 0,
      accepted: true,
    });
  });

  it('accepts raw or formatted paste and preserves unselected slots', () => {
    for (const pasted of ['123456', '12.34.56'])
      expect(edit('__.__.__', 0, 0, 'insertFromPaste', pasted)).toEqual({
        value: '12.34.56',
        caret: 8,
        accepted: true,
      });
    expect(edit('98.76.54', 0, 8, 'insertFromPaste', '1234')).toEqual({
      value: '12.34.__',
      caret: 6,
      accepted: true,
    });
    expect(edit('98.76.54', 3, 3, 'insertFromPaste', '12')).toEqual({
      value: '98.12.54',
      caret: 6,
      accepted: true,
    });
    expect(
      edit('#__-__', 0, 0, 'insertFromPaste', '#12-34', { mask: '#00-00' }),
    ).toEqual({ value: '#12-34', caret: 6, accepted: true });
  });

  it('rejects invalid paste, incompatible token characters and overflow atomically', () => {
    for (const pasted of ['12.3x.56', '1234567', '12/34/56'])
      expect(edit('98.76.54', 0, 8, 'insertFromPaste', pasted)).toEqual({
        value: '98.76.54',
        caret: 0,
        accepted: false,
      });
    expect(edit('12.34.56', 8, 8, 'insertText', '7')).toEqual({
      value: '12.34.56',
      caret: 8,
      accepted: false,
    });
    expect(
      edit('AB-1234', 3, 3, 'insertText', 'C', { mask: 'AA-0000' }),
    ).toEqual({ value: 'AB-1234', caret: 3, accepted: false });
  });

  it('keeps prefixes and escaped numeric literals visible while accepting matching digit tokens', () => {
    const options = { mask: '\\0000' };
    expect(formatMaskedDraft('', options)).toBe('0___');
    expect(edit('0___', 1, 1, 'insertText', '0', options)).toEqual({
      value: '00__',
      caret: 2,
      accepted: true,
    });
    expect(edit('012_', 3, 3, 'deleteContentBackward', null, options)).toEqual({
      value: '01__',
      caret: 2,
      accepted: true,
    });
    expect(edit('01__', 2, 2, 'deleteContentBackward', null, options)).toEqual({
      value: '0___',
      caret: 1,
      accepted: true,
    });
    expect(formatMaskedDraft('1234', { mask: '\\A00/\\000' })).toBe('A12/034');
  });

  it('moves through explicitly entered separators without deleting or adding tokens', () => {
    const options = { mask: '00 / 00' };
    expect(edit('12 / 34', 2, 2, 'insertText', ' / ', options)).toEqual({
      value: '12 / 34',
      caret: 5,
      accepted: true,
    });
    expect(
      edit('12 / 34', 5, 5, 'deleteContentBackward', null, options),
    ).toEqual({ value: '1_ / 34', caret: 1, accepted: true });
    expect(
      edit('12 / 34', 2, 2, 'deleteContentForward', null, options),
    ).toEqual({ value: '12 / _4', caret: 5, accepted: true });
  });

  it('allows complete correction of malformed imported data without partial character loss', () => {
    expect(edit('broken', 0, 6, 'insertFromPaste', '123456')).toEqual({
      value: '12.34.56',
      caret: 8,
      accepted: true,
    });
    expect(edit('broken', 1, 2, 'insertText', '1')).toEqual({
      value: 'broken',
      caret: 1,
      accepted: false,
    });
  });

  it('parses blank optional templates as null and rejects missing interior slots', () => {
    expect(parseMaskedDraft('__.__.__', dots)).toMatchObject({
      valid: true,
      value: null,
    });
    expect(
      parseMaskedDraft('__.__.__', { ...dots, required: true }),
    ).toMatchObject({ valid: false, error: 'required' });
    expect(parseMaskedDraft('1_.34.56', dots)).toMatchObject({
      valid: false,
      error: 'incomplete',
    });
    expect(parseMaskedDraft('12.34.56', dots)).toMatchObject({
      valid: true,
      value: '123456',
    });
    expect(
      parseMaskedDraft('12.34.56', { ...dots, store: 'formatted' }),
    ).toMatchObject({ valid: true, value: '12.34.56' });
  });
});

describe('masked draft history bridge', () => {
  const inputWith = (value = '__.__.__') => {
    const input = document.createElement('input');
    input.value = value;
    input.setSelectionRange(0, 0);
    return input;
  };
  const history = (
    input: HTMLInputElement,
    key: string,
    modifiers: KeyboardEventInit = { ctrlKey: true },
  ) => {
    const event = new KeyboardEvent('keydown', {
      key,
      cancelable: true,
      ...modifiers,
    });
    return { event, handled: handleMaskedHistory(input, event) };
  };

  it('restores value and selection on undo and redo', () => {
    const input = inputWith('12.34.56');
    input.setSelectionRange(1, 4);
    expect(applyMaskedEdit(input, 'insertText', '98', dots)).toBe(true);
    expect(input.value).toBe('19.84.56');
    expect(input.selectionStart).toBe(4);
    expect(history(input, 'z').handled).toBe(true);
    expect(input.value).toBe('12.34.56');
    expect([input.selectionStart, input.selectionEnd]).toEqual([1, 4]);
    expect(
      history(input, 'z', { metaKey: true, shiftKey: true }).event
        .defaultPrevented,
    ).toBe(true);
    expect(input.value).toBe('19.84.56');
    expect([input.selectionStart, input.selectionEnd]).toEqual([4, 4]);
  });

  it('supports Ctrl+Y redo and clears redo after a new edit', () => {
    const input = inputWith();
    applyMaskedEdit(input, 'insertText', '1', dots);
    applyMaskedEdit(input, 'insertText', '2', dots);
    expect(input.value).toBe('12.__.__');
    history(input, 'z');
    expect(input.value).toBe('1_.__.__');
    history(input, 'y');
    expect(input.value).toBe('12.__.__');
    history(input, 'z');
    applyMaskedEdit(input, 'insertText', '9', dots);
    expect(input.value).toBe('19.__.__');
    history(input, 'y');
    expect(input.value).toBe('19.__.__');
  });

  it('does not restore stale history after an external value replacement', () => {
    const input = inputWith();
    applyMaskedEdit(input, 'insertText', '12', dots);
    input.value = '98.76.54';
    input.setSelectionRange(8, 8);
    history(input, 'z');
    expect(input.value).toBe('98.76.54');
    applyMaskedEdit(input, 'deleteContentBackward', null, dots);
    expect(input.value).toBe('98.76.5_');
    history(input, 'z');
    expect(input.value).toBe('98.76.54');
    history(input, 'z');
    expect(input.value).toBe('98.76.54');
  });

  it('leaves unsupported shortcuts and composition keys untouched', () => {
    const input = inputWith();
    applyMaskedEdit(input, 'insertText', '12', dots);
    for (const [key, modifiers] of [
      ['z', {}],
      ['a', { ctrlKey: true }],
      ['z', { ctrlKey: true, altKey: true }],
      ['z', { ctrlKey: true, isComposing: true }],
    ] as const) {
      const result = history(input, key, modifiers);
      expect(result.handled).toBe(false);
      expect(result.event.defaultPrevented).toBe(false);
      expect(input.value).toBe('12.__.__');
    }
    history(input, 'z');
    expect(input.value).toBe('__.__.__');
  });
});
