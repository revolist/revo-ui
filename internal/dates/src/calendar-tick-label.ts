import type { UtcCalendarTickUnit } from './calendar-ticks';
import { formatIsoDate, formatIsoDateTime } from './iso';
import { parseTimelineInstantValue } from './timeline';

/** UTC fallback text and precision for a calendar tick, before consumer localization. */
export function formatUtcCalendarTickLabel(
  value: number,
  unit: UtcCalendarTickUnit,
): { text: string; dateOnly: boolean } | undefined {
  const date = parseTimelineInstantValue(value);
  if (!date) return undefined;
  const dateOnly =
    unit === 'day' ||
    unit === 'week' ||
    unit === 'month' ||
    unit === 'quarter' ||
    unit === 'year';
  const text =
    unit === 'year'
      ? String(date.getUTCFullYear())
      : unit === 'quarter'
        ? `${date.getUTCFullYear()} Q${Math.floor(date.getUTCMonth() / 3) + 1}`
        : unit === 'month'
          ? formatIsoDate(date).slice(0, 7)
          : dateOnly
            ? formatIsoDate(date)
            : formatIsoDateTime(date).replace('T', ' ').replace('.000Z', 'Z');
  return { text, dateOnly };
}
