/** @jsxImportSource preact */
import { h } from 'preact';
import { useMemo } from 'preact/hooks';
import {
  addDisplayMonths,
  displayYearMonths,
  formatDisplayCalendarDate,
  getDisplayCalendarParts,
  startOfDisplayMonth,
  type ISODateString,
  type DisplayCalendarSystem,
} from '@revolist/ui-dates';
import { Dropdown } from '../dropdown';
import type { CalendarProps, CalendarTranslations } from './types';

export function CalendarCaption({
  month,
  system,
  locale,
  layout,
  start,
  end,
  disabled,
  labels,
  onChange,
}: {
  month: ISODateString;
  system: DisplayCalendarSystem;
  locale: string;
  layout: CalendarProps['captionLayout'];
  start?: ISODateString;
  end?: ISODateString;
  disabled?: boolean;
  labels: CalendarTranslations;
  onChange: (month: ISODateString) => void;
}) {
  const yearMonths = displayYearMonths(month, system);
  const parts = getDisplayCalendarParts(month, system);
  const years = useMemo(() => {
    const currentStart = displayYearMonths(month, system)[0];
    const first = start
      ? displayYearMonths(start, system)[0]
      : addDisplayMonths(currentStart, -600, system);
    const last = end
      ? displayYearMonths(end, system)[0]
      : addDisplayMonths(currentStart, 120, system);
    const result: ISODateString[] = [];
    for (
      let year = first;
      year <= last;
      year = addDisplayMonths(year, 12, system)
    )
      result.push(year);
    // An explicitly navigated year remains selectable even outside the default window.
    if (!result.includes(currentStart)) result.push(currentStart);
    return result.sort();
  }, [month, system, start, end]);
  return (
    <div class="revo-calendar__caption">
      {layout !== 'dropdown-years' ? (
        <Dropdown
          className="rv-select"
          config={{
            ariaLabel: labels.chooseMonth,
            topLayer: true,
            nativeTabNavigation: true,
          }}
          disabled={disabled}
          value={String(parts.month)}
          source={yearMonths.map((date, index) => ({
            value: String(index + 1),
            label: formatDisplayCalendarDate(
              date,
              locale,
              { month: 'short' },
              system,
            ),
            disabled: Boolean(
              (start && date < startOfDisplayMonth(start, system)) ||
              (end && date > startOfDisplayMonth(end, system)),
            ),
          }))}
          onChange={(value) => onChange(yearMonths[Number(value) - 1])}
        />
      ) : (
        <span>
          {formatDisplayCalendarDate(month, locale, { month: 'long' }, system)}
        </span>
      )}
      {layout !== 'dropdown-months' ? (
        <Dropdown
          className="rv-select"
          config={{
            ariaLabel: labels.chooseYear,
            topLayer: true,
            nativeTabNavigation: true,
          }}
          disabled={disabled}
          value={yearMonths[0]}
          source={years.map((date) => ({
            value: date,
            label: formatDisplayCalendarDate(
              date,
              locale,
              { year: 'numeric' },
              system,
            ),
          }))}
          onChange={(value) => {
            const year = value as ISODateString;
            let next = addDisplayMonths(year, parts.month - 1, system);
            if (start && next < startOfDisplayMonth(start, system))
              next = startOfDisplayMonth(start, system);
            if (end && next > startOfDisplayMonth(end, system))
              next = startOfDisplayMonth(end, system);
            onChange(next);
          }}
        />
      ) : (
        <span>
          {formatDisplayCalendarDate(
            month,
            locale,
            { year: 'numeric' },
            system,
          )}
        </span>
      )}
    </div>
  );
}
