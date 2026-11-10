/** @jsxImportSource preact */
import type { JSX } from 'preact';
import { useControlTooltip } from '../core/tooltip';
import { useRef } from 'preact/hooks';
import { ButtonControl as UiButton } from '../native-control';
import {
  timelineEventBackground,
  eventOutsideRange,
  moveTimelineEvent,
  niceTimelineStep,
  resizeTimelineEvent,
  timelineGeometry,
  type TimelineTrackEvent,
  type TimelineTrackRange,
} from './model';

export type TimelineTrackPointerMode = 'move' | 'start' | 'end';
export interface TimelineTrackItem<T extends TimelineTrackEvent> {
  readonly id: string | number;
  readonly event: T;
}
export interface TimelineTrackLabels {
  readonly preview: string;
  readonly editEvents?: string;
  readonly moveEarlier?: string;
  readonly moveLater?: string;
  readonly startEarlier?: string;
  readonly startLater?: string;
  readonly endEarlier?: string;
  readonly endLater?: string;
  readonly moveEvent: (index: number) => string;
  readonly resizeStart: (label: string) => string;
  readonly resizeEnd: (label: string) => string;
}
const defaultLabels: Required<TimelineTrackLabels> = {
  preview: 'Timeline preview',
  editEvents: 'Edit timeline events',
  moveEarlier: 'Move earlier',
  moveLater: 'Move later',
  startEarlier: 'Start earlier',
  startLater: 'Start later',
  endEarlier: 'End earlier',
  endLater: 'End later',
  moveEvent: (index) => `Move event ${index}`,
  resizeStart: (label) => `Resize start of ${label}`,
  resizeEnd: (label) => `Resize end of ${label}`,
};

interface PointerSession<T extends TimelineTrackEvent> {
  readonly id: string | number;
  readonly mode: TimelineTrackPointerMode;
  readonly clientX: number;
  readonly event: T;
  readonly width: number;
}

export interface TimelineTrackProps<T extends TimelineTrackEvent> {
  readonly rows: readonly TimelineTrackItem<T>[];
  readonly tooltip?: boolean;
  /** Show click/tap alternatives to dragging. Hosts hiding these must supply equivalent controls. */
  readonly showActions?: boolean;
  readonly formatValue?: (value: number) => string;
  readonly getTooltip?: (event: T) => string;
  readonly selected?: string | number;
  /** Finite bounds with end greater than start. */
  readonly range: TimelineTrackRange;
  readonly labels?: Partial<TimelineTrackLabels>;
  readonly onSelect: (id: string | number) => void;
  readonly onEventChange: (id: string | number, event: T) => void;
}

