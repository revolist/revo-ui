import { h } from 'preact';
import { useState } from 'preact/hooks';
import { Legend, Popover, TimelineTrack } from '@revolist/ui/preact';
import type {
  TimelineTrackEvent,
  TimelineTrackItem,
} from '@revolist/ui/timeline-track';
import gateway from '@fortawesome/fontawesome-free/svgs/solid/network-wired.svg?raw';
import search from '@fortawesome/fontawesome-free/svgs/solid/magnifying-glass.svg?raw';
import billing from '@fortawesome/fontawesome-free/svgs/solid/receipt.svg?raw';
import delivery from '@fortawesome/fontawesome-free/svgs/solid/envelope.svg?raw';
import { Example } from './catalog';

const lanes = [
  {
    id: 'gateway',
    label: 'API gateway',
    description: 'Platform · v2.8.0',
    icon: gateway,
  },
  {
    id: 'search',
    label: 'Search index',
    description: 'Discovery · v1.14.0',
    icon: search,
  },
  {
    id: 'billing',
    label: 'Billing pipeline',
    description: 'Payments · v3.2.1',
    icon: billing,
  },
  {
    id: 'delivery',
    label: 'Email delivery',
    description: 'Messaging · v1.9.0',
    icon: delivery,
  },
];

const states = {
  active: { label: 'Active', color: 'var(--rv-ui-accent)' },
  complete: { label: 'Completed', color: 'var(--rv-ui-text-muted)' },
  paused: {
    label: 'Paused',
    color: 'var(--rv-ui-surface)',
    pattern: 'var(--rv-rollout-paused)',
  },
};

type RolloutState = keyof typeof states;
interface Rollout extends TimelineTrackEvent {
  readonly stage: string;
  readonly state: RolloutState;
  readonly note?: string;
}

const startHour = 9;
const columns = Array.from({ length: 7 }, (_, value) => ({
  value,
  label: `${String(startHour + value).padStart(2, '0')}:00`,
}));
const now = 6.6;
const range = { start: 0, end: columns.length };

function stage(
  id: string,
  laneId: string,
  name: string,
  start: number,
  end: number,
  state: RolloutState,
  note?: string,
): TimelineTrackItem<Rollout> {
  return {
    id,
    laneId,
    event: {
      start,
      end,
      state,
      stage: name,
      note,
      label: lanes.find((lane) => lane.id === laneId)?.label,
      color: states[state].color,
      pattern: state === 'paused' ? states.paused.pattern : undefined,
      endLabel: state === 'paused' ? states.paused.label : undefined,
    },
  };
}

const rows = [
  stage('GW-01', 'gateway', 'Smoke checks', 0.15, 0.8, 'complete'),
  stage('GW-02', 'gateway', 'Canary traffic', 2.25, 3.4, 'complete'),
  stage('GW-03', 'gateway', 'Gradual rollout', 4.9, now, 'active'),
  stage('SR-01', 'search', 'Index backfill', 0.6, 2.05, 'complete'),
  stage('SR-02', 'search', 'Replica rollout', 4.1, now, 'active'),
  stage('BL-01', 'billing', 'Schema migration', 1.15, 2.3, 'complete'),
  stage(
    'BL-02',
    'billing',
    'Webhook verification',
    3.65,
    4.55,
    'paused',
    'Waiting for reconciliation checks.',
  ),
  stage('EM-01', 'delivery', 'Template validation', 0.92, 1.72, 'complete'),
  stage(
    'EM-02',
    'delivery',
    'Provider switch',
    5.15,
    5.75,
    'paused',
    'Provider health check failed.',
  ),
];

const time = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'UTC',
  hour: '2-digit',
  minute: '2-digit',
});

const formatTime = (hour: number) => time.format((startHour + hour) * 3600000);
const describe = (event: Rollout) =>
  `${event.label}, ${event.stage}, ${states[event.state].label}, ${formatTime(event.start)} to ${formatTime(event.end)}`;

export function ReleaseTimelineExample() {
  const [selection, setSelection] = useState<{
    id: string | number;
    anchor: HTMLButtonElement;
  }>();
  const [laneWidth, setLaneWidth] = useState(192);
  const selected = rows.find(({ id }) => id === selection?.id)?.event;

  return (
    <Example title="Release rollout" wide>
      <div class="release-timeline-demo">
        <TimelineTrack
          rows={rows}
          lanes={lanes}
          laneResize={{
            label: 'Resize service column',
            value: laneWidth,
            min: 140,
            max: 320,
            onChange: setLaneWidth,
          }}
          columns={columns}
          marker={{ value: now, label: `Now · ${formatTime(now)}` }}
          range={range}
          readOnly
          tooltip={false}
          labels={{ preview: 'Release rollout by service' }}
          getTooltip={describe}
          onEventActivate={(id, anchor) => setSelection({ id, anchor })}
        />
        <Legend
          label="Rollout status"
          className="release-timeline-legend"
          items={Object.entries(states).map(([id, state]) => ({
            id,
            label: state.label,
            color: state.color,
            className: id === 'paused' ? 'release-timeline-paused' : undefined,
          }))}
        />
        <Popover
          open={!!selected}
          anchor={selection?.anchor ?? null}
          onClose={() => setSelection(undefined)}
          label="Rollout details"
        >
          {selected && (
            <dl class="release-timeline-details">
              <dt>Stage</dt>
              <dd>{selected.stage}</dd>
              <dt>Status</dt>
              <dd>{states[selected.state].label}</dd>
              <dt>Started</dt>
              <dd>{formatTime(selected.start)}</dd>
              <dt>
                {selected.state === 'active'
                  ? 'Observed through'
                  : selected.state === 'paused'
                    ? 'Paused at'
                    : 'Finished'}
              </dt>
              <dd>{formatTime(selected.end)}</dd>
              {selected.note && (
                <>
                  <dt>Note</dt>
                  <dd>{selected.note}</dd>
                </>
              )}
            </dl>
          )}
        </Popover>
      </div>
    </Example>
  );
}
