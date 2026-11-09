/** @jsxImportSource preact */
import { h } from 'preact';
import {
  displayYearMonths,
  startOfDisplayMonth,
  type DisplayCalendarSystem,
  type ISODateString,
  formatDisplayCalendarDate,
} from '@revolist/dates';

import { isCalendarMonthDisabled } from './model';

export function CalendarYearGrid({
  month,
  system = 'gregory',
  referenceDate,
  minDate,
  maxDate,
  isMonthDisabled,
  locale,
  ariaLabel,
  onSelect,
  onEscape,
}: {
  month: ISODateString;
  system?: DisplayCalendarSystem;
  referenceDate?: ISODateString;
  minDate?: ISODateString;
  maxDate?: ISODateString;
  isMonthDisabled?: (month: ISODateString) => boolean;
  locale: string;
  ariaLabel: string;
  onSelect: (month: ISODateString) => void;
  onEscape: () => void;
}) {
  const months = displayYearMonths(month, system);
  return (
    <div
      class="revo-calendar__year-grid"
      role="group"
      aria-label={ariaLabel}
      onKeyDown={(event) => {
        if (event.key !== 'Escape') return;
        event.preventDefault();
        onEscape();
      }}
    >
      {months.map((candidate) => {
        const disabled = isCalendarMonthDisabled(candidate, {
          minDate,
          maxDate,
          isMonthDisabled,
          calendarSystem: system,
        });
        const active = candidate === month;
        const current = referenceDate
          ? startOfDisplayMonth(referenceDate, system) === candidate
          : false;
        return (
          <button
            key={candidate}
            type="button"
            class={`revo-calendar__month${active ? ' active' : ''}${current ? ' current' : ''}`}
            data-calendar-month={candidate}
            aria-pressed={active ? 'true' : 'false'}
            disabled={disabled}
            onClick={() => onSelect(candidate)}
          >
            {formatDisplayCalendarDate(
              candidate,
              locale,
              { month: 'long' },
              system,
            )}
          </button>
        );
      })}
    </div>
  );
}
