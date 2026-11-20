import type { ClassPreset } from './presets/types';
import { h, type ComponentChildren } from 'preact';

export interface ActivityMessageProps {
  preset?: ClassPreset;
  className?: string;
  avatar: ComponentChildren;
  timestamp: ComponentChildren;
  header?: ComponentChildren;
  children: ComponentChildren;
  actions?: ComponentChildren;
  details?: ComponentChildren;
}

/** A compact, composable message with an avatar, timestamp and optional actions. */
export function ActivityMessage({
  preset,
  className = '',
  avatar,
  timestamp,
  header,
  children,
  actions,
  details,
}: ActivityMessageProps) {
  return (
    <article class={`rv-activity-message ${preset?.className ?? ''} ${className}`} data-part="root">
      <div class="rv-activity-message-avatar" data-part="avatar">{avatar}</div>
      <div class="rv-activity-message-card" data-part="card">
        {header && <div class="rv-activity-message-header" data-part="header">{header}</div>}
        <div
          class={`rv-activity-message-content${header ? ' rv-activity-message-content--full' : ''}`}
        >
          {children}
        </div>
        <div class="rv-activity-message-time" data-part="time">{timestamp}</div>
        {actions && <div class="rv-activity-message-actions" data-part="actions">{actions}</div>}
      </div>
      {details && <div class="rv-activity-message-details" data-part="details">{details}</div>}
    </article>
  );
}
