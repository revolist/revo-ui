// @vitest-environment happy-dom
import { expect, it } from 'vitest';
import { findOpenDialog } from './open-dialog';

it('finds an open dialog through an assigned slot', () => {
  const host = document.createElement('div');
  const shadow = host.attachShadow({ mode: 'open' });
  const dialog = document.createElement('dialog');
  dialog.setAttribute('open', '');
  const slot = document.createElement('slot');
  dialog.append(slot);
  shadow.append(dialog);
  const child = document.createElement('button');
  host.append(child);
  // happy-dom does not implement slot assignment; real assignment is covered in Chromium.
  Object.defineProperty(child, 'assignedSlot', { value: slot });
  document.body.append(host);
  try {
    expect(child.assignedSlot).toBe(slot);
    expect(findOpenDialog(child)).toBe(dialog);
  } finally {
    host.remove();
  }
});
