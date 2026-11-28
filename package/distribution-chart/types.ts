import type { ComponentChildren } from 'preact';
import type { ClassPreset } from '../presets/types';

export type DistributionChartType = 'bar' | 'line' | 'area' | 'donut';
/** Optional decorative texture for bars and doughnut slices. */
export type DistributionChartPattern = 'dots' | 'stripes';

export interface DistributionChartTooltip {
  readonly title: string;
  readonly details?: readonly string[];
}

export interface DistributionChartDatum {
  readonly key: string;
  readonly value: number;
  readonly selected?: boolean;
  readonly tooltip: DistributionChartTooltip;
}

/** Series values align with the chart data by category index. */
export interface DistributionChartSeries {
  readonly key: string;
  readonly label: string;
  readonly values: readonly number[];
  readonly type?: 'bar' | 'line' | 'area';
  readonly color?: string;
  /** Pattern for bar series; omitted for a solid fill. */
  readonly pattern?: DistributionChartPattern;
}

export interface DistributionChartProps {
  readonly preset?: ClassPreset;
  readonly data: readonly DistributionChartDatum[];
  readonly ariaLabel: string;
  readonly type?: DistributionChartType;
  readonly height?: number;
  readonly showPoints?: boolean;
  /** Optional category text; defaults to the tooltip title. */
  readonly showLabels?: boolean;
  readonly showValues?: boolean;
  readonly showGrid?: boolean;
  readonly legend?: string;
  readonly formatValue?: (value: number) => string;
  readonly tooltip?: boolean;
  readonly tooltipIndicator?: 'dot' | 'line' | 'dashed' | 'none';
  readonly interpolation?: 'linear' | 'step' | 'smooth';
  readonly areaFill?: 'solid' | 'gradient';
  /** Pattern for single-series bars. */
  readonly barPattern?: DistributionChartPattern;
  /** Multiple series share the categories in data. */
  readonly series?: readonly DistributionChartSeries[];
  /** Overlay series or stack their nonnegative values. Defaults to overlay. */
  readonly seriesMode?: 'overlay' | 'stacked';
  /** Doughnut slice colors, in data order; defaults to theme colors. */
  readonly sliceColors?: readonly string[];
  /** Optional doughnut slice patterns, in data order. */
  readonly slicePatterns?: readonly (DistributionChartPattern | undefined)[];
  /** Optional text displayed in the doughnut center. */
  readonly centerLabel?: string;
  readonly className?: string;
  readonly renderTooltip?: (
    datum: DistributionChartDatum,
    index: number,
  ) => ComponentChildren;
}

export type StandaloneChartProps = Omit<DistributionChartProps, 'type'>;
