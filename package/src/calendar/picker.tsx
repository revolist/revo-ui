/** @jsxImportSource preact */
import { Fragment, h } from 'preact';
import { useState } from 'preact/hooks';
import {
  addDays,
  diffInDays,
  formatIsoDateInTimeZone,
  startOfDisplayMonth,
  todayIsoDate,
  type ISODateString,
} from '@revolist/dates';
import { Calendar } from './calendar';
import { orderCalendarRange } from './model';
import { DEFAULT_CALENDAR_TRANSLATIONS } from './translations';
import { ButtonControl } from '../native-control';
import type { CalendarProps, CalendarView } from './types';
export interface CalendarRangeSelection {
  readonly from: ISODateString;
  readonly to?: ISODateString;
}
type Base = Omit<
  CalendarProps,
  | 'month'
  | 'focusedDate'
  | 'selection'
  | 'preview'
  | 'previewInvalid'
  | 'previewDescription'
  | 'selectedDates'
  | 'onSelect'
  | 'onMonthChange'
  | 'onFocusedDateChange'
  | 'onPreviewDateChange'
  | 'presets'
  | 'onPresetSelect'
> & {
  readonly month?: ISODateString;
  readonly defaultMonth?: ISODateString;
  readonly onMonthChange?: (month: ISODateString) => void;
  readonly required?: boolean;
  /** Multiple: selected dates. Range: nights. */
  readonly min?: number;
  readonly max?: number;
  readonly excludeDisabled?: boolean;
};
type Preset<T> = { readonly label: string; readonly selection: T };
export type CalendarPickerProps = Base &
  (
    | {
        readonly mode?: 'single';
        readonly selected?: ISODateString;
        readonly onSelectionChange: (value: ISODateString | undefined) => void;
        readonly presets?: readonly Preset<ISODateString>[];
      }
    | {
        readonly mode: 'multiple';
        readonly selected?: readonly ISODateString[];
        readonly onSelectionChange: (value: readonly ISODateString[]) => void;
        readonly presets?: readonly Preset<readonly ISODateString[]>[];
      }
    | {
        readonly mode: 'range';
        readonly selected?: CalendarRangeSelection;
        readonly onSelectionChange: (
          value: CalendarRangeSelection | undefined,
        ) => void;
        readonly presets?: readonly Preset<CalendarRangeSelection>[];
      }
  );
