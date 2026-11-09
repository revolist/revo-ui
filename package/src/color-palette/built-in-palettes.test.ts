// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { compileString } from 'sass-embedded';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { builtInColorPalettes } from './built-in-palettes';

describe('built-in palette ownership', () => {
  it('catalogs unique named palettes with usage and consumers', () => {
    expect(
      new Set(builtInColorPalettes.map((palette) => palette.id)).size,
    ).toBe(builtInColorPalettes.length);
    for (const palette of builtInColorPalettes) {
      expect(palette.id).toMatch(/^[a-z][a-z0-9-]*$/);
      expect(palette.title.trim()).not.toBe('');
      expect(palette.usage.trim()).not.toBe('');
      expect(palette.consumers.length).toBeGreaterThan(0);
      expect(Object.keys(palette.colors).length).toBeGreaterThan(0);
    }
  });

  it('keeps generated Sass synchronized with runtime definitions', () => {
    execFileSync(
      process.execPath,
      ['scripts/generate-palettes.mjs', '--check'],
      {
        cwd: fileURLToPath(new URL('../..', import.meta.url)),
      },
    );
  });

  it('preserves hexadecimal spelling in encoded SVG colors', () => {
    const css = compileString(
      `@use 'built-in-palettes' as palettes; .probe { --light: #{palettes.uri-color('pro-formula-syntax', 'enterHintLight')}; --dark: #{palettes.uri-color('pro-formula-syntax', 'enterHintDark')}; }`,
      {
        loadPaths: [fileURLToPath(new URL('../styles', import.meta.url))],
      },
    ).css;
    expect(css).toContain('--light: %23666;');
    expect(css).toContain('--dark: %2397a6ba;');
  });

  it('preserves every exact color value through Sass interpolation', () => {
    const entries = builtInColorPalettes.flatMap((palette) =>
      Object.entries(palette.colors).map(([key, value]) => ({
        id: palette.id,
        key,
        value,
      })),
    );
    const declarations = entries
      .map(
        ({ id, key }, index) =>
          `--color-${index}: #{palettes.color(${JSON.stringify(id)}, ${JSON.stringify(key)})};`,
      )
      .join('\n');
    const css = compileString(
      `@use 'built-in-palettes' as palettes; .probe { ${declarations} }`,
      {
        loadPaths: [fileURLToPath(new URL('../styles', import.meta.url))],
      },
    ).css;
    entries.forEach(({ value }, index) =>
      expect(css).toContain(`--color-${index}: ${value};`),
    );
  });
});
