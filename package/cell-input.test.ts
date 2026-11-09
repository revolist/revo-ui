import { expect, it, vi } from 'vitest';
import { renderCellInput } from './cell-input';

it('renders compact native inputs through the host factory without changing refs or events', () => {
  const ref = vi.fn();
  const onInput = vi.fn();
  const node = { hostVNode: true };
  const factory = vi.fn(() => node);
  expect(
    renderCellInput(factory, {
      ref,
      onInput,
      'aria-label': 'Amount',
      inputMode: 'decimal',
    }),
  ).toBe(node);
  expect(factory).toHaveBeenCalledExactlyOnceWith('input', {
    type: 'text',
    enterKeyHint: 'enter',
    class: 'rv-cell-input',
    ref,
    onInput,
    'aria-label': 'Amount',
    inputMode: 'decimal',
  });
});
