import { h } from 'preact';
import { useState } from 'preact/hooks';
import { Legend, Popover, TimelineTrack } from '@revolist/ui/preact';
import type {
  TimelineTrackEvent,
  TimelineTrackItem,
} from '@revolist/ui/timeline-track';
import laptop from '@fortawesome/fontawesome-free/svgs/solid/laptop.svg?raw';
import mobile from '@fortawesome/fontawesome-free/svgs/solid/mobile-screen.svg?raw';
import desktop from '@fortawesome/fontawesome-free/svgs/solid/desktop.svg?raw';
import { Example } from './catalog';

const lanes = [
  {
    id: 'work',
    label: 'Chrome on macOS',
    description: 'Lisbon, Portugal',
    icon: laptop,
  },
  {
    id: 'phone',
    label: 'Safari on iOS',
    description: 'Cascais, Portugal',
    icon: mobile,
  },
  {
    id: 'desktop',
    label: 'Firefox on Windows',
    description: 'Porto, Portugal',
    icon: desktop,
  },
  {
    id: 'tablet',
    label: 'Edge on Android',
    description: 'Braga, Portugal',
    icon: mobile,
  },
];

const states = {
  active: { label: 'Active', color: 'var(--rv-ui-text)' },
  ended: { label: 'Ended', color: 'var(--rv-ui-text-muted)' },
  revoked: {
    label: 'Revoked',
    color: 'var(--rv-ui-surface)',
    pattern: 'var(--rv-session-revoked)',
  },
};
type SessionState = keyof typeof states;
interface Session extends TimelineTrackEvent {
  readonly state: SessionState;
}
const columns = [
  'Sun 15',
  'Mon 16',
  'Tue 17',
  'Wed 18',
  'Thu 19',
  'Fri 20',
  'Sat 21',
].map((label, value) => ({ label, value }));
const now = 6.55;
const range = { start: 0, end: columns.length };

function session(
  id: string,
  laneId: string,
  start: number,
  end: number,
  state: SessionState,
): TimelineTrackItem<Session> {
  return {
    id,
    laneId,
    event: {
      start,
      end,
      state,
      label: lanes.find((lane) => lane.id === laneId)?.label,
      color: states[state].color,
      pattern: state === 'revoked' ? states.revoked.pattern : undefined,
      endLabel: state === 'revoked' ? states.revoked.label : undefined,
    },
  };
}
const rows = [
  session('WK-14', 'work', 0.34, 0.82, 'ended'),
  session('WK-23', 'work', 1.37, 1.74, 'ended'),
  session('WK-32', 'work', 4.25, 5.74, 'ended'),
  session('WK-38', 'work', 6.4, now, 'active'),
  session('PH-17', 'phone', 0.86, 2.23, 'ended'),
  session('PH-26', 'phone', 2.92, now, 'active'),
  session('DT-28', 'desktop', 1.58, 1.82, 'revoked'),
  session('DT-35', 'desktop', 3.85, 4.16, 'ended'),
  session('TB-19', 'tablet', 4.41, 4.7, 'revoked'),
];

const time = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'UTC',
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});
const formatTime = (day: number) =>
  time.format(Date.UTC(2026, 10, 15) + day * 86400000);
const describe = (event: Session) =>
  `${event.label}, ${states[event.state].label}, ${formatTime(event.start)} to ${formatTime(event.end)}`;

export function SessionTimelineExample() {
  const [selection, setSelection] = useState<{
    id: string | number;
    anchor: HTMLButtonElement;
  }>();
  const active = rows.find(({ id }) => id === selection?.id);
  return (
    <Example title="Device session history" wide>
      <div class="session-timeline-demo">
        <TimelineTrack
          rows={rows}
          lanes={lanes}
          columns={columns}
          marker={{ value: now, label: 'Now · 13:12' }}
          range={range}
          readOnly
          tooltip={false}
          labels={{ preview: 'Device sessions by day' }}
          getTooltip={describe}
          onEventActivate={(id, anchor) => setSelection({ id, anchor })}
        />
        <Legend
          label="Session status"
          className="session-timeline-legend"
          items={Object.entries(states).map(([id, state]) => ({
            id,
            label: state.label,
            color: state.color,
            className:
              id === 'revoked' ? 'session-timeline-revoked' : undefined,
          }))}
        />
        <Popover
          open={!!active}
          anchor={selection?.anchor ?? null}
          onClose={() => setSelection(undefined)}
          label="Session details"
        >
          {active && (
            <dl class="session-timeline-details">
              <dt>Session</dt>
              <dd>{active.id}</dd>
              <dt>Status</dt>
              <dd>{states[active.event.state].label}</dd>
              <dt>Started</dt>
              <dd>{formatTime(active.event.start)}</dd>
              <dt>Last seen</dt>
              <dd>{formatTime(active.event.end)}</dd>
            </dl>
          )}
        </Popover>
      </div>
    </Example>
  );
}
