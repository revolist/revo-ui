import { h, type ComponentChildren } from 'preact';
import type { ClassPreset } from './presets/types';
import { ActivityMessage } from './activity-message';
/** A chronological item supplied by the host application. */
export interface ActivityTimelineEntry {
  id: string;
  avatar: ComponentChildren;
  timestamp: ComponentChildren;
  header?: ComponentChildren;
  content: ComponentChildren;
  actions?: ComponentChildren;
  details?: ComponentChildren;
}
export interface ActivityTimelineProps {
  /** Accessible name of the timeline. */
  label: string;
  /** Events in the order supplied by the host. */
  entries: readonly ActivityTimelineEntry[];
  /** Optional presentation preset. */
  preset?: ClassPreset;
  /** Additional root class names. */
  className?: string;
}
/** Chronological activity composed from the shared ActivityMessage. */
export function ActivityTimeline({
  label,
  entries,
  preset,
  className = '',
}: ActivityTimelineProps) {
  return (
    <ol
      class={`rv-activity-timeline ${preset?.className ?? ''} ${className}`}
      aria-label={label}
      data-part="root"
    >
      {entries.map((entry) => (
        <li key={entry.id} data-part="entry">
          <ActivityMessage
            avatar={entry.avatar}
            timestamp={entry.timestamp}
            header={entry.header}
            actions={entry.actions}
            details={entry.details}
          >
            {entry.content}
          </ActivityMessage>
        </li>
      ))}
    </ol>
  );
}
