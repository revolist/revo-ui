import {
  addDays,
  diffInDays,
  getUtcWeekday,
  isValidIsoDate,
  parseIsoDate,
  formatLocalIsoDate,
  type ISODateString,
} from '@revolist/ui-dates';
import left from '@fortawesome/fontawesome-free/svgs/solid/chevron-left.svg?raw';
import right from '@fortawesome/fontawesome-free/svgs/solid/chevron-right.svg?raw';
import { h, type JSX } from 'preact';
import { useLayoutEffect, useMemo, useRef, useState } from 'preact/hooks';
import { Button, IconButton } from '../controls';
import type { ClassPreset } from '../presets/types';
import { isCalendarDateDisabled } from './model';
import { MAX_CALENDAR_DATE, MIN_CALENDAR_DATE } from './reference-date';
import { DEFAULT_CALENDAR_TRANSLATIONS } from './translations';

export interface MiniCalendarProps {
  /** Accessible name describing what the date is used for. */
  label?: string;
  /** Selected date when controlled. Pass null for no selection. */
  value?: ISODateString | null;
  /** Initially selected date when uncontrolled. */
  defaultValue?: ISODateString;
  /** Reports selection with a date-only ISO string. */
  onValueChange?: (date: ISODateString) => void;
  /** First visible date when controlled. */
  startDate?: ISODateString;
  /** Initial first date when uncontrolled. Defaults to the selection or today. */
  defaultStartDate?: ISODateString;
  /** Reports the first visible date after navigation. */
  onStartDateChange?: (date: ISODateString) => void;
  /** Days to show per page, from 1 through 31. Defaults to 5. */
  days?: number;
  /** Inclusive lower bound for selection and pagination. */
  minDate?: ISODateString;
  /** Inclusive upper bound for selection and pagination. */
  maxDate?: ISODateString;
  /** Prevent individual dates from receiving focus or being selected. */
  isDisabled?: (date: ISODateString) => boolean;
  /** Override today for deterministic rendering or a business time zone. */
  referenceDate?: ISODateString;
  /** Locale for month labels, day numbers, and full-date announcements. */
  locale?: string;
  /** Text direction. Defaults to the surrounding layout. */
  dir?: 'ltr' | 'rtl';
  /** Translated previous and next buttons. Use {days} for the page size. */
  translations?: { previous?: string; next?: string };
  /** Theme preset for the date strip. */
  preset?: ClassPreset;
  /** Extra class on the date strip. */
  className?: string;
}

function calendarDays(start: ISODateString, count: number) {
  return Array.from({ length: count }, (_, index) => addDays(start, index));
}

