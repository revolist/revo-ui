import { expect, it } from 'vitest';
import {
  timeSelectionChoices,
  timeSelectionColumns,
  timeSelectionValue,
  clockUses12Hours,
} from './time-selection';

it('bounds selectable clock values and respects steps anchored to the minimum', () => {
  expect(
    timeSelectionChoices({ min: '09:10', max: '10:00', step: 900 }).map(
      (value) => timeSelectionValue(value),
    ),
  ).toEqual(['09:10', '09:25', '09:40', '09:55']);
  expect(timeSelectionChoices({ min: '17:00', max: '09:00' })).toEqual([]);
  expect(timeSelectionChoices({ step: 0 })).toEqual([]);
  expect(timeSelectionChoices({ precision: 'second' })).toHaveLength(86400);
});
it('recovers from invalid drafts by selecting the closest available value in a column', () => {
  const choices = timeSelectionChoices({
    min: '09:30',
    max: '17:00',
    step: 900,
  });
  const model = timeSelectionColumns(choices, '09:31', false);
  expect(timeSelectionValue(model.columns.hour.get(10)!)).toBe('10:30');
  expect(timeSelectionValue(model.columns.minute.get(45)!)).toBe('09:45');
  expect(model.columns.hour.has(8)).toBe(false);
});
it('keeps midnight/noon and seconds correct in 12-hour columns', () => {
  const choices = timeSelectionChoices({ precision: 'second' });
  const model = timeSelectionColumns(choices, '00:15:23', true);
  expect(timeSelectionValue(model.columns.period.get(1)!, 'second')).toBe(
    '12:15:23',
  );
  expect(timeSelectionValue(model.columns.minute.get(30)!, 'second')).toBe(
    '00:30:23',
  );
  expect(clockUses12Hours('locale', 'en-US')).toBe(true);
  expect(clockUses12Hours('locale', 'en-GB')).toBe(false);
});
