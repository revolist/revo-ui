import { h, render, createRef } from 'preact';
import { act } from 'preact/test-utils';
import { afterEach, expect, it, vi } from 'vitest';
import { ButtonControl } from '../native-control';
import { Button } from '../controls';
import { SvgButton } from '../buttons/svg-button';
import { IconToolbar } from '../icon-toolbar';

const host = document.createElement('div');
afterEach(() => {
  act(() => render(null, host));
  host.remove();
});
it('uses the shared tooltip for native titles and preserves refs, handlers and descriptions', () => {
  document.body.append(host);
  const ref = createRef<HTMLButtonElement>(),
    focus = vi.fn(),
    click = vi.fn();
  act(() =>
    render(
      <ButtonControl
        ref={ref}
        title="Save changes"
        aria-describedby="help"
        onFocus={focus}
        onClick={click}
      >
        Save
      </ButtonControl>,
      host,
    ),
  );
  const button = host.querySelector('button')!;
  expect(ref.current).toBe(button);
  expect(button.hasAttribute('title')).toBe(false);
  act(() => button.focus());
  const tooltip = document.querySelector('[role="tooltip"]')!;
  expect(tooltip.textContent).toBe('Save changes');
  expect(tooltip.className).toBe('rv-tooltip');
  expect(button.getAttribute('aria-describedby')).toContain(tooltip.id);
  expect(focus).toHaveBeenCalledOnce();
  act(() => button.click());
  expect(click).toHaveBeenCalledOnce();
  act(() => button.blur());
  expect(button.getAttribute('aria-describedby')).toBe('help');
  act(() =>
    render(<ButtonControl title="Updated hint">Save</ButtonControl>, host),
  );
  act(() => button.focus());
  expect(document.querySelector('[role="tooltip"]')!.textContent).toBe(
    'Updated hint',
  );
  act(() => render(<ButtonControl>Save</ButtonControl>, host));
  expect(document.querySelector('[role="tooltip"]')).toBeNull();
});
it('uses shared tooltips for navigation buttons and leaves untitled buttons alone', () => {
  document.body.append(host);
  act(() =>
    render(
      <>
        <Button href="/help" title="Open help">
          Help
        </Button>
        <Button>Plain</Button>
      </>,
      host,
    ),
  );
  const link = host.querySelector('a')!;
  expect(link.hasAttribute('title')).toBe(false);
  act(() => link.focus());
  expect(document.querySelector('[role="tooltip"]')!.textContent).toBe(
    'Open help',
  );
  act(() => host.querySelector('button')!.focus());
  expect(document.querySelector('[role="tooltip"]')).toBeNull();
});
it('uses an explicit SVG button title as its single tooltip text', () => {
  document.body.append(host);
  act(() =>
    render(<SvgButton label="Rotate" title="Rotate clockwise" />, host),
  );
  const button = host.querySelector('button')!;
  expect(button.getAttribute('aria-label')).toBe('Rotate');
  expect(button.hasAttribute('title')).toBe(false);
  act(() => button.focus());
  expect(document.querySelectorAll('[role="tooltip"]')).toHaveLength(1);
  expect(document.querySelector('[role="tooltip"]')!.textContent).toBe(
    'Rotate clockwise',
  );
});
it('attaches a shared HTML tooltip to SVG actions without a native SVG title', () => {
  document.body.append(host);
  act(() =>
    render(
      <IconToolbar
        actions={[
          { id: 'bold', label: 'Bold', title: 'Make text bold', text: 'B' },
        ]}
        onAction={() => {}}
      />,
      host,
    ),
  );
  const action = host.querySelector<SVGGElement>('[role="button"]')!;
  expect(action.querySelector('title')).toBeNull();
  act(() => action.dispatchEvent(new Event('pointerenter')));
  expect(document.querySelector('[role="tooltip"]')!.textContent).toBe(
    'Make text bold',
  );
  expect(document.querySelector('[role="tooltip"]')!.namespaceURI).toBe(
    'http://www.w3.org/1999/xhtml',
  );
  act(() => action.dispatchEvent(new Event('pointerleave')));
  expect(document.querySelector('[role="tooltip"]')).toBeNull();
});

it('uses the same tooltip for native input, textarea and disclosure titles', async () => {
  const { Input, TextArea, Summary } = await import('../native-control');
  document.body.append(host);
  act(() =>
    render(
      <>
        <Input title="Input hint" />
        <TextArea title="Text hint" />
        <details>
          <Summary title="Disclosure hint">Details</Summary>
        </details>
      </>,
      host,
    ),
  );
  for (const [selector, text] of [
    ['input', 'Input hint'],
    ['textarea', 'Text hint'],
    ['summary', 'Disclosure hint'],
  ]) {
    const control = host.querySelector<HTMLElement>(selector)!;
    expect(control.hasAttribute('title')).toBe(false);
    act(() => control.focus());
    expect(
      document.querySelector('.rv-tooltip:not([hidden])')?.textContent,
    ).toBe(text);
    act(() => control.blur());
  }
});

it('restores composite focus when Escape dismisses an SVG action tooltip', () => {
  document.body.append(host);
  const onEscape = vi.fn();
  act(() =>
    render(
      <IconToolbar
        actions={[{ id: 'bold', label: 'Bold' }]}
        onAction={() => {}}
        onEscape={onEscape}
      />,
      host,
    ),
  );
  const action = host.querySelector<SVGGElement>('[role="button"]')!;
  act(() => action.focus());
  expect(document.querySelector('.rv-tooltip:not([hidden])')).not.toBeNull();
  act(() =>
    action.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
        cancelable: true,
      }),
    ),
  );
  expect(onEscape).toHaveBeenCalledOnce();
  expect(document.querySelector('.rv-tooltip:not([hidden])')).toBeNull();
});
