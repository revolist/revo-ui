import { render } from 'preact';
import { act } from 'preact/test-utils';
import { afterEach, expect, it, vi } from 'vitest';
import { AssigneePicker } from './picker';
const host = document.createElement('div');
document.body.append(host);
afterEach(() => act(() => render(null, host)));
it('provides a standalone localized allocation picker without a grid dependency', () => {
  const change = vi.fn(),
    apply = vi.fn();
  act(() =>
    render(
      <AssigneePicker
        autoApply={false}
        id="people"
        options={[
          { value: 'a', label: 'Ana' },
          { value: 'b', label: 'Bea', disabled: true },
        ]}
        value={[{ value: 'a', units: 25 }]}
        change={change}
        apply={apply}
        cancel={() => {}}
        defaultUnits={100}
        text={{
          dialogLabel: 'Personen',
          searchLabel: 'Suchen',
          unitsLabel: (name) => `Anteil ${name}`,
          selected: (count) => `${count} gewählt`,
          apply: 'Speichern',
          cancel: 'Abbrechen',
        }}
      />,
      host,
    ),
  );
  expect(host.querySelector('revo-grid')).toBeNull();
  expect(host.querySelector('[role=dialog]')?.getAttribute('aria-label')).toBe(
    'Personen',
  );
  expect(host.textContent).toContain('1 gewählt');
  const units = host.querySelector<HTMLInputElement>('input[type=number]')!;
  expect(units.getAttribute('aria-label')).toBe('Anteil Ana');
  act(() => {
    units.value = '75';
    units.dispatchEvent(new Event('input', { bubbles: true }));
  });
  expect(change).toHaveBeenLastCalledWith([{ value: 'a', units: 75 }]);
  expect(
    [...host.querySelectorAll<HTMLInputElement>('input[type=checkbox]')].find(
      (input) => input.disabled,
    ),
  ).toBeTruthy();
  act(() =>
    [...host.querySelectorAll('button')]
      .find((button) => button.textContent === 'Speichern')!
      .click(),
  );
  expect(apply).toHaveBeenCalledOnce();
});
it('blocks invalid allocations and honors hidden avatars', () => {
  act(() =>
    render(
      <AssigneePicker
        autoApply={false}
        id="people"
        options={[{ value: 1, label: 'Ana' }]}
        value={[{ value: 1, units: -1 }]}
        change={() => {}}
        apply={() => {}}
        cancel={() => {}}
        defaultUnits={100}
        showAvatars={false}
        text={{ invalidUnits: 'Ungültig' }}
      />,
      host,
    ),
  );
  expect(host.querySelector('[role=alert]')?.textContent).toBe('Ungültig');
  expect(
    [...host.querySelectorAll('button')].find(
      (button) => button.textContent === 'Save',
    )?.disabled,
  ).toBe(true);
  expect(host.querySelector('.rv-assignee-avatar--hidden')).toBeTruthy();
});

it('hides confirmation buttons by default', () => {
  act(() =>
    render(
      <AssigneePicker
        id="people"
        options={[]}
        value={[]}
        change={() => {}}
        apply={() => {}}
        cancel={() => {}}
        defaultUnits={100}
      />,
      host,
    ),
  );
  expect(
    [...host.querySelectorAll('button')].some(
      (button) =>
        button.textContent === 'Save' || button.textContent === 'Cancel',
    ),
  ).toBe(false);
});
