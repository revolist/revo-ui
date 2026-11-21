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
    label: 'Firefox on Ubuntu',
    description: 'Porto, Portugal',
    icon: laptop,
  },
  {
    id: 'phone',
    label: 'Chrome on Pixel',
    description: 'Évora, Portugal',
    icon: mobile,
  },
  {
    id: 'desktop',
    label: 'Edge on Windows',
    description: 'Aveiro, Portugal',
    icon: desktop,
  },
  {
    id: 'tablet',
    label: 'Safari on iPad',
    description: 'Setúbal, Portugal',
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
const now = 6.65;
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
  session('NB-141', 'work', 0.42, 1.46, 'ended'),
  session('NB-143', 'work', 2.61, 3.12, 'ended'),
  session('NB-148', 'work', 4.35, now, 'active'),
  session('PX-221', 'phone', 0.84, 1.7, 'ended'),
  session('PX-225', 'phone', 3.55, 4.27, 'ended'),
  session('PX-229', 'phone', 5.79, now, 'active'),
  session('WS-304', 'desktop', 2.12, 2.56, 'revoked'),
  session('WS-308', 'desktop', 5.18, 5.99, 'ended'),
  session('PD-416', 'tablet', 3.48, 4.21, 'revoked'),
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
  const [laneWidth, setLaneWidth] = useState(192);
  const active = rows.find(({ id }) => id === selection?.id);
  return (
    <Example title="Device session history" wide>
      <div class="session-timeline-demo">
        <TimelineTrack
          rows={rows}
          lanes={lanes}
          laneResize={{
            label: 'Resize device column',
            value: laneWidth,
            min: 140,
            max: 320,
            onChange: setLaneWidth,
          }}
          columns={columns}
          marker={{ value: now, label: 'Now · 15:36' }}
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
