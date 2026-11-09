import { commonColors } from './common-palettes';

/** Built-in Pro product colors. Values preserve existing product appearance. */
export const proBaseColors = {
  white: commonColors.watermarkForeground,
  black: commonColors.blackKeyword,
} as const;

export const proFormattingColors = {
  border: commonColors.hex64748b,
  borderLabel: commonColors.hex64748B,
  accent: commonColors.blue600,
  negative: commonColors.red600,
  scaleMid: commonColors.hexfacc15,
  scaleHigh: commonColors.green600,
  black: commonColors.black,
  conditionalFill: commonColors.hexfff3a3,
  conditionalText: commonColors.hex111111,
} as const;

export const proExportColors = {
  headerFill: commonColors.hexF3F4F6,
  headerBorder: commonColors.hexD1D5DB,
} as const;

export const proNotesColors = {
  none: commonColors.hex9ca3af,
  info: commonColors.blue600,
  warning: commonColors.hexd97706,
  blocker: commonColors.red600,
  resolved: commonColors.green600,
} as const;

export const proPresenceColors = {
  default: commonColors.blue600,
  outlineLight: commonColors.rgba_255_255_255_0_88,
  white: commonColors.hexfff,
  surface: commonColors.rgba_255_255_255_0_18,
  surfaceStrong: commonColors.rgba_255_255_255_0_72,
  outlineDark: commonColors.rgba_22_22_26_0_9,
} as const;

export const proCellFlashColors = {
  lightHighlight: commonColors.rgba_255_238_0_0_58,
  lightRowHighlight: commonColors.rgba_255_238_0_0_20,
  lightUp: commonColors.hex15803d,
  lightDown: commonColors.red600,
  darkHighlight: commonColors.rgba_250_204_21_0_34,
  darkRowHighlight: commonColors.rgba_250_204_21_0_16,
  darkUp: commonColors.hex4ade80,
  darkDown: commonColors.hexf87171,
} as const;

export const proColumnTypesColors = {
  foreground: commonColors.hexfff,
  green: commonColors.hex00ca72,
  blue: commonColors.hex0b63f6,
  cyan: commonColors.hex24b7f3,
  red: commonColors.hexf43f5e,
  orange: commonColors.hexfdab3d,
  yellow: commonColors.hexffcb00,
  yellowForeground: commonColors.hex3b3f4a,
  violet: commonColors.hex784bd1,
  pink: commonColors.hexff158a,
  gray: commonColors.hex676879,
} as const;

export const proFilterSyntaxColors = {
  keyword: commonColors.hex315fdc,
  value: commonColors.hex0f766e,
  number: commonColors.hexa14b08,
  boolean: commonColors.hex7c3aed,
  field: commonColors.hex64748b,
  property: commonColors.hex9f1239,
  darkKeyword: commonColors.hex8fb0ff,
  darkValue: commonColors.hex6ee7b7,
  darkNumber: commonColors.hexfdba74,
  darkBoolean: commonColors.hexc4b5fd,
  darkField: commonColors.rgba_255_255_255_0_68,
  darkProperty: commonColors.hexfda4af,
} as const;

export const proFormulaSyntaxColors = {
  function: commonColors.hex7c3aed,
  reference: commonColors.blue600,
  number: commonColors.hex059669,
  punctuation: commonColors.hex667085,
  string: commonColors.hexc2410c,
  name: commonColors.rose700,
  enterHintLight: commonColors.hex666,
  enterHintDark: commonColors.hex97a6ba,
} as const;

export const proFormulaDependenciesColors = {
  blue: commonColors.blue600,
  red: commonColors.red600,
  green: commonColors.green600,
  purple: commonColors.purple600,
  orange: commonColors.orange600,
  cyan: commonColors.cyan600,
} as const;

