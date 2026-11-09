// @vitest-environment node
import { expect, it } from 'vitest';
import {
  COLLABORATIVE_IDENTITY_COLORS,
  TRIAL_WATERMARK_COLORS,
} from './platform-palettes';
import { builtInColorPalettes } from './built-in-palettes';

it('preserves the collaborator hash palette order and exact colors', () => {
  expect(Object.entries(COLLABORATIVE_IDENTITY_COLORS)).toEqual([
    ['blue', '#2563eb'],
    ['green', '#16a34a'],
    ['red', '#dc2626'],
    ['purple', '#9333ea'],
    ['orange', '#ea580c'],
    ['cyan', '#0891b2'],
    ['rose', '#be123c'],
    ['indigo', '#4f46e5'],
  ]);
});

it('preserves watermark paint and exposes both palettes in the Colors catalog', () => {
  expect(TRIAL_WATERMARK_COLORS).toEqual({
    foreground: 'white',
    background: 'rgba(166, 0, 0, 0.9)',
  });
  expect(
    builtInColorPalettes.find(
      (palette) => palette.id === 'collaborative-identity',
    )?.colors,
  ).toBe(COLLABORATIVE_IDENTITY_COLORS);
  expect(
    builtInColorPalettes.find((palette) => palette.id === 'trial-watermark')
      ?.colors,
  ).toBe(TRIAL_WATERMARK_COLORS);
});
