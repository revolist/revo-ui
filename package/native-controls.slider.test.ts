import { afterEach, expect, it, vi } from 'vitest';
import { renderScalarSlider } from './native-controls';
const host = document.createElement('div');
afterEach(() => host.replaceChildren());
// Exercise the renderer-neutral adapter with native DOM events (Preact compat
// deliberately maps range onChange to input, unlike the Stencil grid host).
function h(
  tag: string,
  props: Record<string, any>,
  children: any[] | string = [],
) {
  const element = document.createElement(tag);
  for (const [key, value] of Object.entries(props)) {
    if (key.startsWith('on'))
      element.addEventListener(key.slice(2).toLowerCase(), value);
    else if (key === 'style') {
      for (const [name, item] of Object.entries(value))
        element.style.setProperty(name, String(item));
    } else if (value != null) element.setAttribute(key, String(value));
  }
  for (const child of [children].flat()) element.append(child);
  return element;
}
it('previews formatted badge values without committing until change', () => {
  const commit = vi.fn();
  host.append(
    renderScalarSlider(h, {
      min: 0,
      max: 100,
      step: 5,
      value: 25,
      displayValue: '25%',
      formatValue: (value) => `${value}%`,
      thresholdClassNames: 'high',
      onChange: commit,
    }),
  );
  const input = host.querySelector<HTMLInputElement>('input')!;
  expect(input.classList.contains('rv-single-slider')).toBe(true);
  const badge = host.querySelector('.revo-slider-value.rv-badge')!;
  expect(badge.textContent).toBe('25%');
  input.value = '60';
  input.dispatchEvent(new Event('input', { bubbles: true }));
  expect(badge.textContent).toBe('60%');
  expect(input.style.getPropertyValue('--rv-single-slider-value')).toBe('60%');
  expect(input.getAttribute('aria-valuetext')).toBe('60%');
  expect(commit).not.toHaveBeenCalled();
  const event = new Event('change', { bubbles: true });
  input.dispatchEvent(event);
  expect(commit).toHaveBeenCalledExactlyOnceWith(60, event);
});
it('retains bounds, step, threshold hooks and hidden-value mode', () => {
  host.append(
    renderScalarSlider(h, {
      min: -10,
      max: 10,
      step: 0.5,
      value: 0,
      hideValue: true,
      thresholdClassNames: 'medium',
      thresholds: [{ value: 5, className: 'high' }],
      onChange: () => {},
    }),
  );
  expect(host.querySelector('.revo-slider-value')).toBeNull();
  const input = host.querySelector<HTMLInputElement>('input')!;
  expect([input.min, input.max, input.step]).toEqual(['-10', '10', '0.5']);
  expect(input.style.getPropertyValue('--rv-single-slider-value')).toBe('50%');
  expect(host.querySelector('.revo-slider-threshold.high')).toBeTruthy();
});
