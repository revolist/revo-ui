/** @jsxImportSource preact */
import { h, render } from 'preact';
import { useState } from 'preact/hooks';
import { act } from 'preact/test-utils';
import { afterEach, expect, it, vi } from 'vitest';
import { Dropdown } from './index';
import type { DropdownProps } from './dropdown.types';

const hosts: HTMLElement[] = [];
afterEach(() => {
  for (const host of hosts) act(() => render(null, host));
  hosts.length = 0;
  document.body.replaceChildren();
  vi.restoreAllMocks();
});
const source = [
  { value: 'vue', label: 'Vue' },
  { value: 'react', label: 'React' },
  { value: 'locked', label: 'Locked', disabled: true },
];
function mount(config: any, onCreateOption = vi.fn(), multi = false) {
  const host = document.body.appendChild(document.createElement('div'));
  hosts.push(host);
  const onChange = vi.fn();
  function Fixture() {
    const [value, setValue] = useState<string | string[]>(multi ? [] : 'vue');
    return (
      <Dropdown
        source={source}
        value={value}
        config={{ search: true, multiSelect: multi, ...config }}
        onChange={(next) => {
          onChange(next);
          setValue(next);
        }}
        onCreateOption={onCreateOption}
      />
    );
  }
  act(() => render(<Fixture />, host));
  return { host, onChange, onCreateOption };
}
async function type(host: HTMLElement, text: string) {
  const input = host.querySelector<HTMLInputElement>('input[role="combobox"]');
  expect(input).not.toBeNull();
  await act(async () => {
    input!.focus();
    input!.value = text;
    input!.dispatchEvent(new Event('input', { bubbles: true }));
  });
  return input!;
}
async function enter(input: HTMLInputElement) {
  await act(async () =>
    input.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Enter',
        bubbles: true,
        cancelable: true,
      }),
    ),
  );
}
it('filters in the editable field while retaining focus and commits an existing option', async () => {
  const { host, onChange } = mount({ autocomplete: true });
  const input = await type(host, 'rea');
  await vi.waitFor(() =>
    expect(document.querySelectorAll('[role=option]')).toHaveLength(1),
  );
  expect(document.querySelector('.dropdown-search-input')).toBeNull();
  expect(document.activeElement).toBe(input);
  await enter(input);
  expect(onChange).toHaveBeenCalledWith('react');
  expect(input.value).toBe('React');
  expect(input.getAttribute('aria-expanded')).toBe('false');
});
it('creates an opt-in typed tag once and keeps it selected', async () => {
  const factory = vi.fn((label: string) => ({
    value: label.toLowerCase(),
    label,
  }));
  const { host, onCreateOption, onChange } = mount(
    { tags: factory },
    undefined,
    true,
  );
  const input = await type(host, 'Svelte');
  await vi.waitFor(() =>
    expect(
      document.querySelector('[data-create-option="true"]'),
    ).not.toBeNull(),
  );
  await enter(input);
  expect(onCreateOption).toHaveBeenCalledExactlyOnceWith({
    value: 'svelte',
    label: 'Svelte',
  });
  expect(onChange).toHaveBeenCalledWith(['svelte']);
  expect(host.textContent).toContain('Svelte');
  expect(input.value).toBe('');
  await type(host, 'Svelte');
  expect(document.querySelector('[data-create-option="true"]')).toBeNull();
});
it('does not create unmatched text without tags enabled', async () => {
  const { host, onChange } = mount({ autocomplete: true });
  const input = await type(host, 'Svelte');
  await enter(input);
  expect(onChange).not.toHaveBeenCalled();
  await act(async () =>
    input.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
    ),
  );
  expect(input.value).toBe('Vue');
});
it('rejects blank, duplicate and disabled candidate tags', async () => {
  const { host, onCreateOption } = mount(
    {
      tags: (label: string) => ({
        value: label.toLowerCase(),
        label,
        disabled: label === 'Blocked',
      }),
    },
    undefined,
    true,
  );
  for (const text of [' ', 'Vue', 'Blocked']) {
    await type(host, text);
    expect(document.querySelector('[data-create-option="true"]')).toBeNull();
  }
  expect(onCreateOption).not.toHaveBeenCalled();
});

