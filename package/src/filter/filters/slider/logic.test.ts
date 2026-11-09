import { describe, expect, it } from 'vitest';
import {
  formatSliderInputValue,
  formatSliderValue,
  isFullSliderRange,
  normalizeFromInputValue,
  normalizeFromSlider,
  normalizeSliderState,
  normalizeToInputValue,
  normalizeToSlider,
  parseSliderInputValue,
  toSliderDisplayValue,
  toSliderRange,
} from './logic';

describe('slider filter logic', () => {
  it('normalizes bounds and initial values into an ordered scaled range', () => {
    expect(
      normalizeSliderState({
        min: 10,
        max: 0,
        fromValue: 8,
        toValue: 2,
      }),
    ).toEqual({
      minInt: 0,
      maxInt: 1000,
      fromValueInt: 200,
      toValueInt: 800,
    });
  });

  it('clamps initial values to slider bounds', () => {
    expect(
      normalizeSliderState({
        min: 0,
        max: 10,
        fromValue: -5,
        toValue: 15,
      }),
    ).toEqual({
      minInt: 0,
      maxInt: 1000,
      fromValueInt: 0,
      toValueInt: 1000,
    });
  });

  it('keeps slider handles from crossing', () => {
    expect(normalizeFromSlider(800, 500)).toBe(500);
    expect(normalizeToSlider(800, 500)).toBe(800);
  });

  it('clamps decimal input values and keeps them within the current range', () => {
    const state = normalizeSliderState({
      min: 0,
      max: 100,
      fromValue: 10,
      toValue: 75,
    });

    expect(normalizeFromInputValue(55.5, state.toValueInt, state)).toBe(5550);
    expect(normalizeFromInputValue(150, state.toValueInt, state)).toBe(7500);
    expect(normalizeToInputValue(0.55, state.fromValueInt, state)).toBe(1000);
  });

  it('converts scaled values back to filter ranges and input display values', () => {
    expect(toSliderRange(55, 5550)).toEqual({
      fromValue: 0.55,
      toValue: 55.5,
    });
    expect(toSliderDisplayValue(5550)).toBe('55.5');
  });

  it('formats inputs with dot decimals by default and parses comma decimals', () => {
    expect(formatSliderInputValue(640.42)).toBe('640.42');
    expect(parseSliderInputValue('640,42')).toBe(640.42);
    expect(parseSliderInputValue('640.42')).toBe(640.42);
  });

  it('formats compact slider display values consistently', () => {
    expect(formatSliderValue(10)).toBe('10');
    expect(formatSliderValue(10.5)).toBe('10.50');
    expect(formatSliderValue()).toBe('');
  });

  it('recognizes default ranges in the native slider scaled space', () => {
    expect(
      isFullSliderRange(
        { fromValue: 45.02, toValue: 140_000 },
        { min: 45.016, max: 140_000 },
      ),
    ).toBe(true);
    expect(
      isFullSliderRange(
        { fromValue: 45.02, toValue: 2_495 },
        { min: 45.016, max: 140_000 },
      ),
    ).toBe(false);
  });
});
