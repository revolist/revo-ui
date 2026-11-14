// @vitest-environment happy-dom
/** @jsxImportSource preact */
import { h, render } from 'preact';
import { useState } from 'preact/hooks';
import { act } from 'preact/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { SharedResourcePicker, type ResourcePickerItem } from '.';

afterEach(() => {
  document.body.innerHTML = '';
});

describe('SharedResourcePicker', () => {
  it('filters resources by name and role without changing selected ids', () => {
    const host = document.createElement('div');
    document.body.append(host);
    const onChange = vi.fn();
    const resources: readonly ResourcePickerItem<number>[] = [
      { id: 1, name: 'Ada Lovelace', role: 'Engineer' },
      { id: 2, name: 'Grace Hopper', role: 'Admiral' },
    ];
    render(
      <SharedResourcePicker
        resources={resources}
        selectedResourceIds={[1] as readonly number[]}
        text={{
          groupAriaLabel: 'Resources',
          searchPlaceholder: 'Search resources',
          searchAriaLabel: 'Search resources',
          emptyResources: 'No resources',
          emptySearch: 'No matching resources',
        }}
        resourceDataAttribute="data-resource-id"
        onChange={onChange}
      />,
      host,
    );

    expect(
      host.querySelector('[data-resource-id="1"]')?.getAttribute('aria-label'),
    ).toBe('Ada Lovelace');
    expect(host.querySelector('[role="option"]')).toBeNull();
    expect(
      host.querySelector<HTMLInputElement>('[data-resource-id="1"]')?.checked,
    ).toBe(true);

    expect(
      host.querySelector('[data-resource-id="1"]')?.nextSibling?.textContent,
    ).toBe('AL');

    const search = host.querySelector<HTMLInputElement>(
      '.rv-resource-picker__search',
    );
    expect(
      search
        ?.closest('.rv-search-input')
        ?.querySelector('.rv-search-input-icon svg'),
    ).not.toBeNull();
    act(() => {
      if (search) {
        search.value = 'admiral';
        search.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });

    expect(host.querySelector('[data-resource-id="1"]')).toBeNull();
    expect(host.querySelector('[data-resource-id="2"]')).not.toBeNull();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('supports unassigned and disabled resource options', () => {
    const host = document.createElement('div');
    document.body.append(host);
    const onChange = vi.fn();
    const resources: readonly ResourcePickerItem<string>[] = [
      { id: 'available', name: 'Available' },
      { id: 'locked', name: 'Locked' },
    ];
    render(
      <SharedResourcePicker
        resources={resources}
        selectedResourceIds={['available'] as readonly string[]}
        text={{
          groupAriaLabel: 'Resources',
          searchPlaceholder: 'Search resources',
          searchAriaLabel: 'Search resources',
          emptyResources: 'No resources',
          emptySearch: 'No matching resources',
        }}
        unassigned={{
          label: 'Unassigned',
          dataAttribute: 'data-unassigned',
        }}
        resourceDataAttribute="data-resource-id"
        isResourceDisabled={(resource) => resource.id === 'locked'}
        onChange={onChange}
      />,
      host,
    );

    expect(
      host.querySelector<HTMLInputElement>('[data-resource-id="locked"]')
        ?.disabled,
    ).toBe(true);

    act(() => {
      host.querySelector<HTMLInputElement>('[data-unassigned]')?.click();
    });
    expect(onChange).toHaveBeenLastCalledWith([]);
  });

  it('preserves source order when requested', () => {
    const host = document.createElement('div');
    document.body.append(host);
    render(
      <SharedResourcePicker
        resources={[
          { id: 'priority', name: 'Zulu Priority' },
          { id: 'secondary', name: 'Alpha Secondary' },
        ]}
        selectedResourceIds={[] as readonly string[]}
        text={{
          groupAriaLabel: 'Resources',
          searchPlaceholder: 'Search resources',
          searchAriaLabel: 'Search resources',
          emptyResources: 'No resources',
          emptySearch: 'No matching resources',
        }}
        preserveOrder
        resourceDataAttribute="data-resource-id"
        onChange={vi.fn()}
      />,
      host,
    );

    expect(
      Array.from(
        host.querySelectorAll<HTMLInputElement>('[data-resource-id]'),
        (input) => input.dataset.resourceId,
      ),
    ).toEqual(['priority', 'secondary']);
  });

  it('replaces the current selection when multiple selection is disabled', () => {
    const host = document.createElement('div');
    document.body.append(host);
    const onChange = vi.fn();
    render(
      <SharedResourcePicker
        resources={[
          { id: 'crew-a', name: 'Crew A' },
          { id: 'crew-b', name: 'Crew B' },
        ]}
        selectedResourceIds={['crew-a'] as readonly string[]}
        text={{
          groupAriaLabel: 'Resources',
          searchPlaceholder: 'Search resources',
          searchAriaLabel: 'Search resources',
          emptyResources: 'No resources',
          emptySearch: 'No matching resources',
        }}
        multiple={false}
        resourceDataAttribute="data-resource-id"
        onChange={onChange}
      />,
      host,
    );

    act(() => {
      host
        .querySelector<HTMLInputElement>('[data-resource-id="crew-b"]')
        ?.click();
    });
    expect(onChange).toHaveBeenLastCalledWith(['crew-b']);

    act(() => {
      host
        .querySelector<HTMLInputElement>('[data-resource-id="crew-a"]')
        ?.click();
    });
    expect(onChange).toHaveBeenLastCalledWith([]);
  });

  it('presents selected resources as searchable dropdown chips', () => {
    const host = document.createElement('div');
    document.body.append(host);
    const onChange = vi.fn();
    render(
      <SharedResourcePicker
        resources={[
          { id: 'crew-a', name: 'Ada Lovelace', role: 'Engineer' },
          { id: 'crew-b', name: 'Grace Hopper', role: 'Admiral' },
        ]}
        selectedResourceIds={['crew-a'] as readonly string[]}
        presentation="dropdown"
        text={{
          groupAriaLabel: 'Resources',
          searchPlaceholder: 'Search resources',
          searchAriaLabel: 'Search resources',
          emptyResources: 'No resources',
          emptySearch: 'No matching resources',
        }}
        resourceDataAttribute="data-resource-id"
        onChange={onChange}
      />,
      host,
    );

    const control = host.querySelector<HTMLElement>(
      '.rv-resource-picker__control',
    );
    expect(control?.getAttribute('role')).toBe('combobox');
    expect(control?.getAttribute('aria-expanded')).toBe('false');
    expect(
      host.querySelector('.rv-resource-picker__chip')?.textContent,
    ).toContain('Ada Lovelace');
    expect(host.querySelector('.rv-resource-picker__search')).toBeNull();

    act(() => control?.click());
    expect(control?.getAttribute('aria-expanded')).toBe('true');
    expect(document.querySelector('[role="listbox"]')).not.toBeNull();

    const search = document.querySelector<HTMLInputElement>(
      '.rv-resource-picker__search',
    );
    act(() => {
      if (!search) return;
      search.value = 'admiral';
      search.dispatchEvent(new Event('input', { bubbles: true }));
    });
    expect(document.querySelector('[data-resource-id="crew-a"]')).toBeNull();
    expect(
      document.querySelector('[data-resource-id="crew-b"]'),
    ).not.toBeNull();

    act(() => {
      search?.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'Enter',
          bubbles: true,
        }),
      );
    });
    expect(onChange).toHaveBeenLastCalledWith(['crew-a', 'crew-b']);

    act(() => {
      host
        .querySelector<HTMLButtonElement>('.rv-resource-picker__chip-remove')
        ?.click();
    });
    expect(onChange).toHaveBeenLastCalledWith([]);
  });

  it('does not mutate a read-only dropdown through Enter or selected chips', () => {
    const host = document.createElement('div');
    document.body.append(host);
    const onChange = vi.fn();
    render(
      <SharedResourcePicker
        resources={[
          { id: 'crew-a', name: 'Ada Lovelace' },
          { id: 'crew-b', name: 'Grace Hopper' },
        ]}
        selectedResourceIds={['crew-a'] as readonly string[]}
        presentation="dropdown"
        readOnly
        text={{
          groupAriaLabel: 'Resources',
          searchPlaceholder: 'Search resources',
          searchAriaLabel: 'Search resources',
          emptyResources: 'No resources',
          emptySearch: 'No matching resources',
        }}
        resourceDataAttribute="data-resource-id"
        onChange={onChange}
      />,
      host,
    );

    const control = host.querySelector<HTMLElement>(
      '.rv-resource-picker__control',
    );
    act(() => control?.click());
    act(() => {
      document
        .querySelector<HTMLInputElement>('.rv-resource-picker__search')
        ?.dispatchEvent(
          new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }),
        );
    });
    act(() =>
      host
        .querySelector<HTMLButtonElement>('.rv-resource-picker__chip-remove')
        ?.click(),
    );

    expect(onChange).not.toHaveBeenCalled();
    expect(host.querySelector('.rv-resource-picker__chip-remove')).toBeNull();
  });

  it('keeps one control and portal while selection updates rerender the picker', () => {
    const host = document.createElement('div');
    document.body.append(host);

    function StatefulPicker() {
      const [selectedResourceIds, setSelectedResourceIds] = useState<
        readonly string[]
      >(['crew-a']);
      return (
        <SharedResourcePicker
          resources={[
            { id: 'crew-a', name: 'Ada Lovelace' },
            { id: 'crew-b', name: 'Grace Hopper' },
          ]}
          selectedResourceIds={selectedResourceIds}
          presentation="dropdown"
          text={{
            groupAriaLabel: 'Resources',
            searchPlaceholder: 'Search resources',
            searchAriaLabel: 'Search resources',
            emptyResources: 'No resources',
            emptySearch: 'No matching resources',
          }}
          resourceDataAttribute="data-resource-id"
          onChange={setSelectedResourceIds}
        />
      );
    }

    render(<StatefulPicker />, host);
    act(() =>
      host.querySelector<HTMLElement>('.rv-resource-picker__control')?.click(),
    );

    for (let index = 0; index < 4; index += 1) {
      act(() =>
        document
          .querySelector<HTMLInputElement>('[data-resource-id="crew-b"]')
          ?.click(),
      );
      expect(
        host.querySelectorAll('.rv-resource-picker__control'),
      ).toHaveLength(1);
      expect(
        document.querySelectorAll('.rv-resource-picker__portal'),
      ).toHaveLength(1);
    }
  });

  it('does not remove the first selected resource when opened inside a label', () => {
    const host = document.createElement('div');
    document.body.append(host);
    const onChange = vi.fn();
    render(
      <label>
        <span>Assignees</span>
        <SharedResourcePicker
          resources={[
            { id: 'leo', name: 'Leo' },
            { id: 'ava', name: 'Ava' },
            { id: 'noah', name: 'Noah' },
          ]}
          selectedResourceIds={['leo', 'ava', 'noah'] as readonly string[]}
          presentation="dropdown"
          text={{
            groupAriaLabel: 'Assignees',
            searchPlaceholder: 'Search people',
            searchAriaLabel: 'Search assignees',
            emptyResources: 'No people available',
            emptySearch: 'No matches',
          }}
          onChange={onChange}
        />
      </label>,
      host,
    );

    const control = host.querySelector<HTMLElement>(
      '.rv-resource-picker__control',
    );
    act(() => control?.click());
    expect(control?.getAttribute('aria-expanded')).toBe('true');
    expect(onChange).not.toHaveBeenCalled();
    expect(host.querySelectorAll('.rv-resource-picker__chip')).toHaveLength(3);

    act(() => control?.click());
    expect(control?.getAttribute('aria-expanded')).toBe('false');
    expect(onChange).not.toHaveBeenCalled();
    expect(host.querySelectorAll('.rv-resource-picker__chip')).toHaveLength(3);
  });

  it('portals dropdown content outside overflow-clipping ancestors', () => {
    const clippingContainer = document.createElement('div');
    clippingContainer.style.overflow = 'auto';
    const host = document.createElement('div');
    clippingContainer.append(host);
    document.body.append(clippingContainer);
    render(
      <SharedResourcePicker
        resources={[{ id: 'crew-a', name: 'Crew A' }]}
        selectedResourceIds={[] as readonly string[]}
        presentation="dropdown"
        text={{
          groupAriaLabel: 'Resources',
          searchPlaceholder: 'Search resources',
          searchAriaLabel: 'Search resources',
          emptyResources: 'No resources',
          emptySearch: 'No matching resources',
        }}
        resourceDataAttribute="data-resource-id"
        onChange={vi.fn()}
      />,
      host,
    );

    act(() =>
      host.querySelector<HTMLElement>('.rv-resource-picker__control')?.click(),
    );

    const popup = document.querySelector('.rv-resource-picker__portal');
    expect(popup).not.toBeNull();
    expect(clippingContainer.contains(popup)).toBe(false);
    expect(popup?.querySelector('[role="listbox"]')).not.toBeNull();

    act(() => {
      clippingContainer.dispatchEvent(new Event('scroll'));
    });
    expect(
      host
        .querySelector('.rv-resource-picker__control')
        ?.getAttribute('aria-expanded'),
    ).toBe('false');
    expect(document.querySelector('.rv-resource-picker__portal')).toBeNull();
  });

  it.each(['Enter', ' '])(
    'leaves %j activation of a focused chip remove button to the button',
    (key) => {
      const host = document.createElement('div');
      document.body.append(host);
      render(
        <SharedResourcePicker
          resources={[{ id: 'crew-a', name: 'Crew A' }]}
          selectedResourceIds={['crew-a'] as readonly string[]}
          presentation="dropdown"
          text={{
            groupAriaLabel: 'Resources',
            searchPlaceholder: 'Search resources',
            searchAriaLabel: 'Search resources',
            emptyResources: 'No resources',
            emptySearch: 'No matching resources',
          }}
          resourceDataAttribute="data-resource-id"
          onChange={vi.fn()}
        />,
        host,
      );

      const control = host.querySelector<HTMLElement>(
        '.rv-resource-picker__control',
      );
      const removeButton = host.querySelector<HTMLButtonElement>(
        '.rv-resource-picker__chip-remove',
      );
      const keyboardEvent = new KeyboardEvent('keydown', {
        key,
        bubbles: true,
        cancelable: true,
      });

      act(() => {
        removeButton?.focus();
        removeButton?.dispatchEvent(keyboardEvent);
      });

      expect(document.activeElement).toBe(removeButton);
      expect(keyboardEvent.defaultPrevented).toBe(false);
      expect(control?.getAttribute('aria-expanded')).toBe('false');
    },
  );

  it.each(['control', 'outside'] as const)(
    'clears the dropdown search after closing from the %s',
    (closeFrom) => {
      const host = document.createElement('div');
      document.body.append(host);
      render(
        <SharedResourcePicker
          resources={[
            { id: 'crew-a', name: 'Crew A' },
            { id: 'crew-b', name: 'Crew B' },
          ]}
          selectedResourceIds={[] as readonly string[]}
          presentation="dropdown"
          text={{
            groupAriaLabel: 'Resources',
            searchPlaceholder: 'Search resources',
            searchAriaLabel: 'Search resources',
            emptyResources: 'No resources',
            emptySearch: 'No matching resources',
          }}
          resourceDataAttribute="data-resource-id"
          onChange={vi.fn()}
        />,
        host,
      );

      const control = host.querySelector<HTMLElement>(
        '.rv-resource-picker__control',
      );
      act(() => control?.click());
      const search = document.querySelector<HTMLInputElement>(
        '.rv-resource-picker__search',
      );
      act(() => {
        if (!search) return;
        search.value = 'Crew B';
        search.dispatchEvent(new Event('input', { bubbles: true }));
      });
      expect(document.querySelector('[data-resource-id="crew-a"]')).toBeNull();

      act(() => {
        if (closeFrom === 'control') {
          control?.click();
          return;
        }
        document.body.dispatchEvent(
          new PointerEvent('pointerdown', {
            bubbles: true,
          }),
        );
      });
      expect(control?.getAttribute('aria-expanded')).toBe('false');

      act(() => control?.click());
      expect(
        document.querySelector<HTMLInputElement>('.rv-resource-picker__search')
          ?.value,
      ).toBe('');
      expect(
        document.querySelector('[data-resource-id="crew-a"]'),
      ).not.toBeNull();
      expect(
        document.querySelector('[data-resource-id="crew-b"]'),
      ).not.toBeNull();
    },
  );

  it('scrolls the keyboard-focused option into view', () => {
    const host = document.createElement('div');
    document.body.append(host);
    render(
      <SharedResourcePicker
        resources={Array.from({ length: 8 }, (_, index) => ({
          id: `crew-${index}`,
          name: `Crew ${index + 1}`,
        }))}
        selectedResourceIds={[] as readonly string[]}
        presentation="dropdown"
        preserveOrder
        text={{
          groupAriaLabel: 'Resources',
          searchPlaceholder: 'Search resources',
          searchAriaLabel: 'Search resources',
          emptyResources: 'No resources',
          emptySearch: 'No matching resources',
        }}
        resourceDataAttribute="data-resource-id"
        onChange={vi.fn()}
      />,
      host,
    );

    act(() =>
      host.querySelector<HTMLElement>('.rv-resource-picker__control')?.click(),
    );
    const options = document.querySelectorAll<HTMLElement>(
      '.rv-resource-picker__option',
    );
    const targetOption = options.item(5);
    const scrollIntoView = vi.fn();
    Object.defineProperty(targetOption, 'scrollIntoView', {
      configurable: true,
      value: scrollIntoView,
    });
    const search = document.querySelector<HTMLInputElement>(
      '.rv-resource-picker__search',
    );

    act(() => {
      for (let index = 0; index < 5; index += 1) {
        search?.dispatchEvent(
          new KeyboardEvent('keydown', {
            key: 'ArrowDown',
            bubbles: true,
          }),
        );
      }
    });

    expect(
      targetOption.classList.contains('rv-resource-picker__option--focused'),
    ).toBe(true);
    expect(scrollIntoView).toHaveBeenCalledWith({ block: 'nearest' });
  });

  it('does not scroll an option into view when pointer hover changes focus', () => {
    const host = document.createElement('div');
    document.body.append(host);
    render(
      <SharedResourcePicker
        resources={Array.from({ length: 8 }, (_, index) => ({
          id: `crew-${index}`,
          name: `Crew ${index + 1}`,
        }))}
        selectedResourceIds={[] as readonly string[]}
        presentation="dropdown"
        preserveOrder
        text={{
          groupAriaLabel: 'Resources',
          searchPlaceholder: 'Search resources',
          searchAriaLabel: 'Search resources',
          emptyResources: 'No resources',
          emptySearch: 'No matching resources',
        }}
        resourceDataAttribute="data-resource-id"
        onChange={vi.fn()}
      />,
      host,
    );

    act(() =>
      host.querySelector<HTMLElement>('.rv-resource-picker__control')?.click(),
    );
    const targetOption = document
      .querySelectorAll<HTMLElement>('.rv-resource-picker__option')
      .item(5);
    const scrollIntoView = vi.fn();
    Object.defineProperty(targetOption, 'scrollIntoView', {
      configurable: true,
      value: scrollIntoView,
    });

    act(() => {
      targetOption.dispatchEvent(
        new MouseEvent('mouseenter', {
          bubbles: true,
        }),
      );
    });

    expect(
      targetOption.classList.contains('rv-resource-picker__option--focused'),
    ).toBe(true);
    expect(scrollIntoView).not.toHaveBeenCalled();
  });
});

