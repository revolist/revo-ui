// @vitest-environment node
import { readFileSync, readdirSync } from 'node:fs';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';
import { commonColors } from './common-palettes';
import { builtInColorPalettes } from './built-in-palettes';
import { DEFAULT_COLOR_PALETTE_OPTIONS } from './palette';
import { COLOR_PICKER_DEFAULT_COLOR } from './color-picker.constants';

const colorLiteral =
  /^(?:#[\da-f]{3,8}|rgba?\([^)]*\)|linear-gradient\([^)]*\)|black|white|transparent|lightgray)$/i;

describe('shared color primitives', () => {
  it('defines each exact primitive string once', () => {
    const values = Object.values(commonColors);
    expect(new Set(values).size).toBe(values.length);
  });

  it('owns every fixed product palette and picker color', () => {
    const primitives = new Set<string>(Object.values(commonColors));
    for (const palette of builtInColorPalettes.filter(
      (palette) => palette.id !== 'avatar-cell',
    )) {
      for (const value of Object.values(palette.colors)) {
        expect(primitives.has(value), `${palette.id}: ${value}`).toBe(true);
      }
    }
    for (const option of DEFAULT_COLOR_PALETTE_OPTIONS)
      expect(primitives.has(option.value)).toBe(true);
    expect(primitives.has(COLOR_PICKER_DEFAULT_COLOR)).toBe(true);
  });

  it('requires palette consumers to reference shared colors instead of literal paints', () => {
    const files = readdirSync(new URL('.', import.meta.url)).filter(
      (file) => file.endsWith('-palettes.ts') && file !== 'common-palettes.ts',
    );
    files.push('palette.ts', 'color-picker.constants.ts');
    for (const file of files) {
      const source = ts.createSourceFile(
        file,
        readFileSync(new URL(file, import.meta.url), 'utf8'),
        ts.ScriptTarget.Latest,
        true,
      );
      const literals: string[] = [];
      function visit(node: ts.Node) {
        if (ts.isStringLiteral(node) && colorLiteral.test(node.text)) {
          // Object keys such as 'white' describe a role, rather than defining its paint.
          const property = ts.isPropertyAssignment(node.parent)
            ? node.parent
            : undefined;
          const isLabel =
            property &&
            ts.isIdentifier(property.name) &&
            property.name.text === 'label';
          if (property?.name !== node && !isLabel) literals.push(node.text);
        }
        ts.forEachChild(node, visit);
      }
      visit(source);
      expect(literals, file).toEqual([]);
    }
    const sass = readFileSync(
      new URL('../styles/_palette.scss', import.meta.url),
      'utf8',
    );
    expect(sass).not.toMatch(/#[\da-f]{3,8}|rgba?\(/i);
  });
});
