import { commonColors } from './common-palettes';

/** Built-in colors; preserve concrete values for portable drawings and persisted defaults. */
export const CHART_SERIES_COLORS = {
  violet: commonColors.hex6647f0,
  orange: commonColors.hexfc6d2d,
  blue: commonColors.hex0091ff,
  magenta: commonColors.hexff02f0,
  teal: commonColors.hex00b8a6,
  yellow: commonColors.hexf5b700,
  pink: commonColors.hexe14b8d,
  indigo: commonColors.hex6c78f4,
} as const;

export const CHART_THEME_LIGHT = {
  background: commonColors.white,
  foreground: commonColors.hex171717,
  muted: commonColors.hex666666,
  grid: commonColors.hexe0e0e0,
} as const;

export const CHART_THEME_DARK = {
  background: commonColors.hex1b1b1f,
  foreground: commonColors.hexf5f5f5,
  muted: commonColors.hexa3a3a3,
  grid: commonColors.hex404040,
} as const;

export const CHART_GEOGRAPHIC_COLORS = {
  markLight: commonColors.hex4285d4,
  markDark: commonColors.hex60a5fa,
  heatLight: commonColors.hexe8590c,
  heatDark: commonColors.hexfb923c,
} as const;

export const CHART_DRAWING_COLORS = {
  black: commonColors.black,
  white: commonColors.white,
  annotation: commonColors.watermarkForeground,
  textFallback: commonColors.hex171717,
} as const;

export const chartPalettes = [
  {
    id: 'chart-series',
    title: 'Chart series',
    usage:
      'Ordered categorical series defaults; public DEFAULT_PALETTE retains its original order.',
    colors: CHART_SERIES_COLORS,
    consumers: ['Charts renderer DEFAULT_PALETTE', 'Charts WebGL focus'],
  },
  {
    id: 'chart-theme-light',
    title: 'Chart drawing · light',
    usage: 'Portable drawing surfaces, text, muted labels and grid lines.',
    colors: CHART_THEME_LIGHT,
    consumers: ['Charts renderer theme', 'Pivot chart theme'],
  },
  {
    id: 'chart-theme-dark',
    title: 'Chart drawing · dark',
    usage: 'Portable dark drawing surfaces, text, muted labels and grid lines.',
    colors: CHART_THEME_DARK,
    consumers: ['Charts renderer theme', 'Pivot chart theme'],
  },
  {
    id: 'chart-geographic',
    title: 'Geographic layers',
    usage: 'Default map markers and heat colors for light and dark charts.',
    colors: CHART_GEOGRAPHIC_COLORS,
    consumers: ['Charts geographic renderer'],
  },
  {
    id: 'chart-drawing',
    title: 'Chart drawing primitives',
    usage: 'Contrast text, SVG annotations, organization shadows.',
    colors: CHART_DRAWING_COLORS,
    consumers: [
      'Charts annotations and analysis',
      'Charts treemap labels',
      'Charts organization shadows',
    ],
  },
] as const;
