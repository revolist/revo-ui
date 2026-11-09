import { commonColors } from './common-palettes';

/** Built-in product palettes. Exact values are shared by runtime code, Sass and the Colors gallery. */
export const schedulerEventColorColors = {
  event: commonColors.hex4573de,
  white: commonColors.white,
} as const;

export const schedulerExportColors = {
  'surface-sunken': commonColors.hexf3f4f6,
  text: commonColors.hex111827,
  white: commonColors.white,
  'grid-dark': commonColors.hex4b5563,
  grid: commonColors.hexd1d5db,
  conflict: commonColors.red600,
  progress: commonColors.hex166534,
  'header-dark': commonColors.hex1f2937,
  'group-dark': commonColors.hex374151,
  'group-light': commonColors.hexe5e7eb,
  'closed-light': commonColors.hexfef3c7,
} as const;

export const schedulerTimeAnnotationsColors = {
  'current-time': commonColors.rgb_82_94_227,
  annotation: commonColors.hexe5a000,
} as const;

export const schedulerReportColors = {
  text: commonColors.hex111827,
  muted: commonColors.hex6b7280,
  grid: commonColors.hexd1d5db,
  'surface-sunken': commonColors.hexf3f4f6,
} as const;

export const schedulerEventBaseColors = {
  'progress-track-mix': commonColors.white,
} as const;

export const schedulerEventCompactColors = {
  conflict: commonColors.red600,
} as const;

export const schedulerEventContentColors = {
  'chip-highlight': commonColors.rgba_255_255_255_0_32,
  'chip-icon': commonColors.white,
} as const;

export const schedulerEventStatesColors = {
  'state-highlight': commonColors.rgba_255_255_255_0_32,
  'state-icon': commonColors.white,
  'invalid-outline': commonColors.red600,
  'invalid-badge-bg': commonColors.red600,
  'invalid-badge-text': commonColors.watermarkForeground,
} as const;

export const schedulerThemeLightColors = {
  'event-color': commonColors.rgb_69_115_222,
  'event-border-mix-base': commonColors.hex0f172a,
  'confirmed-color': commonColors.rgb_69_115_222,
  'confirmed-bg': commonColors.rgb_69_115_222,
  'confirmed-text': commonColors.white,
  'tentative-color': commonColors.rgb_190_91_0,
  'tentative-bg': commonColors.rgb_190_91_0,
  'tentative-text': commonColors.white,
  'info-color': commonColors.rgb_0_144_184,
  'info-bg': commonColors.rgb_0_144_184,
  'info-text': commonColors.white,
  'locked-color': commonColors.rgb_0_144_184,
  'locked-bg': commonColors.rgb_0_144_184,
  'locked-text': commonColors.white,
  'conflict-color': commonColors.rgb_230_43_52,
  'conflict-bg': commonColors.rgb_202_68_91,
  'conflict-text': commonColors.white,
  'conflict-warning-color': commonColors.rgb_230_43_52,
  'conflict-warning-bg': commonColors.rgb_190_91_0,
  'conflict-warning-text': commonColors.white,
  'conflict-confirm-color': commonColors.rgb_82_94_227,
  'conflict-confirm-bg': commonColors.rgb_139_93_206,
  'conflict-confirm-text': commonColors.white,
  'conflict-error-color': commonColors.rgb_230_43_52,
  'conflict-error-bg': commonColors.rgb_202_68_91,
  'conflict-error-text': commonColors.white,
  'available-bg': commonColors.rgba_31_157_114_0_045,
  'non-working-bg': commonColors.rgba_116_126_148_0_085,
  'closed-bg': commonColors.rgba_116_126_148_0_14,
  'blocked-bg': commonColors.rgba_214_69_69_0_12,
  'break-bg': commonColors.rgba_201_138_20_0_12,
  'holiday-bg': commonColors.rgba_79_91_213_0_12,
  'coverage-under-bg': commonColors.rgba_214_69_69_0_1,
  'coverage-under-border': commonColors.rgba_214_69_69_0_38,
  'coverage-met-bg': commonColors.rgba_31_157_114_0_07,
  'coverage-met-border': commonColors.rgba_31_157_114_0_2,
  'coverage-over-bg': commonColors.rgba_201_138_20_0_1,
  'coverage-over-border': commonColors.rgba_201_138_20_0_34,
  'utilization-under-bg': commonColors.rgba_201_138_20_0_08,
  'utilization-under-border': commonColors.rgba_201_138_20_0_42,
  'utilization-under-text': commonColors.hex8a5d05,
  'utilization-balanced-bg': commonColors.rgba_31_157_114_0_06,
  'utilization-balanced-border': commonColors.rgba_31_157_114_0_32,
  'utilization-balanced-text': commonColors.hex0d6b4d,
  'utilization-over-bg': commonColors.rgba_214_69_69_0_09,
  'utilization-over-border': commonColors.rgba_214_69_69_0_42,
  'utilization-over-text': commonColors.hex9c2a2a,
  'unassigned-bg': commonColors.rgba_79_91_213_0_06,
  'unassigned-border': commonColors.rgba_79_91_213_0_34,
  'unassigned-text': commonColors.hex343b9d,
  'unassigned-timeline-bg': commonColors.rgba_79_91_213_0_035,
  'required-role-chip-bg': commonColors.rgba_79_91_213_0_12,
  'required-role-chip-border': commonColors.rgba_79_91_213_0_26,
  'required-role-chip-text': commonColors.hex343b9d,
  'event-chip-bg': commonColors.rgba_255_255_255_0_22,
  'event-chip-border': commonColors.rgba_255_255_255_0_2,
  'event-selected-shadow': commonColors.rgba_37_99_235_0_24,
  'event-text': commonColors.white,
  'current-time-label-ring': commonColors.rgba_255_255_255_0_9,
  'current-time-dot-ring': commonColors.rgba_255_255_255_0_85,
} as const;

