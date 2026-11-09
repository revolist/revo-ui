import { platformPalettes } from './platform-palettes';
import { commonPalettes } from './common-palettes';
import { proPalettes } from './pro-palettes';
import { chartPalettes } from './chart-palettes';
import { pivotPalettes } from './pivot-palettes';
import { ganttPalettes } from './gantt-palettes';
import { schedulerPalettes } from './scheduler-palettes';

export interface BuiltInColorPalette {
  readonly id: string;
  readonly title: string;
  readonly usage: string;
  readonly colors: Readonly<Record<string, string>>;
  readonly consumers: readonly string[];
}

/** One catalog for Sass generation, auditing, and the Colors reference page. */
export const builtInColorPalettes: readonly BuiltInColorPalette[] = [
  ...commonPalettes,
  ...platformPalettes,
  ...proPalettes,
  ...chartPalettes,
  ...pivotPalettes,
  ...ganttPalettes,
  ...schedulerPalettes,
];
