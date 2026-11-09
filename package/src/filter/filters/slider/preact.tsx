/** @jsxImportSource preact */
import { h } from 'preact';
import type { RangeSliderProps } from './types';
import { renderRangeSlider, type RangeSliderElementFactory } from './component';

/** Preact adapter for the shared slider renderer. */
export function PreactRangeSlider(props: RangeSliderProps) {
  return renderRangeSlider(
    h as RangeSliderElementFactory,
    props,
  ) as preact.VNode;
}
