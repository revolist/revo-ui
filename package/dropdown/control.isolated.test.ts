// @vitest-environment node
import { expect, it } from 'vitest';
import { Window } from 'happy-dom';
import { createDropdownControl } from './control';

it('creates, updates and destroys a dropdown without an ambient document', async () => {
  const window = new Window();
  const owner = window.document as unknown as Document;
  expect(globalThis.document).toBeUndefined();
  let control: ReturnType<typeof createDropdownControl> | undefined;
  try {
    control = createDropdownControl(owner, {
      source: [{ value: 'a', label: 'Alpha' }],
      value: 'a',
    });
    owner.body.append(control.element);
    expect(control.element.ownerDocument).toBe(owner);
    expect(
      control.element.querySelector('[role=combobox]')?.textContent,
    ).toContain('Alpha');
    expect(globalThis.document).toBeUndefined();
    control.update({ source: [{ value: 'b', label: 'Beta' }], value: 'b' });
    expect(
      control.element.querySelector('[role=combobox]')?.textContent,
    ).toContain('Beta');
    expect(globalThis.document).toBeUndefined();
    control.destroy();
    expect(control.element.isConnected).toBe(false);
    expect(globalThis.document).toBeUndefined();
  } finally {
    control?.destroy();
    await window.happyDOM.close();
  }
});
