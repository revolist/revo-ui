import { describe, expect, it, vi } from 'vitest';
import { createNumberStepperElement } from './number-stepper-native';

describe('native number stepper', () => {
  it('keeps the input, respects bounds, and emits input events', () => {
    const input = document.createElement('input');
    input.type = 'number';
    input.min = '0';
    input.max = '2';
    input.value = '1';
    const onInput = vi.fn();
    input.addEventListener('input', onInput);
    const stepper = createNumberStepperElement({ input, decreaseLabel: 'Diminuer', increaseLabel: 'Augmenter' });
    expect(stepper.element.querySelector('input')).toBe(input);
    expect(stepper.increase.getAttribute('aria-label')).toBe('Augmenter');
    stepper.increase.click();
    stepper.increase.click();
    expect(input.value).toBe('2');
    expect(onInput).toHaveBeenCalledTimes(1);
    input.disabled = true;
    stepper.decrease.click();
    expect(input.value).toBe('2');
  });
  it('steps decimal values without introducing floating point noise', () => {
    const input = document.createElement('input');
    input.type = 'number';
    input.step = '0.1';
    input.value = '0.2';
    const stepper = createNumberStepperElement({ input, decreaseLabel: 'Decrease', increaseLabel: 'Increase' });
    stepper.increase.click();
    expect(input.value).toBe('0.3');
  });
  it('uses the input minimum as the step base', () => {
    const input = document.createElement('input');
    input.type = 'number';
    input.min = '0.5';
    input.step = '1';
    input.value = '0.5';
    const stepper = createNumberStepperElement({ input, decreaseLabel: 'Decrease', increaseLabel: 'Increase' });
    stepper.increase.click();
    expect(input.value).toBe('1.5');
  });
});
