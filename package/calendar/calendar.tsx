/** @jsxImportSource preact */
import { h } from 'preact';
import { useLayoutEffect, useMemo, useRef, useState } from 'preact/hooks';
import {
  addDays,
  addDisplayMonths,
  compareIsoDates,
  displayYearMonths,
  isValidIsoDate,
  startOfDisplayMonth,
  formatDisplayCalendarDate,
  displayWeekNumber,
  getUtcWeekday,
  type ISODateString,
} from '@revolist/ui-dates';
import { createControlId } from '../core/control-id';
import { ButtonControl } from '../native-control';
import { CalendarHeader, CalendarWeekdays } from './header';
import { CalendarCaption } from './caption';
import {
  createCalendarMonth,
  isCalendarDateDisabled,
  isCalendarMonthDisabled,
  moveCalendarFocus,
} from './model';
import { CalendarMonthGrid } from './month-grid';
import {
  MAX_CALENDAR_DATE,
  MIN_CALENDAR_DATE,
  resolveCalendarReferenceDate,
} from './reference-date';
import {
  getCalendarSelectionError,
  getCalendarViews,
} from './selection-validation';
import { DEFAULT_CALENDAR_TRANSLATIONS } from './translations';
import type { CalendarProps, CalendarView } from './types';
import { CalendarYearGrid } from './year-grid';
const DAY_NAVIGATION_KEYS = [
  'ArrowLeft',
  'ArrowRight',
  'ArrowUp',
  'ArrowDown',
  'Home',
  'End',
  'PageUp',
  'PageDown',
];

