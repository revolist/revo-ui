/** @jsxImportSource preact */
import type { ClassPreset } from '../presets/types';
import { h } from 'preact';
import { useLayoutEffect, useRef } from 'preact/hooks';
import {
  compareIsoDates,
  displayYearMonths,
  startOfDisplayMonth,
  type DisplayCalendarSystem,
  type ISODateString,
  formatDisplayCalendarDate,
} from '@revolist/ui-dates';
import { isCalendarMonthDisabled } from './model';
import { MAX_CALENDAR_DATE, MIN_CALENDAR_DATE } from './reference-date';

export function CalendarYearGrid({
  preset,
  className = '',
  month,
  system = 'gregory',
  referenceDate,
  minDate,
  maxDate,
  isMonthDisabled,
  focusOnMount,
  locale,
  ariaLabel,
  onSelect,
  onEscape,
}: {
  preset?: ClassPreset;
  className?: string;
  month: ISODateString;
  system?: DisplayCalendarSystem;
  referenceDate?: ISODateString;
  minDate?: ISODateString;
  maxDate?: ISODateString;
  isMonthDisabled?: (month: ISODateString) => boolean;
  /** Focuses the active or first available month when entering the year view. */
  focusOnMount?: boolean;
  locale: string;
  ariaLabel: string;
  onSelect: (month: ISODateString) => void;
  /** Handles Escape within the year view when supplied. */
  onEscape?: () => void;
}) {
  const months = displayYearMonths(month, system);
  const first = startOfDisplayMonth(MIN_CALENDAR_DATE, system);
  const last = startOfDisplayMonth(MAX_CALENDAR_DATE, system);
  const buttons = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (!focusOnMount || !buttons.current) return;
    const first =
      buttons.current.querySelector<HTMLButtonElement>(
        '[aria-pressed="true"]:not(:disabled)',
      ) ??
      buttons.current.querySelector<HTMLButtonElement>('button:not(:disabled)');
    (first ?? buttons.current).focus({ preventScroll: true });
  }, [focusOnMount]);
  return (
    <div
      ref={buttons}
      class={`revo-calendar__year-grid ${preset?.className ?? ''} ${className}`}
      data-part="root"
      role="group"
      aria-label={ariaLabel}
      tabIndex={-1}
      onKeyDown={(event) => {
        if (event.key !== 'Escape' || !onEscape) return;
        event.preventDefault();
        onEscape();
      }}
    >
      {months.map((candidate) => {
        const disabled =
          compareIsoDates(candidate, first) < 0 ||
          compareIsoDates(candidate, last) > 0 ||
          isCalendarMonthDisabled(candidate, {
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
