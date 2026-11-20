// @vitest-environment happy-dom
import { h, render } from 'preact';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SegmentedSwitch, renderSegmentedSwitch } from '.';

afterEach(() => {
  document.body.innerHTML = '';
});

describe('SegmentedSwitch', () => {
  it('renders configurable options, counts, active state, and disabled state', () => {
    const host = document.createElement('div');
    const onChange = vi.fn();
    document.body.append(host);

    render(
      <SegmentedSwitch
        value="cell"
        ariaLabel="Audit scope"
        className="custom-switch"
        itemClassName="custom-item"
        countClassName="custom-count"
        activeClassName="active"
        role="radiogroup"
        options={[
          { value: 'all', label: 'All', count: 4, testId: 'all' },
          {
            value: 'cell',
            label: 'Cell',
            count: 1,
            title: 'Cell scope',
            testId: 'cell',
            id: 'cell-tab',
            ariaControls: 'cell-panel',
          },
          {
            value: 'row',
            label: 'Row',
            count: 2,
            disabled: true,
            testId: 'row',
          },
        ]}
        onChange={onChange}
      />,
      host,
    );

    expect(
      host
        .querySelector('.rv-segmented-switch')
        ?.classList.contains('custom-switch'),
    ).toBe(true);
    expect(
      host.querySelector('[role="radiogroup"]')?.getAttribute('aria-label'),
    ).toBe('Audit scope');
    expect(
      host.querySelector('[data-testid="cell"]')?.classList.contains('active'),
    ).toBe(true);
    expect(
      host.querySelector('[data-testid="cell"]')?.classList.contains('on'),
    ).toBe(true);
    expect(
      host.querySelector('[data-testid="cell"]')?.getAttribute('aria-checked'),
    ).toBe('true');
    expect(
      host.querySelector('[data-testid="cell"]')?.getAttribute('title'),
    ).toBe('Cell scope');
    expect(host.querySelector('[data-testid="cell"]')?.id).toBe('cell-tab');
    expect(
      host.querySelector('[data-testid="cell"]')?.getAttribute('aria-controls'),
    ).toBe('cell-panel');
    expect(
      host.querySelectorAll('.rv-segmented-switch-count.custom-count'),
    ).toHaveLength(3);
    expect(
      host.querySelector<HTMLButtonElement>('[data-testid="row"]')?.disabled,
    ).toBe(true);

    host.querySelector<HTMLButtonElement>('[data-testid="all"]')!.click();
    expect(onChange).toHaveBeenCalledWith(
      'all',
      expect.objectContaining({ value: 'all' }),
      expect.any(MouseEvent),
    );

    host.querySelector<HTMLButtonElement>('[data-testid="cell"]')!.click();
    host.querySelector<HTMLButtonElement>('[data-testid="row"]')!.click();
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('supports custom option and count renderers', () => {
    const host = document.createElement('div');
    document.body.append(host);

    render(
      <SegmentedSwitch
        value={1}
        options={[{ value: 1, label: 'One', count: 3 }]}
        onChange={() => undefined}
        renderOption={(option) => <strong>{option.label}</strong>}
        renderCount={(option) => <em>{option.count}</em>}
      />,
      host,
    );

    expect(host.querySelector('strong')?.textContent).toBe('One');
    expect(host.querySelector('em')?.textContent).toBe('3');
  });

  it('uses one roving tab stop and supports Arrow, Home, and End navigation', () => {
    const host = document.createElement('div');
    const onChange = vi.fn();
    document.body.append(host);

    render(
      <SegmentedSwitch
        value="all"
        role="radiogroup"
        options={[
          { value: 'all', label: 'All' },
          { value: 'cell', label: 'Cell', disabled: true },
          { value: 'row', label: 'Row' },
        ]}
        onChange={onChange}
      />,
      host,
    );

    const buttons = [
      ...host.querySelectorAll<HTMLButtonElement>('[role="radio"]'),
    ];
    expect(buttons.map((button) => button.tabIndex)).toEqual([0, -1, -1]);
    buttons[0].focus();
    buttons[0].dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }),
    );
    expect(document.activeElement).toBe(buttons[2]);
    expect(onChange).toHaveBeenLastCalledWith(
      'row',
      expect.objectContaining({ value: 'row' }),
      expect.any(KeyboardEvent),
    );

    buttons[2].dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Home', bubbles: true }),
    );
    expect(document.activeElement).toBe(buttons[0]);
    buttons[0].dispatchEvent(
      new KeyboardEvent('keydown', { key: 'End', bubbles: true }),
    );
    expect(document.activeElement).toBe(buttons[2]);
  });
});