export function Calendar({
  locale = 'en-US',
  weekStartsOn = 1,
  showOutsideDays = false,
  allowOutsideMonthSelection = false,
  fixedWeeks = true,
  showTodayButton = false,
  showHeader = true,
  showNavigation = true,
  showPreviousButton = showNavigation,
  showNextButton = showNavigation,
  showMonthLabel = true,
  showWeekdays = true,
  enableYearView = true,
  translations = {},
  ...props
}: CalendarProps) {
  const [previewDescriptionId] = useState(() =>
    createControlId('rv-calendar-feedback'),
  );
  const system = props.calendarSystem ?? 'gregory';
  const count = Math.max(
    1,
    Math.min(12, Math.trunc(props.numberOfMonths || 1)),
  );
  const availableViews = useMemo(
    () => getCalendarViews({ views: props.views, enableYearView }),
    [props.views, enableYearView],
  );
  const [requestedView, setView] = useState<CalendarView>(
    props.defaultView && availableViews.includes(props.defaultView)
      ? props.defaultView
      : availableViews[0],
  );
  const view = availableViews.includes(requestedView)
    ? requestedView
    : availableViews[0];
  const month = startOfDisplayMonth(props.month, system);
  const [domainStart, domainEnd] = useMemo(
    () => [
      startOfDisplayMonth(MIN_CALENDAR_DATE, system),
      startOfDisplayMonth(MAX_CALENDAR_DATE, system),
    ],
    [system],
  );
  const months = useMemo(
    () =>
      Array.from({ length: count }, (_, index) =>
        addDisplayMonths(month, index, system),
      ).filter((date) => compareIsoDates(date, domainEnd) <= 0),
    [month, count, system, domainEnd],
  );
  const displayed = props.reverseMonths ? [...months].reverse() : months;
  const weekdays = useMemo(() => {
    const firstDay = isValidIsoDate(month) ? month : MIN_CALENDAR_DATE;
    const offset = (weekStartsOn - getUtcWeekday(firstDay) + 7) % 7;
    return Array.from({ length: 7 }, (_, index) =>
      addDays(firstDay, offset + index),
    );
  }, [month, weekStartsOn]);
  const referenceDate = resolveCalendarReferenceDate(props);
  const dayRefs = useRef(new Map<ISODateString, HTMLButtonElement>());
  const requestFocus = useRef(false);
  const monthCaptionRefs = useRef(new Map<number, HTMLButtonElement>());
  const viewTriggerIndex = useRef<number>();
  const requestViewFocus = useRef<'caption' | 'day'>();
  const text = { ...DEFAULT_CALENDAR_TRANSLATIONS, ...translations };
  const monthDisabled = (candidate: ISODateString) =>
    isCalendarMonthDisabled(candidate, {
      minDate: props.minDate,
      maxDate: props.maxDate,
      isMonthDisabled: props.isMonthDisabled,
      calendarSystem: system,
    });
  const navigationStart = [props.startMonth, props.minDate]
    .filter((date): date is ISODateString => Boolean(date))
    .map((date) => startOfDisplayMonth(date, system))
    .sort(compareIsoDates)
    .at(-1);
  const navigationEnd = [props.endMonth, props.maxDate]
    .filter((date): date is ISODateString => Boolean(date))
    .map((date) => startOfDisplayMonth(date, system))
    .sort(compareIsoDates)
    .at(0);
  const firstMonth = navigationStart ?? domainStart;
  const lastMonth = navigationEnd ?? domainEnd;
  const navDisabled = (candidate: ISODateString) =>
    Boolean(
      props.disableNavigation ||
      compareIsoDates(candidate, firstMonth) < 0 ||
      compareIsoDates(candidate, lastMonth) > 0,
    );
  const yearMonthDisabled = (candidate: ISODateString) =>
    navDisabled(candidate) || monthDisabled(candidate);
  const navigationMonth = (candidate: ISODateString, windowCount = count) => {
    const last = addDisplayMonths(lastMonth, 1 - windowCount, system);
    if (compareIsoDates(candidate, last) > 0) candidate = last;
    if (compareIsoDates(candidate, firstMonth) < 0) candidate = firstMonth;
    return candidate;
  };
  // One evaluation per date per render, shared by focus fallback and visible cells.
  const disabledCache = new Map<ISODateString, boolean>();
  const isDisabled = (date: ISODateString): boolean => {
    const cached = disabledCache.get(date);
    if (cached !== undefined) return cached;
    const disabled =
      monthDisabled(startOfDisplayMonth(date, system)) ||
      isCalendarDateDisabled(date, {
        minDate: props.minDate,
        maxDate: props.maxDate,
        isDisabled: props.isDateDisabled,
      });
    disabledCache.set(date, disabled);
    return disabled;
  };
  const focusTarget =
    isValidIsoDate(props.focusedDate) &&
    months.includes(startOfDisplayMonth(props.focusedDate, system)) &&
    !isDisabled(props.focusedDate)
      ? props.focusedDate
      : (months
          .flatMap((candidate) =>
            createCalendarMonth(candidate, weekStartsOn, false, system),
          )
          .find(
            (date) =>
              isValidIsoDate(date) &&
              months.includes(startOfDisplayMonth(date, system)) &&
              !isDisabled(date),
          ) ?? props.focusedDate);
  useLayoutEffect(() => {
    const requested = requestViewFocus.current;
    if (view !== 'month' || !requested) return;
    requestViewFocus.current = undefined;
    const caption = monthCaptionRefs.current.get(viewTriggerIndex.current ?? 0);
    viewTriggerIndex.current = undefined;
    const day = dayRefs.current.get(focusTarget);
    const enabledDay = day && !day.disabled ? day : undefined;
    const target =
      requested === 'day' ? (enabledDay ?? caption) : (caption ?? enabledDay);
    target?.focus({
      preventScroll: true,
    });
  }, [view, focusTarget]);
  const changeView = (next: CalendarView) => {
    if (next !== view && availableViews.includes(next)) {
      setView(next);
      props.onViewChange?.(next);
    }
  };
  const selectDate = (date: ISODateString, commit = props.onSelect) => {
    const error = getCalendarSelectionError(
      { translations, validateSelection: props.validateSelection },
      date,
      {
        month,
        view,
        selection: props.selection,
        preview: props.preview,
        referenceDate,
      },
      isDisabled(date),
    );
    if (error !== undefined) {
      props.onInvalidSelection?.(error, date);
      return false;
    }
    commit(date);
    return true;
  };
  const setDayRef = (
    date: ISODateString,
    element: HTMLButtonElement | null,
  ) => {
    if (element) dayRefs.current.set(date, element);
    else dayRefs.current.delete(date);
    if (element && requestFocus.current && date === props.focusedDate) {
      requestFocus.current = false;
      queueMicrotask(() => element.focus());
    }
  };
  const moveFocus = (
    event: h.JSX.TargetedKeyboardEvent<HTMLButtonElement>,
    date: ISODateString,
  ) => {
    if (!DAY_NAVIGATION_KEYS.includes(event.key)) return;
    event.preventDefault();
    const direction =
      props.dir ??
      (event.currentTarget.ownerDocument.defaultView?.getComputedStyle(
        event.currentTarget,
      ).direction === 'rtl'
        ? 'rtl'
        : 'ltr');
    const next = moveCalendarFocus({
      date,
      key: event.key,
      shiftKey: event.shiftKey,
      weekStartsOn,
      minDate: props.minDate,
      maxDate: props.maxDate,
      isDisabled,
      dir: direction,
      calendarSystem: system,
    });
    if (!next) return;
    const target = startOfDisplayMonth(next, system);
    if (!months.includes(target) && navDisabled(target)) return;
    requestFocus.current = true;
    if (!months.includes(target)) props.onMonthChange(navigationMonth(target));
    props.onFocusedDateChange(next);
    queueMicrotask(() => {
      const element = dayRefs.current.get(next);
      if (element) {
        requestFocus.current = false;
        element.focus();
      }
    });
  };
  const monthLabel = (date: ISODateString) =>
    props.formatMonth?.(date, locale) ??
    formatDisplayCalendarDate(
      date,
      locale,
      { month: 'long', year: 'numeric' },
      system,
    );
  const isYearView = view === 'year';
  const yearNavigationTarget = (offset: number) => {
    const candidate = navigationMonth(
      addDisplayMonths(month, offset, system),
      1,
    );
    const yearMonths = displayYearMonths(candidate, system);
    if (yearMonths.includes(month)) return;
    return yearMonthDisabled(candidate)
      ? yearMonths.find((date) => !yearMonthDisabled(date)) ?? candidate
      : candidate;
  };
  const step = props.pagedNavigation ? count : 1;
  const previousMonth = isYearView
    ? yearNavigationTarget(-12)
    : navigationMonth(addDisplayMonths(month, -step, system));
  const nextMonth = isYearView
    ? yearNavigationTarget(12)
    : navigationMonth(addDisplayMonths(month, step, system));
  const navigateTo = (
    date: ISODateString,
    windowCount = isYearView ? 1 : count,
  ) => {
    const target = navigationMonth(date, windowCount);
    if (navDisabled(target)) return;
    props.onMonthChange(target);
  };
  const selectPreset = (date: ISODateString) => {
    if (!selectDate(date, props.onPresetSelect ?? props.onSelect)) return;
    props.onMonthChange(navigationMonth(startOfDisplayMonth(date, system)));
    props.onFocusedDateChange(date);
    changeView('month');
  };
  return (
    <div
      class={`revo-calendar${props.showWeekNumber ? ' revo-calendar--week-numbers' : ''}${props.className ? ` ${props.className}` : ''}`}
      dir={props.dir}
      style={
        props.cellSize
          ? { '--revo-calendar-cell-size': `${Math.max(24, props.cellSize)}px` }
          : undefined
      }
    >
      <div class="revo-calendar__months">
        {(isYearView ? [month] : displayed).map((candidate, index) => (
          <section class="revo-calendar__month-panel" key={index}>
            {showHeader && (
              <CalendarHeader
                label={
                  isYearView
                    ? formatDisplayCalendarDate(
                        candidate,
                        locale,
                        { year: 'numeric' },
                        system,
                      )
                    : monthLabel(candidate)
                }
                previousLabel={
                  isYearView ? text.previousYear : text.previousMonth
                }
                nextLabel={isYearView ? text.nextYear : text.nextMonth}
                caption={
                  !isYearView &&
                  props.captionLayout &&
                  props.captionLayout !== 'label' ? (
                    <CalendarCaption
                      month={candidate}
                      system={system}
                      locale={locale}
                      layout={props.captionLayout}
                      start={navigationStart}
                      end={navigationEnd}
                      disabled={props.disableNavigation}
                      labels={text}
                      onChange={(date) =>
                        navigateTo(
                          addDisplayMonths(
                            date,
                            -months.indexOf(candidate),
                            system,
                          ),
                        )
                      }
                    />
                  ) : undefined
                }
                labelAction={
                  !props.disableNavigation &&
                  !isYearView &&
                  availableViews.includes('year')
                    ? {
                        ariaLabel: `${text.chooseMonth}: ${monthLabel(candidate)}`,
                        onClick: () => {
                          viewTriggerIndex.current = index;
                          changeView('year');
                        },
                        ref: (element) => {
                          if (element)
                            monthCaptionRefs.current.set(index, element);
                          else monthCaptionRefs.current.delete(index);
                        },
                      }
                    : undefined
                }
                showLabel={showMonthLabel}
                showPrevious={showPreviousButton && index === 0}
                showNext={
                  showNextButton &&
                  index === (isYearView ? 0 : displayed.length - 1)
                }
                previousDisabled={
                  !previousMonth ||
                  compareIsoDates(previousMonth, month) >= 0 ||
                  navDisabled(previousMonth)
                }
                nextDisabled={
                  !nextMonth ||
                  compareIsoDates(nextMonth, month) <= 0 ||
                  navDisabled(nextMonth)
                }
                onPrevious={() => previousMonth && navigateTo(previousMonth)}
                onNext={() => nextMonth && navigateTo(nextMonth)}
              />
            )}
            {isYearView ? (
              <CalendarYearGrid
                month={month}
                system={system}
                referenceDate={referenceDate}
                isMonthDisabled={yearMonthDisabled}
                focusOnMount={viewTriggerIndex.current !== undefined}
                locale={locale}
                ariaLabel={`${text.chooseMonth} ${formatDisplayCalendarDate(month, locale, { year: 'numeric' }, system)}`}
                onEscape={
                  availableViews.includes('month')
                    ? () => {
                        requestViewFocus.current = 'caption';
                        changeView('month');
                      }
                    : undefined
                }
                onSelect={(next) => {
                  if (availableViews.includes('month')) {
                    requestViewFocus.current = 'day';
                    props.onFocusedDateChange(next);
                    props.onMonthChange(navigationMonth(next));
                    changeView('month');
                  } else navigateTo(next, 1);
                }}
              />
            ) : (
              <div
                class="revo-calendar__calendar"
                role="grid"
                aria-label={`${monthLabel(candidate)} ${text.calendar}`}
              >
                {showWeekdays && (
                  <CalendarWeekdays
                    dates={weekdays}
                    locale={locale}
                    format={
                      props.formatWeekday ??
                      ((date, loc) =>
                        formatDisplayCalendarDate(
                          date,
                          loc,
                          {
                            weekday: /^(fa|ar)(-|$)/.test(loc)
                              ? 'narrow'
                              : 'short',
                          },
                          system,
                        ))
                    }
                    weekNumberLabel={
                      props.showWeekNumber ? text.weekNumber : undefined
                    }
                  />
                )}
                <CalendarMonthGrid
                  dates={createCalendarMonth(
                    candidate,
                    weekStartsOn,
                    fixedWeeks,
                    system,
                  )}
                  month={candidate}
                  system={system}
                  visibleMonths={months}
                  focusedDate={focusTarget}
                  referenceDate={referenceDate}
                  selection={props.selection}
                  selectedDates={props.selectedDates}
                  preview={props.preview}
                  previewInvalid={props.previewInvalid}
                  previewDescriptionId={
                    props.previewDescription ? previewDescriptionId : undefined
                  }
                  showOutsideDays={showOutsideDays}
                  allowOutsideMonthSelection={allowOutsideMonthSelection}
                  dayClassName={props.dayClassName}
                  renderDay={
                    props.renderDay ??
                    ((date) =>
                      formatDisplayCalendarDate(
                        date,
                        locale,
                        { day: 'numeric' },
                        system,
                      ))
                  }
                  isDisabled={isDisabled}
                  formatDayLabel={(date) =>
                    props.formatDayLabel?.(date, locale) ??
                    formatDisplayCalendarDate(
                      date,
                      locale,
                      {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      },
                      system,
                    )
                  }
                  weekNumber={
                    props.showWeekNumber
                      ? (date) => {
                          const number = displayWeekNumber(
                            props.weekNumbering === 'local'
                              ? date
                              : addDays(
                                  date,
                                  (4 - getUtcWeekday(date) + 7) % 7,
                                ),
                            props.weekNumbering === 'local' ? weekStartsOn : 1,
                            props.weekNumbering === 'local' ? 1 : 4,
                            props.weekNumbering === 'local'
                              ? system
                              : 'gregory',
                          );
                          return (
                            props.formatWeekNumber?.(number) ??
                            new Intl.NumberFormat(locale).format(number)
                          );
                        }
                      : undefined
                  }
                  weekNumberLabel={text.weekNumber}
                  setDayRef={setDayRef}
                  onFocus={props.onFocusedDateChange}
                  onPreview={(date) => props.onPreviewDateChange?.(date)}
                  onKeyDown={moveFocus}
                  onSelect={selectDate}
                />
              </div>
            )}
          </section>
        ))}
      </div>
      {props.presets?.length ? (
        <div class="revo-calendar__presets">
          {props.presets.map((preset) => (
            <ButtonControl
              key={preset.label}
              disabled={!isValidIsoDate(preset.date) || isDisabled(preset.date)}
              onClick={() => selectPreset(preset.date)}
            >
              {preset.label}
            </ButtonControl>
          ))}
        </div>
      ) : null}
      {showTodayButton && referenceDate && (
        <button
          type="button"
          class="revo-calendar__today"
          disabled={isDisabled(referenceDate)}
          onClick={() => selectPreset(referenceDate)}
        >
          {text.today}
        </button>
      )}
      {props.previewDescription !== undefined && (
        <p
          id={previewDescriptionId}
          class="revo-calendar__feedback"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {props.previewDescription}
        </p>
      )}
      {props.footer && <div class="revo-calendar__footer">{props.footer}</div>}
    </div>
  );
}