it('keeps dropdowns within the shared dialog overlay stacking and focus boundary', () => {
  const overlay = document.createElement('div');
  overlay.className = 'rv-dialog-overlay';
  overlay.setAttribute('role', 'dialog');
  const host = document.createElement('div');
  overlay.append(host);
  document.body.append(overlay);
  act(() =>
    render(
      <SharedResourcePicker
        resources={[{ id: 'crew', name: 'Crew' }]}
        selectedResourceIds={[] as readonly string[]}
        presentation="dropdown"
        text={{
          groupAriaLabel: 'Resources',
          searchPlaceholder: 'Search',
          searchAriaLabel: 'Search',
          emptyResources: 'None',
          emptySearch: 'None',
        }}
        onChange={vi.fn()}
      />,
      host,
    ),
  );
  act(() =>
    host.querySelector<HTMLElement>('.rv-resource-picker__control')!.click(),
  );
  expect(
    overlay.contains(document.querySelector('.rv-resource-picker__portal')),
  ).toBe(true);
  act(() => render(null, host));
  overlay.remove();
});

it('returns keyboard focus to the dropdown control when Escape removes its portal', () => {
  const host = document.createElement('div');
  document.body.append(host);
  act(() =>
    render(
      <SharedResourcePicker
        resources={[{ id: 'crew', name: 'Crew' }]}
        selectedResourceIds={[] as readonly string[]}
        presentation="dropdown"
        text={{
          groupAriaLabel: 'Resources',
          searchPlaceholder: 'Search',
          searchAriaLabel: 'Search',
          emptyResources: 'None',
          emptySearch: 'None',
        }}
        onChange={vi.fn()}
      />,
      host,
    ),
  );
  const control = host.querySelector<HTMLElement>(
    '.rv-resource-picker__control',
  )!;
  act(() => control.click());
  const search =
    document.querySelector<HTMLInputElement>(
      '.rv-resource-picker__portal input[type="search"]',
    ) ??
    document.querySelector<HTMLInputElement>(
      '.rv-resource-picker__portal input',
    )!;
  act(() => {
    search.focus();
    search.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
        cancelable: true,
      }),
    );
  });
  expect(document.activeElement).toBe(control);
  act(() => render(null, host));
  host.remove();
});

