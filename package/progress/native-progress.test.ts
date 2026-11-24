import { expect, it } from 'vitest';
import { createProgressElement } from './native-progress';

it('sets a localized label and safely bounds native progress', () => {
  const meter = createProgressElement(document, { label: 'Cobertura', value: 4, max: 3, className: 'positive' });
  expect(meter.getAttribute('aria-label')).toBe('Cobertura');
  expect(meter.value).toBe(3);
  expect(meter.className).toBe('positive');
  expect(createProgressElement(document, { label: 'Empty', value: null, max: 0 }).max).toBe(1);
});

it('leaves progress indeterminate when the value is unknown', () => {
  const meter = createProgressElement(document, { label: 'Loading', value: null, max: 100 });
  expect(meter.hasAttribute('value')).toBe(false);
});
