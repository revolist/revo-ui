// @vitest-environment happy-dom
import { expect, it } from 'vitest';
import { createCalendarField } from './date-field-native';
it('provides a form-compatible localized date field and disposes on removal', () => {
  const field = createCalendarField(document, {
    label: 'Fecha',
    openLabel: 'Elegir fecha',
    value: '2026-10-12',
  });
  document.body.append(field);
  field.required = true;
  field.min = '2026-10-01';
  field.max = '2026-10-31';
  const input = field.querySelector('input')!;
  expect(input.getAttribute('aria-label')).toBe('Fecha');
  expect(field.querySelector('button')?.getAttribute('aria-label')).toBe(
    'Elegir fecha',
  );
  expect(input.required).toBe(true);
  expect([field.value, field.min, field.max]).toEqual([
    '2026-10-12',
    '2026-10-01',
    '2026-10-31',
  ]);
  field.disabled = true;
  expect(field.querySelector('button')?.disabled).toBe(true);
  field.remove();
});

it('reconfigures its trigger without registering duplicate opens', async () => {
  const { vi } = await import('vitest');
  const { PopoverController } = await import('../core/popover-controller');
  const open = vi.spyOn(PopoverController.prototype, 'open');
  const field = createCalendarField(document, {
    label: 'Fecha',
    openLabel: 'Elegir fecha',
    triggerIcon: 'calendar',
  });
  document.body.append(field);
  field.configure({ label: 'Otra fecha', openLabel: 'Elegir otra fecha' });
  field.showPicker();
  expect(open).toHaveBeenCalledTimes(1);
  expect(field.querySelector('button')?.dataset.icon).toBeUndefined();
  field.remove();
  open.mockRestore();
});

it('submits the named date and resets to its initial value', () => {
  const form = document.createElement('form');
  const field = createCalendarField(document, {
    label: 'Date',
    openLabel: 'Choose date',
    value: '2026-10-12',
  });
  field.setAttribute('name', 'visit');
  form.append(field);
  document.body.append(form);
  expect(new FormData(form).get('visit')).toBe('2026-10-12');
  field.value = '2026-10-20';
  form.reset();
  expect(field.value).toBe('2026-10-12');
  form.remove();
});

it('preserves a user edit and reset value when only labels change', () => {
  const form = document.createElement('form');
  const field = createCalendarField(document, {
    label: 'Date',
    openLabel: 'Choose',
    value: '2026-10-12',
  });
  form.append(field);
  document.body.append(form);
  field.value = '2026-10-20';
  field.configure({ label: 'Fecha', openLabel: 'Elegir' });
  expect(field.value).toBe('2026-10-20');
  form.reset();
  expect(field.value).toBe('2026-10-12');
  form.remove();
});

it('focuses the selected day on open and restores the trigger on Escape', async () => {
  const field = createCalendarField(document, {
    label: 'Date',
    openLabel: 'Choose date',
    value: '2026-10-12',
  });
  document.body.append(field);
  const trigger = field.querySelector('button')!;
  trigger.focus();
  field.showPicker();
  const popup = document.querySelector<HTMLElement>('[role="dialog"]')!;
  const selected = popup.querySelector<HTMLButtonElement>(
    '[data-calendar-date="2026-10-12"]',
  )!;
  expect(document.activeElement).toBe(selected);
  selected.dispatchEvent(
    new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }),
  );
  await Promise.resolve();
  const next = popup.querySelector<HTMLButtonElement>(
    '[data-calendar-date="2026-10-13"]',
  )!;
  expect(document.activeElement).toBe(next);
  next.dispatchEvent(
    new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
  );
  expect(document.querySelector('[role="dialog"]')).toBeNull();
  expect(document.activeElement).toBe(trigger);
  field.remove();
  await Promise.resolve();
});

it('emits native input then change and restores focus after selecting a date', async () => {
  const field = createCalendarField(document, {
    label: 'Date',
    openLabel: 'Choose date',
    value: '2026-10-12',
  });
  document.body.append(field);
  const trigger = field.querySelector('button')!;
  const events: string[] = [];
  field.addEventListener('input', () => events.push(`input:${field.value}`));
  field.addEventListener('change', () => events.push(`change:${field.value}`));
  field.showPicker();
  document
    .querySelector<HTMLButtonElement>('[data-calendar-date="2026-10-13"]')!
    .click();
  expect(events).toEqual(['input:2026-10-13', 'change:2026-10-13']);
  expect(document.activeElement).toBe(trigger);
  expect(document.querySelector('[role="dialog"]')).toBeNull();
  field.remove();
  await Promise.resolve();
});

it('closes the open calendar when its owning dialog closes', async () => {
  const dialog = document.createElement('dialog');
  dialog.setAttribute('open', '');
  const field = createCalendarField(document, {
    label: 'Date',
    openLabel: 'Choose date',
    value: '2026-10-12',
  });
  dialog.append(field);
  document.body.append(dialog);
  field.showPicker();
  expect(dialog.querySelector('[role="dialog"]')).not.toBeNull();
  dialog.dispatchEvent(new Event('close'));
  expect(dialog.querySelector('[role="dialog"]')).toBeNull();
  dialog.remove();
  await Promise.resolve();
});

it('does not emit input or change when the selected date is unchanged', async () => {
  const field = createCalendarField(document, {
    label: 'Date',
    openLabel: 'Choose date',
    value: '2026-10-12',
  });
  document.body.append(field);
  const events: string[] = [];
  field.addEventListener('input', () => events.push('input'));
  field.addEventListener('change', () => events.push('change'));
  field.showPicker();
  field.value = '2026-10-13';
  document
    .querySelector<HTMLButtonElement>('[data-calendar-date="2026-10-13"]')!
    .click();
  expect(events).toEqual([]);
  expect(document.querySelector('[role="dialog"]')).toBeNull();
  field.remove();
  await Promise.resolve();
});

it('closes an open calendar when the field becomes disabled', async () => {
  const field = createCalendarField(document, {
    label: 'Date',
    openLabel: 'Choose date',
    value: '2026-10-12',
  });
  document.body.append(field);
  const events: string[] = [];
  field.addEventListener('change', () => events.push('change'));
  field.showPicker();
  const popup = document.querySelector<HTMLElement>('[role="dialog"]')!;
  expect(popup.isConnected).toBe(true);
  field.disabled = true;
  expect(popup.isConnected).toBe(false);
  expect(events).toEqual([]);
  field.remove();
  await Promise.resolve();
});

it('closes a calendar inside a dialog across a shadow boundary', async () => {
  const dialog = document.createElement('dialog');
  dialog.setAttribute('open', '');
  const shadowHost = document.createElement('div');
  const shadow = shadowHost.attachShadow({ mode: 'open' });
  const field = createCalendarField(document, {
    label: 'Date',
    openLabel: 'Choose date',
    value: '2026-10-12',
  });
  shadow.append(field);
  dialog.append(shadowHost);
  document.body.append(dialog);
  field.showPicker();
  expect(document.body.querySelector('[role="dialog"]')).toBeNull();
  expect(shadow.querySelector('[role="dialog"]')).not.toBeNull();
  dialog.dispatchEvent(new Event('close'));
  expect(shadow.querySelector('[role="dialog"]')).toBeNull();
  dialog.remove();
  await Promise.resolve();
});