it('searches a remote source from the same field without losing the first query', async () => {
  const search = vi.fn(async ({ query }: { query: string }) => ({
    items: source.filter((option) =>
      option.label.toLowerCase().includes(query.toLowerCase()),
    ),
  }));
  const resolve = vi.fn(async () => []);
  const host = document.body.appendChild(document.createElement('div'));
  hosts.push(host);
  act(() =>
    render(
      <Dropdown
        source={[]}
        dataSource={{ search, resolve }}
        config={{ autocomplete: true, ariaLabel: 'Remote view' }}
      />,
      host,
    ),
  );
  const input = await type(host, 'rea');
  await vi.waitFor(() =>
    expect(search).toHaveBeenCalledWith(
      expect.objectContaining({ query: 'rea' }),
    ),
  );
  await vi.waitFor(() =>
    expect(document.querySelectorAll('[role=option]')).toHaveLength(1),
  );
  expect(input.value).toBe('rea');
  expect(document.activeElement).toBe(input);
  expect(search).not.toHaveBeenCalledWith(
    expect.objectContaining({ query: '' }),
  );
});

it('creates a single option with a domain ID instead of coercing the typed text into the value', async () => {
  const host = document.body.appendChild(document.createElement('div'));
  hosts.push(host);
  const onCreate = vi.fn();
  const onChange = vi.fn();
  function Fixture() {
    const [value, setValue] = useState<number>();
    return (
      <Dropdown<number>
        source={[]}
        value={value}
        onChange={(next) => {
          onChange(next);
          setValue(Array.isArray(next) ? next[0] : next);
        }}
        config={{ tags: (label) => ({ value: 42, label }) }}
        onCreateOption={onCreate}
      />
    );
  }
  act(() => render(<Fixture />, host));
  const input = await type(host, 'New person');
  await enter(input);
  expect(onChange).toHaveBeenCalledExactlyOnceWith(42);
  expect(onCreate).toHaveBeenCalledExactlyOnceWith({
    value: 42,
    label: 'New person',
  });
  expect(input.value).toBe('New person');
});

it('uses host-translated field captions, no-results content and chip removal labels', async () => {
  const host = document.body.appendChild(document.createElement('div'));
  hosts.push(host);
  act(() =>
    render(
      <Dropdown
        source={source}
        value={['vue']}
        config={{
          autocomplete: true,
          multiSelect: true,
          ariaLabel: 'Compétences',
          searchPlaceholder: 'Rechercher…',
          removeLabel: (label) => `Retirer ${label}`,
        }}
        renderNoResults={() => 'Aucun résultat'}
      />,
      host,
    ),
  );
  const input = host.querySelector<HTMLInputElement>('input[role=combobox]')!;
  expect(input.getAttribute('aria-label')).toBe('Compétences');
  expect(input.placeholder).toBe('Rechercher…');
  expect(host.querySelector('button')?.getAttribute('aria-label')).toBe(
    'Retirer Vue',
  );
  await type(host, 'absent');
  expect(document.querySelector('.no-results')?.textContent).toBe(
    'Aucun résultat',
  );
});

it('hands persisted tags back to the controlled source instead of restoring removed options', async () => {
  const host = document.body.appendChild(document.createElement('div'));
  hosts.push(host);
  let remove: () => void;
  function Fixture() {
    const [options, setOptions] = useState<{ value: string; label: string }[]>(
      [],
    );
    const [value, setValue] = useState<string>();
    remove = () => setOptions([]);
    return (
      <Dropdown
        source={options}
        value={value}
        onChange={(next) => setValue(Array.isArray(next) ? next[0] : next)}
        config={{ tags: (label) => ({ value: label, label }) }}
        onCreateOption={(option) =>
          setOptions((current) => [...current, option])
        }
      />
    );
  }
  act(() => render(<Fixture />, host));
  const input = await type(host, 'Svelte');
  await enter(input);
  expect(input.value).toBe('Svelte');
  await act(async () => remove());
  expect(input.value).toBe('');
  await type(host, 'Svelte');
  expect(document.querySelector('[data-create-option="true"]')).not.toBeNull();
});
