import { render } from 'preact';
import { act } from 'preact/test-utils';
import { afterEach, expect, it, vi } from 'vitest';
import {
  SvgToolbarButton,
  IconToolbar,
  SVG_TOOLBAR_BUTTON_STYLES,
  ICON_TOOLBAR_ICONS,
} from './icon-toolbar';
const host = document.createElement('div');
document.body.append(host);
afterEach(() => act(() => render(null, host)));
it('renders portable SVG actions with consumer metadata and measurement refs', () => {
  const rectangle = vi.fn(),
    text = vi.fn();
  act(() =>
    render(
      <svg>
        <SvgToolbarButton
          action="in"
          label="Ampliar"
          text="+"
          enabled
          x={10}
          y={20}
          foreground="navy"
          attributes={{ 'data-product-action': 'in' }}
          onRectangle={rectangle}
          onText={text}
        />
      </svg>,
      host,
    ),
  );
  const button = host.querySelector('[role="button"]')!;
  expect(button.getAttribute('aria-label')).toBe('Ampliar');
  expect(button.getAttribute('data-product-action')).toBe('in');
  expect(button.getAttribute('tabindex')).toBe('0');
  expect(rectangle.mock.calls[0][0]).toBe(host.querySelector('rect'));
  expect(text.mock.calls[0][0]).toBe(host.querySelector('text'));
  expect(host.querySelector('text')!.getAttribute('fill')).toBe('navy');
  expect(host.querySelector('rect')!.namespaceURI).toBe(
    'http://www.w3.org/2000/svg',
  );
  expect(SVG_TOOLBAR_BUTTON_STYLES).toContain('focus-visible');
});
it('activates explicit actions by pointer, Enter and Space while ignoring disabled actions', () => {
  const activate = vi.fn();
  act(() =>
    render(
      <IconToolbar
        actions={[
          { id: 'in', label: 'Zoom in', text: '+' },
          { id: 'out', label: 'Zoom out', text: '−', disabled: true },
        ]}
        onAction={activate}
      />,
      host,
    ),
  );
  const [enabled, disabled] = [...host.querySelectorAll('[role="button"]')];
  act(() => {
    enabled.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    enabled.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }),
    );
    enabled.dispatchEvent(
      new KeyboardEvent('keydown', { key: ' ', bubbles: true }),
    );
    disabled.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    disabled.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }),
    );
  });
  expect(activate.mock.calls).toEqual([['in'], ['in'], ['in']]);
  expect(disabled.getAttribute('tabindex')).toBe('-1');
  expect(disabled.getAttribute('aria-disabled')).toBe('true');
});

it('renders actual SVG assets for every toolbar icon without visible font glyphs', () => {
  act(() =>
    render(
      <IconToolbar
        actions={Object.entries(ICON_TOOLBAR_ICONS).map(([id, icon]) => ({
          id,
          label: id,
          icon,
        }))}
        onAction={() => {}}
      />,
      host,
    ),
  );
  expect(host.querySelectorAll('[data-rv-toolbar-icon]')).toHaveLength(7);
  expect(host.querySelectorAll('[data-rv-toolbar-icon] path')).toHaveLength(7);
  expect(
    [...host.querySelectorAll('[data-rv-toolbar-icon]')].every(
      (icon) =>
        icon.getAttribute('width') === '12' &&
        icon.getAttribute('height') === '12',
    ),
  ).toBe(true);
  expect(
    [...host.querySelectorAll('text')].every(
      (text) => text.getAttribute('visibility') === 'hidden',
    ),
  ).toBe(true);
});

it('supports pressed formatting actions and secondary heading icons without changing plain actions', () => {
  act(() =>
    render(
      <IconToolbar
        label="Formatting"
        actions={[
          {
            id: 'heading',
            label: 'Heading 1',
            icon: ICON_TOOLBAR_ICONS.plus,
            suffixIcon: ICON_TOOLBAR_ICONS.minus,
            pressed: true,
          },
          {
            id: 'plain',
            label: 'Plain action',
            icon: ICON_TOOLBAR_ICONS.reset,
          },
        ]}
        onAction={() => {}}
      />,
      host,
    ),
  );
  const [heading, plain] = [...host.querySelectorAll('[role="button"]')];
  expect(heading.getAttribute('aria-pressed')).toBe('true');
  expect(heading.querySelectorAll(':scope > svg')).toHaveLength(2);
  expect(plain.hasAttribute('aria-pressed')).toBe(false);
  expect(plain.querySelectorAll(':scope > svg')).toHaveLength(1);
});
