// @vitest-environment node
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const css = readFileSync(
  new URL('./column-type.style.css', import.meta.url),
  'utf8',
);

describe('column title overflow', () => {
  it('lets the title shrink and ellipsize while preserving its icon', () => {
    expect(css).toMatch(/\.column-type-container\s*\{[^}]*min-width:\s*0/);
    expect(css).toMatch(/\.column-icon\s*\{[^}]*flex:\s*0 0 auto/);
    expect(css).toMatch(
      /\.column-label\s*\{[^}]*min-width:\s*0[^}]*overflow:\s*hidden[^}]*text-overflow:\s*ellipsis[^}]*white-space:\s*nowrap/,
    );
  });
});
