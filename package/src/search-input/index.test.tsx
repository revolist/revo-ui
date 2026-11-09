// @vitest-environment happy-dom
import { h, render } from 'preact';
import { createRef } from 'preact';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SearchInput } from '.';

afterEach(() => {
  document.body.innerHTML = '';
});

describe('SearchInput', () => {
  it('renders configurable search input chrome and emits value changes', () => {
    const host = document.createElement('div');
    const inputRef = createRef<HTMLInputElement>();
    const onValueChange = vi.fn();
    const onInput = vi.fn();
    document.body.append(host);

    render(
      <SearchInput
        value="draft"
        inputRef={inputRef}
        rootClassName="custom-search"
        inputClassName="custom-input"
        iconClassName="custom-icon"
        shortcutClassName="custom-shortcut"
        placeholder="Search records"
        aria-label="Search audit"
        shortcut="⌘K"
        icon={<span data-testid="icon">S</span>}
        trailing={<span data-testid="trailing">Help</span>}
        testId="search"
        onInput={onInput}
        onValueChange={onValueChange}
      />,
      host,
    );

    const root = host.querySelector('[data-testid="search"]');
    const input = host.querySelector<HTMLInputElement>('input[type="search"]')!;
    expect(root?.classList.contains('rv-search-input')).toBe(true);
    expect(root?.classList.contains('custom-search')).toBe(true);
    expect(input.classList.contains('custom-input')).toBe(true);
    expect(input.value).toBe('draft');
    expect(input.placeholder).toBe('Search records');
    expect(input.getAttribute('aria-label')).toBe('Search audit');
    expect(
      host
        .querySelector('.rv-search-input-icon')
        ?.classList.contains('custom-icon'),
    ).toBe(true);
    expect(host.querySelector('.rv-search-input-shortcut')?.textContent).toBe(
      '⌘K',
    );
    expect(
      host
        .querySelector('.rv-search-input-shortcut')
        ?.classList.contains('custom-shortcut'),
    ).toBe(true);
    expect(host.querySelector('[data-testid="icon"]')?.textContent).toBe('S');
    expect(host.querySelector('[data-testid="trailing"]')?.textContent).toBe(
      'Help',
    );
    expect(inputRef.current).toBe(input);

    input.value = 'approved';
    input.dispatchEvent(new Event('input', { bubbles: true }));

    expect(onInput).toHaveBeenCalledTimes(1);
    expect(onValueChange).toHaveBeenCalledWith('approved', expect.any(Event));
  });

  it('can hide optional icon and shortcut and pass input props', () => {
    const host = document.createElement('div');
    document.body.append(host);

    render(
      <SearchInput
        value=""
        hideIcon
        type="text"
        leading={
          <button type="button" data-testid="leading">
            Select all
          </button>
        }
        disabled
        name="panel-search"
        onValueChange={() => undefined}
      />,
      host,
    );

    expect(host.querySelector('.rv-search-input-icon')).toBeNull();
    expect(host.querySelector('.rv-search-input-shortcut')).toBeNull();
    expect(host.querySelector('[data-testid="leading"]')?.textContent).toBe(
      'Select all',
    );
    expect(host.querySelector<HTMLInputElement>('input')?.type).toBe('text');
    expect(host.querySelector<HTMLInputElement>('input')?.disabled).toBe(true);
    expect(host.querySelector<HTMLInputElement>('input')?.name).toBe(
      'panel-search',
    );
  });
});