/** Controlled numeric timeline. Changes preserve event metadata; consumers own commits. */
export function TimelineTrack<T extends TimelineTrackEvent>({
  rows,
  tooltip = true,
  showActions = true,
  formatValue = String,
  getTooltip,
  selected,
  range,
  labels,
  onSelect,
  onEventChange,
}: TimelineTrackProps<T>) {
  const locale = { ...defaultLabels, ...labels };
  const pointer = useRef<PointerSession<T>>();

  const beginPointer = (
    pointerEvent: PointerEvent,
    row: TimelineTrackItem<T>,
    mode: TimelineTrackPointerMode,
  ) => {
    const track = (
      pointerEvent.currentTarget as HTMLElement
    ).closest<HTMLElement>('.rv-timeline-control__track');
    if (!track) return;
    pointerEvent.preventDefault();
    (pointerEvent.currentTarget as HTMLElement).setPointerCapture?.(
      pointerEvent.pointerId,
    );
    pointer.current = {
      id: row.id,
      mode,
      clientX: pointerEvent.clientX,
      event: row.event,
      width: track.getBoundingClientRect().width,
    };
    onSelect(row.id);
  };
  const continuePointer = (pointerEvent: PointerEvent) => {
    const session = pointer.current;
    if (!session) return;
    const step = niceTimelineStep(range);
    const delta =
      ((pointerEvent.clientX - session.clientX) / Math.max(1, session.width)) *
      (range.end - range.start);
    const snapped = Math.round(delta / step) * step;
    const event =
      session.mode === 'move'
        ? moveTimelineEvent(session.event, snapped, range)
        : resizeTimelineEvent(session.event, session.mode, snapped, range);
    onEventChange(session.id, event);
  };
  const endPointer = () => {
    pointer.current = undefined;
  };
  const keyboardChange = (
    event: KeyboardEvent,
    row: TimelineTrackItem<T>,
    mode: TimelineTrackPointerMode,
  ) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const delta =
      niceTimelineStep(range) * (event.key === 'ArrowLeft' ? -1 : 1);
    onEventChange(
      row.id,
      mode === 'move'
        ? moveTimelineEvent(row.event, delta, range)
        : resizeTimelineEvent(row.event, mode, delta, range),
    );
  };

  return (
    <>
      <div
        class="rv-timeline-editor__track rv-timeline-control__track"
        role="group"
        aria-label={locale.preview}
        style={{
          height: `max(112px, calc(70px + ${rows.length} * var(--rv-timeline-lane-size)))`,
        }}
      >
        <span class="rv-timeline-editor__range rv-timeline-editor__range--start rv-timeline-control__range rv-timeline-control__range--start">
          {range.start}
        </span>
        <span class="rv-timeline-editor__range rv-timeline-editor__range--end rv-timeline-control__range rv-timeline-control__range--end">
          {range.end}
        </span>
        {rows
          .map((row, index) => ({ row, index }))
          .filter(
            ({ row }) =>
              Number.isFinite(row.event.start) &&
              Number.isFinite(row.event.end) &&
              row.event.end >= row.event.start,
          )
          .map(({ row, index }) => {
            const geometry = timelineGeometry(row.event, range);
            // Keep the minimum-sized interaction area and both edge handles
            // inside the clipped track, including milestones at either bound.
            const affordanceWidth = `clamp(56px, ${geometry.width}%, calc(100% - 24px))`;
            const outside = eventOutsideRange(row.event, range);
            const eventName = row.event.label || locale.moveEvent(index + 1);
            return (
              <TimelineEventFrame
                tooltipText={
                  tooltip
                    ? (getTooltip?.(row.event) ??
                      `${eventName}: ${formatValue(row.event.start)} – ${formatValue(row.event.end)}`)
                    : undefined
                }
                key={row.id}
                class={[
                  'rv-timeline-editor__bar rv-timeline-control__bar',
                  selected === row.id
                    ? 'rv-timeline-editor__bar--selected rv-timeline-control__bar--selected'
                    : '',
                  row.event.start === row.event.end
                    ? 'rv-timeline-editor__bar--milestone rv-timeline-control__bar--milestone'
                    : '',
                  outside
                    ? 'rv-timeline-editor__bar--outside rv-timeline-control__bar--outside'
                    : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                style={{
                  top: `calc(39px + ${index} * var(--rv-timeline-lane-size))`,
                  left: `clamp(12px, ${geometry.left}%, calc(100% - ${affordanceWidth} - 12px))`,
                  width: affordanceWidth,
                  background: timelineEventBackground(row.event),
                  color: row.event.textColor,
                  '--timeline-event-color': row.event.color,
                  '--timeline-event-color-end': row.event.color,
                }}
                role="group"
                aria-label={eventName}
              >
                <UiButton
                  unstyled
                  type="button"
                  class="rv-timeline-editor__bar-move rv-timeline-control__bar-move"
                  data-autofocus={index === 0 ? '' : undefined}
                  aria-label={
                    row.event.label
                      ? `${locale.moveEvent(index + 1)}: ${row.event.label}`
                      : locale.moveEvent(index + 1)
                  }
                  aria-keyshortcuts="ArrowLeft ArrowRight"
                  onFocus={() => onSelect(row.id)}
                  onPointerDown={(event) => beginPointer(event, row, 'move')}
                  onPointerMove={continuePointer}
                  onPointerUp={endPointer}
                  onPointerCancel={endPointer}
                  onKeyDown={(event) => keyboardChange(event, row, 'move')}
                >
                  <span class="rv-timeline-editor__bar-label rv-timeline-control__bar-label">
                    {row.event.label}
                  </span>
                </UiButton>
                <UiButton
                  unstyled
                  type="button"
                  class="rv-timeline-editor__handle rv-timeline-editor__handle--start rv-timeline-control__handle rv-timeline-control__handle--start"
                  role="slider"
                  aria-orientation="horizontal"
                  aria-label={locale.resizeStart(eventName)}
                  aria-valuemin={Math.min(range.start, row.event.start)}
                  aria-valuemax={row.event.end}
                  aria-valuenow={row.event.start}
                  aria-keyshortcuts="ArrowLeft ArrowRight"
                  onFocus={() => onSelect(row.id)}
                  onPointerDown={(event) => {
                    event.stopPropagation();
                    beginPointer(event, row, 'start');
                  }}
                  onPointerMove={continuePointer}
                  onPointerUp={endPointer}
                  onPointerCancel={endPointer}
                  onKeyDown={(event) => {
                    event.stopPropagation();
                    keyboardChange(event, row, 'start');
                  }}
                />
                <UiButton
                  unstyled
                  type="button"
                  class="rv-timeline-editor__handle rv-timeline-editor__handle--end rv-timeline-control__handle rv-timeline-control__handle--end"
                  role="slider"
                  aria-orientation="horizontal"
                  aria-label={locale.resizeEnd(eventName)}
                  aria-valuemin={row.event.start}
                  aria-valuemax={Math.max(range.end, row.event.end)}
                  aria-valuenow={row.event.end}
                  aria-keyshortcuts="ArrowLeft ArrowRight"
                  onFocus={() => onSelect(row.id)}
                  onPointerDown={(event) => {
                    event.stopPropagation();
                    beginPointer(event, row, 'end');
                  }}
                  onPointerMove={continuePointer}
                  onPointerUp={endPointer}
                  onPointerCancel={endPointer}
                  onKeyDown={(event) => {
                    event.stopPropagation();
                    keyboardChange(event, row, 'end');
                  }}
                />
              </TimelineEventFrame>
            );
          })}
      </div>
      {showActions && (
        <details class="rv-timeline-control__actions">
          <summary>{locale.editEvents}</summary>
          {rows
            .filter(
              ({ event }) =>
                Number.isFinite(event.start) &&
                Number.isFinite(event.end) &&
                event.end >= event.start,
            )
            .map((row, index) => (
              <fieldset key={row.id}>
                <legend>
                  {row.event.label || locale.moveEvent(index + 1)}
                </legend>
                <output>
                  {formatValue(row.event.start)} – {formatValue(row.event.end)}
                </output>
                <div class="rv-timeline-control__commands">
                  {(
                    [
                      ['move', -1, locale.moveEarlier],
                      ['move', 1, locale.moveLater],
                      ['start', -1, locale.startEarlier],
                      ['start', 1, locale.startLater],
                      ['end', -1, locale.endEarlier],
                      ['end', 1, locale.endLater],
                    ] as const
                  ).map(([mode, direction, label]) => (
                    <UiButton
                      type="button"
                      onClick={() => {
                        const delta = niceTimelineStep(range) * direction;
                        onSelect(row.id);
                        onEventChange(
                          row.id,
                          mode === 'move'
                            ? moveTimelineEvent(row.event, delta, range)
                            : resizeTimelineEvent(
                                row.event,
                                mode,
                                delta,
                                range,
                              ),
                        );
                      }}
                    >
                      {label}
                    </UiButton>
                  ))}
                </div>
              </fieldset>
            ))}
        </details>
      )}
    </>
  );
}

function TimelineEventFrame({
  tooltipText,
  children,
  ...attributes
}: JSX.HTMLAttributes<HTMLDivElement> & { tooltipText?: string }) {
  const tooltip = useControlTooltip(tooltipText ?? '', true, {
    className: 'rv-control-tooltip',
    placement: 'above',
  });
  return (
    <div {...attributes} {...(tooltipText ? tooltip.triggerProps : {})}>
      {children}
      {tooltipText && tooltip.tooltip}
    </div>
  );
}
