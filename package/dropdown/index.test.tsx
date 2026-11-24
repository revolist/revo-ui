// @vitest-environment happy-dom
import { h, render } from 'preact';
import { act } from 'preact/test-utils';
import { expect, it, vi } from 'vitest';
import { Dropdown } from './index';

it('shows the label and selected count in count display mode', () => {
  const host = document.body.appendChild(document.createElement('div'));
  const source = [{ value: 1, label: 'One' }, { value: 2, label: 'Two' }];
  try {
    const draw = (value: number[]) => act(() => render(
      <Dropdown source={source} value={value} placeholder="Status" config={{ multiSelect: true, selectedDisplay: 'count' }} />,
      host,
    ));
    draw([1, 2]);
    expect(host.querySelector('.selected-count-value')?.textContent).toBe('Status2');
    expect(host.querySelector('.selected-tag')).toBeNull();
    draw([]);
    expect(host.querySelector('.selected-count-badge')).toBeNull();
    expect(host.textContent).toContain('Status');
  } finally {
    act(() => render(null, host));
    host.remove();
  }
});

it.each([false, true])(
  'closes a native-Tab dropdown before popup focus moves (backwards: %s)',
  async (shiftKey) => {
    const host = document.createElement('div');
    document.body.append(host);
    const outside = vi.fn();
    host.addEventListener('keydown', outside);
    try {
      act(() =>
        render(
          h(Dropdown, {
            source: [{ label: 'One', value: 1 }],
            value: 1,
            config: { nativeTabNavigation: true },
          }),
          host,
        ),
      );
      const trigger = host.querySelector<HTMLElement>('[role="combobox"]')!;
      act(() => trigger.click());
      await vi.waitFor(() =>
        expect(trigger.getAttribute('aria-expanded')).toBe('true'),
      );
      // A fast Tab can arrive while focus still belongs to the trigger.
      trigger.focus();
      const event = new KeyboardEvent('keydown', {
        key: 'Tab',
        shiftKey,
        bubbles: true,
        cancelable: true,
      });
      act(() => trigger.dispatchEvent(event));
      await vi.waitFor(() =>
        expect(trigger.getAttribute('aria-expanded')).toBe('false'),
      );
      expect(event.defaultPrevented).toBe(false);
      expect(outside).not.toHaveBeenCalled();
    } finally {
      act(() => render(null, host));
      host.remove();
    }
  },
);

it('consumes Escape on an open trigger before focus moves into its popup', async () => {
  const host = document.createElement('div');
  document.body.append(host);
  const escaped = vi.fn();
  host.addEventListener('keydown', escaped);
  try {
    render(
      h(Dropdown, { source: [{ label: 'One', value: 1 }], value: 1 }),
      host,
    );
    const trigger = host.querySelector<HTMLElement>('[role=combobox]')!;
    trigger.click();
    await vi.waitFor(() =>
      expect(trigger.getAttribute('aria-expanded')).toBe('true'),
    );
    trigger.focus();
    trigger.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
        cancelable: true,
      }),
    );
    await vi.waitFor(() =>
      expect(trigger.getAttribute('aria-expanded')).toBe('false'),
    );
    expect(escaped).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(trigger);
  } finally {
    render(null, host);
    host.remove();
  }
});

it('preserves motion opt-out when a dropdown renders outside the trigger subtree', async () => {
  const host = document.createElement('div');
  host.setAttribute('data-rv-ui-motion', 'off');
  document.body.append(host);
  try {
    render(
      h(Dropdown, { source: [{ label: 'One', value: 1 }], value: 1 }),
      host,
    );
    host.querySelector<HTMLElement>('[role=combobox]')!.click();
    await vi.waitFor(() => {
      const popup = document.body.querySelector<HTMLElement>(
        '.revo-dropdown-menu',
      );
      expect(popup?.getAttribute('data-rv-ui-motion')).toBe('off');
      expect(host.contains(popup)).toBe(false);
    });
  } finally {
    render(null, host);
    host.remove();
  }
});

