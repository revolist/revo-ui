import { render } from 'preact';
import { act } from 'preact/test-utils';
import { afterEach, expect, it, vi } from 'vitest';
import { AssigneeField } from './field';
import type { AssigneeFieldOptions } from './types';
const host = document.createElement('div');
document.body.append(host);
afterEach(() => act(() => render(null, host)));
const setup = (extra: Partial<AssigneeFieldOptions> = {}) => {
  const save = vi.fn(),
    cancel = vi.fn();
  act(() =>
    render(
      <AssigneeField
        value={[{ value: 'a', units: 50 }]}
        options={{ source: [{ value: 'a', label: 'Ana' }], ...extra }}
        save={save}
        cancel={cancel}
        renderPicker={(props) => (
          <div id={props.id}>
            <input
              type="number"
              aria-label="Units"
              value={props.value[0]?.units}
              onInput={(event) =>
                props.change([
                  { value: 'a', units: event.currentTarget.valueAsNumber },
                ])
              }
            />
            <button onClick={props.cancel}>Discard</button>
          </div>
        )}
      />,
      host,
    ),
  );
  const input = document.querySelector<HTMLInputElement>(
    'input[aria-label="Units"]',
  )!;
  return { save, cancel, input };
};
const change = (input: HTMLInputElement, value: string) =>
  act(() => {
    input.value = value;
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
const outside = () =>
  act(() =>
    document.body.dispatchEvent(
      new Event('pointerdown', { bubbles: true, cancelable: true }),
    ),
  );
it('keeps allocation typing local and automatically commits when leaving', () => {
  const { save, cancel, input } = setup();
  change(input, '75');
  expect(save).not.toHaveBeenCalled();
  outside();
  expect(save).toHaveBeenCalledExactlyOnceWith([{ value: 'a', units: 75 }]);
  expect(cancel).not.toHaveBeenCalled();
});
it('does not add history for untouched allocations or manual cancellation', () => {
  const { save, cancel } = setup();
  outside();
  expect(save).not.toHaveBeenCalled();
  expect(cancel).toHaveBeenCalledOnce();
});
it('blocks invalid automatic allocations and keeps the picker open', () => {
  const { save, cancel, input } = setup();
  change(input, '-1');
  outside();
  expect(save).not.toHaveBeenCalled();
  expect(cancel).not.toHaveBeenCalled();
  expect(document.querySelector('input[aria-label="Units"]')).toBeTruthy();
  change(input, '80');
  outside();
  expect(save).toHaveBeenCalledExactlyOnceWith([{ value: 'a', units: 80 }]);
});
it('preserves explicit manual mode by discarding outside drafts', () => {
  const { save, cancel, input } = setup({ autoApply: false });
  change(input, '75');
  outside();
  expect(save).not.toHaveBeenCalled();
  expect(cancel).toHaveBeenCalledOnce();
});