/** Controlled selection composition over the compatible low-level Calendar. */
export function CalendarPicker(props: CalendarPickerProps) {
  const {
    selected,
    onSelectionChange,
    presets,
    mode = 'single',
    min = 0,
    max = Infinity,
    required = false,
    excludeDisabled = false,
    month: controlledMonth,
    defaultMonth,
    onMonthChange,
    ...options
  } = props;
  const initial =
    typeof selected === 'string'
      ? selected
      : Array.isArray(selected)
        ? selected[0]
        : (selected as CalendarRangeSelection | undefined)?.from;
  const [localMonth, setMonth] = useState<ISODateString>(
    defaultMonth ?? initial ?? props.referenceDate ?? todayIsoDate(),
  );
  const [focused, setFocused] = useState<ISODateString>(initial ?? localMonth);
  const [hover, setHover] = useState<ISODateString>();
  const [rejectedReason, setRejectedReason] = useState<string>();
  const previewDate = (date?: ISODateString) => {
    setHover(date);
    setRejectedReason(undefined);
  };
  const month = controlledMonth ?? localMonth;
  const availableViews = props.views?.filter(
    (view) => view === 'month' || view === 'year',
  );
  const views: readonly CalendarView[] = availableViews?.length
    ? availableViews
    : props.views || props.enableYearView === false
      ? ['month']
      : ['month', 'year'];
  const [requestedView, setView] = useState<CalendarView>(
    props.defaultView && views.includes(props.defaultView)
      ? props.defaultView
      : views[0],
  );
  const view = views.includes(requestedView) ? requestedView : views[0];
  const changeMonth = (date: ISODateString) => {
    setMonth(date);
    previewDate();
    onMonthChange?.(date);
  };
  const invalidMessage =
    props.translations?.invalidSelection ??
    DEFAULT_CALENDAR_TRANSLATIONS.invalidSelection;
  const reject = (date: ISODateString, reason = invalidMessage) => {
    setHover(date);
    setRejectedReason(reason);
    props.onInvalidSelection?.(reason, date);
  };
  const blocked = (date: ISODateString) =>
    Boolean(
      (props.minDate && date < props.minDate) ||
      (props.maxDate && date > props.maxDate) ||
      props.isDateDisabled?.(date) ||
      props.isMonthDisabled?.(startOfDisplayMonth(date, props.calendarSystem)),
    );
  const rangeValid = (range: CalendarRangeSelection) => {
    if (!range.to) return !blocked(range.from);
    const nights = diffInDays(range.from, range.to);
    if (
      nights < min ||
      nights > max ||
      nights < 0 ||
      blocked(range.from) ||
      blocked(range.to)
    )
      return false;
    if (excludeDisabled) {
      // Bounded user action, never a per-cell or pointer-move scan.
      if (nights > 366000) return false;
      for (let day = range.from; day <= range.to; day = addDays(day, 1))
        if (blocked(day)) return false;
    }
    return true;
  };
  const select = (date: ISODateString) => {
    if (props.mode === 'multiple') {
      const values = props.selected ?? [],
        has = values.includes(date);
      const next = has
        ? values.filter((value) => value !== date)
        : [...values, date];
      if (
        (has && next.length < Math.max(min, required ? 1 : 0)) ||
        next.length > max
      ) {
        reject(date);
        return;
      }
      props.onSelectionChange(next);
      return;
    }
    if (props.mode === 'range') {
      const previous = props.selected;
      if (!previous || previous.to) {
        props.onSelectionChange({ from: date });
        previewDate();
        return;
      }
      const range = orderCalendarRange(previous.from, date);
      if (!rangeValid(range)) {
        if (
          excludeDisabled &&
          diffInDays(range.from, range.to) >= min &&
          diffInDays(range.from, range.to) <= max
        )
          props.onSelectionChange({ from: date });
        reject(date);
        return;
      }
      props.onSelectionChange(range);
      previewDate();
      return;
    }
    props.onSelectionChange(
      props.selected === date && !required ? undefined : date,
    );
  };
  const range = props.mode === 'range' ? props.selected : undefined;
  const selection =
    typeof selected === 'string'
      ? { from: selected, to: selected }
      : range
        ? { from: range.from, to: range.to ?? range.from }
        : undefined;
  const preview =
    range && !range.to && hover
      ? orderCalendarRange(range.from, hover)
      : undefined;
  const validationReason = (date: ISODateString) => {
    const result = props.validateSelection?.(date, {
      month: startOfDisplayMonth(month, props.calendarSystem),
      view,
      selection,
      preview,
      referenceDate:
        props.referenceDate ??
        (props.referenceInstant
          ? formatIsoDateInTimeZone(
              props.referenceInstant,
              props.timeZone ?? 'UTC',
            )
          : undefined),
    });
    if (result === false || typeof result === 'string') {
      return typeof result === 'string' ? result : invalidMessage;
    }
    return undefined;
  };
  const candidateReason =
    preview && !rangeValid(preview) ? invalidMessage : undefined;
  const previewReason = rejectedReason ?? candidateReason;
  const validatePresetDate = (date: ISODateString) => {
    const reason = validationReason(date);
    if (reason) {
      reject(date, reason);
      return false;
    }
    return true;
  };
  const selectPreset = (preset: Preset<any>) => {
    const value = preset.selection;
    let target: ISODateString;
    if (props.mode === 'multiple') {
      if (
        !Array.isArray(value) ||
        value.length < Math.max(min, required ? 1 : 0) ||
        value.length > max ||
        value.some(blocked)
      )
        return;
      const unique = [...new Set(value)] as ISODateString[];
      if (unique.length < Math.max(min, required ? 1 : 0)) return;
      if (!unique.every(validatePresetDate)) return;
      props.onSelectionChange(unique);
      target = unique[0] ?? month;
    } else if (props.mode === 'range') {
      if (!value?.from || !rangeValid(value)) return;
      if (
        !validatePresetDate(value.from) ||
        (value.to && !validatePresetDate(value.to))
      )
        return;
      props.onSelectionChange(value);
      target = value.from;
    } else {
      if (typeof value !== 'string' || blocked(value as ISODateString)) return;
      if (!validatePresetDate(value as ISODateString)) return;
      props.onSelectionChange(value as ISODateString);
      target = value as ISODateString;
    }
    setFocused(target);
    changeMonth(startOfDisplayMonth(target, props.calendarSystem));
    previewDate();
  };
  return (
    <Calendar
      {...options}
      onViewChange={(next) => {
        setView(next);
        previewDate();
        props.onViewChange?.(next);
      }}
      month={month}
      focusedDate={focused}
      onFocusedDateChange={setFocused}
      onMonthChange={changeMonth}
      selection={selection}
      selectedDates={props.mode === 'multiple' ? props.selected : undefined}
      preview={preview}
      previewInvalid={Boolean(preview && previewReason)}
      previewDescription={mode === 'range' ? (previewReason ?? '') : undefined}
      onInvalidSelection={(reason, date) => reject(date, reason)}
      fixedWeeks={props.fixedWeeks ?? false}
      showOutsideDays={props.showOutsideDays ?? true}
      allowOutsideMonthSelection={props.allowOutsideMonthSelection ?? true}
      onPresetSelect={(date) => {
        if (props.mode === 'multiple') {
          const values = props.selected ?? [];
          if (values.includes(date)) return;
          if (values.length >= max) {
            reject(date);
            return;
          }
          props.onSelectionChange([...values, date]);
        } else if (props.mode === 'range')
          props.onSelectionChange({ from: date });
        else props.onSelectionChange(date);
      }}
      onSelect={select}
      onPreviewDateChange={previewDate}
      footer={
        presets?.length || props.footer ? (
          <>
            {presets?.length ? (
              <div class="revo-calendar__presets">
                {presets.map((preset) => (
                  <ButtonControl
                    key={preset.label}
                    onClick={() => selectPreset(preset)}
                  >
                    {preset.label}
                  </ButtonControl>
                ))}
              </div>
            ) : null}
            {props.footer}
          </>
        ) : undefined
      }
    />
  );
}
