import { cpSync, mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const gallery = fileURLToPath(new URL('../', import.meta.url));
const library = resolve(process.argv[2] ?? '../library');
const target = resolve(process.argv[3] ?? 'site');
if (existsSync(target)) throw new Error(`Build workspace already exists: ${target}`);
mkdirSync(target, { recursive: true });
const excluded = new Set(['.git', 'node_modules', 'dist', 'test-results', 'playwright-report', '.artifacts', '.pages-workspace']);
const filter = path => !excluded.has(basename(path)) && !path.endsWith('_feature.md') && basename(path) !== 'design-qa.md';
for (const name of ['ui', 'dates', 'chart-utils']) {
  const source = resolve(library, 'packages', name);
  const destination = resolve(target, 'packages', name);
  mkdirSync(destination, { recursive: true });
  cpSync(resolve(source, 'src'), resolve(destination, 'src'), { recursive: true, filter });
  cpSync(resolve(source, 'package.json'), resolve(destination, 'package.json'));
}
cpSync(gallery, resolve(target, 'apps/revo-ui'), { recursive: true, filter });
writeFileSync(resolve(target, 'package.json'), JSON.stringify({ name: 'revo-ui-pages-build', private: true, packageManager: 'pnpm@11.25.0' }, null, 2) + '\n');
writeFileSync(resolve(target, 'pnpm-workspace.yaml'), "packages:\n  - 'packages/*'\n  - 'apps/revo-ui'\n\nshamefullyHoist: true\n\nallowBuilds:\n  esbuild: true\n  '@parcel/watcher': true\n");
const lock = resolve(gallery, 'pages.pnpm-lock.yaml');
if (existsSync(lock)) cpSync(lock, resolve(target, 'pnpm-lock.yaml'));
