/** @jsxImportSource preact */
import type { JSX } from 'preact';
import type { ClassPreset } from '../presets/types';
import { useControlTooltip } from '../core/tooltip';
import { useRef } from 'preact/hooks';
import { SvgIcon } from '../icons/icon';
import { CollapsibleSection } from '../field-configurator';
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
  /** Share an explicitly configured lane with other events. */
  readonly laneId?: string | number;
}
export interface TimelineTrackLane {
  readonly id: string | number;
  readonly label: string;
  readonly description?: string;
  /** Trusted SVG markup for the lane icon. */
  readonly icon?: string;
}
export interface TimelineTrackColumn {
  /** Numeric position at which this column starts, in the same units as events. */
  readonly value: number;
  readonly label: string;
}
export interface TimelineTrackMarker {
  readonly value: number;
  readonly label: string;
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
  readonly preset?: ClassPreset;
  readonly className?: string;
  readonly rows: readonly TimelineTrackItem<T>[];
  /** Optional named lanes. Events with a matching laneId share one row. */
  readonly lanes?: readonly TimelineTrackLane[];
  /** Optional axis labels and vertical grid lines. */
  readonly columns?: readonly TimelineTrackColumn[];
  /** Optional vertical reference line with a caption. */
  readonly marker?: TimelineTrackMarker;
  /** Display events without move and resize controls. */
  readonly readOnly?: boolean;
  /** Activate a read-only event with its button. */
  readonly onEventActivate?: (
    id: string | number,
    anchor: HTMLButtonElement,
  ) => void;
  readonly tooltip?: boolean;
  /** Show click/tap alternatives to dragging. Hosts hiding these must supply equivalent controls. */
  readonly showActions?: boolean;
  readonly formatValue?: (value: number) => string;
  readonly getTooltip?: (event: T) => string;
  readonly selected?: string | number;
  /** Finite bounds with end greater than start. */
  readonly range: TimelineTrackRange;
  readonly labels?: Partial<TimelineTrackLabels>;
  readonly onSelect?: (id: string | number) => void;
  readonly onEventChange?: (id: string | number, event: T) => void;
}

