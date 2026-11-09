import { TooltipText } from './core/tooltip-text';
/** @jsxImportSource preact */
import { ButtonControl as UiButton } from './native-control';

import { h, type RefObject } from 'preact';
import { useLayoutEffect, useRef } from 'preact/hooks';
export interface TimeGridWorkingHours {
  readonly startHour: number;
  readonly endHour: number;
}
export const timeGridCellKey = (weekday: number, hour: number) =>
  `${weekday}:${hour}`;

export interface TimeGridDayLabel {
  readonly weekday: number;
  readonly short: string;
  readonly long: string;
}

export interface TimeGridProps {
  readonly disabled?: boolean;
  readonly days: readonly TimeGridDayLabel[];
  readonly cells: ReadonlySet<string>;
  readonly focused: string;
  readonly weekendDays: readonly number[];
  readonly workingHours?: TimeGridWorkingHours;
  readonly gridLabel: string;
  readonly hourLabel: (hour: number) => string;
  readonly cellLabel: (
    day: TimeGridDayLabel,
    start: string,
    end: string,
    selected: boolean,
  ) => string;
  readonly matrixRef: RefObject<HTMLDivElement>;
  readonly onFocus: (key: string) => void;
  readonly onKeyDown: (
    event: h.JSX.TargetedKeyboardEvent<HTMLButtonElement>,
    weekday: number,
    hour: number,
  ) => void;
  readonly onClick: (
    event: h.JSX.TargetedMouseEvent<HTMLButtonElement>,
    weekday: number,
    hour: number,
    selected: boolean,
  ) => void;
  readonly onPointerDown: (
    event: h.JSX.TargetedPointerEvent<HTMLButtonElement>,
    weekday: number,
    hour: number,
    selected: boolean,
  ) => void;
  readonly onPointerEnter: (weekday: number, hour: number) => void;
}

function cellClassName(options: {
  weekend: boolean;
  outsideWorkHours: boolean;
}) {
  return [
    'rv-time-grid__cell',
    options.weekend && 'is-weekend',
    options.outsideWorkHours && 'is-outside-work-hours',
  ]
    .filter(Boolean)
    .join(' ');
}

