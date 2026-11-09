import {
  addDays,
  diffInDays,
  isValidIsoDate,
  isValidTemporalControl,
  isTimeControlAllowed,
  temporalDatePart,
  temporalTimePart,
  startOfDisplayMonth,
  type ISODateString,
} from '@revolist/dates';
import { defaultTemporalPickerText, type TemporalPickerProps } from './types';
/** One validation path for keyboard drafts and calendar selections. */
export function validateTemporalSelection(
  props: TemporalPickerProps,
  month: ISODateString,
  selectionError = '',
) {
  const { kind = 'date', selection = 'single', value, calendar = {} } = props;
  const text = { ...defaultTemporalPickerText, ...props.text };
  const range =
    value && !Array.isArray(value) && typeof value === 'object'
      ? value
      : undefined;
  const single = typeof value === 'string' ? value : '';
  const from = range?.from ?? '',
    to = range?.to ?? '';
  const required = props.required ?? calendar.required ?? false;
  const values = range
    ? [from, to]
    : Array.isArray(value)
      ? value
      : single
        ? [single]
        : [];
  const validDate = (date: string) =>
    isValidIsoDate(date) &&
    (!calendar.minDate || date >= calendar.minDate) &&
    (!calendar.maxDate || date <= calendar.maxDate) &&
    !calendar.isDateDisabled?.(date as ISODateString) &&
    !calendar.isMonthDisabled?.(
      startOfDisplayMonth(date as ISODateString, calendar.calendarSystem),
    );
  const validValue = (item: string) =>
    isValidTemporalControl(kind, item) &&
    (kind === 'time' || validDate(temporalDatePart(item))) &&
    (kind === 'date' ||
      isTimeControlAllowed(temporalTimePart(item), {
        min: props.minTime,
        max: props.maxTime,
        step: props.timeStep,
      }));
  const rangeNights =
    range && to
      ? diffInDays(
          temporalDatePart(from) as ISODateString,
          temporalDatePart(to) as ISODateString,
        )
      : 0;
  const count = selection === 'multiple' ? values.length : rangeNights;
  const minMaxValid =
    (!values.length && !required) ||
    selection === 'single' ||
    ((!calendar.min || count >= calendar.min) &&
      (calendar.max === undefined || count <= calendar.max));
  const validRangeInterior = () => {
    if (
      kind === 'time' ||
      !range?.to ||
      !calendar.excludeDisabled ||
      !values.every(validValue)
    )
      return true;
    if (rangeNights > 366000) return false;
    for (
      let day = temporalDatePart(from) as ISODateString;
      day <= temporalDatePart(to);
      day = addDays(day, 1)
    )
      if (!validDate(day)) return false;
    return true;
  };
  const interiorValid = validRangeInterior();
  let customError = '';
  const customValid =
    kind === 'time' ||
    values.every((item) => {
      const date = temporalDatePart(item) as ISODateString;
      if (!isValidIsoDate(date)) return false;
      const result = calendar.validateSelection?.(date, {
        month: calendar.month ?? month,
        view: calendar.defaultView ?? 'month',
        referenceDate: calendar.referenceDate,
        selection: range
          ? {
              from: temporalDatePart(from) as ISODateString,
              to: temporalDatePart(to || from) as ISODateString,
            }
          : { from: date, to: date },
      });
      if (typeof result === 'string') customError = result;
      return result !== false && typeof result !== 'string';
    });
  const valid =
    !selectionError &&
    minMaxValid &&
    customValid &&
    interiorValid &&
    (!required || values.length > 0) &&
    values.every(validValue) &&
    (selection !== 'multiple' || new Set(values).size === values.length) &&
    (!range || (!!to && from <= to)) &&
    (selection !== 'multiple' || kind === 'date');
  const message = (key: keyof typeof text) =>
    props.text?.[key] ?? props.text?.invalid ?? text[key] ?? text.invalid;
  const dateValues = kind === 'time' ? [] : values.map(temporalDatePart);
  const errorMessage =
    selectionError ||
    customError ||
    (!values.length && required
      ? message('requiredValue')
      : range && (!from || !to)
        ? message('invalidRange')
        : dateValues.some((date) => !isValidIsoDate(date))
          ? message('invalidDate')
          : dateValues.some(
                (date) =>
                  (calendar.minDate && date < calendar.minDate) ||
                  (calendar.maxDate && date > calendar.maxDate),
              )
            ? message('outOfRange')
            : dateValues.some((date) => !validDate(date)) || !interiorValid
              ? message('disabledDate')
              : range && (!to || from > to)
                ? message('invalidRange')
                : !minMaxValid ||
                    (selection === 'multiple' &&
                      new Set(values).size !== values.length)
                  ? message('selectionCount')
                  : text.invalid);
  return { valid, errorMessage, validDate };
}