it('can hide local search when composed with a host search field', () => {
  const host = document.createElement('div');
  document.body.append(host);
  render(
    <SharedResourcePicker
      resources={[{ id: 0, name: 'Maya' }]}
      selectedResourceIds={[0]}
      showSearch={false}
      text={{
        groupAriaLabel: 'People',
        searchPlaceholder: 'Find people',
        searchAriaLabel: 'Find people',
        emptyResources: 'No people',
        emptySearch: 'No matches',
      }}
      onChange={() => {}}
    />,
    host,
  );
  expect(host.querySelector('input[type="search"]')).toBeNull();
  expect(host.querySelectorAll('input[type="checkbox"]')).toHaveLength(1);
});

it('uses explicit resource colors for checkbox accents and leaves uncolored options on the theme accent', () => {
  const host = document.createElement('div');
  document.body.append(host);
  render(
    <SharedResourcePicker
      resources={[
        { id: 0, name: 'Maya', color: '#d94b45' },
        { id: 1, name: 'Leo', color: '#408c82' },
        { id: 2, name: 'Uncolored' },
      ]}
      selectedResourceIds={[0, 1, 2]}
      showSearch={false}
      text={{
        groupAriaLabel: 'People',
        searchPlaceholder: 'Search',
        searchAriaLabel: 'Search',
        emptyResources: 'None',
        emptySearch: 'None',
      }}
      onChange={() => {}}
    />,
    host,
  );
  const accent = (name: string) =>
    host
      .querySelector<HTMLInputElement>(`input[aria-label="${name}"]`)!
      .closest('label')!
      .style.getPropertyValue('--rv-resource-picker-accent');
  expect(accent('Maya')).toBe('#d94b45');
  expect(accent('Leo')).toBe('#408c82');
  expect(accent('Uncolored')).toBe('');
});

it('supports an independent Unassigned checkbox without clearing resource selections', () => {
  const host = document.createElement('div');
  document.body.append(host);
  const onChange = vi.fn(),
    onUnassigned = vi.fn();
  render(
    <SharedResourcePicker
      resources={[
        { id: 1, name: 'Maya' },
        { id: 2, name: 'Leo' },
      ]}
      selectedResourceIds={[1, 2]}
      resourceDataAttribute="data-person"
      unassigned={{
        label: 'Unassigned',
        dataAttribute: 'data-open',
        checked: true,
        onChange: onUnassigned,
      }}
      text={{
        groupAriaLabel: 'People',
        searchPlaceholder: 'Search',
        searchAriaLabel: 'Search',
        emptyResources: 'None',
        emptySearch: 'None',
      }}
      onChange={onChange}
    />,
    host,
  );
  act(() => host.querySelector<HTMLInputElement>('[data-open]')!.click());
  expect(onUnassigned).toHaveBeenCalledWith(false);
  expect(onChange).not.toHaveBeenCalled();
  expect(host.querySelectorAll('input[data-person]:checked')).toHaveLength(2);
});
