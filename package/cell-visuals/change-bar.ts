import type { ElementFactory } from './types';

export interface ChangeBarOptions {
  /** Magnitude as a fraction of the full track. */
  fraction: number;
  text: string;
  tone: 'up' | 'down';
  className?: string;
  trackClassName?: string;
}
export function renderChangeBar(h: ElementFactory, options: ChangeBarOptions) {
  const width = Number.isFinite(options.fraction) ? Math.max(0, Math.min(1, options.fraction)) : 0;
  return h('span', { class: ['rv-change-bar', options.className, `is-${options.tone}`].filter(Boolean).join(' ') }, [
    h('span', { class: ['rv-change-bar__track', options.trackClassName].filter(Boolean).join(' ') }, h('span', { style: { width: `${width * 100}%` } })),
    h('strong', {}, options.text),
  ]);
}