export const schedulerThemeDarkColors = {
  'event-color': commonColors.rgb_80_128_235,
  'event-bg': commonColors.rgb_80_128_235,
  'event-text': commonColors.white,
  'confirmed-color': commonColors.rgb_80_128_235,
  'confirmed-bg': commonColors.rgb_80_128_235,
  'confirmed-text': commonColors.white,
  'tentative-color': commonColors.rgb_203_104_0,
  'tentative-bg': commonColors.rgb_203_104_0,
  'tentative-text': commonColors.white,
  'info-color': commonColors.rgb_0_156_197,
  'info-bg': commonColors.rgb_0_156_197,
  'info-text': commonColors.white,
  'locked-color': commonColors.rgb_0_156_197,
  'locked-bg': commonColors.rgb_0_156_197,
  'locked-text': commonColors.white,
  'conflict-color': commonColors.rgb_255_119_99,
  'conflict-bg': commonColors.rgb_216_81_102,
  'conflict-text': commonColors.white,
  'conflict-warning-color': commonColors.rgb_255_119_99,
  'conflict-warning-bg': commonColors.rgb_203_104_0,
  'conflict-warning-text': commonColors.white,
  'conflict-confirm-color': commonColors.rgb_120_139_255,
  'conflict-confirm-bg': commonColors.rgb_151_105_220,
  'conflict-confirm-text': commonColors.white,
  'conflict-error-color': commonColors.rgb_255_119_99,
  'conflict-error-bg': commonColors.rgb_216_81_102,
  'conflict-error-text': commonColors.white,
  'current-time-label-ring': commonColors.rgba_15_17_23_0_92,
  'current-time-dot-ring': commonColors.rgba_15_17_23_0_88,
  'available-bg': commonColors.rgba_52_211_153_0_075,
  'non-working-bg': commonColors.rgba_148_163_184_0_07,
  'closed-bg': commonColors.rgba_148_163_184_0_11,
  'blocked-bg': commonColors.rgba_248_113_113_0_13,
  'break-bg': commonColors.rgba_251_191_36_0_12,
  'holiday-bg': commonColors.rgba_165_180_252_0_12,
  'coverage-under-bg': commonColors.rgba_248_113_113_0_13,
  'coverage-under-border': commonColors.rgba_248_113_113_0_5,
  'coverage-met-bg': commonColors.rgba_52_211_153_0_09,
  'coverage-met-border': commonColors.rgba_52_211_153_0_34,
  'coverage-over-bg': commonColors.rgba_251_191_36_0_13,
  'coverage-over-border': commonColors.rgba_251_191_36_0_48,
  'utilization-under-bg': commonColors.rgba_251_191_36_0_13,
  'utilization-under-border': commonColors.rgba_251_191_36_0_48,
  'utilization-under-text': commonColors.hexfef3c7,
  'utilization-balanced-bg': commonColors.rgba_52_211_153_0_1,
  'utilization-balanced-border': commonColors.rgba_52_211_153_0_42,
  'utilization-balanced-text': commonColors.hexd1fae5,
  'utilization-over-bg': commonColors.rgba_248_113_113_0_13,
  'utilization-over-border': commonColors.rgba_248_113_113_0_48,
  'utilization-over-text': commonColors.hexfee2e2,
  'unassigned-bg': commonColors.rgba_165_180_252_0_11,
  'unassigned-border': commonColors.rgba_165_180_252_0_42,
  'unassigned-text': commonColors.hexe0e7ff,
  'unassigned-timeline-bg': commonColors.rgba_165_180_252_0_07,
  'required-role-chip-bg': commonColors.rgba_165_180_252_0_16,
  'required-role-chip-border': commonColors.rgba_165_180_252_0_32,
  'required-role-chip-text': commonColors.hexe0e7ff,
  'weekend-header-bg': commonColors.rgba_148_163_184_0_075,
  'event-chip-bg': commonColors.rgba_255_255_255_0_16,
  'event-chip-border': commonColors.rgba_255_255_255_0_14,
} as const;

