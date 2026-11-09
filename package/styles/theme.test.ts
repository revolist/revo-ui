// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { compileString } from 'sass-embedded';
import { fileURLToPath } from 'node:url';
import { colorRoles } from './color-roles';

describe('shared semantic color theme', () => {
  it('defines every catalog role in both explicit theme scopes without duplicate JavaScript values', () => {
    const source = `@use 'theme'; .light { @include theme.rv-ui-light-tokens; } .dark { @include theme.rv-ui-light-tokens; @include theme.rv-ui-dark-tokens; }`;
    const css = compileString(source, {
      loadPaths: [fileURLToPath(new URL('.', import.meta.url))],
    }).css;
    const scopes = css.match(/\.(?:light|dark)\s*\{[^}]+\}/g)!;
    expect(scopes).toHaveLength(2);
    for (const scope of scopes)
      for (const { token } of colorRoles) expect(scope).toContain(`${token}:`);
    expect(css).not.toContain('palette.$');
    expect(css).toContain('--rv-ui-accent: #2563eb');
    expect(css).toContain('--rv-ui-surface: #1f1f1f');
  });
});
