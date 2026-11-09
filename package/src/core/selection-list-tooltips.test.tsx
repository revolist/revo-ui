/** @jsxImportSource preact */
import { render } from 'preact';
import { act } from 'preact/test-utils';
import { afterEach, expect, it } from 'vitest';
import { useSelectionListTooltips } from './selection-list-tooltips';
import { EditorList, EditorListItem } from '../editor-layout';
const host = document.createElement('div');
afterEach(() => {
  act(() => render(null, host));
  host.remove();
});
it('reveals clipped rich option text on hover and focus, with cleanup', () => {
  document.body.append(host);
  act(() =>
    render(
      <EditorList label="Choices" onSelect={() => {}}>
        <EditorListItem value="long" selected>
          <span>
            <b>Planification trimestrielle complète</b>
          </span>
        </EditorListItem>
        <EditorListItem value="short" selected={false} label="Short" />
      </EditorList>,
      host,
    ),
  );
  const option = host.querySelector<HTMLButtonElement>('button')!;
  const label = option.querySelector('b')!;
  Object.defineProperties(label, {
    scrollWidth: { value: 300 },
    clientWidth: { value: 90 },
  });
  act(() => label.dispatchEvent(new Event('pointerover', { bubbles: true })));
  expect(document.querySelector('[role="tooltip"]')?.textContent).toBe(
    'Planification trimestrielle complète',
  );
  act(() =>
    option.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
    ),
  );
  expect(document.querySelector('[role="tooltip"]')).toBeNull();
  act(() => option.focus());
  expect(document.querySelector('[role="tooltip"]')?.textContent).toBe(
    'Planification trimestrielle complète',
  );
  act(() => host.querySelectorAll<HTMLButtonElement>('button')[1].focus());
  expect(document.querySelector('[role="tooltip"]')).toBeNull();
  act(() => option.focus());
  act(() => render(null, host));
  expect(document.querySelector('[role="tooltip"]')).toBeNull();
});

it('reveals an active descendant on keyboard navigation without reopening on Escape', () => {
  function Choices() {
    const ref = useSelectionListTooltips();
    return (
      <div
        ref={ref}
        role="listbox"
        tabIndex={0}
        aria-activedescendant="long-option"
      >
        <div role="option" id="long-option">
          A long choice
        </div>
      </div>
    );
  }
  document.body.append(host);
  act(() => render(<Choices />, host));
  const list = host.querySelector<HTMLElement>('[role="listbox"]')!;
  const option = host.querySelector<HTMLElement>('[role="option"]')!;
  Object.defineProperties(option, {
    scrollWidth: { value: 300 },
    clientWidth: { value: 90 },
  });
  act(() =>
    list.dispatchEvent(
      new KeyboardEvent('keyup', { key: 'ArrowDown', bubbles: true }),
    ),
  );
  expect(document.querySelector('[role="tooltip"]')?.textContent).toBe(
    'A long choice',
  );
  act(() => {
    list.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
    );
    list.dispatchEvent(
      new KeyboardEvent('keyup', { key: 'Escape', bubbles: true }),
    );
  });
  expect(document.querySelector('[role="tooltip"]')).toBeNull();
});