export function TimeGrid(props: TimeGridProps) {
  const classes = (part: string) => `rv-time-grid__${part}`;
  const hours = Array.from({ length: 12 }, (_, bucket) => bucket * 2);
  return (
    <div class={classes('schedule')}>
      <div class={classes('hours')} aria-hidden="true">
        <span />
        {hours.map((hour) => (
          <span class={classes('hour')} key={hour}>
            {props.hourLabel(hour)}
          </span>
        ))}
      </div>
      <div
        ref={props.matrixRef}
        class={classes('matrix')}
        role="grid"
        aria-label={props.gridLabel}
        aria-rowcount={props.days.length}
        aria-colcount={12}
      >
        {props.days.map((day) => {
          const { weekday, short, long } = day;
          const weekend = props.weekendDays.includes(weekday);
          return (
            <div
              class={`${classes('row')}${weekend ? ' is-weekend' : ''}`}
              role="row"
              key={weekday}
            >
              <TooltipText
                class={classes('weekday')}
                role="rowheader"
                title={long}
              >
                {short}
              </TooltipText>
              {hours.map((hour) => {
                const key = timeGridCellKey(weekday, hour);
                const selected =
                  props.cells.has(key) ||
                  props.cells.has(timeGridCellKey(weekday, hour + 1));
                const outsideWorkHours = props.workingHours
                  ? hour < props.workingHours.startHour ||
                    hour + 2 > props.workingHours.endHour
                  : false;
                return (
                  <UiButton
                    key={key}
                    type="button"
                    disabled={props.disabled}
                    role="gridcell"
                    data-time-cell={key}
                    class={cellClassName({ weekend, outsideWorkHours })}
                    aria-selected={selected}
                    aria-label={props.cellLabel(
                      day,
                      props.hourLabel(hour),
                      props.hourLabel(hour + 2),
                      selected,
                    )}
                    tabIndex={props.focused === key ? 0 : -1}
                    onFocus={() => props.onFocus(key)}
                    onKeyDown={(event) => props.onKeyDown(event, weekday, hour)}
                    onClick={(event) =>
                      props.onClick(event, weekday, hour, selected)
                    }
                    onPointerDown={(event) =>
                      props.onPointerDown(event, weekday, hour, selected)
                    }
                    onPointerEnter={() => props.onPointerEnter(weekday, hour)}
                  />
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Shared native focus, paint gesture and teardown; consumers own selected values. */
export function useTimeGridInteraction(options: {
  days: readonly TimeGridDayLabel[];
  matrixRef: RefObject<HTMLDivElement>;
  onFocus: (key: string) => void;
  onPaint: (weekday: number, hour: number, selected: boolean) => void;
  onCommit: () => void;
  disabled?: boolean;
}) {
  const current = useRef(options);
  current.current = options;
  const drag = useRef<{ selected: boolean }>();
  const release = useRef<() => void>();
  const frame = useRef<number>();
  const stop = () => {
    release.current?.();
    release.current = undefined;
  };
  useLayoutEffect(
    () => () => {
      drag.current = undefined;
      stop();
      if (frame.current !== undefined) cancelAnimationFrame(frame.current);
    },
    [],
  );
  const focus = (weekday: number, hour: number) => {
    const key = timeGridCellKey(weekday, hour);
    current.current.onFocus(key);
    if (frame.current !== undefined) cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() =>
      current.current.matrixRef.current
        ?.querySelector<HTMLButtonElement>(`[data-time-cell="${key}"]`)
        ?.focus(),
    );
  };
  return {
    onKeyDown: (
      event: h.JSX.TargetedKeyboardEvent<HTMLButtonElement>,
      weekday: number,
      hour: number,
    ) => {
      if (current.current.disabled) return;
      const days = current.current.days;
      const index = days.findIndex((day) => day.weekday === weekday);
      if (!days.length || index < 0) return;
      if (event.key === 'ArrowLeft') focus(weekday, (hour + 22) % 24);
      else if (event.key === 'ArrowRight') focus(weekday, (hour + 2) % 24);
      else if (event.key === 'ArrowUp')
        focus(days[(index + days.length - 1) % days.length].weekday, hour);
      else if (event.key === 'ArrowDown')
        focus(days[(index + 1) % days.length].weekday, hour);
      else if (event.key === 'Home') focus(weekday, 0);
      else if (event.key === 'End') focus(weekday, 22);
      else return;
      event.preventDefault();
    },
    onClick: (
      event: h.JSX.TargetedMouseEvent<HTMLButtonElement>,
      weekday: number,
      hour: number,
      selected: boolean,
    ) => {
      if (current.current.disabled || event.detail !== 0) return;
      current.current.onPaint(weekday, hour, !selected);
      current.current.onCommit();
    },
    onPointerDown: (
      event: h.JSX.TargetedPointerEvent<HTMLButtonElement>,
      weekday: number,
      hour: number,
      selected: boolean,
    ) => {
      if (current.current.disabled || event.button !== 0) return;
      event.preventDefault();
      stop();
      drag.current = { selected: !selected };
      const document = event.currentTarget.ownerDocument;
      const finish = () => {
        if (!drag.current) return;
        drag.current = undefined;
        stop();
        current.current.onCommit();
      };
      document.addEventListener('pointerup', finish);
      document.addEventListener('pointercancel', finish);
      release.current = () => {
        document.removeEventListener('pointerup', finish);
        document.removeEventListener('pointercancel', finish);
      };
      current.current.onPaint(weekday, hour, !selected);
      current.current.onFocus(timeGridCellKey(weekday, hour));
    },
    onPointerEnter: (weekday: number, hour: number) => {
      if (drag.current && !current.current.disabled)
        current.current.onPaint(weekday, hour, drag.current.selected);
    },
  };
}
