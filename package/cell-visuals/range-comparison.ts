import type { ElementFactory } from './types';

export interface RangeComparisonOptions {
  domain: { min: number; max: number };
  current: number | null;
  previous?: number | null;
  range?: { min: number; max: number };
  floor?: number | null;
  goal?: number | null;
  ticks?: readonly number[];
  display: string;
  label: string;
  tone?: 'neutral' | 'negative' | 'positive';
}

/** A common-scale comparison lane; labels, thresholds and calculations belong to the host. */
export function renderRangeComparison(h: ElementFactory, options: RangeComparisonOptions) {
  const { min, max } = options.domain;
  if (!Number.isFinite(min) || !Number.isFinite(max) || min >= max || !Number.isFinite(max - min)) return null;
  const valid = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);
  const pos = (value: number) => `${Math.max(0, Math.min(1, (value - min) / (max - min))) * 100}%`;
  const marks: unknown[] = [];
  for (const tick of options.ticks ?? []) {
    if (valid(tick) && tick >= min && tick <= max) marks.push(h('span', { class: 'rv-range-comparison__gridline', style: { left: pos(tick) }, 'aria-hidden': 'true' }));
  }
  if (options.range && valid(options.range.min) && valid(options.range.max) && options.range.min <= options.range.max) {
    const start = Math.max(min, options.range.min);
    const end = Math.min(max, options.range.max);
    if (start <= end) marks.push(h('span', { class: 'rv-range-comparison__range', style: { left: pos(start), right: `${100 - parseFloat(pos(end))}%` }, 'aria-hidden': 'true' }));
  }
  if (valid(options.floor)) marks.push(h('span', { class: 'rv-range-comparison__floor', style: { left: pos(options.floor) }, 'aria-hidden': 'true' }));
  if (valid(options.goal)) marks.push(h('span', { class: 'rv-range-comparison__goal', style: { left: pos(options.goal) }, 'aria-hidden': 'true' }));
  if (valid(options.previous) && valid(options.current)) {
    const from = Math.min(options.previous, options.current), to = Math.max(options.previous, options.current);
    marks.push(h('span', { class: 'rv-range-comparison__connector', style: { left: pos(from), right: `${100 - parseFloat(pos(to))}%` }, 'aria-hidden': 'true' }));
  }
  if (valid(options.previous)) marks.push(h('span', { class: 'rv-range-comparison__previous', style: { left: pos(options.previous) }, 'aria-hidden': 'true' }));
  if (valid(options.current)) marks.push(h('span', { class: `rv-range-comparison__current is-${options.tone ?? 'neutral'}`, style: { left: pos(options.current) }, 'aria-hidden': 'true' }));
  return h('div', { class: 'rv-range-comparison', role: 'img', 'aria-label': options.label }, [
    h('div', { class: 'rv-range-comparison__lane' }, marks),
    h('span', { class: `rv-range-comparison__value is-${options.tone ?? 'neutral'}`, 'aria-hidden': 'true' }, options.display),
  ]);
}
