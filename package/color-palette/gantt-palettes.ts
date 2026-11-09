import { commonColors } from './common-palettes';

/** Built-in product palettes. Exact values are shared by runtime code, Sass and the Colors gallery. */
export const ganttLayoutColors = {
  'rv-panel-accent': commonColors.hex3f8f7d,
} as const;

export const ganttStatusBadgesColors = {
  'neutral-text': commonColors.hex475569,
  'complete-text': commonColors.hex047857,
  'late-text': commonColors.hexb91c1c,
  'neutral-bg': commonColors.hexf8fafc,
  'neutral-border': commonColors.hexcbd5e1,
  'in-progress-bg': commonColors.hexeff6ff,
  'in-progress-border': commonColors.hexbfdbfe,
  'in-progress-text': commonColors.blue600,
  'complete-bg': commonColors.hexecfdf5,
  'complete-border': commonColors.hexa7f3d0,
  'blocked-bg': commonColors.hexfef2f2,
  'blocked-border': commonColors.hexfecaca,
  'neutral-dark-bg': commonColors.rgba_148_163_184_0_14,
  'neutral-dark-border': commonColors.rgba_148_163_184_0_36,
  'neutral-dark-text': commonColors.hexcbd5e1,
  'in-progress-dark-bg': commonColors.rgba_37_99_235_0_18,
  'in-progress-dark-border': commonColors.rgba_96_165_250_0_42,
  'in-progress-dark-text': commonColors.hex93c5fd,
  'complete-dark-bg': commonColors.rgba_4_120_87_0_2,
  'complete-dark-border': commonColors.rgba_52_211_153_0_44,
  'complete-dark-text': commonColors.hex6ee7b7,
  'blocked-dark-bg': commonColors.rgba_185_28_28_0_2,
  'blocked-dark-border': commonColors.rgba_248_113_113_0_44,
  'blocked-dark-text': commonColors.hexfca5a5,
} as const;

export const ganttTaskBarsColors = {
  selection: commonColors.hex3b82f6,
  'split-border-start': commonColors.rgba_255_255_255_0_75,
  'split-border-end': commonColors.rgba_255_255_255_0_75,
  'split-stripe-light': commonColors.rgba_255_255_255_0_88,
  'split-stripe-dark': commonColors.rgba_15_23_42_0_16,
  'split-handle': commonColors.rgba_15_23_42_0_42,
  'assignee-badge-border': commonColors.rgba_15_23_42_0_72,
  'assignee-badge-bg': commonColors.hexfacc15,
  'assignee-badge-text': commonColors.hex0f172a,
  'progress-handle': commonColors.rgb_255_255_255,
  'progress-handle-shadow': commonColors.blackKeyword,
  'resize-handle': commonColors.rgba_255_255_255_0_45,
  'dependency-handle-border': commonColors.rgba_42_95_134_0_92,
  'dependency-handle-bg': commonColors.rgba_255_255_255_0_98,
  'progress-preview': commonColors.rgba_132_204_22_0_42,
  'range-selection': commonColors.hex3b82f6,
  'milestone-highlight': commonColors.rgba_255_255_255_0_6,
} as const;

export const ganttTimelineHeaderColors = {
  'interaction-highlight': commonColors.hexfff,
  'annotation-text': commonColors.hex17120a,
} as const;

export const ganttTimelineColors = {
  'marker-text': commonColors.hexfff,
} as const;

export const ganttThemeLightColors = {
  'task-bg': commonColors.hex5be16b,
  'task-border': commonColors.rgba_0_0_0_0_1,
  'task-progress-bg': commonColors.hex329e16,
  'task-text': commonColors.hex1f2d05,
  'critical-bg': commonColors.hexff77d2,
  'critical-border': commonColors.hexdb3fa9,
  'critical-progress-bg': commonColors.hexf43f9e,
  'summary-bg': commonColors.hex3b82f6,
  'summary-critical-bg': commonColors.hexff77d2,
  'milestone-bg': commonColors.hexfacc15,
  'milestone-border': commonColors.hexa87800,
  'bar-mix-bg': commonColors.white,
  'bar-progress-mix': commonColors.white,
  'shadow-strong': commonColors.rgba_250_204_21_0_18,
  'dependency-stroke': commonColors.hex525866,
  'dependency-stroke-hover': commonColors.hex329e16,
  'dependency-stroke-selected': commonColors.hexff77d2,
  'dependency-stroke-critical': commonColors.hexf43f9e,
  'baseline-bg': commonColors.rgba_167_179_196_0_72,
  'indicator-deadline': commonColors.hexff4d4f,
  'indicator-constraint': commonColors.hex60a5fa,
  'indicator-custom': commonColors.hexa78bfa,
  'indicator-warning': commonColors.hexf59e0b,
  'range-bg': commonColors.rgba_190_242_100_0_14,
  'non-working-bg': commonColors.rgba_17_24_39_0_032,
  'project-line': commonColors.hexff77d2,
  'today-line': commonColors.hexf5a623,
  'milestone-line': commonColors.hexfacc15,
  'resource-load-bg': commonColors.rgba_22_204_22_0_90,
  'resource-load-over-bg': commonColors.rgba_212_36_36_0_90,
  'resource-capacity-line': commonColors.rgba_15_23_42_0_42,
  'tooltip-dependency-block': commonColors.hexb9dcfb,
  'tooltip-dependency-dot': commonColors.hex2b91df,
  'revo-grid-cell-disabled-bg': commonColors.rgba_0_0_0_0_02,
} as const;

