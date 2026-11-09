import { h, type ComponentChildren } from 'preact';

export interface ActivityMessageProps {
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
  className = '',
  avatar,
  timestamp,
  header,
  children,
  actions,
  details,
}: ActivityMessageProps) {
  return (
    <article class={`rv-activity-message ${className}`}>
      <div class="rv-activity-message-avatar">{avatar}</div>
      <div class="rv-activity-message-card">
        {header && <div class="rv-activity-message-header">{header}</div>}
        <div
          class={`rv-activity-message-content${header ? ' rv-activity-message-content--full' : ''}`}
        >
          {children}
        </div>
        <div class="rv-activity-message-time">{timestamp}</div>
        {actions && <div class="rv-activity-message-actions">{actions}</div>}
      </div>
      {details && <div class="rv-activity-message-details">{details}</div>}
    </article>
  );
}
