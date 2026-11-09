import type { RangeSliderProps } from './types';
import { renderSliderControl } from './control';
import { renderRangeInputs } from './inputs';
import {
  formatSliderInputValue,
  formatSliderValue,
  normalizeSliderState,
  parseSliderInputValue,
  scaleSliderValue,
  SLIDER_SCALE_FACTOR,
  unscaleSliderValue,
} from './logic';
import {
  syncVisuals,
  type RangeSliderRefs,
  type RangeSliderRuntime,
} from './runtime';

export type RangeSliderElementFactory = (
  type: string,
  props: Record<string, unknown> | null,
  ...children: unknown[]
) => unknown;

function renderRangeLabels(
  h: RangeSliderElementFactory,
  runtime: RangeSliderRuntime,
) {
  const { fromValueInt, toValueInt } = runtime.state;
  const { scaleFactor } = runtime;

  return h(
    'div',
    { className: 'range-values' },
    h(
      'span',
      {
        ref: (el?: HTMLSpanElement) => {
          runtime.refs.fromLabel = el;
          if (el)
            el.textContent = runtime.formatFromValue(
              unscaleSliderValue(fromValueInt, scaleFactor),
            );
        },
      },
      runtime.formatFromValue(unscaleSliderValue(fromValueInt, scaleFactor)),
    ),
    h(
      'span',
      {
        ref: (el?: HTMLSpanElement) => {
          runtime.refs.toLabel = el;
          if (el)
            el.textContent = runtime.formatToValue(
              unscaleSliderValue(toValueInt, scaleFactor),
            );
        },
      },
      runtime.formatToValue(unscaleSliderValue(toValueInt, scaleFactor)),
    ),
  );
}

/** Renderer shared by the Stencil filter shell and Preact structured editors. */
export function renderRangeSlider(
  h: RangeSliderElementFactory,
  props: RangeSliderProps,
) {
  const {
    min,
    max,
    fromValue,
    toValue,
    showTooltips = false,
    showRangeDisplay = false,
    showRangeInputs = false,
    disabled = false,
    scaleFactor,
    step,
    className,
    controlClassName,
    fromClassName,
    toClassName,
    fromAriaLabel,
    toAriaLabel,
    onRangeChange,
    onRangeCommit,
    formatValue = formatSliderValue,
    formatFromValue = formatValue,
    formatToValue = formatValue,
    formatInputValue = formatSliderInputValue,
    parseInputValue,
  } = props;
  const effectiveScaleFactor =
    Number.isFinite(scaleFactor) && Number(scaleFactor) > 0
      ? Number(scaleFactor)
      : SLIDER_SCALE_FACTOR;
  const refs: RangeSliderRefs = {};
  const state = normalizeSliderState({
    min,
    max,
    fromValue,
    toValue,
    scaleFactor: effectiveScaleFactor,
  });
  const declaredNativeStep =
    Number.isFinite(step) && Number(step) > 0
      ? Math.max(1, scaleSliderValue(Number(step), effectiveScaleFactor))
      : 1;
  const nativeStep =
    (state.maxInt - state.minInt) % declaredNativeStep === 0
      ? declaredNativeStep
      : 1;
  let syncFrame = 0;

  const runtime: RangeSliderRuntime = {
    refs,
    state,
    scaleFactor: effectiveScaleFactor,
    nativeStep,
    formatValue,
    formatFromValue,
    formatToValue,
    formatInputValue,
    parseInputValue: parseInputValue ?? parseSliderInputValue,
    showTooltips,
    onRangeChange,
    onRangeCommit,
    disabled,
    controlClassName,
    fromClassName,
    toClassName,
    fromAriaLabel,
    toAriaLabel,
    syncVisuals: () => syncVisuals(runtime),
    scheduleSyncVisuals: () => {
      if (syncFrame) cancelAnimationFrame(syncFrame);
      syncFrame = requestAnimationFrame(() => {
        syncFrame = 0;
        runtime.syncVisuals();
      });
    },
  };

  return h(
    'div',
    {
      className: `range_container${className ? ` ${className}` : ''}`,
    },
    showRangeDisplay ? renderRangeLabels(h, runtime) : null,
    renderSliderControl(h, runtime),
    showRangeInputs ? renderRangeInputs(h, runtime) : null,
  );
}
