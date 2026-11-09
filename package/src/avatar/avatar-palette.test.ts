// @vitest-environment node
import { expect, it } from 'vitest';
import { compile } from 'sass-embedded';
import { fileURLToPath } from 'node:url';
import { AVATAR_CELL_BACKGROUNDS as paletteBackgrounds } from '../color-palette/common-palettes';
import { AVATAR_CELL_BACKGROUNDS, getAvatarCellBackground } from './index';

it('preserves the avatar export and indexed selection from the shared palette', () => {
  expect(AVATAR_CELL_BACKGROUNDS).toBe(paletteBackgrounds);
  expect(paletteBackgrounds).toHaveLength(8);
  expect(getAvatarCellBackground(-1)).toBe(paletteBackgrounds[0]);
  expect(getAvatarCellBackground(8)).toBe(paletteBackgrounds[0]);
  expect(getAvatarCellBackground(15)).toBe(paletteBackgrounds[7]);
});

it('renders every avatar CSS tone from the same colors as the runtime helper', () => {
  const css = compile(
    fileURLToPath(new URL('./avatar.style.scss', import.meta.url)),
  ).css;
  paletteBackgrounds.forEach((background, index) => {
    expect(css).toContain(
      `.avatar-cell--${index} {\n  --avatar-cell-background: ${background};\n}`,
    );
  });
  expect(css).toContain(`--avatar-cell-background: ${paletteBackgrounds[0]};`);
});
