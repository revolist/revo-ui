import { render } from 'preact';
import { act } from 'preact/test-utils';
import { afterEach, expect, it, vi } from 'vitest';
import { mountEditorPopup } from './editor-popup';
let close: (() => void) | undefined;
it('preserves anchor direction when portalled outside its styled owner', () => {
  const owner = document.createElement('div'),
    anchor = document.createElement('button');
  anchor.style.direction = 'rtl';
  owner.append(anchor);
  document.body.append(owner);
  act(() => {
    close = mountEditorPopup(anchor, () => <input />, { label: 'Time' }).close;
  });
  expect(
    document.querySelector<HTMLElement>('.rv-editor-popup')?.style.direction,
  ).toBe('rtl');
});
afterEach(() => {
  act(() => close?.());
  document.body.replaceChildren();
});
it('disposes on virtualized-anchor removal and invokes cancellation exactly once', async () => {
  const anchor = document.createElement('button');
  document.body.append(anchor);
  const cancelled = vi.fn();
  act(() => {
    close = mountEditorPopup(
      anchor,
      (dismiss) => <button onClick={dismiss}>Cancel</button>,
      { label: 'Test', onClose: cancelled },
    ).close;
  });
  await act(async () => {
    anchor.remove();
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
  expect(document.querySelector('[role="dialog"]')).toBeNull();
  expect(cancelled).toHaveBeenCalledTimes(1);
});
it('cancels when a live grid becomes unavailable', async () => {
  const grid = document.createElement('revo-grid');
  const anchor = document.createElement('button');
  grid.append(anchor);
  document.body.append(grid);
  let available = true;
  act(() => {
    close = mountEditorPopup(anchor, () => <input />, {
      label: 'Test',
      isAvailable: () => available,
    }).close;
  });
  await act(async () => {
    available = false;
    grid.setAttribute('readonly', '');
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
  expect(document.querySelector('[role="dialog"]')).toBeNull();
});
it('keeps nested calendars within their owning dialog and restores focus', () => {
  const dialog = document.createElement('div');
  dialog.setAttribute('role', 'dialog');
  const anchor = document.createElement('button');
  dialog.append(anchor);
  document.body.append(dialog);
  act(() => {
    close = mountEditorPopup(anchor, () => <input />, {
      label: 'Calendar',
    }).close;
  });
  expect(dialog.querySelector('.rv-editor-popup')).toBeTruthy();
  act(() => close?.());
  expect(document.activeElement).toBe(anchor);
});
it('follows sibling grid viewport scrolling and ignores unrelated scrolling', () => {
  const grid = document.createElement('revo-grid'),
    viewport = document.createElement('div'),
    anchor = document.createElement('button');
  grid.append(viewport, anchor);
  document.body.append(grid);
  act(() => {
    close = mountEditorPopup(anchor, () => <input />, {
      label: 'Calendar',
    }).close;
  });
  act(() => viewport.dispatchEvent(new Event('scroll')));
  expect(document.querySelector('.rv-editor-popup')).toBeTruthy();
  const unrelated = document.createElement('div');
  document.body.append(unrelated);
  act(() => unrelated.dispatchEvent(new Event('scroll')));
  expect(document.querySelector('.rv-editor-popup')).toBeTruthy();
});
it('keeps editing keys local without preventing native input and retains Escape dismissal', () => {
  const anchor = document.createElement('button');
  document.body.append(anchor);
  const keydown = vi.fn(),
    keyup = vi.fn();
  document.addEventListener('keydown', keydown);
  document.addEventListener('keyup', keyup);
  try {
    act(() => {
      close = mountEditorPopup(anchor, () => <textarea />, {
        label: 'Text',
      }).close;
    });
    const input = document.querySelector('textarea')!;
    const letter = new KeyboardEvent('keydown', {
      key: 'a',
      bubbles: true,
      cancelable: true,
    });
    input.dispatchEvent(letter);
    input.dispatchEvent(
      new KeyboardEvent('keyup', { key: 'a', bubbles: true }),
    );
    expect(letter.defaultPrevented).toBe(false);
    expect(keydown).not.toHaveBeenCalled();
    expect(keyup).not.toHaveBeenCalled();
    act(() => {
      input.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'Escape',
          bubbles: true,
          cancelable: true,
        }),
      );
    });
    expect(document.querySelector('.rv-editor-popup')).toBeNull();
  } finally {
    document.removeEventListener('keydown', keydown);
    document.removeEventListener('keyup', keyup);
  }
});
