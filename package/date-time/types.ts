import type { DateInputOptions } from './date-control';
export type { DateInputOptions } from './date-control';
import type { JSX } from 'preact';
import type { CalendarPickerProps } from '../calendar/picker';
import type {
  LocalDateControlKind,
  TemporalControlValue,
} from '@revolist/ui-dates';
import type { EditorActionText, EditorCommitOptions } from '../editor-actions';

type CalendarOptions<T> = T extends unknown
  ? Omit<T, 'mode' | 'selected' | 'onSelectionChange'>
  : never;
/** Complete shared picker options except controlled selection, which belongs to the field. */
export type TemporalCalendarOptions = CalendarOptions<CalendarPickerProps>;
export interface TemporalPickerText {
  date?: string;
  dates?: string;
  invalidDate?: string;
  outOfRange?: string;
  disabledDate?: string;
  invalidRange?: string;
  selectionCount?: string;
  requiredValue?: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  time: string;
  hours?: string;
  minutes?: string;
  seconds?: string;
  dayPeriod?: string;
  noTimes?: string;
  invalid: string;
  chooseDate: string;
  chooseTime?: string;
}
export const defaultTemporalPickerText: TemporalPickerText = {
  date: 'Date',
  dates: 'Dates',
  invalidDate: 'Enter a valid date in the indicated format.',
  outOfRange: 'The date is outside the allowed range.',
  disabledDate: 'This date is unavailable.',
  invalidRange:
    'Enter a complete range with the start before or equal to the end.',
  selectionCount: 'The selection does not meet the allowed count or length.',
  requiredValue: 'A value is required.',
  startDate: 'Start date',
  endDate: 'End date',
  startTime: 'Start time',
  endTime: 'End time',
  time: 'Time',
  hours: 'Hour',
  minutes: 'Minute',
  seconds: 'Second',
  dayPeriod: 'Period',
  noTimes: 'No available times.',
  invalid: 'Enter a valid value within the allowed range.',
  chooseDate: 'Choose date',
  chooseTime: 'Choose time',
};
export interface TemporalPickerOptions extends EditorCommitOptions {
  kind?: LocalDateControlKind;
  /** Typed date entry is enabled by default; false retains calendar-only controls. */
  dateInput?: boolean | DateInputOptions;
  selection?: 'single' | 'range' | 'multiple';
  calendar?: TemporalCalendarOptions;
  required?: boolean;
  minTime?: string;
  maxTime?: string;
  timeStep?: number;
  precision?: 'minute' | 'second';
  timeFormat?: 'locale' | '12h' | '24h';
  text?: Partial<TemporalPickerText>;
  actions?: Partial<EditorActionText>;
  /** Endpoint-only adjustment, for the existing Timeline end-arrow interaction. */
  classNames?: { endpoints?: string };
  endpoint?: 'from' | 'to';
}
export interface TemporalPickerProps extends TemporalPickerOptions {
  value: TemporalControlValue;
  onChange: (value: TemporalControlValue) => void;
  onValidityChange?: (valid: boolean) => void;
  /** Called for each valid edit, including intermediate edits before selection completes. */
  onValidChange?: (value: TemporalControlValue) => void;
  /** Complete calendar selection, distinct from an in-progress keyboard draft. */
  onSelectionComplete?: (value: TemporalControlValue) => void;
}
export interface DateTimeFieldProps extends Omit<
  JSX.InputHTMLAttributes<HTMLInputElement>,
  'type' | 'value' | 'onChange' | 'required' | 'disabled' | 'readOnly'
> {
  kind?: LocalDateControlKind;
  value: string;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  picker?: Omit<TemporalPickerOptions, 'kind' | 'selection'>;
  /** Publish valid popup edits immediately when the picker uses auto-apply. */
  livePickerUpdates?: boolean;
  onValueChange?: (value: string) => void;
  /** Existing product text adapters can keep their custom display/parser. */
  formatValue?: (value: string) => string;
  parseValue?: (text: string) => string | undefined;
}

/** One accessible name for both trigger and popup; date and time controls use their own localized action labels. */
export function temporalPickerLabel(
  kind: LocalDateControlKind,
  text?: Partial<TemporalPickerText>,
): string {
  return (
    (kind === 'time' ? text?.chooseTime : text?.chooseDate) ??
    (kind === 'time'
      ? defaultTemporalPickerText.chooseTime!
      : defaultTemporalPickerText.chooseDate)
  );
}