/** Controlled numeric timeline. Changes preserve event metadata; consumers own commits. */
export function TimelineTrack<T extends TimelineTrackEvent>({
  preset,
  className = '',
  rows,
  lanes,
  columns,
  marker,
  readOnly = false,
  onEventActivate,
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
  const chart = Boolean(lanes || columns || marker);
  const laneIndices = new Map(lanes?.map((lane, index) => [lane.id, index]));
  const inRange = (value: number) => value >= range.start && value <= range.end;
  const axis = (columns ?? [])
    .filter((column) => column.value >= range.start && column.value < range.end)
    .sort((a, b) => a.value - b.value);
  const reference = marker && inRange(marker.value) ? marker : undefined;
  const position = (value: number) =>
    `${((value - range.start) / (range.end - range.start)) * 100}%`;
  const entries = rows.flatMap((row, index) => {
    const lane = lanes ? laneIndices.get(row.laneId ?? row.id) : index;
    const { start, end } = row.event;
    if (
      lane === undefined ||
      !Number.isFinite(start) ||
      !Number.isFinite(end) ||
      end < start ||
      (readOnly && (start > range.end || end < range.start))
    )
      return [];
    return [{ row, index, lane }];
  });

  const beginPointer = (
    pointerEvent: PointerEvent,
    row: TimelineTrackItem<T>,
    mode: TimelineTrackPointerMode,
  ) => {
    const track = (
      pointerEvent.currentTarget as HTMLElement
    ).closest<HTMLElement>(
      '.rv-timeline-control__plot, .rv-timeline-control__track',
    );
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
    onSelect?.(row.id);
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
    onEventChange?.(session.id, event);
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
    onEventChange?.(
      row.id,
      mode === 'move'
        ? moveTimelineEvent(row.event, delta, range)
        : resizeTimelineEvent(row.event, mode, delta, range),
    );
  };

  const events = entries.map(({ row, index, lane }) => {
    const geometry = timelineGeometry(row.event, range);
    // Keep the minimum-sized interaction area and both edge handles
    // inside the clipped track, including milestones at either bound.
    const affordanceWidth = `clamp(56px, ${geometry.width}%, calc(100% - 24px))`;
    const outside = !readOnly && eventOutsideRange(row.event, range);
    const eventName = row.event.label || locale.moveEvent(index + 1);
    const eventSummary =
      tooltip || readOnly
        ? (getTooltip?.(row.event) ??
          `${eventName}: ${formatValue(row.event.start)} – ${formatValue(row.event.end)}`)
        : undefined;
    return (
      <TimelineEventFrame
        tooltipText={tooltip ? eventSummary : undefined}
        key={row.id}
        data-part="event"
        data-pattern={Boolean(row.event.pattern) || undefined}
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
          top: chart
            ? `calc((${lane} + 0.5) * var(--rv-timeline-lane-size))`
            : `calc(39px + ${lane} * var(--rv-timeline-lane-size))`,
          left: readOnly
            ? `min(100% - 2px, ${position(Math.max(range.start, row.event.start))})`
            : `clamp(12px, ${geometry.left}%, calc(100% - ${affordanceWidth} - 12px))`,
          width: readOnly ? `${geometry.width}%` : affordanceWidth,
          background: timelineEventBackground(row.event),
          color: row.event.textColor,
          '--timeline-event-color': row.event.color,
          '--timeline-event-color-end': row.event.color,
        }}
        role={readOnly && !onEventActivate ? 'img' : 'group'}
        aria-label={readOnly && !onEventActivate ? eventSummary : eventName}
      >
        {readOnly ? (
          <>
            {onEventActivate && (
              <UiButton
                unstyled
                type="button"
                class="rv-timeline-control__bar-move"
                aria-label={eventSummary}
                onClick={(event) =>
                  onEventActivate(row.id, event.currentTarget)
                }
              />
            )}
            {row.event.endLabel && (
              <span class="rv-timeline-control__end-label" aria-hidden="true">
                {row.event.endLabel}
              </span>
            )}
          </>
        ) : (
          <>
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
              onFocus={() => onSelect?.(row.id)}
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
              onFocus={() => onSelect?.(row.id)}
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
              onFocus={() => onSelect?.(row.id)}
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
          </>
        )}
      </TimelineEventFrame>
    );
  });

  return (
    <>
      <div
        class={`rv-timeline-editor__track rv-timeline-control__track ${preset?.className ?? ''} ${className}`}
        data-part="track"
        data-chart={chart || undefined}
        data-readonly={readOnly || undefined}
        data-labeled={Boolean(lanes) || undefined}
        role="group"
        aria-label={locale.preview}
        tabIndex={chart ? 0 : undefined}
        style={{
          '--rv-timeline-lane-count': lanes?.length ?? rows.length,
          height: chart
            ? undefined
            : `max(112px, calc(70px + ${rows.length} * var(--rv-timeline-lane-size)))`,
        }}
      >
        {chart ? (
          <div class="rv-timeline-control__chart">
            {axis.length > 0 && (
              <>
                {lanes && (
                  <div
                    class="rv-timeline-control__lane-heading"
                    aria-hidden="true"
                  />
                )}
                <div class="rv-timeline-control__axis" data-part="axis">
                  {axis.map((column, index) => (
                    <span
                      key={column.value}
                      data-part="column"
                      style={{
                        left: position(column.value),
                        width: position(
                          range.start +
                            (axis[index + 1]?.value ?? range.end) -
                            column.value,
                        ),
                      }}
                    >
                      {column.label}
                    </span>
                  ))}
                </div>
              </>
            )}
            {lanes && (
              <div class="rv-timeline-control__lanes" data-part="lanes">
                {lanes.map((lane) => (
                  <div
                    class="rv-timeline-control__lane"
                    data-part="lane"
                    key={lane.id}
                  >
                    {lane.icon && (
                      <SvgIcon
                        svg={lane.icon}
                        size={15}
                        className="rv-svg-icon rv-timeline-control__lane-icon"
                      />
                    )}
                    <span dir="auto">
                      {lane.label}
                      {lane.description && <small>{lane.description}</small>}
                    </span>
                  </div>
                ))}
              </div>
            )}
            <div class="rv-timeline-control__plot" data-part="plot">
              {axis.map((column) => (
                <i
                  key={column.value}
                  data-part="column-line"
                  style={{ left: position(column.value) }}
                  aria-hidden="true"
                />
              ))}
              {reference && (
                <i
                  data-part="reference-line"
                  style={{ left: position(reference.value) }}
                  aria-hidden="true"
                />
              )}
              {events}
            </div>
            {reference && (
              <div class="rv-timeline-control__reference" data-part="reference">
                <span
                  style={{
                    '--rv-timeline-marker-position': position(reference.value),
                  }}
                >
                  {reference.label}
                </span>
              </div>
            )}
          </div>
        ) : (
          <>
            <span class="rv-timeline-editor__range rv-timeline-editor__range--start rv-timeline-control__range rv-timeline-control__range--start">
              {range.start}
            </span>
            <span class="rv-timeline-editor__range rv-timeline-editor__range--end rv-timeline-control__range rv-timeline-control__range--end">
              {range.end}
            </span>
            {events}
          </>
        )}
      </div>
      {showActions && !readOnly && (
        <CollapsibleSection
          title={locale.editEvents}
          preset={preset}
          className={`rv-timeline-control__actions ${className}`.trim()}
          renderRoot={(props) => <details {...props} data-part="actions" />}
        >
          {entries.map(({ row, index }) => (
            <fieldset key={row.id}>
              <legend>{row.event.label || locale.moveEvent(index + 1)}</legend>
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
                      onSelect?.(row.id);
                      onEventChange?.(
                        row.id,
                        mode === 'move'
                          ? moveTimelineEvent(row.event, delta, range)
                          : resizeTimelineEvent(row.event, mode, delta, range),
                      );
                    }}
                  >
                    {label}
                  </UiButton>
                ))}
              </div>
            </fieldset>
          ))}
        </CollapsibleSection>
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
