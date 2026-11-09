import { commonColors } from './common-palettes';

/** Stable identity colors; order participates in the user-ID hash assignment. */
export const COLLABORATIVE_IDENTITY_COLORS = {
  blue: commonColors.blue600,
  green: commonColors.green600,
  red: commonColors.red600,
  purple: commonColors.purple600,
  orange: commonColors.orange600,
  cyan: commonColors.cyan600,
  rose: commonColors.rose700,
  indigo: commonColors.indigo600,
} as const;

export const TRIAL_WATERMARK_COLORS = {
  foreground: commonColors.watermarkForeground,
  background: commonColors.watermarkBackground,
} as const;

export const platformPalettes = [
  {
    id: 'collaborative-identity',
    title: 'Collaborative editing identities',
    usage:
      'Deterministic fallback colors for collaborator IDs; explicit user colors take precedence.',
    colors: COLLABORATIVE_IDENTITY_COLORS,
    consumers: [
      'packages/collaborative-editing/plugins/collaborative-editing/collaborative-editing.utils.ts',
    ],
  },
  {
    id: 'trial-watermark',
    title: 'Trial watermark',
    usage:
      'Foreground and translucent background of delayed trial notices in grids and charts.',
    colors: TRIAL_WATERMARK_COLORS,
    consumers: ['packages/trial-control/src/watermark.ts'],
  },
] as const;
