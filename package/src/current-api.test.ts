import { expect, it } from 'vitest';
import * as ui from './preact';
import { uiComponents } from './component-catalog';
import { createPreactElement, releasePreactElement } from './preact-mount';
import { temporalPickerLabel } from './date-time/types';

it('publishes canonical component names without duplicate compatibility names', () => {
  for (const name of [
    'Icon',
    'RemovableChip',
    'Slider',
    'RangeSlider',
    'ResourcePicker',
    'FeedbackPanel',
  ]) {
    expect(Object.hasOwn(ui, name), name).toBe(false);
    expect(Object.hasOwn(uiComponents, name), name).toBe(false);
  }
  for (const name of [
    'SvgIcon',
    'FilterChip',
    'SingleValueSlider',
    'PreactRangeSlider',
    'SharedResourcePicker',
    'StatusFeedbackPanel',
  ])
    expect(Object.hasOwn(ui, name), name).toBe(true);
  expect(createPreactElement).toBeTypeOf('function');
  expect(releasePreactElement).toBeTypeOf('function');
});

it('uses the time label independently from date picker text', () => {
  expect(temporalPickerLabel('time', { chooseDate: 'Pick a date' })).toBe(
    'Choose time',
  );
  expect(temporalPickerLabel('time', { chooseTime: 'Pick a time' })).toBe(
    'Pick a time',
  );
  expect(temporalPickerLabel('date', { chooseDate: 'Pick a date' })).toBe(
    'Pick a date',
  );
});
