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
import { motionAllowed, presetAnimation } from '../presets/motion';
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

export function Calendar(input: CalendarProps) {
  const defaults = input.preset?.props;
  return renderCalendar({
    ...input,
    showTodayButton: input.showTodayButton ?? defaults?.showTodayButton,
    showOutsideDays: input.showOutsideDays ?? defaults?.showOutsideDays,
    fixedWeeks: input.fixedWeeks ?? defaults?.fixedWeeks,
    showWeekNumber: input.showWeekNumber ?? defaults?.showWeekNumber,
    enableYearView: input.enableYearView ?? defaults?.enableYearView,
  });
}

function renderCalendar({
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
  const calendarRoot = useRef<HTMLDivElement>(null);
  const focusedDay = useRef<HTMLButtonElement | null>(null);
  const requestFocus = useRef(false);
  const monthCaptionRefs = useRef(new Map<number, HTMLButtonElement>());
  const viewTriggerIndex = useRef<number>();
  const requestViewFocus = useRef<'caption' | 'day'>();
  const singleDate = props.selectedDates?.length
    ? props.selectedDates.length === 1 && !props.selection
      ? props.selectedDates[0]
      : undefined
    : props.selection?.from && props.selection.from === props.selection.to
      ? props.selection.from
      : undefined;
  const previousMotion = useRef({ month, view, singleDate });
  useLayoutEffect(() => {
    const previous = previousMotion.current;
    previousMotion.current = { month, view, singleDate };
    const root = calendarRoot.current;
    const win = root?.ownerDocument.defaultView;
    if (
      !root ||
      !win ||
      typeof root.animate !== 'function' ||
      !motionAllowed(root)
    )
      return;

    if (month !== previous.month || view !== previous.view) {
      const backwards = compareIsoDates(month, previous.month) < 0;
      const periodEvent =
        backwards && props.preset?.motion?.periodBackward
          ? 'periodBackward'
          : !backwards && props.preset?.motion?.periodForward
            ? 'periodForward'
            : 'period';
      if (
        !props.preset?.motion?.[periodEvent] &&
        !props.preset?.motion?.caption
      )
        return;
      const direction = win.getComputedStyle(root).direction === 'rtl' ? -1 : 1;
      // Keep weekdays and navigation stable while the new columns open out
      // from the center and fade in, in the direction of navigation.
      const animations: Animation[] = [];
      root
        .querySelectorAll<HTMLElement>('.revo-calendar__month-label')
        .forEach((label) => {
          if (!props.preset?.motion?.caption) return;
          const content =
            label.querySelector<HTMLElement>('[aria-live]') ?? label;
          const config = presetAnimation(props.preset?.motion, 'caption', {
            keyframes: [{ opacity: 0 }, { opacity: 1 }],
            options: { duration: 220, easing: 'ease-out' },
          });
          if (config)
            animations.push(content.animate(config.keyframes, config.options));
        });
      root
        .querySelectorAll<HTMLElement>(
          '.revo-calendar__week, .revo-calendar__year-grid',
        )
        .forEach((row) => {
          if (!props.preset?.motion?.[periodEvent]) return;
          const yearGrid = row.classList.contains('revo-calendar__year-grid');
          const items = row.querySelectorAll<HTMLElement>(
            yearGrid ? '.revo-calendar__month' : '.revo-calendar__day',
          );
          items.forEach((item, index) => {
            if (item.getAttribute('aria-hidden') === 'true') return;
            const opacity = win.getComputedStyle(item).opacity;
            const columns = yearGrid ? 3 : 7;
            const column = index % columns;
            const offset = ((columns - 1) / 2 - column) * 1.5 * direction;
            const cascade = backwards ? columns - 1 - column : column;
            const config = presetAnimation(
              props.preset?.motion,
              periodEvent,
              {
                keyframes: [
                  {
                    opacity: 0,
                    transform: `translateX(${offset}px) scaleX(.92)`,
                  },
                  { opacity, transform: 'translateX(0) scaleX(1)' },
                ],
                options: {
                  duration: 220,
                  easing: 'cubic-bezier(.2, .8, .2, 1)',
                  fill: 'backwards',
                },
              },
              { x: offset, opacity, column, direction },
            );
            if (config)
              animations.push(
                item.animate(config.keyframes, {
                  ...config.options,
                  delay:
                    Number(config.options.delay ?? 0) +
                    cascade * (config.stagger ?? 14),
                }),
              );
          });
        });
      animations.forEach(
        (animation) => void animation.finished.catch(() => {}),
      );
      return () => animations.forEach((animation) => animation.cancel());
    }
    if (
      !singleDate ||
      !previous.singleDate ||
      singleDate === previous.singleDate ||
      month !== previous.month ||
      view !== 'month' ||
      previous.view !== 'month'
    )
      return;
    const from = dayRefs.current.get(previous.singleDate);
    const to = dayRefs.current.get(singleDate);
    if (
      !from ||
      !to ||
      from.closest('.revo-calendar__month-grid') !==
        to.closest('.revo-calendar__month-grid')
    )
      return;
    const bounds = root.getBoundingClientRect();
    const start = from.getBoundingClientRect();
    const end = to.getBoundingClientRect();
    const style = win.getComputedStyle(to);
    const indicator = root.ownerDocument.createElement('span');
    indicator.className = 'revo-calendar__selection-indicator';
    indicator.setAttribute('aria-hidden', 'true');
    Object.assign(indicator.style, {
      left: `${start.left - bounds.left - root.clientLeft}px`,
      top: `${start.top - bounds.top - root.clientTop}px`,
      width: `${start.width}px`,
      height: `${start.height}px`,
      borderRadius: style.borderRadius,
      background: style.backgroundColor,
    });
    root.appendChild(indicator);
    to.classList.add('revo-calendar__day--sliding');
    const config = presetAnimation(
      props.preset?.motion,
      'selection',
      {
        keyframes: [
          { transform: 'translate(0, 0)' },
          {
            transform: `translate(${end.left - start.left}px, ${end.top - start.top}px)`,
          },
        ],
        options: { duration: 220, easing: 'cubic-bezier(.22, 1, .36, 1)' },
      },
      { x: end.left - start.left, y: end.top - start.top },
    );
    if (!config) {
      indicator.remove();
      to.classList.remove('revo-calendar__day--sliding');
      return;
    }
    const animation = indicator.animate(config.keyframes, config.options);
    void animation.finished.catch(() => {});
    const cleanup = () => {
      indicator.remove();
      to.classList.remove('revo-calendar__day--sliding');
    };
    animation.onfinish = cleanup;
    return () => {
      animation.cancel();
      cleanup();
    };
  }, [month, view, singleDate, props.preset?.motion]);
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
    // A constraint can disable the focused outside day without moving the tab stop.
    const previous = focusedDay.current;
    if (
      !previous ||
      view !== 'month' ||
      (previous.isConnected && !previous.disabled)
    )
      return;
    const document = previous.ownerDocument;
    if (
      document.activeElement !== previous &&
      document.activeElement !== document.body
    )
      return;
    const next = dayRefs.current.get(focusTarget);
    const target =
      next && !next.disabled
        ? next
        : (calendarRoot.current?.querySelector<HTMLButtonElement>(
            '.revo-calendar__header button:not([disabled])',
          ) ?? calendarRoot.current);
    target?.focus({ preventScroll: true });
  });
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
      ? (yearMonths.find((date) => !yearMonthDisabled(date)) ?? candidate)
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
      ref={calendarRoot}
      tabIndex={-1}
      class={`revo-calendar${props.showWeekNumber ? ' revo-calendar--week-numbers' : ''}${props.className ? ` ${props.className}` : ''}${props.preset?.className ? ` ${props.preset.className}` : ''}`}
      data-part="root"
      data-preset-surface={props.presetSurface ? '' : undefined}
      onFocusCapture={(event) => {
        const element = event.target as HTMLButtonElement;
        focusedDay.current = element.hasAttribute('data-calendar-date')
          ? element
          : null;
      }}
      onBlurCapture={(event) => {
        const element = focusedDay.current;
        if (!element || element !== event.target) return;
        if (event.relatedTarget) focusedDay.current = null;
        else
          queueMicrotask(() => {
            if (
              focusedDay.current === element &&
              element.ownerDocument.activeElement !== element
            )
              focusedDay.current = null;
          });
      }}
      dir={props.dir}
      style={
        props.cellSize
          ? { '--revo-calendar-cell-size': `${Math.max(24, props.cellSize)}px` }
          : undefined
      }
    >
      <div class="revo-calendar__months" data-part="months">
        {(isYearView ? [month] : displayed).map((candidate, index) => (
          <section
            class="revo-calendar__month-panel"
            data-part="month"
            key={index}
          >
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
                  inheritPresetScope
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
