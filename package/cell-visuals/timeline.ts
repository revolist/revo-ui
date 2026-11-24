import type { ElementFactory } from './types';
import { METRIC_TILE_HISTORY_TOOLTIP, type MetricTileHistory } from './metric-tile-history';
export interface TimelineEvent {
  readonly start: number;
  readonly end: number;
  readonly label?: string;
  /** Optional host class for styling a layer. */
  readonly className?: string;
}

/** A position on the same numeric domain as timeline events. */
export interface TimelineMarker {
  readonly value: number;
  readonly className?: string;
}

function timelineEventDescription(event: TimelineEvent): string {
  const range = `${event.start}–${event.end}`;
  return event.label ? `${event.label}: ${range}` : range;
}

/**
 * Converts valid Timeline events to the same readable text used by tooltips
 * and accessibility labels.
 *
 * @param value Timeline event array; invalid entries are ignored.
 * @param separator Text inserted between valid event descriptions.
 * @returns A human-readable schedule, or an empty string when no event is valid.
 *
 * @example
 * formatTimelineEvents([
 *   { start: 8, end: 12, label: 'Build' },
 *   { start: 14, end: 18, label: 'Review' },
 * ], '; ');
 * // "Build: 8–12; Review: 14–18"
 */
export function formatTimelineEvents(value: unknown, separator = ', '): string {
  return normalizeTimelineEvents(value)
    .map(timelineEventDescription)
    .join(separator);
}

/**
 * Helper to generate timeline elements for the cell.
 * @param h Hyperscript function.
 * @param events Array of event objects with `start`, `end`, and optional `label`.
 * @param column Column definition to get configuration like total timeline range.
 * @returns An array of event bar elements for the timeline.
 */
function getTimelineBars(
  h: (tag: string, props: Record<string, any>, ...children: any[]) => any,
  events: readonly TimelineEvent[],
  rangeValue?: { start: number; end: number },
  summaryTooltip = false,
) {
  const totalRange = normalizeTimelineRange(rangeValue);
  const range = totalRange.end - totalRange.start;

  return events.flatMap((event, index) => {
    if (event.end < totalRange.start || event.start > totalRange.end) return [];
    const start = Math.max(totalRange.start, event.start);
    const end = Math.min(totalRange.end, event.end);
    const startPercentage = ((start - totalRange.start) / range) * 100;
    const widthPercentage = ((end - start) / range) * 100;

    return [
      h('div', {
        class: [
          'rv-timeline-event-bar',
          typeof event.className === 'string' ? event.className : '',
        ]
          .filter(Boolean)
          .join(' '),
        style: {
          left: `${startPercentage}%`,
          width: `${widthPercentage}%`,
          position: 'absolute',
        },
        ...(summaryTooltip ? {} : { 'data-tooltip': timelineEventDescription(event), 'tooltip-position': 'top' }),
        role: 'img',
        'aria-label': timelineEventDescription(event),
        key: index, // Ensure unique key for each bar
      }),
    ];
  });
}

function normalizeTimelineRange(value?: { start: number; end: number }) {
  const start = value?.start;
  const end = value?.end;
  return Number.isFinite(start) && Number.isFinite(end) && end! > start!
    ? { start: start!, end: end! }
    : { start: 0, end: 100 };
}

function normalizeTimelineEvents(value: unknown): TimelineEvent[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (event): event is TimelineEvent =>
      Boolean(event) &&
      typeof event === 'object' &&
      Number.isFinite((event as TimelineEvent).start) &&
      Number.isFinite((event as TimelineEvent).end) &&
      (event as TimelineEvent).end >= (event as TimelineEvent).start &&
      ((event as TimelineEvent).label === undefined ||
        typeof (event as TimelineEvent).label === 'string'),
  );
}

function timelineAccessibleLabel(
  events: readonly TimelineEvent[],
  label: string | ((events: readonly TimelineEvent[]) => string) | undefined,
): string {
  if (typeof label === 'function') return label(events);
  if (label) return label;
  return formatTimelineEvents(events);
}

export function renderTimeline(
  h: ElementFactory,
  options: {
    value: unknown;
    range?: { start: number; end: number };
    ariaLabel?: string | ((events: readonly TimelineEvent[]) => string);
    markers?: readonly TimelineMarker[];
    tooltip?: MetricTileHistory;
  },
) {
  const { value } = options;
  const events = normalizeTimelineEvents(value);
  const ariaLabel = timelineAccessibleLabel(events, options.ariaLabel);
  const range = normalizeTimelineRange(options.range);
  const markers = (options.markers ?? []).flatMap((marker, index) => {
    if (
      !marker ||
      !Number.isFinite(marker.value) ||
      marker.value < range.start ||
      marker.value > range.end ||
      (marker.className !== undefined && typeof marker.className !== 'string')
    )
      return [];
    return [
      h('span', {
        class: ['rv-timeline-marker', marker.className]
          .filter(Boolean)
          .join(' '),
        style: {
          left: `${((marker.value - range.start) / (range.end - range.start)) * 100}%`,
        },
        'aria-hidden': 'true',
        key: `marker-${index}`,
      }),
    ];
  });

  return h(
    'div',
    {
      class: 'rv-timeline-container',
      role: options.tooltip ? 'group' : 'img',
      'aria-label': ariaLabel || undefined,
      ...(options.tooltip ? { tabIndex: 0, 'data-tooltip': JSON.stringify({ history: options.tooltip, index: -1 }), 'tooltip-type': METRIC_TILE_HISTORY_TOOLTIP, 'tooltip-position': 'top' } : {}),
    },
    [
      h('div', { class: 'rv-timeline-track' }, [
        h('div', { class: 'rv-timeline-bar' }, []), // Background bar
        ...getTimelineBars(h, events, options.range, !!options.tooltip), // Dynamic event bars
        ...markers,
      ]),
    ],
  );
}