export const schedulerDomLayerColors = {
  conflict: commonColors.red600,
} as const;

export const schedulerColors = {
  'scheduler-event-color': schedulerEventColorColors,
  'scheduler-export': schedulerExportColors,
  'scheduler-time-annotations': schedulerTimeAnnotationsColors,
  'scheduler-report': schedulerReportColors,
  'scheduler-event-base': schedulerEventBaseColors,
  'scheduler-event-compact': schedulerEventCompactColors,
  'scheduler-event-content': schedulerEventContentColors,
  'scheduler-event-states': schedulerEventStatesColors,
  'scheduler-theme-light': schedulerThemeLightColors,
  'scheduler-theme-dark': schedulerThemeDarkColors,
  'scheduler-dom-layer': schedulerDomLayerColors,
} as const;

export const schedulerPalettes = [
  {
    id: 'scheduler-event-color',
    title: 'Scheduler event color',
    usage:
      'Default event color colors, preserving configured user colors and theme overrides.',
    colors: schedulerEventColorColors,
    consumers: ['packages/scheduler/src/event-scheduler/core/event-color.ts'],
  },
  {
    id: 'scheduler-export',
    title: 'Scheduler export',
    usage:
      'Default export colors, preserving configured user colors and theme overrides.',
    colors: schedulerExportColors,
    consumers: [
      'packages/scheduler/src/event-scheduler/core/export-drawing.ts',
      'packages/scheduler/src/event-scheduler/core/export-events.ts',
      'packages/scheduler/src/event-scheduler/core/export-header.ts',
      'packages/scheduler/src/event-scheduler/core/export-row.ts',
      'packages/scheduler/src/event-scheduler/core/export-svg.ts',
    ],
  },
  {
    id: 'scheduler-time-annotations',
    title: 'Scheduler time annotations',
    usage:
      'Default time annotations colors, preserving configured user colors and theme overrides.',
    colors: schedulerTimeAnnotationsColors,
    consumers: [
      'packages/scheduler/src/event-scheduler/core/projection-time.ts',
      'packages/scheduler/src/event-scheduler/ui/time-annotations.ts',
    ],
  },
  {
    id: 'scheduler-report',
    title: 'Scheduler report',
    usage:
      'Default report colors, preserving configured user colors and theme overrides.',
    colors: schedulerReportColors,
    consumers: ['packages/scheduler/src/event-scheduler/core/reporting.ts'],
  },
  {
    id: 'scheduler-event-base',
    title: 'Scheduler event base',
    usage:
      'Built-in event base colors; product CSS overrides remain supported.',
    colors: schedulerEventBaseColors,
    consumers: [
      'packages/scheduler/src/event-scheduler/styles/_event-base.scss',
    ],
  },
  {
    id: 'scheduler-event-compact',
    title: 'Scheduler event compact',
    usage:
      'Built-in event compact colors; product CSS overrides remain supported.',
    colors: schedulerEventCompactColors,
    consumers: [
      'packages/scheduler/src/event-scheduler/styles/_event-compact.scss',
    ],
  },
  {
    id: 'scheduler-event-content',
    title: 'Scheduler event content',
    usage:
      'Built-in event content colors; product CSS overrides remain supported.',
    colors: schedulerEventContentColors,
    consumers: [
      'packages/scheduler/src/event-scheduler/styles/_event-content.scss',
    ],
  },
  {
    id: 'scheduler-event-states',
    title: 'Scheduler event states',
    usage:
      'Built-in event states colors; product CSS overrides remain supported.',
    colors: schedulerEventStatesColors,
    consumers: [
      'packages/scheduler/src/event-scheduler/styles/_event-states.scss',
    ],
  },
  {
    id: 'scheduler-theme-light',
    title: 'Scheduler theme light',
    usage:
      'Built-in theme light colors; product CSS overrides remain supported.',
    colors: schedulerThemeLightColors,
    consumers: [
      'packages/scheduler/src/event-scheduler/styles/_tokens.scss',
      'packages/scheduler/src/event-scheduler/styles/themes/_light.scss',
    ],
  },
  {
    id: 'scheduler-theme-dark',
    title: 'Scheduler theme dark',
    usage:
      'Built-in theme dark colors; product CSS overrides remain supported.',
    colors: schedulerThemeDarkColors,
    consumers: [
      'packages/scheduler/src/event-scheduler/styles/themes/_dark.scss',
    ],
  },
  {
    id: 'scheduler-dom-layer',
    title: 'Scheduler dom layer',
    usage:
      'Default dom layer colors, preserving configured user colors and theme overrides.',
    colors: schedulerDomLayerColors,
    consumers: ['packages/scheduler/src/event-scheduler/ui/dom-layer.ts'],
  },
] as const;
