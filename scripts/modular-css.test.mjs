import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { root } from './bundle-size.mjs';
import { styleEntrypoints } from './style-entrypoints.mjs';

test('published CSS includes small opt-in base, calendar and dialog entrypoints alongside the aggregate', () => {
  const manifest = JSON.parse(
    readFileSync(resolve(root, 'dist/package.json'), 'utf8'),
  );
  for (const name of styleEntrypoints) {
    assert.equal(
      manifest.exports[`./styles/${name}.css`],
      `./styles/${name}.css`,
    );
    assert(existsSync(resolve(root, 'dist/styles', `${name}.css`)));
  }
  assert.equal(manifest.exports['./styles.css'], './styles.css');
});

test('base CSS excludes heavyweight families while providing themed controls', () => {
  const css = readFileSync(resolve(root, 'dist/styles/base.css'), 'utf8');
  for (const selector of [
    '.rv-btn',
    '.rv-control',
    '.rv-checkbox',
    '[data-theme',
  ])
    assert(css.includes(selector), selector);
  for (const selector of [
    '.revo-calendar__header{',
    '.rv-dialog__surface{',
    '.rv-ai-prompt',
    '.rv-pdf-viewer__toolbar',
    '.rv-timeline-track__event',
  ])
    assert(!css.includes(selector), selector);
});
