import { TooltipText } from '../core/tooltip-text';
/** @jsxImportSource preact */
import { h, type ComponentChildren } from 'preact';
import type { RangeSliderProps } from '../filter/filters/slider/types';
import {
  DistributionChart,
  type DistributionChartProps,
} from '../distribution-chart';
import { PreactRangeSlider } from '../filter/filters/slider/preact';

export interface BrushRangeProps {
  readonly chart?: DistributionChartProps | null;
  readonly slider: RangeSliderProps;
  readonly startLabel: ComponentChildren;
  readonly selectionLabel: ComponentChildren;
  readonly endLabel: ComponentChildren;
}

function classes(...values: Array<string | undefined>) {
  return values.filter(Boolean).join(' ');
}

function labelTitle(label: ComponentChildren) {
  return typeof label === 'string' || typeof label === 'number'
    ? String(label)
    : undefined;
}

/**
 * Shared presentation for distribution-backed brush filters. Domain editors own
 * the chart data and translate slider positions to their filter conditions.
 */
export function BrushRange({
  chart,
  slider,
  startLabel,
  selectionLabel,
  endLabel,
}: BrushRangeProps) {
  return (
    <div class="brush-range">
      {chart ? (
        <DistributionChart
          {...chart}
          className={classes('brush-range__chart', chart.className)}
        />
      ) : null}
      <PreactRangeSlider
        {...slider}
        className={classes('brush-range__range', slider.className)}
        controlClassName={classes(
          'brush-range__controls',
          slider.controlClassName,
        )}
        fromClassName={slider.fromClassName}
        toClassName={slider.toClassName}
      />
      <div class="brush-range__labels">
        <TooltipText
          class="brush-range__label brush-range__label--start"
          title={labelTitle(startLabel)}
        >
          {startLabel}
        </TooltipText>
        <TooltipText
          class={classes('brush-range__label', 'brush-range__selection')}
          role="status"
          title={labelTitle(selectionLabel)}
        >
          {selectionLabel}
        </TooltipText>
        <TooltipText
          class="brush-range__label brush-range__label--end"
          title={labelTitle(endLabel)}
        >
          {endLabel}
        </TooltipText>
      </div>
    </div>
  );
}
