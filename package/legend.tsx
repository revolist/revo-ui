/** @jsxImportSource preact */
import { h } from 'preact';

export interface LegendItem {
  id: string;
  label: string;
  tone?: 'selected' | 'outside' | 'muted';
  className?: string;
  /** Any CSS color, including the host's semantic theme variables. */
  color?: string;
  marker?: 'solid' | 'outline' | 'dashed';
}

/** Inline, wrapping key for calendars, filters and other compact visual controls. */
export function Legend({
  label,
  items,
  className = '',
  itemClassName = '',
}: {
  label: string;
  items: readonly LegendItem[];
  className?: string;
  itemClassName?: string;
}) {
  return (
    <div class={`rv-legend ${className}`} role="list" aria-label={label}>
      {items.map((item) => (
        <span
          key={item.id}
          role="listitem"
          class={`rv-legend__item ${itemClassName} ${item.className ?? ''}`}
          data-tone={item.tone ?? 'muted'}
          style={
            item.color ? { '--rv-legend-marker-color': item.color } : undefined
          }
        >
          <i aria-hidden="true" data-marker={item.marker ?? 'solid'} />
          <span class="rv-legend__label">{item.label}</span>
        </span>
      ))}
    </div>
  );
}
