import type { ElementFactory } from './types';
import { renderSegmentedBar } from './segmented-bar';
export interface SegmentedSummaryPart { label: string; value: number; color: string }
export interface SegmentedSummaryOptions {
  label: string;
  parts: readonly SegmentedSummaryPart[];
  /** Legend order as indices into parts. Defaults to the bar order. */
  legendOrder?: readonly number[];
  formatValue?: (value: number) => string;
}
/** A composition bar with a caller-localized legend. */
export function renderSegmentedSummary(h: ElementFactory, options: SegmentedSummaryOptions) {
  const indices = options.legendOrder ?? options.parts.map((_, index) => index);
  return h('div', { class: 'rv-segmented-summary' }, [
    renderSegmentedBar(h, { label: options.label, parts: options.parts }),
    h('div', { class: 'rv-segmented-summary__legend', 'aria-hidden': 'true' }, indices.flatMap(index => {
      const part = options.parts[index];
      if (!part) return [];
      return [h('span', { class: 'rv-segmented-summary__item' }, [h('i', { style: { backgroundColor: part.color } }), `${part.label} ${options.formatValue?.(part.value) ?? part.value}`])];
    })),
  ]);
}
