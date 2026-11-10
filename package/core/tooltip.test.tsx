/** @jsxImportSource preact */
import { render } from 'preact';
import { act } from 'preact/test-utils';
import { afterEach, expect, it, vi } from 'vitest';
import { useTooltip } from './tooltip';
import { TooltipController } from '../surfaces';
import { ensureTooltipStyles, prepareTooltipSurface } from './tooltip-surface';

const host = document.createElement('div');
afterEach(() => {
  act(() => render(null, host));
  host.remove();
  vi.useRealTimers();
});
function Hint({
  text = 'Formatting',
  delay = 0,
}: {
  text?: string;
  delay?: number;
}) {
  const hint = useTooltip(text, true, {
    delay,
    content: <strong>{text}</strong>,
  });
  return (
    <>
      <button {...hint.triggerProps}>Hint</button>
      {hint.tooltip}
    </>
  );
}
it('shares ownership and surface between declarative, SVG and imperative consumers', () => {
  document.body.append(host);
  act(() => render(<Hint />, host));
  const trigger = host.querySelector('button')!;
  act(() => trigger.focus());
  const hint = host.querySelector<HTMLElement>('[role="tooltip"]')!;
  expect(hint.classList.contains('rv-tooltip')).toBe(true);
  expect(hint.querySelector('strong')?.textContent).toBe('Formatting');
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  const anchor = document.createElementNS(svg.namespaceURI, 'g') as SVGGElement;
  svg.append(anchor);
  host.append(svg);
  const controller = new TooltipController();
  const dispose = controller.bind(anchor, 'Chart action');
  act(() => anchor.dispatchEvent(new Event('pointerenter')));
  expect(hint.hidden).toBe(true);
  expect(document.querySelectorAll('.rv-tooltip:not([hidden])')).toHaveLength(
    1,
  );
  dispose();
  act(() => trigger.dispatchEvent(new MouseEvent('mouseenter')));
  expect(hint.hidden).toBe(false);
  act(() =>
    trigger.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
    ),
  );
  expect(hint.hidden).toBe(true);
});
it('cancels delayed hints on Escape, message changes and unmount', () => {
  vi.useFakeTimers();
  document.body.append(host);
  act(() => render(<Hint delay={500} />, host));
  const trigger = host.querySelector('button')!;
  act(() => trigger.focus());
  act(() =>
    trigger.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
    ),
  );
  act(() => vi.advanceTimersByTime(600));
  expect(host.querySelector<HTMLElement>('[role="tooltip"]')!.hidden).toBe(
    true,
  );
  act(() => trigger.dispatchEvent(new MouseEvent('mouseenter')));
  act(() => render(<Hint text="New" delay={500} />, host));
  act(() => vi.advanceTimersByTime(600));
  expect(host.querySelector<HTMLElement>('[role="tooltip"]')!.hidden).toBe(
    true,
  );
  act(() => trigger.dispatchEvent(new MouseEvent('mouseenter')));
  act(() => render(null, host));
  expect(vi.getTimerCount()).toBe(0);
});
it('installs one presentation per document and shadow root without changing grid tooltip markup', () => {
  document.body.append(host);
  const shadow = host.attachShadow({ mode: 'open' });
  const chart = document.createElement('div');
  shadow.append(chart);
  prepareTooltipSurface(chart);
  ensureTooltipStyles(shadow);
  expect(shadow.querySelectorAll('[data-rv-tooltip-styles]')).toHaveLength(1);
  expect(chart.className).toBe('rv-tooltip');
  expect(chart.getAttribute('role')).toBe('tooltip');
  const grid = document.createElement('div');
  grid.className = 'grid-tooltip';
  expect(grid.classList.contains('rv-tooltip')).toBe(false);
});

it('describes an already-focused framework trigger when its controller binds', () => {
  document.body.append(host);
  const trigger = document.createElement('button');
  trigger.textContent = 'Framework help';
  host.append(trigger);
  trigger.focus();
  const controller = new TooltipController();
  const dispose = controller.bind(trigger, 'Framework details');
  const tooltip = document.querySelector<HTMLElement>(
    '.rv-tooltip:not([hidden])',
  );
  expect(tooltip?.textContent).toBe('Framework details');
  expect(trigger.getAttribute('aria-describedby')).toBe(tooltip?.id);
  dispose();
  expect(trigger.hasAttribute('aria-describedby')).toBe(false);
  const disposeClick = controller.bind(trigger, 'Click-only details', {
    trigger: 'click',
  });
  expect(document.querySelector('.rv-tooltip:not([hidden])')).toBeNull();
  trigger.click();
  expect(document.querySelector('.rv-tooltip:not([hidden])')?.textContent).toBe(
    'Click-only details',
  );
  disposeClick();
});
