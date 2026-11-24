import type { ComponentChildren } from 'preact';
import type { ClassPreset } from '../presets/types';

export type DistributionChartType = 'bar' | 'line' | 'area';

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
  readonly className?: string;
  readonly renderTooltip?: (
    datum: DistributionChartDatum,
    index: number,
  ) => ComponentChildren;
}

export type StandaloneChartProps = Omit<DistributionChartProps, 'type'>;
