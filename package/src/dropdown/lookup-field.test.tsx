/** @jsxImportSource preact */
import { render } from 'preact';
import { act } from 'preact/test-utils';
import { afterEach, expect, it, vi } from 'vitest';
import { EditorCommitContext, type EditorCommit } from '../core/editor-commit';
import { LookupField } from './lookup-field';
vi.mock('./index', async () => {
  const { h } = await import('preact');
  return {
    Dropdown: (props: any) =>
      h(
        'div',
        null,
        h(
          'button',
          {
            onClick: () =>
              props.onChange(props.config.multiSelect ? [1, 2] : 2),
          },
          'Choose',
        ),
        h('button', { onClick: () => props.onChange(null) }, 'Remove'),
      ),
  };
});
const host = document.createElement('div');
document.body.append(host);
afterEach(() => act(() => render(null, host)));
const dataSource = {
  search: async () => ({ items: [] }),
  resolve: async () => [],
};
async function mount(options: Record<string, unknown> = {}) {
  const apply = vi.fn();
  await act(async () =>
    render(
      <LookupField
        initial={1}
        context={null}
        options={{ dataSource, ...options }}
        apply={apply}
        cancel={() => {}}
      />,
      host,
    ),
  );
  return apply;
}
it('automatically applies a single selection and hides confirmation actions by default', async () => {
  const apply = await mount();
  await act(async () => host.querySelector('button')!.click());
  expect(apply).toHaveBeenCalledExactlyOnceWith(2);
  expect(
    [...host.querySelectorAll('button')].map((button) => button.textContent),
  ).toEqual(['Choose', 'Remove', 'Clear']);
});
it('keeps multiple choices staged for dismissal and preserves optional manual Apply', async () => {
  const apply = await mount({ multiple: true, autoApply: false });
  await act(async () => host.querySelector('button')!.click());
  expect(apply).not.toHaveBeenCalled();
  await act(async () =>
    [...host.querySelectorAll('button')]
      .find((button) => button.textContent === 'Apply')!
      .click(),
  );
  expect(apply).toHaveBeenCalledExactlyOnceWith([1, 2]);
});
it('clears immediately by default while retaining required validation', async () => {
  const apply = await mount();
  await act(async () =>
    [...host.querySelectorAll('button')]
      .find((button) => button.textContent === 'Clear')!
      .click(),
  );
  expect(apply).toHaveBeenCalledExactlyOnceWith(null);
  await mount({ required: true });
  expect(
    [...host.querySelectorAll('button')].some(
      (button) => button.textContent === 'Clear',
    ),
  ).toBe(false);
});

it('keeps multiple selection open and commits the complete set once on dismissal', async () => {
  const apply = vi.fn();
  let commit: EditorCommit | undefined;
  await act(async () =>
    render(
      <EditorCommitContext.Provider
        value={(next) => {
          commit = next;
          return () => {
            commit = undefined;
          };
        }}
      >
        <LookupField
          initial={[1]}
          context={null}
          options={{ dataSource, multiple: true }}
          apply={apply}
          cancel={() => {}}
        />
      </EditorCommitContext.Provider>,
      host,
    ),
  );
  await act(async () => host.querySelector('button')!.click());
  expect(apply).not.toHaveBeenCalled();
  expect(commit?.()).toBe(true);
  expect(apply).toHaveBeenCalledExactlyOnceWith([1, 2]);
  commit?.();
  expect(apply).toHaveBeenCalledTimes(1);
});

it('keeps required single-value removal invalid and exposes translated feedback', async () => {
  const apply = vi.fn();
  let commit: EditorCommit | undefined;
  await act(async () =>
    render(
      <EditorCommitContext.Provider
        value={(next) => {
          commit = next;
          return () => {};
        }}
      >
        <LookupField
          initial={null}
          context={null}
          options={{
            dataSource,
            required: true,
            text: { requiredValue: 'Choisissez un enregistrement.' },
          }}
          apply={apply}
          cancel={() => {}}
        />
      </EditorCommitContext.Provider>,
      host,
    ),
  );
  expect(commit?.()).toBe(true);
  await act(async () =>
    [...host.querySelectorAll('button')]
      .find((button) => button.textContent === 'Remove')!
      .click(),
  );
  expect(apply).not.toHaveBeenCalled();
  expect(commit?.()).toBe(false);
  expect(host.querySelector('[role="alert"]')?.textContent).toBe(
    'Choisissez un enregistrement.',
  );
});
