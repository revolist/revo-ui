/** @jsxRuntime automatic */
/** @jsxImportSource preact */
import { useLayoutEffect, useState } from 'preact/hooks';
import { validateTemporalSelection } from './validation';
import { DateControl } from './date-control';
import { createControlId } from '../core/control-id';
import { Alert, Button } from '../controls';
import { TimeControl } from './time-control';
import { TimeSelection } from './time-selection';
import { CalendarPicker, type CalendarPickerProps } from '../calendar/picker';
import {
  isValidIsoDate,
  temporalDatePart,
  temporalTimePart,
  withTemporalDate,
  withTemporalTime,
  startOfDisplayMonth,
  todayIsoDate,
  type ISODateString,
  type TemporalControlValue,
} from '@revolist/dates';
import { defaultTemporalPickerText, type TemporalPickerProps } from './types';
import './style.scss';

export function TemporalPicker(props: TemporalPickerProps) {
  const {
    kind = 'date',
    selection = 'single',
    value,
    onChange,
    calendar = {},
  } = props;
  const multipleMonths = (calendar.numberOfMonths ?? 1) >= 2;
  const text = { ...defaultTemporalPickerText, ...props.text };
  const [errorId] = useState(() => createControlId('rv-date-error'));
  const datePart = (item: string) =>
    kind === 'date' ? item : temporalDatePart(item);
  const dateOptions = {
    locale: calendar.locale,
    ...(typeof props.dateInput === 'object' ? props.dateInput : {}),
  };
  const [endpoint, setEndpoint] = useState<'from' | 'to' | undefined>(
    props.endpoint === 'to' ? 'to' : undefined,
  );
  const [selectionError, setSelectionError] = useState('');
  const range =
    value && !Array.isArray(value) && typeof value === 'object'
      ? value
      : undefined;
  const single = typeof value === 'string' ? value : '';
  const selectedDates = Array.isArray(value) ? value : [];
  const from = range?.from ?? '',
    to = range?.to ?? '';
  const initialDay = temporalDatePart(
    kind === 'time'
      ? todayIsoDate()
      : props.endpoint === 'to'
        ? to
        : from || single || selectedDates[0] || '',
  );
  const [month, setMonth] = useState<ISODateString>(
    () =>
      calendar.defaultMonth ??
      startOfDisplayMonth(
        (isValidIsoDate(initialDay)
          ? initialDay
          : todayIsoDate()) as ISODateString,
        calendar.calendarSystem,
      ),
  );
  const required = props.required ?? calendar.required ?? false;
  const { valid, errorMessage, validDate } = validateTemporalSelection(
    props,
    month,
    selectionError,
  );
  // Draft keyboard commits must observe the validity of the rendered input.
  useLayoutEffect(() => props.onValidityChange?.(!!valid), [valid]);
  const update = (next: TemporalControlValue, complete = false) => {
    setSelectionError('');
    onChange(next);
    if (
      (props.onValidChange || complete) &&
      validateTemporalSelection({ ...props, value: next }, month).valid
    ) {
      props.onValidChange?.(next);
      if (complete) props.onSelectionComplete?.(next);
    }
  };
  const select = (next: TemporalControlValue) => {
    // Date/time and multiple selections need further user input before finishing.
    update(next, kind === 'date' && selection !== 'multiple');
  };
  const followTypedDate = (date: string) => {
    if (!validDate(date)) return;
    const next = startOfDisplayMonth(
      date as ISODateString,
      calendar.calendarSystem,
    );
    if (next !== (calendar.month ?? month)) {
      setMonth(next);
      calendar.onMonthChange?.(next);
    }
  };
  const typedEndpoint = (key: 'from' | 'to', date: string | string[]) => {
    if (typeof date !== 'string') return;
    followTypedDate(date);
    const next = {
      from,
      to,
      [key]: date
        ? withTemporalDate(date, key === 'from' ? from : to, kind)
        : '',
    };
    update(!next.from && !next.to ? null : next);
  };
  const timeInput = (
    current: string,
    label: string,
    set: (value: string) => void,
    showLabel = true,
  ) => (
    <label
      class={`rv-temporal-picker__time${showLabel ? '' : ' rv-temporal-picker__time--single'}`}
    >
      {showLabel && <span>{label}</span>}
      <TimeControl
        label={label}
        value={current ? temporalTimePart(current) : ''}
        min={props.minTime}
        max={props.maxTime}
        step={props.timeStep}
        precision={props.precision}
        format={props.timeFormat}
        locale={calendar.locale}
        onChange={set}
      />
    </label>
  );
  const common = {
    ...calendar,
    month: calendar.month ?? month,
    onMonthChange: (next: ISODateString) => {
      setMonth(next);
      calendar.onMonthChange?.(next);
    },
    required,
    onInvalidSelection: (reason: string, date: ISODateString) => {
      setSelectionError(reason || text.invalid);
      calendar.onInvalidSelection?.(reason, date);
    },
  };
  let picker: CalendarPickerProps;
  if (selection === 'multiple')
    picker = {
      ...common,
      mode: 'multiple',
      selected: selectedDates.filter(isValidIsoDate),
      onSelectionChange: (dates: readonly ISODateString[]) =>
        select([...dates]),
    } as CalendarPickerProps;
  else if (selection === 'range' && !endpoint)
    picker = {
      ...common,
      mode: 'range',
      selected:
        from && isValidIsoDate(temporalDatePart(from))
          ? {
              from: temporalDatePart(from) as ISODateString,
              ...(to && isValidIsoDate(temporalDatePart(to))
                ? { to: temporalDatePart(to) as ISODateString }
                : {}),
            }
          : undefined,
      onSelectionChange: (next) =>
        select(
          next
            ? {
                from: withTemporalDate(next.from, from, kind),
                ...(next.to ? { to: withTemporalDate(next.to, to, kind) } : {}),
              }
            : null,
        ),
    } as CalendarPickerProps;
  else {
    const current =
      selection === 'range' ? (endpoint === 'to' ? to : from) : single;
    picker = {
      ...common,
      mode: 'single',
      selected:
        current && isValidIsoDate(temporalDatePart(current))
          ? temporalDatePart(current)
          : undefined,
      onSelectionChange: (date) => {
        if (selection === 'range')
          select(
            date
              ? {
                  from,
                  to,
                  [endpoint ?? 'from']: withTemporalDate(date, current, kind),
                }
              : null,
          );
        else select(date ? withTemporalDate(date, single, kind) : null);
      },
    } as CalendarPickerProps;
  }
  return (
    <div
      class={`rv-temporal-picker rv-temporal-picker--${kind}${multipleMonths ? ' rv-temporal-picker--multi-month' : ''}`}
    >
      {props.dateInput === false &&
        selection === 'range' &&
        kind !== 'time' && (
          <div
            class={`rv-temporal-picker__endpoints ${props.classNames?.endpoints ?? ''}`}
          >
            <Button
              aria-label={`${text.startDate}: ${from}`}
              aria-pressed={endpoint !== 'to'}
              onClick={() => {
                setEndpoint(undefined);
                if (from)
                  setMonth(
                    startOfDisplayMonth(
                      temporalDatePart(from) as ISODateString,
                      calendar.calendarSystem,
                    ),
                  );
                setSelectionError('');
              }}
            >
              {from ? temporalDatePart(from) : '—'}
            </Button>
            <Button
              aria-label={`${text.endDate}: ${to}`}
              aria-pressed={endpoint === 'to'}
              onClick={() => {
                setEndpoint('to');
                if (to)
                  setMonth(
                    startOfDisplayMonth(
                      temporalDatePart(to) as ISODateString,
                      calendar.calendarSystem,
                    ),
                  );
                setSelectionError('');
              }}
            >
              {to ? temporalDatePart(to) : '—'}
            </Button>
          </div>
        )}
      <div class="rv-temporal-picker__header">
        {kind !== 'time' && props.dateInput !== false && (
          <div
            class={`rv-temporal-picker__dates ${selection === 'range' ? `rv-temporal-picker__endpoints ${props.classNames?.endpoints ?? ''}` : ''}`}
          >
            {selection === 'range' ? (
              <>
                <div
                  class="rv-temporal-picker__endpoint"
                  role="group"
                  aria-label={text.startDate}
                >
                  <DateControl
                    label={text.startDate}
                    value={datePart(from)}
                    options={dateOptions}
                    invalid={!valid}
                    errorId={errorId}
                    onFocus={() => setEndpoint(undefined)}
                    onChange={(date) => typedEndpoint('from', date)}
                  />
                  {kind === 'datetime' &&
                    timeInput(
                      from,
                      text.startTime,
                      (time) =>
                        update({
                          from: withTemporalTime(from, time, kind),
                          ...(to ? { to } : {}),
                        }),
                      false,
                    )}
                </div>
                <div
                  class="rv-temporal-picker__endpoint"
                  role="group"
                  aria-label={text.endDate}
                >
                  <DateControl
                    label={text.endDate}
                    value={datePart(to)}
                    options={dateOptions}
                    invalid={!valid}
                    errorId={errorId}
                    onFocus={() => setEndpoint('to')}
                    onChange={(date) => typedEndpoint('to', date)}
                  />
                  {kind === 'datetime' &&
                    timeInput(
                      to,
                      text.endTime,
                      (time) =>
                        update({ from, to: withTemporalTime(to, time, kind) }),
                      false,
                    )}
                </div>
              </>
            ) : (
              <DateControl
                label={(selection === 'multiple' ? text.dates : text.date)!}
                value={
                  selection === 'multiple' ? selectedDates : datePart(single)
                }
                multiple={selection === 'multiple'}
                options={dateOptions}
                invalid={!valid}
                errorId={errorId}
                onChange={(date) => {
                  if (typeof date === 'string') followTypedDate(date);
                  update(
                    Array.isArray(date)
                      ? date
                      : date
                        ? withTemporalDate(date, single, kind)
                        : null,
                  );
                }}
              />
            )}
          </div>
        )}
      </div>
      <div class="rv-temporal-picker__body">
        {kind !== 'time' && <CalendarPicker {...picker} />}
        {kind !== 'date' && selection !== 'range' && (
          <TimeSelection
            collapsible={kind === 'datetime' && multipleMonths}
            value={temporalTimePart(single)}
            label={text.time}
            text={text}
            format={props.timeFormat}
            precision={props.precision}
            locale={calendar.locale}
            min={props.minTime}
            max={props.maxTime}
            step={props.timeStep}
            onChange={(time) => update(withTemporalTime(single, time, kind))}
          />
        )}
      </div>
      {kind !== 'date' &&
        selection === 'range' &&
        (kind === 'time' || props.dateInput === false) && (
          <div class="rv-temporal-picker__times">
            {kind === 'time' ? (
              <TimeSelection
                value={temporalTimePart(from)}
                label={text.startTime}
                text={text}
                format={props.timeFormat}
                precision={props.precision}
                locale={calendar.locale}
                min={props.minTime}
                max={props.maxTime}
                step={props.timeStep}
                onChange={(time) =>
                  update({ from: time, ...(to ? { to } : {}) })
                }
              />
            ) : (
              timeInput(from, text.startTime, (time) =>
                update({
                  from: withTemporalTime(from, time, kind),
                  ...(to ? { to } : {}),
                }),
              )
            )}
            {kind === 'time' ? (
              <TimeSelection
                value={temporalTimePart(to)}
                label={text.endTime}
                text={text}
                format={props.timeFormat}
                precision={props.precision}
                locale={calendar.locale}
                min={props.minTime}
                max={props.maxTime}
                step={props.timeStep}
                onChange={(time) => update({ from, to: time })}
              />
            ) : (
              timeInput(to, text.endTime, (time) =>
                update({ from, to: withTemporalTime(to, time, kind) }),
              )
            )}
          </div>
        )}
      {!valid && (
        <Alert tone="danger">
          <span id={errorId}>{errorMessage}</span>
        </Alert>
      )}
    </div>
  );
}
