// @vitest-environment happy-dom
import { h, render } from 'preact';
import { afterEach, expect, it, vi } from 'vitest';
import {
  EditorPane,
  EditorList,
  EditorListItem,
  EditorListItemContent,
  EditorListGroup,
} from './index';
afterEach(() => render(null, document.body));
it('shares icon/description rows and navigates across groups while skipping disabled items', () => {
  const select = vi.fn();
  render(
    <EditorList label="Formats" onSelect={select}>
      <EditorListItem
        value="none"
        selected
        icon={<svg />}
        label="None"
        description="No format"
      />
      <EditorListGroup label="Identity">
        <EditorListItem value="disabled" selected={false} disabled>
          Unavailable
        </EditorListItem>
        <EditorListItem value="avatar" selected={false} label="Avatar" />
      </EditorListGroup>
    </EditorList>,
    document.body,
  );
  expect(
    document.querySelector('[role=option]')?.hasAttribute('description'),
  ).toBe(false);
  expect(
    document.querySelector('.rv-editor-list__description')?.textContent,
  ).toBe('No format');
  expect(
    document
      .querySelector('.rv-editor-list__icon')
      ?.getAttribute('aria-hidden'),
  ).toBe('true');
  expect(
    document.querySelector('[role="group"]')?.getAttribute('aria-label'),
  ).toBe('Identity');
  const first = document.querySelector<HTMLButtonElement>(
    '[data-editor-value="none"]',
  )!;
  first.focus();
  first.dispatchEvent(
    new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }),
  );
  expect(document.activeElement?.getAttribute('data-editor-value')).toBe(
    'avatar',
  );
  expect(select).toHaveBeenCalledWith('avatar');
});

it('supports a padded borderless inset list while keeping the default list presentation', () => {
  render(
    <div>
      <EditorList
        label="Inset formats"
        variant="plain"
        spacing="comfortable"
        onSelect={() => {}}
      >
        <EditorListItem value="number" selected>
          <EditorListItemContent label="Number" description="1,000.12" />
        </EditorListItem>
      </EditorList>
      <EditorList label="Default formats" onSelect={() => {}}>
        <EditorListItem value="text" selected>
          Text
        </EditorListItem>
      </EditorList>
    </div>,
    document.body,
  );
  const inset = document.querySelector('[aria-label="Inset formats"]')!;
  expect(inset.classList.contains('rv-editor-list--plain')).toBe(true);
  expect(inset.classList.contains('rv-editor-list--comfortable')).toBe(true);
  expect(inset.querySelector('[aria-selected="true"]')?.textContent).toBe(
    'Number1,000.12',
  );
  const standard = document.querySelector('[aria-label="Default formats"]')!;
  expect(standard.classList.contains('rv-editor-list--plain')).toBe(false);
  expect(standard.classList.contains('rv-editor-list--comfortable')).toBe(
    false,
  );
});

it('makes pane scrolling explicit without changing the default clipped pane', () => {
  render(
    <div>
      <EditorPane scrollable className="inspector">
        Scrollable
      </EditorPane>
      <EditorPane>Clipped</EditorPane>
    </div>,
    document.body,
  );
  const panes = document.querySelectorAll('.rv-editor-pane');
  expect(panes[0].classList.contains('rv-editor-pane--scrollable')).toBe(true);
  expect(panes[1].classList.contains('rv-editor-pane--scrollable')).toBe(false);
});

it('exposes general selection-list aliases without a separate implementation', async () => {
  const { Listbox, ListboxOption, ListboxGroup, ListboxOptionContent } =
    await import('../selection-list');
  expect(Listbox).toBe(EditorList);
  expect(ListboxOption).toBe(EditorListItem);
  expect(ListboxGroup).toBe(EditorListGroup);
  expect(ListboxOptionContent).toBe(EditorListItemContent);
});

it('allows an explicit keyboard entry point when a list has no current selection', () => {
  const host = document.createElement('div');
  try {
    render(
      <EditorList label="Available choices" onSelect={() => {}}>
        <EditorListItem value="first" selected={false} tabIndex={0}>
          First
        </EditorListItem>
      </EditorList>,
      host,
    );
    expect(
      host.querySelector('[role="option"]')?.getAttribute('tabindex'),
    ).toBe('0');
    expect(
      host.querySelector('[role="option"]')?.getAttribute('aria-selected'),
    ).toBe('false');
  } finally {
    render(null, host);
  }
});
