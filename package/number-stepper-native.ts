import { h } from 'preact';
import { createPreactElement } from './preact-mount';
import { createControl } from './control-presentation';

export interface NativeNumberStepperOptions {
  input: HTMLInputElement;
  decreaseLabel: string;
  increaseLabel: string;
  className?: string;
}

/** Compose the shared stepper around an existing native form control. */
export function createNumberStepperElement(options: NativeNumberStepperOptions) {
  const { input } = options;
  const doc = input.ownerDocument;
  const element = createPreactElement<HTMLDivElement>(doc, h('div', {}));
  element.className = ['rv-number-stepper', options.className].filter(Boolean).join(' ');
  const decrease = createControl(doc, 'button', { 'aria-label': options.decreaseLabel });
  const increase = createControl(doc, 'button', { 'aria-label': options.increaseLabel });
  decrease.type = increase.type = 'button';
  decrease.textContent = '−';
  increase.textContent = '+';
  const step = (direction: number) => {
    if (input.disabled || input.readOnly) return;
    const previous = input.value;
    if (input.step === 'any') {
      // Native stepping rejects "any"; use the default unit increment.
      const current = Number.isFinite(input.valueAsNumber) ? input.valueAsNumber : 0;
      const min = input.min === '' ? -Infinity : Number(input.min);
      const max = input.max === '' ? Infinity : Number(input.max);
      input.value = String(Math.max(min, Math.min(max, current + direction)));
    } else if (direction > 0) {
      input.stepUp();
    } else {
      input.stepDown();
    }
    // Normalize binary noise in implementations of native stepping that use floats.
    const decimalPlaces = (value: string) => {
      const [coefficient, exponent = '0'] = value.toLowerCase().split('e');
      return Math.max(0, (coefficient.split('.')[1]?.length ?? 0) - Number(exponent));
    };
    const places = Math.max(decimalPlaces(previous), decimalPlaces(input.step === 'any' || !input.step ? '1' : input.step), decimalPlaces(input.min));
    if (input.step !== 'any' && places <= 15 && Number.isFinite(input.valueAsNumber)) {
      input.value = String(Number(input.valueAsNumber.toFixed(places)));
    }
    if (input.value !== previous) {
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
  };
  decrease.addEventListener('click', () => step(-1));
  increase.addEventListener('click', () => step(1));
  element.append(decrease, input, increase);
  return { element, decrease, increase };
}
