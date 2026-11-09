import { h, render } from 'preact';
import { act } from 'preact/test-utils';
import { afterEach, expect, it, vi } from 'vitest';
import {
  IconChoiceGroup,
  InspectorSection,
  TypographyControls,
  ComparisonPreview,
} from './index';
const icon = '<svg viewBox="0 0 16 16"><path d="M0 0h16v16z"/></svg>';
const host = document.createElement('div');
afterEach(() => {
  act(() => render(null, host));
  host.remove();
});
function mount(node: preact.ComponentChildren) {
  document.body.append(host);
  act(() => render(node, host));
}
it('keeps icon choices controlled and dismisses the focused tooltip before bubbling Escape', () => {
  const change = vi.fn(),
    escape = vi.fn();
  mount(
    <div onKeyDown={escape}>
      <IconChoiceGroup
        value="left"
        ariaLabel="Alignment"
        options={[
          { value: 'left', label: 'Left', icon },
          { value: 'right', label: 'Right', icon },
        ]}
        onChange={change}
      />
    </div>,
  );
  const buttons = host.querySelectorAll('button');
  act(() => buttons[1].click());
  expect(change).toHaveBeenCalledWith('right');
  expect(buttons[0].getAttribute('aria-pressed')).toBe('true');
  expect(buttons[1].getAttribute('aria-pressed')).toBe('false');
  act(() => buttons[0].focus());
  const tooltip = document.getElementById(
    buttons[0].getAttribute('aria-describedby')!,
  )!;
  expect(tooltip.dataset.visible).toBe('true');
  act(() =>
    buttons[0].dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
        cancelable: true,
      }),
    ),
  );
  expect(tooltip.dataset.visible).toBe('false');
  expect(escape).not.toHaveBeenCalled();
  act(() =>
    buttons[0].dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
    ),
  );
  expect(escape).toHaveBeenCalledOnce();
});
it('synchronizes inspector labels with native disclosure state', () => {
  mount(
    <InspectorSection
      title="Details"
      icon={icon}
      expandLabel="Expand Details"
      collapseLabel="Collapse Details"
      open
    >
      <input aria-label="Name" />
    </InspectorSection>,
  );
  const details = host.querySelector('details')!;
  expect(host.querySelector('summary')?.getAttribute('aria-label')).toBe(
    'Collapse Details',
  );
  act(() => {
    details.open = false;
    details.dispatchEvent(new Event('toggle'));
  });
  expect(host.querySelector('summary')?.getAttribute('aria-expanded')).toBe(
    'false',
  );
  expect(host.querySelector('summary')?.getAttribute('aria-label')).toBe(
    'Expand Details',
  );
});
it('emits typography patches without grid models and preserves literal comparison text', () => {
  const change = vi.fn();
  mount(
    <TypographyControls
      value={{ bold: true }}
      fonts={['Georgia']}
      labels={{
        fontFamily: 'Font',
        defaultFont: 'Default',
        fontSize: 'Size',
        typographySection: 'Style',
        bold: 'Bold',
        italic: 'Italic',
        underline: 'Underline',
        strike: 'Strike',
      }}
      icons={{ bold: icon, italic: icon, underline: icon, strike: icon }}
      onChange={change}
    />,
  );
  const size = host.querySelector('input')!;
  act(() => {
    size.value = '18';
    size.dispatchEvent(new Event('input', { bubbles: true }));
  });
  expect(change).toHaveBeenLastCalledWith({ fontSize: 18 });
  act(() => {
    size.value = '';
    size.dispatchEvent(new Event('input', { bubbles: true }));
  });
  expect(change).toHaveBeenLastCalledWith({ fontSize: undefined });
  act(() =>
    host.querySelector<HTMLButtonElement>('[aria-label="Bold"]')!.click(),
  );
  expect(change).toHaveBeenLastCalledWith({ bold: false });
  mount(
    <ComparisonPreview
      originalValue="<b>literal</b>"
      formatted={<strong>Formatted</strong>}
      labels={{
        title: 'Preview',
        original: 'Original',
        formatted: 'Formatted',
        hint: 'Sample',
      }}
    />,
  );
  expect(
    host.querySelector('.rv-format-preview__original-value')?.textContent,
  ).toBe('<b>literal</b>');
  expect(host.querySelector('.rv-format-preview__original-value b')).toBeNull();
  expect(
    host.querySelector('[role="table"]')?.querySelectorAll('[role="row"]'),
  ).toHaveLength(2);
  expect(
    host.querySelector('[role="table"]')?.querySelectorAll('[role="cell"]'),
  ).toHaveLength(3);
  expect(
    host.querySelector('[role="status"]')?.closest('[role="cell"]'),
  ).not.toBeNull();
  expect(host.querySelector('[role="status"] strong')?.textContent).toBe(
    'Formatted',
  );
});

it('does not pin a tooltip to a pointer-focused control after the pointer leaves', () => {
  mount(
    <IconChoiceGroup
      value="left"
      ariaLabel="Alignment"
      options={[{ value: 'left', label: 'Left', icon }]}
      onChange={() => {}}
    />,
  );
  const button = host.querySelector('button')!;
  act(() => button.dispatchEvent(new Event('pointerdown')));
  act(() => button.focus());
  expect(
    host.querySelector('[role=tooltip]')?.getAttribute('data-visible'),
  ).toBe('true');
  act(() => button.dispatchEvent(new MouseEvent('mouseleave')));
  expect(
    host.querySelector('[role=tooltip]')?.getAttribute('data-visible'),
  ).toBe('false');
});

it('keeps only the current formatting tooltip open and dismisses it on scroll', () => {
  mount(
    <IconChoiceGroup
      value="left"
      ariaLabel="Alignment"
      options={[
        { value: 'left', label: 'Left', icon },
        { value: 'right', label: 'Right', icon },
      ]}
      onChange={() => {}}
    />,
  );
  const buttons = host.querySelectorAll('button');
  act(() => buttons[0].focus());
  act(() => buttons[1].dispatchEvent(new MouseEvent('mouseenter')));
  expect(host.querySelectorAll('[data-visible=true]')).toHaveLength(1);
  expect(host.querySelector('[data-visible=true]')?.textContent).toBe('Right');
  act(() => document.dispatchEvent(new Event('scroll')));
  expect(host.querySelectorAll('[data-visible=true]')).toHaveLength(0);
});
