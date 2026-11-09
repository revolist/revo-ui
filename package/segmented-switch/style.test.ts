// @vitest-environment node
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const sharedUiStyles = readFileSync(
  new URL('../styles/_primitives.scss', import.meta.url),
  'utf8',
);

describe('SegmentedSwitch shared style contract', () => {
  it('uses the compact outer and inner heights', () => {
    expect(sharedUiStyles).toMatch(
      /\.rv-segmented-switch\s*\{[^}]*box-sizing:\s*border-box;[^}]*height:\s*37px;[^}]*padding:\s*2px;/,
    );
    expect(sharedUiStyles).toMatch(
      /\.rv-segmented-switch-item\s*\{[^}]*height:\s*31px;/,
    );
  });
});
