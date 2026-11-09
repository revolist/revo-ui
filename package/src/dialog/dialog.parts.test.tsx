import { createRef, h, render } from 'preact';
import { act } from 'preact/test-utils';
import { expect, it, vi } from 'vitest';
import {
  DialogHeader,
  DialogBody,
  DialogForm,
  DialogFooter,
  DialogActions,
  DialogCloseButton,
  DialogTitleInput,
} from './dialog.parts';

it('preserves native form semantics, refs, title input events and close isolation', () => {
  const host = document.createElement('div');
  document.body.append(host);
  const close = vi.fn(),
    submit = vi.fn(),
    input = vi.fn();
  const header = createRef<HTMLElement>(),
    title = createRef<HTMLInputElement>();
  act(() =>
    render(
      <DialogForm
        class="product-surface"
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <DialogHeader ref={header} class="product-header">
          <label>
            Title
            <DialogTitleInput ref={title} value="Planning" onInput={input} />
          </label>
          <DialogCloseButton aria-label="Close editor" onClick={close} />
        </DialogHeader>
        <DialogBody>
          <p>Editor fields</p>
        </DialogBody>
        <DialogFooter>
          <DialogActions>
            <button type="submit">Save</button>
          </DialogActions>
        </DialogFooter>
      </DialogForm>,
      host,
    ),
  );
  expect(header.current).toBe(
    host.querySelector('.product-header.rv-dialog__header'),
  );
  expect(title.current?.value).toBe('Planning');
  title.current!.dispatchEvent(new Event('input', { bubbles: true }));
  expect(input).toHaveBeenCalledOnce();
  host.querySelector<HTMLButtonElement>('[aria-label="Close editor"]')!.click();
  expect(
    host
      .querySelector('[aria-label="Close editor"]')
      ?.classList.contains('rv-btn'),
  ).toBe(false);
  expect(close).toHaveBeenCalledOnce();
  expect(submit).not.toHaveBeenCalled();
  expect(host.querySelector('[aria-hidden="true"] svg')).not.toBeNull();
  host.querySelector<HTMLButtonElement>('[type="submit"]')!.click();
  expect(submit).toHaveBeenCalledOnce();
  act(() => render(null, host));
  expect(header.current).toBeNull();
  expect(title.current).toBeNull();
  host.remove();
});

it('composes editable names and configurable footer actions without implicit submits', async () => {
  const { EditableDialogHeader, DialogActionFooter } =
    await import('./dialog.parts');
  const host = document.createElement('div');
  document.body.append(host);
  const header = createRef<HTMLElement>();
  const close = vi.fn(),
    reset = vi.fn(),
    remove = vi.fn(),
    save = vi.fn(),
    change = vi.fn();
  try {
    act(() =>
      render(
        <DialogForm
          onSubmit={(event) => {
            event.preventDefault();
            save();
          }}
        >
          <EditableDialogHeader
            ref={header}
            titleId="sample-title"
            name="Edit task"
            title="Planning"
            inputLabel="Task name"
            inputProps={{ onInput: change, disabled: true }}
            closeLabel="Close task"
            onClose={close}
          />
          <DialogActionFooter
            cancel={false}
            save={{ label: 'Store' }}
            reset={{ onClick: reset }}
            deleteAction={{ onClick: remove }}
            start={<button type="button">Custom start</button>}
            end={<button type="button">Custom end</button>}
          />
        </DialogForm>,
        host,
      ),
    );
    expect(header.current).toBe(
      host.querySelector('.rv-dialog__header--editable'),
    );
    expect(host.querySelector('h3')?.id).toBe('sample-title');
    expect(host.querySelector('input')?.disabled).toBe(true);
    expect(host.querySelector('[data-dialog-action="cancel"]')).toBeNull();
    expect(
      host.querySelector('.rv-dialog__action-start')?.textContent,
    ).toContain('Custom start');
    expect(host.querySelector('.rv-dialog__actions')?.textContent).toContain(
      'Custom end',
    );
    host
      .querySelector<HTMLButtonElement>('[data-dialog-action="reset"]')!
      .click();
    host
      .querySelector<HTMLButtonElement>('[data-dialog-action="delete"]')!
      .click();
    expect(reset).toHaveBeenCalledOnce();
    expect(remove).toHaveBeenCalledOnce();
    expect(save).not.toHaveBeenCalled();
    host
      .querySelector<HTMLButtonElement>('[data-dialog-action="save"]')!
      .click();
    expect(save).toHaveBeenCalledOnce();
    host.querySelector<HTMLButtonElement>('[aria-label="Close task"]')!.click();
    expect(close).toHaveBeenCalledOnce();
    act(() =>
      render(
        <DialogActionFooter
          cancel={false}
          save={false}
          reset={false}
          deleteAction={false}
        />,
        host,
      ),
    );
    expect(host.querySelectorAll('button')).toHaveLength(0);
  } finally {
    act(() => render(null, host));
    host.remove();
  }
});