it('localizes selected-chip removal labels without changing the selected value', () => {
  const host = document.createElement('div');
  document.body.append(host);
  const changed = vi.fn();
  try {
    act(() =>
      render(
        <Dropdown
          source={[{ value: 1, label: 'One' }]}
          value={[1]}
          onChange={changed}
          config={{
            multiSelect: true,
            removeLabel: (label) => `Entfernen: ${label}`,
          }}
        />,
        host,
      ),
    );
    const remove = host.querySelector(
      'button[aria-label="Entfernen: One"]',
    ) as HTMLButtonElement;
    expect(remove).toBeTruthy();
    expect(remove.title).toBe('Entfernen: One');
    act(() => remove.click());
    expect(changed).toHaveBeenCalledWith([]);
  } finally {
    act(() => render(null, host));
    host.remove();
  }
});

it('keeps search typing local and treats spaces as text rather than option selection', async () => {
  const host = document.body.appendChild(document.createElement('div'));
  const documentKey = vi.fn(),
    selected = vi.fn();
  document.addEventListener('keydown', documentKey);
  try {
    act(() =>
      render(
        <Dropdown
          source={[{ value: 1, label: 'In progress' }]}
          value={undefined}
          onChange={selected}
          config={{ search: true, autoOpen: true, autoFocus: true }}
        />,
        host,
      ),
    );
    await vi.waitFor(() =>
      expect(document.querySelector('.dropdown-search-input')).toBeTruthy(),
    );
    const input = document.querySelector<HTMLInputElement>(
      '.dropdown-search-input',
    )!;
    expect(input.closest('.rv-search-input')?.querySelector('.rv-search-input-icon')).toBeTruthy();
    for (const key of ['I', ' ', 'Backspace', 'Home', 'ArrowLeft']) {
      const event = new KeyboardEvent('keydown', {
        key,
        bubbles: true,
        cancelable: true,
      });
      act(() => input.dispatchEvent(event));
      expect(event.defaultPrevented).toBe(false);
      expect(input.isConnected).toBe(true);
    }
    expect(documentKey).not.toHaveBeenCalled();
    expect(selected).not.toHaveBeenCalled();
    act(() =>
      input.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'ArrowDown',
          bubbles: true,
          cancelable: true,
        }),
      ),
    );
    act(() =>
      input.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'Enter',
          bubbles: true,
          cancelable: true,
        }),
      ),
    );
    expect(selected).toHaveBeenCalledWith(1);
  } finally {
    document.removeEventListener('keydown', documentKey);
    act(() => render(null, host));
    host.remove();
  }
});

it('lets a draft validate outside dismissal while Escape keeps cancellation semantics', async () => {
  const host = document.body.appendChild(document.createElement('div'));
  const outside = document.body.appendChild(document.createElement('button'));
  const dismissed = vi.fn(),
    beforeOutsideClose = vi.fn(() => false);
  const outsidePointer = vi.fn();
  outside.addEventListener('pointerdown', outsidePointer);
  try {
    act(() =>
      render(
        <Dropdown
          source={[]}
          config={{ autoOpen: true }}
          beforeOutsideClose={beforeOutsideClose}
          onClose={dismissed}
        />,
        host,
      ),
    );
    await vi.waitFor(() =>
      expect(document.querySelector('.revo-dropdown-menu')).toBeTruthy(),
    );
    const rejected = new PointerEvent('pointerdown', {
      bubbles: true,
      cancelable: true,
    });
    act(() => outside.dispatchEvent(rejected));
    expect(beforeOutsideClose).toHaveBeenCalledTimes(1);
    expect(dismissed).not.toHaveBeenCalled();
    expect(rejected.defaultPrevented).toBe(true);
    expect(outsidePointer).not.toHaveBeenCalled();
    const trigger = host.querySelector<HTMLElement>('[role="combobox"]')!;
    act(() =>
      trigger.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
      ),
    );
    expect(dismissed).toHaveBeenCalledTimes(1);
    expect(beforeOutsideClose).toHaveBeenCalledTimes(1);
  } finally {
    act(() => render(null, host));
    host.remove();
    outside.remove();
  }
});

