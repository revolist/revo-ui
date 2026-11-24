/** @jsxImportSource preact */
import { h } from 'preact';
import type { ClassPreset } from './presets/types';

export interface LegendItem {
  id: string;
  label: string;
  tone?: 'selected' | 'outside' | 'muted';
  className?: string;
  /** Any CSS color, including the host's semantic theme variables. */
  color?: string;
  marker?: 'solid' | 'outline' | 'dashed' | 'line';
}

export interface LegendProps {
  preset?: ClassPreset;
  label: string;
  items: readonly LegendItem[];
  className?: string;
  itemClassName?: string;
}

/** Renderer-neutral legend for grid templates and framework adapters. */
export function renderLegend(create: (tag: any, props: any, children?: any) => any, {
  preset, label, items, className = '', itemClassName = '',
}: LegendProps) {
  return create('div', {
    class: `rv-legend ${preset?.className ?? ''} ${className}`,
    'data-part': 'root', role: 'list', 'aria-label': label,
  }, items.map(item => create('span', {
    key: item.id, role: 'listitem', 'data-part': 'item',
    class: `rv-legend__item ${itemClassName} ${item.className ?? ''}`,
    'data-tone': item.tone ?? 'muted',
    style: item.color ? { '--rv-legend-marker-color': item.color } : undefined,
  }, [
    create('i', { 'aria-hidden': 'true', 'data-part': 'marker', 'data-marker': item.marker ?? 'solid' }),
    create('span', { class: 'rv-legend__label', 'data-part': 'label' }, item.label),
  ])));
}

/** Inline, wrapping key for calendars, filters and other compact visual controls. */
export function Legend(props: LegendProps) {
  return renderLegend(h, props);
}
