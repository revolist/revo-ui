import { normalizeFromSlider, normalizeToSlider } from './logic';
import {
  emitRangeCommit,
  emitRangeChange,
  hideTooltip,
  setToggleAccessible,
  updateTooltip,
  type RangeSliderRuntime,
} from './runtime';
import type { RangeSliderElementFactory } from './component';

const commitListeners = new WeakMap<HTMLInputElement, EventListener>();

function bindCommitListener(
  input: HTMLInputElement,
  runtime: RangeSliderRuntime,
) {
  const previous = commitListeners.get(input);
  if (previous) input.removeEventListener('change', previous);
  const listener = () => emitRangeCommit(runtime);
  commitListeners.set(input, listener);
  input.addEventListener('change', listener);
}

/**
 * Renders the dual native range inputs used as slider handles.
 * Shared runtime helpers keep handle position, highlighted track, labels,
 * tooltips, and optional editable inputs synchronized.
 */
export function renderSliderControl(
  h: RangeSliderElementFactory,
  runtime: RangeSliderRuntime,
) {
  const sliderControls = [];
  const { minInt, maxInt, fromValueInt, toValueInt } = runtime.state;

  if (runtime.showTooltips) {
    sliderControls.push(
      h('div', {
        className: 'slider-tooltip',
        hidden: true,
        ref: (el?: HTMLDivElement) => (runtime.refs.fromTooltip = el),
      }),
    );
  }

  sliderControls.push(
    h('input', {
      ref: (el?: HTMLInputElement) => {
        runtime.refs.fromSlider = el;
        if (el) {
          el.value = String(fromValueInt);
          bindCommitListener(el, runtime);
          runtime.scheduleSyncVisuals();
        }
      },
      className: `fromSlider${runtime.fromClassName ? ` ${runtime.fromClassName}` : ''}`,
      type: 'range',
      value: String(fromValueInt),
      min: minInt,
      max: maxInt,
      step: runtime.nativeStep,
      disabled: runtime.disabled,
      'aria-label': runtime.fromAriaLabel,
      'aria-valuetext': runtime.formatFromValue(
        runtime.state.fromValueInt / runtime.scaleFactor,
      ),
      onInput: () => {
        if (!runtime.refs.fromSlider || !runtime.refs.toSlider) return;
        runtime.refs.fromSlider.value = String(
          normalizeFromSlider(
            Number(runtime.refs.fromSlider.value),
            Number(runtime.refs.toSlider.value),
          ),
        );
        runtime.syncVisuals();
        if (runtime.showTooltips && runtime.refs.fromTooltip) {
          updateTooltip(
            runtime.refs.fromSlider,
            runtime.refs.fromTooltip,
            runtime.state,
            runtime.formatFromValue,
            runtime.scaleFactor,
          );
        }
        emitRangeChange(runtime);
      },
      onMouseOver: () =>
        runtime.showTooltips &&
        runtime.refs.fromSlider &&
        runtime.refs.fromTooltip &&
        updateTooltip(
          runtime.refs.fromSlider,
          runtime.refs.fromTooltip,
          runtime.state,
          runtime.formatFromValue,
          runtime.scaleFactor,
        ),
      onMouseOut: () =>
        runtime.showTooltips &&
        runtime.refs.fromTooltip &&
        hideTooltip(runtime.refs.fromTooltip),
    }),
  );

  if (runtime.showTooltips) {
    sliderControls.push(
      h('div', {
        className: 'slider-tooltip',
        hidden: true,
        ref: (el?: HTMLDivElement) => (runtime.refs.toTooltip = el),
      }),
    );
  }

  sliderControls.push(
    h('input', {
      ref: (el?: HTMLInputElement) => {
        runtime.refs.toSlider = el;
        if (el) {
          el.value = String(toValueInt);
          bindCommitListener(el, runtime);
          runtime.scheduleSyncVisuals();
        }
      },
      className: `toSlider${runtime.toClassName ? ` ${runtime.toClassName}` : ''}`,
      type: 'range',
      value: String(toValueInt),
      min: minInt,
      max: maxInt,
      step: runtime.nativeStep,
      disabled: runtime.disabled,
      'aria-label': runtime.toAriaLabel,
      'aria-valuetext': runtime.formatToValue(
        runtime.state.toValueInt / runtime.scaleFactor,
      ),
      onInput: () => {
        if (!runtime.refs.fromSlider || !runtime.refs.toSlider) return;
        runtime.refs.toSlider.value = String(
          normalizeToSlider(
            Number(runtime.refs.fromSlider.value),
            Number(runtime.refs.toSlider.value),
          ),
        );
        runtime.syncVisuals();
        setToggleAccessible(runtime);
        if (runtime.showTooltips && runtime.refs.toTooltip) {
          updateTooltip(
            runtime.refs.toSlider,
            runtime.refs.toTooltip,
            runtime.state,
            runtime.formatToValue,
            runtime.scaleFactor,
          );
        }
        emitRangeChange(runtime);
      },
      onMouseOver: () =>
        runtime.showTooltips &&
        runtime.refs.toSlider &&
        runtime.refs.toTooltip &&
        updateTooltip(
          runtime.refs.toSlider,
          runtime.refs.toTooltip,
          runtime.state,
          runtime.formatToValue,
          runtime.scaleFactor,
        ),
      onMouseOut: () =>
        runtime.showTooltips &&
        runtime.refs.toTooltip &&
        hideTooltip(runtime.refs.toTooltip),
    }),
  );

  return h(
    'div',
    {
      className: `sliders_control range-slider-control${runtime.controlClassName ? ` ${runtime.controlClassName}` : ''}`,
    },
    sliderControls,
  );
}
