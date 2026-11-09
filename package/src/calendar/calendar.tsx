/** @jsxImportSource preact */
import { h } from 'preact';
import { useMemo, useRef, useState } from 'preact/hooks';
import {
  addDays,
  addDisplayMonths,
  startOfDisplayMonth,
  formatDisplayCalendarDate,
  formatIsoDateInTimeZone,
  displayWeekNumber,
  getUtcWeekday,
  type ISODateString,
} from '@revolist/dates';
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
import { DEFAULT_CALENDAR_TRANSLATIONS } from './translations';
import type { CalendarProps, CalendarView } from './types';
import { CalendarYearGrid } from './year-grid';
const SUNDAY = '2026-08-02' as ISODateString;

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
  const availableViews = useMemo<readonly CalendarView[]>(() => {
    const values = props.views
      ? [
          ...new Set(
            props.views.filter(
              (value) => value === 'month' || value === 'year',
            ),
          ),
        ]
      : enableYearView
        ? (['month', 'year'] as const)
        : (['month'] as const);
    return values.length ? values : ['month'];
  }, [props.views, enableYearView]);
  const [requestedView, setView] = useState<CalendarView>(
    props.defaultView && availableViews.includes(props.defaultView)
      ? props.defaultView
      : availableViews[0],
  );
  const view = availableViews.includes(requestedView)
    ? requestedView
    : availableViews[0];
  const month = startOfDisplayMonth(props.month, system);
  const months = useMemo(
    () =>
      Array.from({ length: count }, (_, index) =>
        addDisplayMonths(month, index, system),
      ),
    [month, count, system],
  );
  const displayed = props.reverseMonths ? [...months].reverse() : months;
  const weekdays = useMemo(
    () =>
      Array.from({ length: 7 }, (_, index) =>
        addDays(SUNDAY, (weekStartsOn + index) % 7),
      ),
    [weekStartsOn],
  );
  const referenceDate =
    props.referenceDate ??
    (props.referenceInstant
      ? formatIsoDateInTimeZone(props.referenceInstant, props.timeZone ?? 'UTC')
      : undefined);
  const dayRefs = useRef(new Map<ISODateString, HTMLButtonElement>());
  const requestFocus = useRef(false);
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
    .sort()
    .at(-1);
  const navigationEnd = [props.endMonth, props.maxDate]
    .filter((date): date is ISODateString => Boolean(date))
    .map((date) => startOfDisplayMonth(date, system))
    .sort()
    .at(0);
  const navDisabled = (candidate: ISODateString) =>
    Boolean(
      props.disableNavigation ||
      monthDisabled(candidate) ||
      (navigationStart && candidate < navigationStart) ||
      (navigationEnd && candidate > navigationEnd),
    );
  const navigationMonth = (candidate: ISODateString, windowCount = count) => {
    let last = navigationEnd
      ? addDisplayMonths(navigationEnd, 1 - windowCount, system)
      : undefined;
    if (last && navigationStart && last < navigationStart)
      last = navigationStart;
    if (last && candidate > last) candidate = last;
    if (navigationStart && candidate < navigationStart)
      candidate = navigationStart;
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
    months.includes(startOfDisplayMonth(props.focusedDate, system)) &&
    !isDisabled(props.focusedDate)
      ? props.focusedDate
      : (months
          .flatMap((candidate) =>
            createCalendarMonth(candidate, weekStartsOn, false, system),
          )
          .find(
            (date) =>
              months.includes(startOfDisplayMonth(date, system)) &&
              !isDisabled(date),
          ) ?? props.focusedDate);
  const changeView = (next: CalendarView) => {
    if (next !== view && availableViews.includes(next)) {
      setView(next);
      props.onViewChange?.(next);
    }
  };
  const selectDate = (date: ISODateString, commit = props.onSelect) => {
    if (isDisabled(date)) {
      props.onInvalidSelection?.(text.invalidSelection, date);
      return false;
    }
    const result = props.validateSelection?.(date, {
      month,
      view,
      selection: props.selection,
      preview: props.preview,
      referenceDate,
    });
    if (result === false || typeof result === 'string') {
      props.onInvalidSelection?.(
        typeof result === 'string' ? result : text.invalidSelection,
        date,
      );
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
    event.preventDefault();
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
  const step = isYearView ? 12 : props.pagedNavigation ? count : 1;
  const previousMonth = navigationMonth(
      addDisplayMonths(month, -step, system),
      isYearView ? 1 : count,
    ),
    nextMonth = navigationMonth(
      addDisplayMonths(month, step, system),
      isYearView ? 1 : count,
    );
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
          <section class="revo-calendar__month-panel" key={candidate}>
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
                        onClick: () => changeView('year'),
                      }
                    : undefined
                }
                showLabel={showMonthLabel}
                showPrevious={showPreviousButton && index === 0}
                showNext={
                  showNextButton && index === (isYearView ? 0 : count - 1)
                }
                previousDisabled={
                  previousMonth >= month || navDisabled(previousMonth)
                }
                nextDisabled={nextMonth <= month || navDisabled(nextMonth)}
                onPrevious={() => navigateTo(previousMonth)}
                onNext={() => navigateTo(nextMonth)}
              />
            )}
            {isYearView ? (
              <CalendarYearGrid
                month={month}
                system={system}
                referenceDate={referenceDate}
                minDate={props.minDate}
                maxDate={props.maxDate}
                isMonthDisabled={props.isMonthDisabled}
                locale={locale}
                ariaLabel={`${text.chooseMonth} ${formatDisplayCalendarDate(month, locale, { year: 'numeric' }, system)}`}
                onEscape={() => changeView('month')}
                onSelect={(next) => {
                  navigateTo(next, count);
                  changeView('month');
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
              disabled={isDisabled(preset.date)}
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