export const ganttThemeDarkColors = {
  'task-bg': commonColors.hexbef264,
  'task-border': commonColors.rgba_0_0_0_0_1,
  'task-progress-bg': commonColors.hex329e16,
  'task-text': commonColors.hex1f2d05,
  'critical-bg': commonColors.hexff77d2,
  'critical-border': commonColors.hexd83aa5,
  'critical-progress-bg': commonColors.hexf43f9e,
  'summary-bg': commonColors.hex60a5fa,
  'summary-critical-bg': commonColors.hexff77d2,
  'milestone-bg': commonColors.hexfacc15,
  'milestone-border': commonColors.hex9a7200,
  'bar-mix-bg': commonColors.hex74ff17,
  'bar-progress-mix': commonColors.white,
  'shadow-strong': commonColors.rgba_250_204_21_0_18,
  'baseline-bg': commonColors.rgba_109_114_125_0_78,
  'non-working-bg': commonColors.rgba_255_255_255_0_035,
  'resource-load-bg': commonColors.rgba_190_242_100_0_9,
  'resource-load-over-bg': commonColors.rgba_251_113_133_0_78,
  'resource-capacity-line': commonColors.rgba_248_250_252_0_42,
  'tooltip-dependency-block': commonColors.rgba_96_165_250_0_32,
  'tooltip-dependency-dot': commonColors.hex93c5fd,
} as const;

export const ganttAssigneesColors = {
  'avatar-fallback': commonColors.hex94a3b8,
  cyan: commonColors.hex22d3ee,
  emerald: commonColors.hex34d399,
  yellow: commonColors.hexfacc15,
  rose: commonColors.hexfb7185,
  violet: commonColors.hexa78bfa,
  blue: commonColors.hex60a5fa,
  orange: commonColors.hexf97316,
  teal: commonColors.hex2dd4bf,
} as const;

export const ganttColors = {
  'gantt-layout': ganttLayoutColors,
  'gantt-status-badges': ganttStatusBadgesColors,
  'gantt-task-bars': ganttTaskBarsColors,
  'gantt-timeline-header': ganttTimelineHeaderColors,
  'gantt-timeline': ganttTimelineColors,
  'gantt-theme-light': ganttThemeLightColors,
  'gantt-theme-dark': ganttThemeDarkColors,
  'gantt-assignees': ganttAssigneesColors,
} as const;

export const ganttPalettes = [
  {
    id: 'gantt-layout',
    title: 'Gantt layout',
    usage: 'Built-in layout colors; product CSS overrides remain supported.',
    colors: ganttLayoutColors,
    consumers: ['packages/gantt/src/gantt/assets/styles/_layout.scss'],
  },
  {
    id: 'gantt-status-badges',
    title: 'Gantt status badges',
    usage:
      'Built-in status badges colors; product CSS overrides remain supported.',
    colors: ganttStatusBadgesColors,
    consumers: ['packages/gantt/src/gantt/assets/styles/_status-badges.scss'],
  },
  {
    id: 'gantt-task-bars',
    title: 'Gantt task bars',
    usage: 'Built-in task bars colors; product CSS overrides remain supported.',
    colors: ganttTaskBarsColors,
    consumers: ['packages/gantt/src/gantt/assets/styles/_task-bars.scss'],
  },
  {
    id: 'gantt-timeline-header',
    title: 'Gantt timeline header',
    usage:
      'Built-in timeline header colors; product CSS overrides remain supported.',
    colors: ganttTimelineHeaderColors,
    consumers: ['packages/gantt/src/gantt/assets/styles/_timeline-header.scss'],
  },
  {
    id: 'gantt-timeline',
    title: 'Gantt timeline',
    usage: 'Built-in timeline colors; product CSS overrides remain supported.',
    colors: ganttTimelineColors,
    consumers: ['packages/gantt/src/gantt/assets/styles/_timeline.scss'],
  },
  {
    id: 'gantt-theme-light',
    title: 'Gantt theme light',
    usage:
      'Built-in theme light colors; product CSS overrides remain supported.',
    colors: ganttThemeLightColors,
    consumers: ['packages/gantt/src/gantt/assets/styles/_tokens.scss'],
  },
  {
    id: 'gantt-theme-dark',
    title: 'Gantt theme dark',
    usage:
      'Built-in theme dark colors; product CSS overrides remain supported.',
    colors: ganttThemeDarkColors,
    consumers: ['packages/gantt/src/gantt/assets/styles/_tokens.scss'],
  },
  {
    id: 'gantt-assignees',
    title: 'Gantt assignees',
    usage:
      'Default assignees colors, preserving configured user colors and theme overrides.',
    colors: ganttAssigneesColors,
    consumers: [
      'packages/gantt/src/gantt/grid/gantt-grid-sync.ts',
      'packages/gantt/src/gantt/projection/assignment-display.ts',
    ],
  },
] as const;
