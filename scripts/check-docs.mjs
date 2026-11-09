import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const gallery = fileURLToPath(new URL('../', import.meta.url));
const library = resolve(process.argv[2] ?? gallery);
const source = readFileSync(resolve(library, 'package/component-catalog.ts'), 'utf8');
const names = [...source.matchAll(/^  (\w+): /gm)].map(match => match[1]);
const readme = readFileSync(resolve(gallery, 'README.md'), 'utf8');
const reference = readFileSync(resolve(gallery, 'docs/component-reference.md'), 'utf8');
assert.ok(names.length > 100, 'Component catalog must be discovered');
for (const name of names) {
  assert.ok(reference.includes(`[${name}](api/${name}.md)`), `Missing documentation reference: ${name}`);
  assert.ok(existsSync(resolve(gallery, `docs/api/${name}.md`)), `Missing API page: ${name}`);
}
assert.match(reference, /@revolist\/ui\/select/);
const pages = JSON.parse(readFileSync(resolve(gallery, 'src/pages.json'), 'utf8'));
const families = new Set(pages.components.map(page => page.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')));
for (const match of (readme + reference).matchAll(/https:\/\/ui\.rv-grid\.com\/components\/([a-z-]+)\//g)) {
  assert.ok(families.has(match[1]), `Missing gallery family: ${match[1]}`);
}
assert.match(readme, /https:\/\/rv-grid\.com\//);
assert.match(readme, /https:\/\/pro\.rv-grid\.com\//);
console.log(`Documentation references cover all ${names.length} catalog components, the JSX Select adapter, and valid gallery pages.`);
