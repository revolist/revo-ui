import { commonColors } from './common-palettes';

export interface ColorPaletteOption {
  readonly value: string;
  readonly label: string;
  readonly disabled?: boolean;
}

export type ColorPaletteValue = string | null;

export const DEFAULT_COLOR_PALETTE_OPTIONS: readonly ColorPaletteOption[] = [
  { value: commonColors.hexe53935, label: 'Red' },
  { value: commonColors.hexd81b60, label: 'Pink' },
  { value: commonColors.hexc000c0, label: 'Magenta' },
  { value: commonColors.hex8e24aa, label: 'Purple' },
  { value: commonColors.hex5e35b1, label: 'Deep purple' },
  { value: commonColors.hex4527a0, label: 'Violet' },
  { value: commonColors.hex3949ab, label: 'Indigo' },
  { value: commonColors.blue600, label: 'Blue' },
  { value: commonColors.hex03a9f4, label: 'Light blue' },
  { value: commonColors.hex26c6da, label: 'Cyan' },
  { value: commonColors.hex00897b, label: 'Teal' },
  { value: commonColors.hex43a047, label: 'Green' },
  { value: commonColors.hex8bc34a, label: 'Light green' },
  { value: commonColors.hexc0ca33, label: 'Lime' },
  { value: commonColors.hexfdd835, label: 'Yellow' },
  { value: commonColors.hexffb300, label: 'Amber' },
  { value: commonColors.hexfb8c00, label: 'Orange' },
  { value: commonColors.hexf4511e, label: 'Vermilion' },
  { value: commonColors.hex6d4c41, label: 'Brown' },
  { value: commonColors.hexe0e0e0, label: 'Light gray' },
  { value: commonColors.hexbdbdbd, label: 'Silver' },
  { value: commonColors.hex757575, label: 'Gray' },
  { value: commonColors.black, label: 'Black' },
] as const;