/** A compact, paged strip for selecting one nearby date. */
export function MiniCalendar(props: MiniCalendarProps) {
  const { days = 5, locale = 'en-US', isDisabled } = props;
  const minDate = isValidIsoDate(props.minDate) ? props.minDate : undefined;
  const maxDate = isValidIsoDate(props.maxDate) ? props.maxDate : undefined;
  const count = Number.isFinite(days)
    ? Math.max(1, Math.min(31, Math.floor(days)))
    : 5;
  const [initialToday] = useState(() => formatLocalIsoDate(new Date()));
  const today = isValidIsoDate(props.referenceDate)
    ? props.referenceDate
    : initialToday;
  const [selection, setSelection] = useState(props.defaultValue);
  const value = props.value === undefined ? selection : props.value;
  const [initialStart, setStart] = useState(
    () => props.defaultStartDate ?? value ?? today,
  );
  const [focused, setFocused] = useState<ISODateString>();
  const pending = useRef<{ start: ISODateString; date: ISODateString }>();
  const strip = useRef<HTMLDivElement>(null);
  const lastFullStart = addDays(MAX_CALENDAR_DATE, 1 - count);
  const lowerBound = minDate ?? MIN_CALENDAR_DATE;
  const earliestStart = lowerBound > lastFullStart ? lastFullStart : lowerBound;
  const latestStart =
    maxDate && maxDate < lastFullStart ? maxDate : lastFullStart;
  const requested = props.startDate ?? initialStart;
  const candidate = isValidIsoDate(requested) ? requested : today;
  const start =
    candidate < earliestStart
      ? earliestStart
      : candidate > latestStart
        ? latestStart > earliestStart
          ? latestStart
          : earliestStart
        : candidate;
  const dates = calendarDays(start, count);
  const last = dates[dates.length - 1];
  const disabled = (date: ISODateString) =>
    isCalendarDateDisabled(date, { minDate, maxDate, isDisabled });
  const enabled = dates.filter((date) => !disabled(date));
  const tabbable =
    [focused, value, today].find((date) => date && enabled.includes(date)) ??
    enabled[0];

  const formatters = useMemo(
    () => ({
      month: new Intl.DateTimeFormat(locale, {
        month: 'short',
        timeZone: 'UTC',
      }),
      day: new Intl.DateTimeFormat(locale, { day: 'numeric', timeZone: 'UTC' }),
      weekday: new Intl.DateTimeFormat(locale, {
        weekday: 'long',
        timeZone: 'UTC',
      }),
      year: new Intl.DateTimeFormat(locale, {
        year: 'numeric',
        timeZone: 'UTC',
      }),
    }),
    [locale],
  );

  function focusDate(date: ISODateString) {
    strip.current
      ?.querySelector<HTMLButtonElement>(`[data-date="${date}"]`)
      ?.focus();
  }

  useLayoutEffect(() => {
    const request = pending.current;
    if (!request || request.start !== start) return;
    pending.current = undefined;
    const list = strip.current;
    const active = list?.ownerDocument.activeElement;
    if (active === list?.ownerDocument.body || list?.contains(active ?? null)) {
      focusDate(request.date);
    }
  }, [start]);

  function pageStart(direction: -1 | 1) {
    if (direction < 0) {
      if (start <= earliestStart) return;
      return addDays(start, -Math.min(count, diffInDays(earliestStart, start)));
    }
    if (start >= lastFullStart || last >= (maxDate ?? MAX_CALENDAR_DATE))
      return;
    return last < lastFullStart ? addDays(last, 1) : lastFullStart;
  }

  function movePage(next: ISODateString, focus?: ISODateString) {
    pending.current = focus ? { start: next, date: focus } : undefined;
    if (props.startDate === undefined) setStart(next);
    props.onStartDateChange?.(next);
  }

  function onDayKey(
    event: JSX.TargetedKeyboardEvent<HTMLButtonElement>,
    date: ISODateString,
  ) {
    const rtl =
      event.currentTarget.ownerDocument.defaultView?.getComputedStyle(
        event.currentTarget,
      ).direction === 'rtl';
    const direction =
      event.key === 'ArrowLeft'
        ? rtl
          ? 1
          : -1
        : event.key === 'ArrowRight'
          ? rtl
            ? -1
            : 1
          : 0;
    const pageDirection =
      event.key === 'PageUp' ? -1 : event.key === 'PageDown' ? 1 : 0;
    if (
      !direction &&
      !pageDirection &&
      event.key !== 'Home' &&
      event.key !== 'End'
    )
      return;
    event.preventDefault();
    if (event.key === 'Home' || event.key === 'End') {
      const target =
        event.key === 'Home' ? enabled[0] : enabled[enabled.length - 1];
      if (target) focusDate(target);
      return;
    }
    if (direction) {
      const target =
        direction > 0
          ? enabled.find((day) => day > date)
          : enabled.findLast((day) => day < date);
      if (target) {
        focusDate(target);
        return;
      }
    }
    const step = (direction || pageDirection) as -1 | 1;
    const next = pageStart(step);
    if (!next) return;
    const nextDates = calendarDays(next, count).filter((day) => !disabled(day));
    const target =
      direction > 0
        ? nextDates.find((day) => day > date)
        : direction < 0
          ? nextDates.findLast((day) => day < date)
          : (nextDates.find(
              (day) => day >= addDays(next, dates.indexOf(date)),
            ) ?? nextDates.at(-1));
    if (target) movePage(next, target);
  }

  const previous = pageStart(-1);
  const next = pageStart(1);
  const pageSize = new Intl.NumberFormat(locale).format(count);
  return (
    <div
      class={['rv-mini-calendar', props.preset?.className, props.className]
        .filter(Boolean)
        .join(' ')}
      data-part="root"
      role="group"
      aria-label={props.label ?? DEFAULT_CALENDAR_TRANSLATIONS.calendar}
      dir={props.dir}
    >
      <IconButton
        data-part="previous"
        className="rv-mini-calendar__navigation"
        label={(
          props.translations?.previous ??
          (count === 1 ? 'Previous day' : 'Previous {days} days')
        ).replace('{days}', pageSize)}
        icon={left}
        disabled={!previous}
        onClick={() => previous && movePage(previous)}
      />
      <div class="rv-mini-calendar__days" data-part="days" ref={strip}>
        {dates.map((date) => {
          const civil = parseIsoDate(date);
          const weekday = getUtcWeekday(date);
          const monthLabel = formatters.month.format(civil);
          const dayLabel = formatters.day.format(civil);
          const fullLabel = `${monthLabel} ${dayLabel}, ${formatters.weekday.format(civil)}, ${formatters.year.format(civil)}`;
          return (
            <Button
              key={date}
              type="button"
              variant="ghost"
              className="rv-mini-calendar__day"
              data-part="day"
              data-date={date}
              data-weekend={weekday === 0 || weekday === 6 || undefined}
              disabled={!enabled.includes(date)}
              aria-label={fullLabel}
              aria-current={date === today ? 'date' : undefined}
              aria-pressed={date === value}
              tabIndex={date === tabbable ? 0 : -1}
              onFocus={() => setFocused(date)}
              onKeyDown={(event) => onDayKey(event, date)}
              onClick={() => {
                if (date === value) return;
                if (props.value === undefined) setSelection(date);
                props.onValueChange?.(date);
              }}
            >
              <span data-part="month">{monthLabel}</span>{' '}
              <span data-part="number">{dayLabel}</span>
            </Button>
          );
        })}
      </div>
      <IconButton
        data-part="next"
        className="rv-mini-calendar__navigation"
        label={(
          props.translations?.next ??
          (count === 1 ? 'Next day' : 'Next {days} days')
        ).replace('{days}', pageSize)}
        icon={right}
        disabled={!next}
        onClick={() => next && movePage(next)}
      />
    </div>
  );
}
