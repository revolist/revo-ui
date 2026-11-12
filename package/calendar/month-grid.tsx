/** @jsxImportSource preact */
import { h, type ComponentChildren } from 'preact';
import {
  startOfDisplayMonth,
  type ISODateString,
  type DisplayCalendarSystem,
} from '@revolist/ui-dates';

import { CalendarDay } from './day';
import { isDateInCalendarRange } from './model';
import type { CalendarDateRange, CalendarDayContext } from './types';

export function CalendarMonthGrid({
  dates,
  system = 'gregory',
  selectedDates,
  visibleMonths,
  weekNumber,
  weekNumberLabel = 'Week number',
  month,
  focusedDate,
  referenceDate,
  selection,
  preview,
  previewInvalid,
  previewDescriptionId,
  showOutsideDays,
  allowOutsideMonthSelection,
  dayClassName,
  renderDay,
  isDisabled,
  formatDayLabel,
  setDayRef,
  onFocus,
  onPreview,
  onKeyDown,
  onSelect,
}: {
  dates: readonly ISODateString[];
  system?: DisplayCalendarSystem;
  selectedDates?: readonly ISODateString[];
  visibleMonths?: readonly ISODateString[];
  weekNumber?: (date: ISODateString) => string;
  weekNumberLabel?: string;
  month: ISODateString;
  focusedDate: ISODateString;
  referenceDate?: ISODateString;
  selection?: CalendarDateRange;
  preview?: CalendarDateRange;
  previewInvalid?: boolean;
  previewDescriptionId?: string;
  showOutsideDays: boolean;
  allowOutsideMonthSelection: boolean;
  dayClassName?:
    | string
    | ((
        date: ISODateString,
        context: CalendarDayContext,
      ) => string | undefined);
  renderDay?: (
    date: ISODateString,
    context: CalendarDayContext,
  ) => ComponentChildren;
  isDisabled: (date: ISODateString) => boolean;
  formatDayLabel: (date: ISODateString) => string;
  setDayRef: (date: ISODateString, element: HTMLButtonElement | null) => void;
  onFocus: (date: ISODateString) => void;
  onPreview: (date?: ISODateString) => void;
  onKeyDown: (
    event: h.JSX.TargetedKeyboardEvent<HTMLButtonElement>,
    date: ISODateString,
  ) => void;
  onSelect: (date: ISODateString) => void;
}) {
  return (
    <div class="revo-calendar__month-grid">
      {Array.from({ length: dates.length / 7 }, (_, week) => (
        <div
          class="revo-calendar__week"
          role="row"
          key={week}
          aria-hidden={
            (!weekNumber &&
              dates
                .slice(week * 7, week * 7 + 7)
                .every(
                  (date) =>
                    startOfDisplayMonth(date, system) !== month &&
                    (!showOutsideDays ||
                      visibleMonths?.includes(
                        startOfDisplayMonth(date, system),
                      )),
                )) ||
            undefined
          }
        >
          {weekNumber && (
            <span
              class="revo-calendar__week-number"
              role="rowheader"
              aria-label={`${weekNumberLabel} ${weekNumber(dates[week * 7])}`}
            >
              {weekNumber(dates[week * 7])}
            </span>
          )}
          {dates.slice(week * 7, week * 7 + 7).map((date) => {
            const outside = startOfDisplayMonth(date, system) !== month;
            const hidden =
              outside &&
              (!showOutsideDays ||
                Boolean(
                  visibleMonths?.includes(startOfDisplayMonth(date, system)),
                ));
            const disabled =
              isDisabled(date) || (outside && !allowOutsideMonthSelection);
            const context: CalendarDayContext = {
              outside,
              disabled,
              selected:
                Boolean(selectedDates?.includes(date)) ||
                isDateInCalendarRange(date, selection),
              previewed: isDateInCalendarRange(date, preview),
              today: date === referenceDate,
            };
            return (
              <CalendarDay
                key={date}
                date={date}
                label={formatDayLabel(date)}
                className={
                  typeof dayClassName === 'function'
                    ? dayClassName(date, context)
                    : dayClassName
                }
                outside={outside}
                hidden={hidden}
                disabled={disabled}
                focused={date === focusedDate}
                selected={context.selected}
                previewed={context.previewed}
                previewInvalid={context.previewed && previewInvalid}
                previewDescriptionId={previewDescriptionId}
                rangeStart={
                  selectedDates?.includes(date) || selection?.from === date
                }
                rangeEnd={
                  selectedDates?.includes(date) || selection?.to === date
                }
                previewStart={preview?.from === date}
                previewEnd={preview?.to === date}
                today={context.today}
                content={renderDay?.(date, context)}
                setRef={(date, element) => {
                  if (!outside) setDayRef(date, element);
                }}
                onFocus={onFocus}
                onPreview={onPreview}
                onKeyDown={onKeyDown}
                onSelect={onSelect}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}
