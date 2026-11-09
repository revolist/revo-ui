import { h, render } from 'preact';
import { act } from 'preact/test-utils';
import { afterEach, expect, it, vi } from 'vitest';
import {
  CollapsibleSection,
  ConfiguratorPanel,
  FieldLibrary,
  FieldLibraryList,
  FieldContent,
  FieldGroup,
  FieldList,
  FieldRow,
  FieldItem,
} from './field-configurator';
const host = document.createElement('div');
afterEach(() => {
  act(() => render(null, host));
  host.remove();
});
it('renders an open native library with a scrollable list and accessible summary', () => {
  act(() =>
    render(
      <FieldLibrary title="Fields" count={0}>
        <FieldLibraryList aria-label="Available fields">
          <FieldItem>
            <FieldContent>Country</FieldContent>
          </FieldItem>
        </FieldLibraryList>
      </FieldLibrary>,
      host,
    ),
  );
  expect(host.querySelector('details')!.open).toBe(true);
  expect(host.querySelector('summary')!.textContent).toContain('Fields');
  expect(
    host
      .querySelector('.rv-configurator-library-list')!
      .getAttribute('aria-label'),
  ).toBe('Available fields');
  expect(
    host.querySelector('.rv-configurator-field-caption')!.textContent,
  ).toBe('Country');
});
it('retains native row events, drag attributes and empty list semantics', () => {
  const drag = vi.fn(),
    drop = vi.fn();
  act(() =>
    render(
      <FieldGroup heading="Rows" aria-label="Rows">
        <FieldList empty={false} placeholder="Add a field" onDrop={drop}>
          <FieldRow draggable onDragStart={drag}>
            <FieldContent>Country</FieldContent>
          </FieldRow>
        </FieldList>
      </FieldGroup>,
      host,
    ),
  );
  const row = host.querySelector('li')!;
  expect(row.getAttribute('draggable')).toBe('true');
  row.dispatchEvent(new Event('DragStart', { bubbles: true }));
  row.parentElement!.dispatchEvent(new Event('Drop', { bubbles: true }));
  expect(drag).toHaveBeenCalledOnce();
  expect(drop).toHaveBeenCalledOnce();
  act(() => render(<FieldList empty placeholder="Add a field" />, host));
  expect(host.querySelector('ul > li')!.textContent).toBe('Add a field');
});

it('composes selected rows with native drag hooks, action slots and accessible status badges', async () => {
  const { SelectedField, FieldActions, FieldStatusBadge } =
    await import('./field-configurator');
  const drag = vi.fn(),
    remove = vi.fn();
  act(() =>
    render(
      <FieldGroup heading="Values">
        <FieldList empty={false} placeholder="Add a measure">
          <SelectedField
            draggable
            onDragStart={drag}
            label="Revenue"
            contentClassName="legacy-caption"
            actions={
              <FieldActions className="legacy-actions">
                <FieldStatusBadge active label="Sum aggregation">
                  SUM
                </FieldStatusBadge>
                <button onClick={remove}>Remove</button>
              </FieldActions>
            }
          />
        </FieldList>
      </FieldGroup>,
      host,
    ),
  );
  expect(host.querySelector('.legacy-caption')?.textContent).toBe('Revenue');
  expect(
    host
      .querySelector('.rv-configurator-status-badge')
      ?.getAttribute('aria-label'),
  ).toBe('Sum aggregation');
  expect(
    host
      .querySelector('.rv-configurator-status-badge')
      ?.getAttribute('data-active'),
  ).toBe('true');
  host
    .querySelector('li')!
    .dispatchEvent(new Event('DragStart', { bubbles: true }));
  host.querySelector('button')!.click();
  expect(drag).toHaveBeenCalledOnce();
  expect(remove).toHaveBeenCalledOnce();
});

it('keeps collapsed draft controls mounted when its parent updates', async () => {
  const draw = (title: string) =>
    render(
      <CollapsibleSection title={title} description="Help" defaultOpen>
        <input defaultValue="Saved" />
      </CollapsibleSection>,
      host,
    );
  await act(() => draw('Appearance'));
  const details = host.querySelector('details')!;
  expect(details.open).toBe(true);
  const input = host.querySelector('input')!;
  input.value = 'Draft';
  details.open = false;
  await act(() => draw('Localized appearance'));
  expect(details.open).toBe(false);
  expect(host.querySelector('input')).toBe(input);
  expect(input.value).toBe('Draft');
  expect(details.querySelector('summary')?.textContent).toBe(
    'Localized appearance',
  );
  expect(
    details.querySelector('.rv-collapsible-section__description')?.textContent,
  ).toBe('Help');
});

