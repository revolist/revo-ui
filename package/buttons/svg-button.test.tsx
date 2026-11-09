// @vitest-environment happy-dom
import { h, render } from 'preact';
import { expect, it, vi } from 'vitest';
import { act } from 'preact/test-utils';
import { SvgButton } from './svg-button';

it('keeps an explicit ghost variant when a consumer supplies its own class', () => {
  const host = document.createElement('div');
  try {
    render(
      h(SvgButton, {
        label: 'Currency',
        icon: '<svg/>',
        variant: 'ghost',
        className: 'consumer-icon',
      }),
      host,
    );
    const button = host.querySelector('button')!;
    expect(button.classList.contains('rv-btn-ghost')).toBe(true);
    expect(button.classList.contains('consumer-icon')).toBe(true);
    expect(button.getAttribute('aria-label')).toBe('Currency');
  } finally {
    render(null, host);
  }
});

it('uses the shared solid variant with accessible native icon-button behavior', () => {
  const host = document.createElement('div');
  const onClick = vi.fn();
  try {
    render(
      h(SvgButton, {
        label: 'Add task',
        icon: '<svg/>',
        variant: 'solid',
        className: 'consumer-add',
        onClick,
      }),
      host,
    );
    const button = host.querySelector('button')!;
    expect(button.classList.contains('rv-btn-solid')).toBe(true);
    expect(button.classList.contains('rv-btn-ghost')).toBe(false);
    expect(button.classList.contains('rv-btn-icon')).toBe(true);
    expect(button.getAttribute('aria-label')).toBe('Add task');
    button.click();
    expect(onClick).toHaveBeenCalledOnce();
    render(
      h(SvgButton, {
        label: 'Add task',
        variant: 'solid',
        disabled: true,
        onClick,
      }),
      host,
    );
    expect(button.disabled).toBe(true);
    button.click();
    expect(onClick).toHaveBeenCalledOnce();
  } finally {
    render(null, host);
  }
});

it('includes visible badge text in the accessible name for speech input', () => {
  const host = document.createElement('div');
  try {
    render(<SvgButton label="Undo" badge={3} />, host);
    expect(host.querySelector('button')?.getAttribute('aria-label')).toBe(
      'Undo 3',
    );
    expect(host.querySelector('button')?.hasAttribute('aria-description')).toBe(
      false,
    );
    render(
      <SvgButton
        label="Undo"
        badge={3}
        aria-description="Restores your last edit"
      />,
      host,
    );
    expect(host.querySelector('button')?.getAttribute('aria-description')).toBe(
      'Restores your last edit',
    );
  } finally {
    render(null, host);
  }
});

it('composes tooltip dismissal with consumer events and existing descriptions', () => {
  const host = document.createElement('div');
  document.body.append(host);
  const onFocus = vi.fn(),
    onKeyDown = vi.fn(),
    onClick = vi.fn();
  try {
    act(() =>
      render(
        <SvgButton
          label="Rotate"
          aria-describedby="rotation-help"
          onFocus={onFocus}
          onKeyDown={onKeyDown}
          onClick={onClick}
        />,
        host,
      ),
    );
    const button = host.querySelector('button')!;
    const tooltip = host.querySelector('[role="tooltip"]')!;
    expect(button.getAttribute('title')).toBeNull();
    expect(button.getAttribute('aria-describedby')?.split(' ')).toEqual([
      'rotation-help',
      tooltip.id,
    ]);
    act(() => button.focus());
    expect(onFocus).toHaveBeenCalledOnce();
    expect(tooltip.getAttribute('data-visible')).toBe('true');
    act(() =>
      button.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }),
      ),
    );
    expect(onKeyDown).toHaveBeenCalledOnce();
    expect(tooltip.getAttribute('data-visible')).toBe('false');
    act(() => {
      button.blur();
      button.focus();
    });
    expect(tooltip.getAttribute('data-visible')).toBe('true');
    act(() => button.click());
    expect(onClick).toHaveBeenCalledOnce();
    expect(tooltip.getAttribute('data-visible')).toBe('false');
    expect(document.activeElement).toBe(button);
  } finally {
    act(() => render(null, host));
    host.remove();
  }
});