export const proCellChartsColors = {
  rangePickerShadow: commonColors.hex0003,
  bar: commonColors.hex3f3f46,
  event: commonColors.hex22c55e,
  eventEnd: commonColors.green600,
  eventHoverEnd: commonColors.hex15803d,
  progress: commonColors.rgb_14_79_229,
  progressTrack: commonColors.lightgrayKeyword,
  threshold: commonColors.hex3b82f6,
  progressText: commonColors.white,
} as const;

export const proExcelNamedColors = {
  black: commonColors.black,
  blue: commonColors.hex0000ff,
  cyan: commonColors.hex00ffff,
  green: commonColors.hex008000,
  magenta: commonColors.hexff00ff,
  red: commonColors.hexff0000,
  white: commonColors.white,
  yellow: commonColors.hexffff00,
} as const;

export const proExcelIndexedColors = {
  color1: commonColors.black,
  color2: commonColors.white,
  color3: commonColors.hexff0000,
  color4: commonColors.hex00ff00,
  color5: commonColors.hex0000ff,
  color6: commonColors.hexffff00,
  color7: commonColors.hexff00ff,
  color8: commonColors.hex00ffff,
  color9: commonColors.hex800000,
  color10: commonColors.hex008000,
  color11: commonColors.hex000080,
  color12: commonColors.hex808000,
  color13: commonColors.hex800080,
  color14: commonColors.hex008080,
  color15: commonColors.hexc0c0c0,
  color16: commonColors.hex808080,
  color17: commonColors.hex9999ff,
  color18: commonColors.hex993366,
  color19: commonColors.hexffffcc,
  color20: commonColors.hexccffff,
  color21: commonColors.hex660066,
  color22: commonColors.hexff8080,
  color23: commonColors.hex0066cc,
  color24: commonColors.hexccccff,
  color25: commonColors.hex000080,
  color26: commonColors.hexff00ff,
  color27: commonColors.hexffff00,
  color28: commonColors.hex00ffff,
  color29: commonColors.hex800080,
  color30: commonColors.hex800000,
  color31: commonColors.hex008080,
  color32: commonColors.hex0000ff,
  color33: commonColors.hex00ccff,
  color34: commonColors.hexccffff,
  color35: commonColors.hexccffcc,
  color36: commonColors.hexffff99,
  color37: commonColors.hex99ccff,
  color38: commonColors.hexff99cc,
  color39: commonColors.hexcc99ff,
  color40: commonColors.hexffcc99,
  color41: commonColors.hex3366ff,
  color42: commonColors.hex33cccc,
  color43: commonColors.hex99cc00,
  color44: commonColors.hexffcc00,
  color45: commonColors.hexff9900,
  color46: commonColors.hexff6600,
  color47: commonColors.hex666699,
  color48: commonColors.hex969696,
  color49: commonColors.hex003366,
  color50: commonColors.hex339966,
  color51: commonColors.hex003300,
  color52: commonColors.hex333300,
  color53: commonColors.hex993300,
  color54: commonColors.hex993366,
  color55: commonColors.hex333399,
  color56: commonColors.hex333333,
} as const;