it('keeps a top-layer select inside its owning modal dialog', async () => {
  const dialog = document.body.appendChild(document.createElement('dialog'));
  dialog.setAttribute('open', '');
  const host = dialog.appendChild(document.createElement('div'));
  try {
    act(() =>
      render(
        <Dropdown
          source={[{ value: 'a', label: 'Alpha' }]}
          value="a"
          config={{ topLayer: true }}
        />,
        host,
      ),
    );
    host.querySelector<HTMLElement>('[role=combobox]')!.click();
    await vi.waitFor(() =>
      expect(dialog.querySelector('[role=listbox]')).toBeTruthy(),
    );
  } finally {
    act(() => render(null, host));
    dialog.remove();
  }
});

it('preserves focus deliberately moved outside by a selection callback', async () => {
  const host = document.body.appendChild(document.createElement('div'));
  const outside = document.body.appendChild(document.createElement('button'));
  try {
    act(() =>
      render(
        <Dropdown
          source={[{ value: 'a', label: 'Alpha' }]}
          onChange={() => outside.focus()}
        />,
        host,
      ),
    );
    act(() => host.querySelector<HTMLElement>('[role=combobox]')!.click());
    await vi.waitFor(() =>
      expect(document.querySelector('[role=option]')).toBeTruthy(),
    );
    act(() => (document.querySelector('[role=option]') as HTMLElement).click());
    await new Promise((resolve) => requestAnimationFrame(resolve));
    expect(document.activeElement).toBe(outside);
  } finally {
    act(() => render(null, host));
    host.remove();
    outside.remove();
  }
});

it('applies a preset class to both trigger and detached popup', async () => {
  const host = document.createElement('div');
  document.body.append(host);
  try {
    act(() =>
      render(
        <Dropdown
          source={[{ label: 'One', value: 1 }]}
          preset={{
            className: 'shared-dropdown',
            props: { config: { search: true } },
          }}
          config={{ search: false }}
        />,
        host,
      ),
    );
    expect(
      host.querySelector('.shared-dropdown[data-part="root"]'),
    ).toBeTruthy();
    act(() => host.querySelector<HTMLElement>('[role="combobox"]')!.click());
    await vi.waitFor(() =>
      expect(
        document.querySelector('.shared-dropdown[data-part="popup"]'),
      ).toBeTruthy(),
    );
    expect(
      document.querySelector('.shared-dropdown[data-part="popup"] input'),
    ).toBeFalsy();
  } finally {
    act(() => render(null, host));
    host.remove();
  }
});

it('selects the latest enabled option when arrow and enter arrive together', async () => {
  const host = document.body.appendChild(document.createElement('div'));
  const selected = vi.fn();
  try {
    act(() =>
      render(
        <Dropdown
          source={[
            { value: 1, label: 'First' },
            { value: 2, label: 'Second' },
          ]}
          value={1}
          onChange={selected}
          config={{ autoOpen: true }}
        />,
        host,
      ),
    );
    await vi.waitFor(() =>
      expect(document.querySelector('[role="listbox"]')).toBeTruthy(),
    );
    const list = document.querySelector<HTMLElement>('[role="listbox"]')!;
    act(() => {
      list.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'ArrowDown',
          bubbles: true,
          cancelable: true,
        }),
      );
      list.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'Enter',
          bubbles: true,
          cancelable: true,
        }),
      );
    });
    expect(selected).toHaveBeenCalledWith(2);
  } finally {
    act(() => render(null, host));
    host.remove();
  }
});

it('handles navigation on the trigger while an open popup is taking focus', async () => {
  const host = document.body.appendChild(document.createElement('div'));
  const selected = vi.fn();
  try {
    act(() =>
      render(
        <Dropdown
          source={[
            { value: 1, label: 'First' },
            { value: 2, label: 'Second' },
          ]}
          value={1}
          onChange={selected}
          config={{ autoOpen: true }}
        />,
        host,
      ),
    );
    await vi.waitFor(() =>
      expect(document.querySelector('[role="listbox"]')).toBeTruthy(),
    );
    const trigger = host.querySelector<HTMLElement>('[role="combobox"]')!;
    trigger.focus();
    act(() => {
      trigger.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'ArrowDown',
          bubbles: true,
          cancelable: true,
        }),
      );
      trigger.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'Enter',
          bubbles: true,
          cancelable: true,
        }),
      );
    });
    expect(selected).toHaveBeenCalledWith(2);
  } finally {
    act(() => render(null, host));
    host.remove();
  }
});