it('preserves native consumer markers while owning tab events and disabled focus fallback', () => {
  const host = document.createElement('div');
  document.body.append(host);
  const onChange = vi.fn();
  render(
    <SegmentedSwitch
      value="first"
      options={[
        {
          value: 'first',
          label: 'First',
          disabled: true,
          buttonAttributes: { 'data-policy': 'first' },
        },
        {
          value: 'second',
          label: 'Second',
          buttonAttributes: {
            'data-policy': 'second',
            'aria-describedby': 'reason',
          },
        },
      ]}
      onChange={onChange}
    />,
    host,
  );
  const first = host.querySelector<HTMLButtonElement>('[data-policy="first"]')!;
  const second = host.querySelector<HTMLButtonElement>(
    '[data-policy="second"]',
  )!;
  expect(first.disabled).toBe(true);
  expect(first.tabIndex).toBe(-1);
  expect(second.tabIndex).toBe(0);
  expect(second.getAttribute('aria-describedby')).toBe('reason');
  second.click();
  expect(onChange).toHaveBeenCalledOnce();
});

it('shares icon-only button layout, localized names, tooltips and group selection semantics', () => {
  const host = document.createElement('div');
  document.body.append(host);
  const onChange = vi.fn();
  const draw = (disabled = false) =>
    render(
      <SegmentedSwitch
        role="group"
        iconOnly
        value="board"
        ariaLabel="Vista"
        disabled={disabled}
        options={[
          { value: 'board', label: 'Quadro' },
          { value: 'table', label: 'Tabela', title: 'Abrir tabela' },
        ]}
        renderOption={() => <svg aria-hidden="true" />}
        onChange={onChange}
      />,
      host,
    );
  draw();
  expect(host.querySelector('.rv-segmented-switch--icon-only')).toBeTruthy();
  const [board, table] = [...host.querySelectorAll('button')];
  expect(board.textContent).toBe('');
  expect(board.getAttribute('aria-label')).toBe('Quadro');
  expect(board.title).toBe('Quadro');
  expect(table.title).toBe('Abrir tabela');
  expect(board.getAttribute('aria-pressed')).toBe('true');
  expect(table.getAttribute('aria-pressed')).toBe('false');
  board.click();
  expect(onChange).not.toHaveBeenCalled();
  table.click();
  expect(onChange).toHaveBeenCalledWith(
    'table',
    expect.objectContaining({ value: 'table' }),
    expect.any(MouseEvent),
  );
  draw(true);
  expect(board.disabled).toBe(true);
  expect(table.disabled).toBe(true);
  table.click();
  expect(onChange).toHaveBeenCalledTimes(1);
});

it.each(['tablist', 'radiogroup', 'group'] as const)(
  'serializes ARIA state for generic HTML renderers (%s)',
  (role) => {
    const buttons: Record<string, unknown>[] = [];
    renderSegmentedSwitch(
      (tag, attributes) => {
        if (tag === 'button') buttons.push(attributes);
        return null;
      },
      {
        value: 'a',
        role,
        options: [
          { value: 'a', label: 'A' },
          { value: 'b', label: 'B' },
        ],
        onChange: () => {},
      },
    );
    const state =
      role === 'tablist'
        ? 'aria-selected'
        : role === 'radiogroup'
          ? 'aria-checked'
          : 'aria-pressed';
    expect(buttons.map((button) => button[state])).toEqual(['true', 'false']);
  },
);
