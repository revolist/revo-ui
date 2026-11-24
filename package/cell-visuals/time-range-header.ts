import type { ElementFactory } from './types';

/** Renderer-neutral header for a compact time-range column. */
export function renderTimeRangeHeader(
  h: ElementFactory,
  labels: readonly string[],
  align: 'around' | 'between' = 'around',
  positions?: readonly number[],
  dates?: readonly string[],
) {
  return h(
    'span',
    {
      class: `rv-time-range-header${align === 'between' ? ' rv-time-range-header--between' : ''}${positions ? ' rv-time-range-header--positioned' : ''}`,
    },
    labels.map((label, index) => h('small', {
      ...(dates?.[index] ? { 'data-month': dates[index].slice(0, 7) } : {}),
      style: {
        ...(positions ? { insetInlineStart: `${positions[index]}%` } : {}),
        ...(dates?.[index] ? { color: `var(--rv-time-range-month-${dates[index].slice(0, 7)}, inherit)` } : {}),
      },
    }, label)),
  );
}

/** A two-line date header suitable for one generated date column. */
export function renderDateSlotHeader(h: ElementFactory, options: { day: string; weekday: string; label: string; className?: string }) {
  return h('span', { class: ['rv-date-slot-header', options.className].filter(Boolean).join(' '), title: options.label }, [
    h('strong', {}, options.day), h('small', {}, options.weekday),
  ]);
}
