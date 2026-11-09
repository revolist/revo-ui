// @vitest-environment node
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('independent calendar styles', () => {
  it('rounds ordinary hovered days without breaking connected range geometry', () => {
    const styles = readFileSync(
      new URL('./_calendar.scss', import.meta.url),
      'utf8',
    );

    expect(styles).toMatch(
      /\.revo-calendar__day:hover:not\(:disabled\):not\(\.in-range\):not\(\.in-preview\)\s*\{[^}]*border-radius:\s*7px;/s,
    );
  });
});
