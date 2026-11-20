/** @jsxImportSource preact */
import { h } from 'preact';
import { useMemo } from 'preact/hooks';
import {
  addDisplayMonths,
  compareIsoDates,
  displayYearMonths,
  formatDisplayCalendarDate,
  getDisplayCalendarParts,
  startOfDisplayMonth,
  type ISODateString,
  type DisplayCalendarSystem,
} from '@revolist/ui-dates';
import { Dropdown } from '../dropdown';
import { MAX_CALENDAR_DATE, MIN_CALENDAR_DATE } from './reference-date';
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
  const domainStart = startOfDisplayMonth(MIN_CALENDAR_DATE, system);
  const domainEnd = startOfDisplayMonth(MAX_CALENDAR_DATE, system);
  const firstMonth = start ?? domainStart;
  const lastMonth = end ?? domainEnd;
  const years = useMemo(() => {
    const currentStart = displayYearMonths(month, system)[0];
    const firstSupportedYear = displayYearMonths(domainStart, system)[0];
    const lastSupportedYear = displayYearMonths(domainEnd, system)[0];
    const first = start
      ? displayYearMonths(start, system)[0]
      : [firstSupportedYear, addDisplayMonths(currentStart, -600, system)].sort(
          compareIsoDates,
        )[1];
    const last = end
      ? displayYearMonths(end, system)[0]
      : [lastSupportedYear, addDisplayMonths(currentStart, 120, system)].sort(
          compareIsoDates,
        )[0];
    const result: ISODateString[] = [];
    for (
      let year = first;
      compareIsoDates(year, last) <= 0;
      year = addDisplayMonths(year, 12, system)
    )
      result.push(year);
    // An explicitly navigated year remains selectable even outside the default window.
    if (!result.includes(currentStart)) result.push(currentStart);
    return result.sort(compareIsoDates);
  }, [month, system, start, end, domainStart, domainEnd]);
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
              compareIsoDates(date, firstMonth) < 0 ||
              compareIsoDates(date, lastMonth) > 0,
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
            if (compareIsoDates(next, firstMonth) < 0) next = firstMonth;
            if (compareIsoDates(next, lastMonth) > 0) next = lastMonth;
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
