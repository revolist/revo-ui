export interface TimelineTrackEvent {
  readonly start: number;
  readonly end: number;
  readonly label?: string;
  /** Single CSS color, or weighted phases within this event. */
  readonly color?: string;
  readonly textColor?: string;
  readonly segments?: readonly {
    readonly color: string;
    readonly weight: number;
  }[];
}

export interface TimelineTrackRange {
  readonly start: number;
  readonly end: number;
}

export function eventOutsideRange(
  event: TimelineTrackEvent,
  range: TimelineTrackRange,
): boolean {
  return event.start < range.start || event.end > range.end;
}

export function timelineGeometry(
  event: TimelineTrackEvent,
  range: TimelineTrackRange,
): { readonly left: number; readonly width: number } {
  const span = range.end - range.start;
  const clippedStart = Math.max(range.start, Math.min(range.end, event.start));
  const clippedEnd = Math.max(range.start, Math.min(range.end, event.end));
  const left = ((clippedStart - range.start) / span) * 100;
  const rawWidth = ((clippedEnd - clippedStart) / span) * 100;
  return {
    left: Math.min(99, left),
    width: Math.max(event.start === event.end ? 0.8 : 0, rawWidth),
  };
}

export function niceTimelineStep(range: TimelineTrackRange): number {
  const raw = Math.abs(range.end - range.start) / 24;
  if (!Number.isFinite(raw) || raw <= 0) return 1;
  const power = 10 ** Math.floor(Math.log10(raw));
  const normalized = raw / power;
  const factor =
    normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
  return factor * power;
}

export function moveTimelineEvent<T extends TimelineTrackEvent>(
  event: T,
  delta: number,
  range: TimelineTrackRange,
): T {
  const duration = event.end - event.start;
  if (duration > range.end - range.start) return { ...event };
  let start = event.start + delta;
  start = Math.max(range.start, Math.min(range.end - duration, start));
  return { ...event, start, end: start + duration };
}

export function resizeTimelineEvent<T extends TimelineTrackEvent>(
  event: T,
  edge: 'start' | 'end',
  delta: number,
  range: TimelineTrackRange,
): T {
  return edge === 'start'
    ? {
        ...event,
        start: Math.max(range.start, Math.min(event.end, event.start + delta)),
      }
    : {
        ...event,
        end: Math.min(range.end, Math.max(event.start, event.end + delta)),
      };
}

/** Weighted phase colors use hard stops and scale with the event on resize. */
export function timelineEventBackground(
  event: TimelineTrackEvent,
): string | undefined {
  const segments = event.segments?.filter(
    (segment) => Number.isFinite(segment.weight) && segment.weight > 0,
  );
  if (!segments?.length) return event.color;
  const total = segments.reduce((sum, segment) => sum + segment.weight, 0);
  let offset = 0;
  return `linear-gradient(to right, ${segments
    .map((segment) => {
      const start = (offset / total) * 100;
      offset += segment.weight;
      return `${segment.color} ${start}% ${(offset / total) * 100}%`;
    })
    .join(', ')})`;
}
