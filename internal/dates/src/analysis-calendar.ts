import { addCalendarMonths, addDays } from './date-math';
import { formatIsoDate, formatIsoDateTime, parseIsoDate } from './iso';
import {
  addTimelineUnit,
  startOfTimelineUnit,
  parseTimelineInstantValue,
} from './timeline';

export type AnalysisCalendarUnit =
  | 'day'
  | 'week'
  | 'month'
  | 'quarter'
  | 'year';
/** UTC calendar shifts preserve the time of day and clamp month-end dates. */
export function shiftAnalysisCalendarInstant(
  epoch: number,
  unit: AnalysisCalendarUnit,
  amount: number,
): number {
  const instant = parseTimelineInstantValue(epoch);
  if (!instant || !Number.isInteger(amount))
    throw new RangeError('Invalid analysis calendar shift.');
  const day = formatIsoDate(instant);
  const offset = epoch - parseIsoDate(day).getTime();
  const shifted =
    unit === 'day' || unit === 'week'
      ? addDays(day, amount * (unit === 'week' ? 7 : 1))
      : addCalendarMonths(
          day,
          amount * (unit === 'year' ? 12 : unit === 'quarter' ? 3 : 1),
        );
  const result = parseIsoDate(shifted).getTime() + offset;
  if (!parseTimelineInstantValue(result))
    throw new RangeError(
      'Analysis calendar shift exceeds the supported date range.',
    );
  return result;
}
/** ISO weeks start on Monday; boundaries are UTC instants and end is exclusive. */
export function analysisCalendarPeriod(
  epoch: number,
  unit: AnalysisCalendarUnit,
) {
  const instant = parseTimelineInstantValue(epoch);
  if (!instant) throw new RangeError('Invalid analysis calendar period.');
  const startText = startOfTimelineUnit(unit, formatIsoDateTime(instant), 1);
  return {
    start: parseIsoDate(startText).getTime(),
    end: parseIsoDate(addTimelineUnit(unit, startText, 1)).getTime(),
  };
}