it('supports host policy roots without losing its shared structure', () => {
  render(
    <CollapsibleSection
      title="Axes"
      renderRoot={(props) => (
        <details {...props} data-policy="disabled" aria-disabled="true" />
      )}
    >
      <select disabled>
        <option>Linear</option>
      </select>
    </CollapsibleSection>,
    host,
  );
  expect(host.querySelector('details')?.open).toBe(false);
  expect(host.querySelector('details')?.dataset.policy).toBe('disabled');
  expect(
    host
      .querySelector('summary')
      ?.classList.contains('rv-configurator-summary'),
  ).toBe(true);
  expect(
    host.querySelector('.rv-collapsible-section__content select'),
  ).not.toBeNull();
  expect(host.querySelector('.rv-collapsible-section__description')).toBeNull();
});

it('shows compact summaries and preserves mounted drafts when reopened', () => {
  const open = vi.fn();
  const draw = (count: number, compact = false) =>
    render(
      <ConfiguratorPanel
        compact={compact}
        onExpand={() => draw(count)}
        compactItems={[{ id: 'rows', label: 'Rows', count, onOpen: open }]}
      >
        <input aria-label="Draft" defaultValue="initial" />
      </ConfiguratorPanel>,
      host,
    );
  act(() => draw(2));
  const draft = host.querySelector('input')!;
  draft.value = 'pending';
  expect(host.querySelector('[aria-label="Collapse configurator"]')).toBeNull();
  act(() => draw(2, true));
  expect(
    host.querySelector('.rv-configurator-panel')?.getAttribute('data-compact'),
  ).toBe('true');
  expect(draft.closest('[hidden]')).not.toBeNull();
  act(() => draw(3, true));
  const item = host.querySelector<HTMLButtonElement>(
    '[aria-label="Rows (3)"]',
  )!;
  expect(item).not.toBeNull();
  act(() => item.click());
  expect(open).toHaveBeenCalledOnce();
  expect(host.querySelector('input')).toBe(draft);
  expect(draft.value).toBe('pending');
  expect(draft.closest('[hidden]')).toBeNull();
  expect(host.querySelector('.rv-configurator-rail')).toBeNull();
});

it('lets users expand and collapse an opt-in rail without losing the editor', () => {
  document.body.append(host);
  act(() =>
    render(
      <ConfiguratorPanel
        miniMode
        compactItems={[{ id: 'fields', label: 'Columns' }]}
      >
        <input defaultValue="initial" />
      </ConfiguratorPanel>,
      host,
    ),
  );
  const draft = host.querySelector('input')!;
  const opener = () =>
    host.querySelector<HTMLButtonElement>('button[aria-label="Columns"]')!;
  expect(draft.closest('[hidden]')).not.toBeNull();
  act(() => opener().click());
  const collapse = host.querySelector<HTMLButtonElement>(
    'button[aria-label="Collapse configurator"]',
  )!;
  expect(document.activeElement).toBe(collapse);
  draft.value = 'pending';
  act(() => collapse.click());
  expect(document.activeElement).toBe(opener());
  expect(draft.closest('[hidden]')).not.toBeNull();
  act(() => opener().click());
  expect(host.querySelector('input')).toBe(draft);
  expect(draft.value).toBe('pending');
});

it('resizes only when enabled and restores the last width after collapsing', () => {
  document.body.append(host);
  const draw = (resizable = false) =>
    act(() =>
      render(
        <ConfiguratorPanel resizable={resizable} resizeParent>
          <input />
        </ConfiguratorPanel>,
        host,
      ),
    );
  draw();
  expect(host.querySelector('[role="separator"]')).toBeNull();
  draw(true);
  const key = (value: string) =>
    act(() =>
      host
        .querySelector('[role="separator"]')!
        .dispatchEvent(
          new KeyboardEvent('keydown', { key: value, bubbles: true }),
        ),
    );
  key('ArrowLeft');
  expect(host.style.getPropertyValue('--rv-configurator-resized-width')).toBe(
    '370px',
  );
  key('Home');
  expect(host.querySelector('[data-compact="true"]')).not.toBeNull();
  expect(host.style.getPropertyValue('--rv-configurator-resized-width')).toBe(
    '',
  );
  act(() =>
    host
      .querySelector<HTMLButtonElement>('[aria-label="Expand configurator"]')!
      .click(),
  );
  expect(host.style.getPropertyValue('--rv-configurator-resized-width')).toBe(
    '370px',
  );
  draw();
  expect(host.style.getPropertyValue('--rv-configurator-resized-width')).toBe(
    '',
  );
});

it('widens the measured outer panel when the resize handle is on its left edge', () => {
  const bounds = vi
    .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
    .mockImplementation(function (this: HTMLElement) {
      return DOMRect.fromRect({ width: this === host ? 400 : 368 });
    });
  try {
    document.body.append(host);
    act(() =>
      render(
        <ConfiguratorPanel resizable resizeParent>
          <input />
        </ConfiguratorPanel>,
        host,
      ),
    );
    const handle = host.querySelector('[role="separator"]')!;
    act(() =>
      handle.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }),
      ),
    );
    expect(host.style.getPropertyValue('--rv-configurator-resized-width')).toBe(
      '410px',
    );
  } finally {
    bounds.mockRestore();
  }
});
