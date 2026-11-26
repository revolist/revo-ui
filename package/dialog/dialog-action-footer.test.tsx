import { describe, expect, it, vi } from 'vitest';
import { mountDialogActionFooter } from './dialog-action-footer';

describe('native dialog action footer', () => {
  it('updates actions while preserving external slot elements', () => {
    const host = document.createElement('div');
    const save = vi.fn();
    const cancel = vi.fn();
    const footer = mountDialogActionFooter(host, {
      className: 'custom-footer', actionsClass: 'custom-actions',
      save: { label: 'Edit', icon: 'edit', onClick: save }, cancel: { onClick: cancel },
    });
    const extra = document.createElement('button');
    extra.textContent = 'Export';
    footer.start.append(extra);
    const trailing = document.createElement('span');
    trailing.textContent = 'Additional action';
    footer.end.append(trailing);
    expect(footer.element.classList.contains('custom-footer')).toBe(true);
    expect(footer.element.querySelector('.custom-actions')).not.toBeNull();
    const initial = footer.element.querySelector<HTMLButtonElement>('[data-dialog-action=save]')!;
    expect(initial.type).toBe('submit');
    expect(initial.dataset.icon).toBe('edit');
    initial.click();
    expect(save).toHaveBeenCalledOnce();
    footer.update({ save: { label: 'Save Decision', icon: 'check', disabled: true }, cancel: false });
    expect(footer.start.contains(extra)).toBe(true);
    expect(footer.end.contains(trailing)).toBe(true);
    expect(footer.element.querySelector('[data-dialog-action=cancel]')).toBeNull();
    const updated = footer.element.querySelector<HTMLButtonElement>('[data-dialog-action=save]')!;
    expect(updated.textContent).toBe('Save Decision');
    expect(updated.dataset.icon).toBe('check');
    expect(updated.disabled).toBe(true);
    footer.update({ save: false, cancel: { label: 'Close', onClick: cancel } });
    expect(footer.element.querySelector('[data-dialog-action=save]')).toBeNull();
    footer.element.querySelector<HTMLButtonElement>('[data-dialog-action=cancel]')!.click();
    expect(cancel).toHaveBeenCalledOnce();
    footer.destroy();
    expect(host.children).toHaveLength(0);
    footer.update({ save: { label: 'After removal' } });
    expect(host.children).toHaveLength(0);
    footer.destroy();
  });
});
