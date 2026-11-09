import type { ComponentChildren } from 'preact';
import type { DisplayCalendarSystem, ISODateString } from '@revolist/dates';

export type CalendarWeekStart = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export type CalendarView = 'month' | 'year';

export interface CalendarDateRange {
  readonly from: ISODateString;
  readonly to: ISODateString;
}

/** All non-date text rendered by the shared calendar. */
export interface CalendarTranslations {
  readonly previousMonth: string;
  readonly nextMonth: string;
  readonly previousYear: string;
  readonly nextYear: string;
  readonly chooseMonth: string;
  readonly calendar: string;
  readonly today: string;
  readonly invalidSelection: string;
  readonly chooseYear?: string;
  readonly weekNumber?: string;
}

export interface CalendarDayContext {
  readonly outside: boolean;
  readonly disabled: boolean;
  readonly selected: boolean;
  readonly previewed: boolean;
  readonly today: boolean;
}

export interface CalendarSelectionValidationContext {
  readonly month: ISODateString;
  readonly view: CalendarView;
  readonly selection?: CalendarDateRange;
  readonly preview?: CalendarDateRange;
  readonly referenceDate?: ISODateString;
}

export type CalendarSelectionValidationResult = boolean | string;

export interface CalendarProps {
  readonly month: ISODateString;
  readonly focusedDate: ISODateString;
  readonly referenceDate?: ISODateString;
  readonly selection?: CalendarDateRange;
  readonly preview?: CalendarDateRange;
  /** Marks the current preview as unavailable without changing selection. */
  readonly previewInvalid?: boolean;
  /** Localized explanation, announced politely and linked to invalid preview days. */
  readonly previewDescription?: string;
  /** Independent selected dates for a multiple-selection composition. */
  readonly selectedDates?: readonly ISODateString[];
  readonly calendarSystem?: DisplayCalendarSystem;
  readonly dir?: 'ltr' | 'rtl';
  readonly numberOfMonths?: number;
  readonly pagedNavigation?: boolean;
  readonly reverseMonths?: boolean;
  readonly captionLayout?:
    | 'label'
    | 'dropdown'
    | 'dropdown-months'
    | 'dropdown-years';
  /** Navigation bounds; unlike minDate/maxDate these do not disable day values. */
  readonly startMonth?: ISODateString;
  readonly endMonth?: ISODateString;
  readonly disableNavigation?: boolean;
  readonly showWeekNumber?: boolean;
  readonly weekNumbering?: 'iso' | 'local';
  readonly formatWeekNumber?: (week: number) => string;
  readonly footer?: ComponentChildren;
  readonly presets?: readonly {
    readonly label: string;
    readonly date: ISODateString;
  }[];
  readonly cellSize?: number;
  /** Optional instant used only to resolve Today in the requested zone. ISO date values never shift. */
  readonly referenceInstant?: Date;
  readonly timeZone?: string;
  readonly locale?: string;
  readonly weekStartsOn?: CalendarWeekStart;
  readonly minDate?: ISODateString;
  readonly maxDate?: ISODateString;
  readonly isDateDisabled?: (date: ISODateString) => boolean;
  readonly showOutsideDays?: boolean;
  readonly allowOutsideMonthSelection?: boolean;
  readonly fixedWeeks?: boolean;
  readonly showTodayButton?: boolean;
  /** Hides the complete month/year heading and navigation row. */
  readonly showHeader?: boolean;
  /** Convenience switch for both previous and next actions. */
  readonly showNavigation?: boolean;
  readonly showPreviousButton?: boolean;
  readonly showNextButton?: boolean;
  readonly showMonthLabel?: boolean;
  readonly showWeekdays?: boolean;
  /** Allows the month/year heading to open a twelve-month overview. Defaults to true. */
  readonly enableYearView?: boolean;
  /** Available views. Defaults to month and year; supersedes `enableYearView`. */
  readonly views?: readonly CalendarView[];
  readonly defaultView?: CalendarView;
  readonly isMonthDisabled?: (month: ISODateString) => boolean;
  /** Overrides any subset of the exported English calendar translations. */
  readonly translations?: Partial<CalendarTranslations>;
  readonly className?: string;
  readonly dayClassName?:
    | string
    | ((
        date: ISODateString,
        context: CalendarDayContext,
      ) => string | undefined);
  readonly renderDay?: (
    date: ISODateString,
    context: CalendarDayContext,
  ) => ComponentChildren;
  readonly formatMonth?: (month: ISODateString, locale: string) => string;
  readonly formatWeekday?: (date: ISODateString, locale: string) => string;
  readonly formatDayLabel?: (date: ISODateString, locale: string) => string;
  readonly onMonthChange: (month: ISODateString) => void;
  readonly onFocusedDateChange: (date: ISODateString) => void;
  readonly onSelect: (date: ISODateString) => void;
  /** Optional non-toggle handler for Today and date presets. */
  readonly onPresetSelect?: (date: ISODateString) => void;
  readonly onPreviewDateChange?: (date?: ISODateString) => void;
  readonly validateSelection?: (
    date: ISODateString,
    context: CalendarSelectionValidationContext,
  ) => CalendarSelectionValidationResult;
  readonly onInvalidSelection?: (reason: string, date: ISODateString) => void;
  readonly onViewChange?: (view: CalendarView) => void;
}

export interface MoveCalendarFocusOptions {
  readonly date: ISODateString;
  readonly key: string;
  readonly shiftKey?: boolean;
  readonly weekStartsOn: CalendarWeekStart;
  readonly minDate?: ISODateString;
  readonly maxDate?: ISODateString;
  readonly isDisabled?: (date: ISODateString) => boolean;
  readonly dir?: 'ltr' | 'rtl';
  readonly calendarSystem?: DisplayCalendarSystem;
}
