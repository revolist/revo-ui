import type { RangeSliderProps, SliderRange } from './types';

/**
 * Range inputs can contain decimals while native range inputs work most
 * predictably with integers. Slider logic stores values as scaled integers and
 * converts back to numbers only when displaying values or emitting filter state.
 *
 * @example
 * ```ts
 * const state = normalizeSliderState({
 *   min: 0,
 *   max: 1000,
 *   fromValue: 250,
 *   toValue: 640.42,
 * });
 *
 * const range = toSliderRange(state.fromValueInt, state.toValueInt);
 * // { fromValue: 250, toValue: 640.42 }
 * ```
 */
export const SLIDER_SCALE_FACTOR = 100;

export type ScaledSliderState = {
  minInt: number;
  maxInt: number;
  fromValueInt: number;
  toValueInt: number;
};

export type SliderStateInput = {
  min: number;
  max: number;
  fromValue: number;
  toValue: number;
  scaleFactor?: number;
};

export function scaleSliderValue(
  value: number,
  scaleFactor = SLIDER_SCALE_FACTOR,
) {
  return Math.round(Number(value) * scaleFactor);
}

/** Compares ranges in the same scaled space used by the native handles. */
export function isFullSliderRange(
  range: SliderRange,
  bounds: Pick<RangeSliderProps, 'min' | 'max' | 'scaleFactor'>,
) {
  const scaleFactor =
    Number.isFinite(bounds.scaleFactor) && Number(bounds.scaleFactor) > 0
      ? Number(bounds.scaleFactor)
      : SLIDER_SCALE_FACTOR;
  return (
    scaleSliderValue(range.fromValue, scaleFactor) <=
      scaleSliderValue(bounds.min, scaleFactor) &&
    scaleSliderValue(range.toValue, scaleFactor) >=
      scaleSliderValue(bounds.max, scaleFactor)
  );
}

export function unscaleSliderValue(
  value: number,
  scaleFactor = SLIDER_SCALE_FACTOR,
) {
  return Number(value) / scaleFactor;
}

export function normalizeSliderState({
  min,
  max,
  fromValue,
  toValue,
  scaleFactor = SLIDER_SCALE_FACTOR,
}: SliderStateInput): ScaledSliderState {
  const minInt = Math.min(
    scaleSliderValue(min, scaleFactor),
    scaleSliderValue(max, scaleFactor),
  );
  const maxInt = Math.max(
    scaleSliderValue(min, scaleFactor),
    scaleSliderValue(max, scaleFactor),
  );
  const initialFromValueInt = clampScaledValue(
    scaleSliderValue(fromValue, scaleFactor),
    minInt,
    maxInt,
  );
  const initialToValueInt = clampScaledValue(
    scaleSliderValue(toValue, scaleFactor),
    minInt,
    maxInt,
  );

  return {
    minInt,
    maxInt,
    fromValueInt: Math.min(initialFromValueInt, initialToValueInt),
    toValueInt: Math.max(initialFromValueInt, initialToValueInt),
  };
}

export function clampScaledValue(
  value: number,
  minInt: number,
  maxInt: number,
) {
  return Math.min(Math.max(value, minInt), maxInt);
}

export function normalizeFromSlider(fromValueInt: number, toValueInt: number) {
  return Math.min(fromValueInt, toValueInt);
}

export function normalizeToSlider(fromValueInt: number, toValueInt: number) {
  return Math.max(toValueInt, fromValueInt);
}

export function normalizeFromInputValue(
  value: number,
  currentToValueInt: number,
  state: Pick<ScaledSliderState, 'minInt' | 'maxInt'>,
  scaleFactor = SLIDER_SCALE_FACTOR,
) {
  return Math.min(
    clampScaledValue(
      scaleSliderValue(value, scaleFactor),
      state.minInt,
      state.maxInt,
    ),
    currentToValueInt,
  );
}

export function normalizeToInputValue(
  value: number,
  currentFromValueInt: number,
  state: Pick<ScaledSliderState, 'minInt' | 'maxInt'>,
  scaleFactor = SLIDER_SCALE_FACTOR,
) {
  return Math.max(
    clampScaledValue(
      scaleSliderValue(value, scaleFactor),
      state.minInt,
      state.maxInt,
    ),
    currentFromValueInt,
  );
}

export function toSliderRange(
  fromValueInt: number,
  toValueInt: number,
  scaleFactor = SLIDER_SCALE_FACTOR,
): SliderRange {
  return {
    fromValue: unscaleSliderValue(fromValueInt, scaleFactor),
    toValue: unscaleSliderValue(toValueInt, scaleFactor),
  };
}

export function toSliderDisplayValue(
  valueInt: number,
  scaleFactor = SLIDER_SCALE_FACTOR,
) {
  return String(unscaleSliderValue(valueInt, scaleFactor));
}

export function formatSliderInputValue(value: number) {
  return String(value);
}

/** Default formatter shared by slider labels, tooltips, and header ranges. */
export function formatSliderValue(value?: number) {
  if (value === undefined) {
    return '';
  }
  return value % 1 === 0 ? value.toString() : value.toFixed(2);
}

/**
 * Default editable input parser.
 * Accepts both `640.42` and `640,42`; returns `NaN` for empty text so partial
 * edits do not reset the current slider selection while the user is typing.
 */
export function parseSliderInputValue(value: string) {
  const normalized = value.trim().replace(',', '.');
  if (!normalized) {
    return Number.NaN;
  }
  return Number(normalized);
}
