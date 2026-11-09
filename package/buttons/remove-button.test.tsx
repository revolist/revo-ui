import { h, render } from 'preact';
import { act } from 'preact/test-utils';
import { afterEach, expect, it, vi } from 'vitest';
import { RemoveButton } from './remove-button';
import { DeleteButton } from './delete-button';
import { FieldRemoveButton } from '../field-configurator';

const host = document.createElement('div');
afterEach(() => {
  act(() => render(null, host));
  host.remove();
});

it('shares the neutral remove component with field actions and keeps native labels and events', () => {
  const click = vi.fn(),
    down = vi.fn();
  act(() =>
    render(
      <div>
        <RemoveButton
          compact
          onClick={click}
          onMouseDown={down}
          locale={{ title: 'Remove tag', ariaLabel: 'Remove tag' }}
        />
        <FieldRemoveButton
          onClick={click}
          locale={{ ariaLabel: 'Remove field' }}
        />
      </div>,
      host,
    ),
  );
  const buttons = host.querySelectorAll<HTMLButtonElement>('.rv-remove-button');
  expect(buttons).toHaveLength(2);
  expect(buttons[0].classList.contains('rv-remove-button--compact')).toBe(true);
  expect(buttons[0].getAttribute('type')).toBe('button');
  expect(buttons[0].getAttribute('aria-label')).toBe('Remove tag');
  expect(buttons[0].title).toBe('Remove tag');
  expect(buttons[0].querySelector('svg')!.outerHTML).toBe(
    buttons[1].querySelector('svg')!.outerHTML,
  );
  buttons[0].dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
  buttons[0].click();
  expect(down).toHaveBeenCalledOnce();
  expect(click).toHaveBeenCalledOnce();
  expect(buttons[1].classList.contains('rv-configurator-remove-button')).toBe(
    true,
  );
});

it('preserves disabled behavior and the DeleteButton contract', () => {
  const click = vi.fn();
  act(() =>
    render(
      <div>
        <RemoveButton disabled onClick={click} />
        <DeleteButton onClick={click} />
      </div>,
      host,
    ),
  );
  const buttons = host.querySelectorAll<HTMLButtonElement>('button');
  buttons[0].click();
  expect(click).not.toHaveBeenCalled();
  expect(buttons[1].classList.contains('rv-chip-remove')).toBe(true);
  expect(buttons[1].classList.contains('rv-remove-button')).toBe(false);
  buttons[1].click();
  expect(click).toHaveBeenCalledOnce();
});

it('keeps embedded removal keyboard events separate from the dropdown trigger', async () => {
  const { Dropdown } = await import('../dropdown');
  const change = vi.fn();
  act(() =>
    render(
      <Dropdown
        source={[{ label: 'Table', value: 'table' }]}
        value={['table']}
        config={{ multiSelect: true, ariaLabel: 'Views' }}
        onChange={change}
      />,
      host,
    ),
  );
  const button = host.querySelector<HTMLButtonElement>(
    '[aria-label="Remove Table"]',
  )!;
  act(() => {
    button.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Enter',
        bubbles: true,
        cancelable: true,
      }),
    );
  });
  expect(
    host.querySelector('[role="combobox"]')!.getAttribute('aria-expanded'),
  ).toBe('false');
  act(() => {
    button.click();
  });
  expect(change).toHaveBeenCalledWith([]);
  expect(
    host.querySelector('[role="combobox"]')!.getAttribute('aria-expanded'),
  ).toBe('false');
});