export const proPalettes = [
  {
    id: 'pro-base',
    title: 'Pro utility colors',
    usage: 'Icon mask contrast and legacy fallback surfaces.',
    colors: proBaseColors,
    consumers: [
      'packages/pro/plugins/audit-history-panel/_audit-history-panel.scss',
      'packages/pro/plugins/column-group-panel/delete.icon.ts',
      'packages/pro/plugins/loader/loader.style.scss',
    ],
  },
  {
    id: 'pro-formatting',
    title: 'Pro data formatting',
    usage:
      'Formatting editor defaults, conditional scales, negative values, and Excel border fallback.',
    colors: proFormattingColors,
    consumers: [
      'packages/pro/plugins/conditional-formatting/conditional-formatting.editor.ts',
      'packages/pro/plugins/data-grid-formatting/editor/advanced-format-panel.tsx',
      'packages/pro/plugins/data-grid-formatting/editor/borders-section.tsx',
      'packages/pro/plugins/data-grid-formatting/editor/format-preview.tsx',
      'packages/pro/plugins/data-grid-formatting/editor/index.tsx',
      'packages/pro/plugins/data-grid-formatting/format/advanced.ts',
      'packages/pro/plugins/data-grid-formatting/format/excel.ts',
      'packages/pro/plugins/data-grid-formatting/rendering/index.ts',
    ],
  },
  {
    id: 'pro-export',
    title: 'Pro spreadsheet export',
    usage: 'Portable spreadsheet header fill and border values.',
    colors: proExportColors,
    consumers: [
      'packages/pro/plugins/export-excel/internal/export-transforms.ts',
    ],
  },
  {
    id: 'pro-notes',
    title: 'Pro note severity',
    usage: 'None, information, warning, blocker, and resolved note indicators.',
    colors: proNotesColors,
    consumers: [
      'packages/pro/plugins/grid-notes/grid-notes.plugin.ts',
      'packages/pro/plugins/grid-notes/grid-notes.style.scss',
    ],
  },
  {
    id: 'pro-presence',
    title: 'Pro collaborative presence',
    usage:
      'Collaborator fallback, marker outlines, and translucent marker surfaces.',
    colors: proPresenceColors,
    consumers: [
      'packages/pro/plugins/collaborative-presence/collaborative-presence.layer.ts',
      'packages/pro/plugins/collaborative-presence/collaborative-presence.style.scss',
    ],
  },
  {
    id: 'pro-cell-flash',
    title: 'Pro cell feedback',
    usage:
      'Unchanged light/dark flash highlight and positive/negative movement colors.',
    colors: proCellFlashColors,
    consumers: ['packages/pro/plugins/cell-flash/cell-flash.style.scss'],
  },
  {
    id: 'pro-column-types',
    title: 'Pro column type icons',
    usage: 'Colored badges identifying built-in column types.',
    colors: proColumnTypesColors,
    consumers: [
      'packages/pro/plugins/column-add-popup/column-add-popup.style.scss',
    ],
  },
  {
    id: 'pro-filter-syntax',
    title: 'Pro filter expression syntax',
    usage:
      'Light/dark filter keyword, value, number, boolean, field, and property tokens.',
    colors: proFilterSyntaxColors,
    consumers: ['packages/pro/plugins/filter/filter.style.scss'],
  },
  {
    id: 'pro-formula-syntax',
    title: 'Pro formula syntax',
    usage: 'Formula syntax tokens and light/dark enter-hint SVG stroke colors.',
    colors: proFormulaSyntaxColors,
    consumers: ['packages/pro/plugins/formula/bar/formula-bar.style.scss'],
  },
  {
    id: 'pro-formula-dependencies',
    title: 'Pro formula dependencies',
    usage: 'Ordered reference highlight colors for formula dependencies.',
    colors: proFormulaDependenciesColors,
    consumers: [
      'packages/pro/plugins/formula/dependencies/formula-dependency-highlight.ts',
    ],
  },
  {
    id: 'pro-cell-charts',
    title: 'Pro cell charts',
    usage:
      'Timeline event gradients, progress track/fill, threshold and progress label defaults.',
    colors: proCellChartsColors,
    consumers: [
      'packages/pro/plugins/charts/timeline.style.scss',
      'packages/pro/plugins/column-type-progress/progress.style.scss',
      'packages/pro/plugins/editor-timeline/editor-timeline.styles.scss',
    ],
  },
  {
    id: 'pro-excel-named',
    title: 'Excel named colors',
    usage:
      'Spreadsheet format-code named colors; names are parsing identifiers.',
    colors: proExcelNamedColors,
    consumers: [
      'packages/pro/plugins/data-grid-formatting/format/code/parser.ts',
    ],
  },
  {
    id: 'pro-excel-indexed',
    title: 'Excel indexed colors',
    usage: 'Exact ordered Excel Color1 through Color56 palette.',
    colors: proExcelIndexedColors,
    consumers: [
      'packages/pro/plugins/data-grid-formatting/format/code/parser.ts',
    ],
  },
] as const;
