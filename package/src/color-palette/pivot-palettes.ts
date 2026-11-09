import { commonColors } from './common-palettes';

/** Built-in colors; preserve concrete values for portable drawings and persisted defaults. */
export const PIVOT_CONDITIONAL_COLORS = {
  background: commonColors.hexfff3a3,
  foreground: commonColors.hex111111,
} as const;

export const PIVOT_COLOR_EDITOR_COLORS = {
  primary: commonColors.blue600,
  negative: commonColors.red600,
  neutral: commonColors.white,
} as const;

export const PIVOT_INTERFACE_MIX_COLORS = {
  shade: commonColors.blackKeyword,
  tint: commonColors.watermarkForeground,
} as const;

export const pivotPalettes = [
  {
    id: 'pivot-interface-mix',
    title: 'Pivot interface accent mixing',
    usage:
      'Fixed shade and tint operands for theme-aware accent text; accent overrides and mixing percentages are preserved.',
    colors: PIVOT_INTERFACE_MIX_COLORS,
    consumers: [
      'Pivot configurators',
      'Pivot field actions',
      'Pivot chart controls',
    ],
  },
  {
    id: 'pivot-conditional',
    title: 'Pivot conditional formatting',
    usage: 'Initial background and foreground for conditional-format rules.',
    colors: PIVOT_CONDITIONAL_COLORS,
    consumers: ['Pivot conditional-format draft'],
  },
  {
    id: 'pivot-color-editor',
    title: 'Pivot chart color editor',
    usage: 'Initial positive, negative and neutral colors for color mappings.',
    colors: PIVOT_COLOR_EDITOR_COLORS,
    consumers: ['Pivot chart color editor'],
  },
] as const;
