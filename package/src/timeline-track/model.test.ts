import { expect, it } from 'vitest';
import {
  timelineEventBackground,
  eventOutsideRange,
  moveTimelineEvent,
  niceTimelineStep,
  resizeTimelineEvent,
  timelineGeometry,
} from './model';

const range = { start: 0, end: 24 };
it('moves intervals within bounds without changing duration, metadata or source', () => {
  const event = { start: 8, end: 12, label: 'Build', metadata: { project: 1 } };
  expect(moveTimelineEvent(event, 100, range)).toEqual({
    ...event,
    start: 20,
    end: 24,
  });
  expect(moveTimelineEvent(event, -100, range)).toEqual({
    ...event,
    start: 0,
    end: 4,
  });
  expect(moveTimelineEvent(event, 1, range).metadata).toBe(event.metadata);
  expect(event.start).toBe(8);
  const oversized = { start: -4, end: 30 };
  expect(moveTimelineEvent(oversized, 5, range)).toEqual(oversized);
});
it('clamps resizing at the other edge and range bounds', () => {
  const event = { start: 8, end: 12, tag: 'retained' };
  expect(resizeTimelineEvent(event, 'start', 100, range)).toEqual({
    ...event,
    start: 12,
  });
  expect(resizeTimelineEvent(event, 'start', -100, range)).toEqual({
    ...event,
    start: 0,
  });
  expect(resizeTimelineEvent(event, 'end', -100, range)).toEqual({
    ...event,
    end: 8,
  });
  expect(resizeTimelineEvent(event, 'end', 100, range)).toEqual({
    ...event,
    end: 24,
  });
});
it('clips previews and retains visible milestones with scale-aware steps', () => {
  expect(timelineGeometry({ start: -12, end: 12 }, range)).toEqual({
    left: 0,
    width: 50,
  });
  expect(timelineGeometry({ start: 24, end: 24 }, range)).toEqual({
    left: 99,
    width: 0.8,
  });
  expect(eventOutsideRange({ start: -1, end: 4 }, range)).toBe(true);
  expect(niceTimelineStep(range)).toBe(1);
  expect(niceTimelineStep({ start: 0, end: 2.4 })).toBe(0.1);
});

it('supports weighted event colors and retains phase metadata when moved or resized', () => {
  const event = {
    start: 8,
    end: 12,
    color: 'blue',
    segments: [
      { color: 'blue', weight: 3 },
      { color: 'orange', weight: 1 },
    ],
  };
  expect(timelineEventBackground(event)).toBe(
    'linear-gradient(to right, blue 0% 75%, orange 75% 100%)',
  );
  expect(moveTimelineEvent(event, 1, range).segments).toBe(event.segments);
  expect(resizeTimelineEvent(event, 'end', 1, range).segments).toBe(
    event.segments,
  );
  expect(
    timelineEventBackground({
      start: 0,
      end: 1,
      color: 'red',
      segments: [{ color: 'blue', weight: -1 }],
    }),
  ).toBe('red');
});
