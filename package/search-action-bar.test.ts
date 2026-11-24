// @vitest-environment happy-dom
import { expect, it, vi } from 'vitest';
import { createSearchActionBar } from './search-action-bar';

it('composes a localized search with caller-owned actions and preserves their handlers', () => {
  const bar = createSearchActionBar(document, {
    label: 'Buscar productos',
    shortcut: '/',
  });
  const action = document.createElement('button');
  action.textContent = 'Filtrar';
  const clicked = vi.fn();
  action.addEventListener('click', clicked);
  bar.setActions([action]);
  document.body.append(bar.element);
  expect(bar.input.getAttribute('aria-label')).toBe('Buscar productos');
  expect(
    bar.element.querySelector('.rv-search-input-shortcut')?.textContent,
  ).toBe('/');
  expect(bar.element.querySelector('svg')).not.toBeNull();
  document.body.dispatchEvent(
    new KeyboardEvent('keydown', { key: '/', bubbles: true, cancelable: true }),
  );
  expect(document.activeElement).toBe(bar.input);
  action.click();
  expect(clicked).toHaveBeenCalledOnce();
  bar.setActions([]);
  expect(
    bar.element.querySelector<HTMLElement>('.rv-search-action-bar__actions')
      ?.hidden,
  ).toBe(true);
  bar.destroy();
  expect(bar.element.isConnected).toBe(false);
  const event = new KeyboardEvent('keydown', {
    key: '/',
    bubbles: true,
    cancelable: true,
  });
  document.body.dispatchEvent(event);
  expect(event.defaultPrevented).toBe(false);
});

it('shows localized icon-action tooltips and releases them with the bar', () => {
  vi.useFakeTimers();
  const bar = createSearchActionBar(document, { label: 'Buscar' });
  const button = document.createElement('button');
  button.setAttribute('aria-label', 'Columnas');
  bar.setActions([button]);
  document.body.append(bar.element);
  button.focus();
  vi.advanceTimersByTime(200);
  expect(document.querySelector('[role=tooltip]')?.textContent).toBe(
    'Columnas',
  );
  bar.destroy();
  expect(document.querySelector('[role=tooltip]')).toBeNull();
  vi.useRealTimers();
});

it('uses the search field outline icon in the native action bar', () => {
  const bar = createSearchActionBar(document, { label: 'Search' });
  const icon = bar.element.querySelector('svg');
  expect(icon?.getAttribute('fill')).toBe('none');
  expect(icon?.querySelector('circle')).not.toBeNull();
  expect(icon?.querySelector('line')).not.toBeNull();
  bar.destroy();
});
