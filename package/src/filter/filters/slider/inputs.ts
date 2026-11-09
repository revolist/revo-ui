import { renderControl } from '../../../control-presentation';
import {
  normalizeFromInputValue,
  normalizeToInputValue,
  unscaleSliderValue,
} from './logic';
import {
  emitRangeChange,
  preventInvalidNumberKey,
  type RangeSliderRuntime,
} from './runtime';
import type { RangeSliderElementFactory } from './component';

/**
 * Renders optional editable range inputs for the selected slider range.
 * Inputs intentionally use `type="text"` with `inputMode="decimal"` so custom
 * formatters control comma/dot decimals instead of browser-localized number UI.
 */
export function renderRangeInputs(
  h: RangeSliderElementFactory,
  runtime: RangeSliderRuntime,
) {
  const { fromValueInt, toValueInt } = runtime.state;
  const inputProps = {
    type: 'text',
    inputMode: 'decimal',
    disabled: runtime.disabled,
    onKeyDown: preventInvalidNumberKey,
  };

  return h('div', { className: 'range-inputs' }, [
    renderControl(h, 'input', {
      ...inputProps,
      ref: (el?: HTMLInputElement) => {
        runtime.refs.fromInput = el;
        if (el) {
          el.value = runtime.formatInputValue(
            unscaleSliderValue(fromValueInt, runtime.scaleFactor),
          );
        }
      },
      'aria-label': runtime.fromAriaLabel ?? 'Minimum value',
      className: 'range-input from-range-input',
      value: runtime.formatInputValue(
        unscaleSliderValue(fromValueInt, runtime.scaleFactor),
      ),
      onInput: (event: Event) => {
        if (!runtime.refs.fromSlider || !runtime.refs.toSlider) return;
        const value = runtime.parseInputValue(
          (event.target as HTMLInputElement).value,
        );
        if (!Number.isFinite(value)) {
          return;
        }

        runtime.refs.fromSlider.value = String(
          normalizeFromInputValue(
            value,
            Number(runtime.refs.toSlider.value),
            runtime.state,
          ),
        );
        runtime.syncVisuals();
        emitRangeChange(runtime);
      },
    }),
    h('span', { className: 'range-input-separator' }, '-'),
    renderControl(h, 'input', {
      ...inputProps,
      ref: (el?: HTMLInputElement) => {
        runtime.refs.toInput = el;
        if (el) {
          el.value = runtime.formatInputValue(
            unscaleSliderValue(toValueInt, runtime.scaleFactor),
          );
        }
      },
      'aria-label': runtime.toAriaLabel ?? 'Maximum value',
      className: 'range-input to-range-input',
      value: runtime.formatInputValue(
        unscaleSliderValue(toValueInt, runtime.scaleFactor),
      ),
      onInput: (event: Event) => {
        if (!runtime.refs.fromSlider || !runtime.refs.toSlider) return;
        const value = runtime.parseInputValue(
          (event.target as HTMLInputElement).value,
        );
        if (!Number.isFinite(value)) {
          return;
        }

        runtime.refs.toSlider.value = String(
          normalizeToInputValue(
            value,
            Number(runtime.refs.fromSlider.value),
            runtime.state,
          ),
        );
        runtime.syncVisuals();
        emitRangeChange(runtime);
      },
    }),
  ]);
}
