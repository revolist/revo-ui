import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';
import { build } from 'esbuild';
import { styleEntrypoints } from './style-entrypoints.mjs';

export const root = fileURLToPath(new URL('../', import.meta.url));
export const gzipBytes = (content) => gzipSync(content, { level: 9 }).length;
export const entries = {
  'react-button': ['react.js', ['SvgButton']],
  'react-controls': ['react.js', ['SvgButton', 'Input', 'Checkbox']],
  'react-all': ['react.js'],
  'native-all': ['native.js'],
};
export const limits = {
  'react-button': 18 * 1024,
  'react-controls': 19 * 1024,
  'react-all': 120 * 1024,
  'native-all': 65 * 1024,
  'styles.css': 32 * 1024,
  'styles/base.css': 8 * 1024,
  ...Object.fromEntries(
    styleEntrypoints
      .filter((name) => name !== 'base')
      .map((name) => [`styles/${name}.css`, 8 * 1024]),
  ),
};

export async function measureEntry(
  file,
  names,
  packageRoot = resolve(root, 'dist'),
) {
  return measureConsumer(
    `export ${names ? `{ ${names.join(', ')} }` : '*'} from ${JSON.stringify(resolve(packageRoot, file))};`,
  );
}

export async function measureConsumer(contents) {
  const result = await build({
    stdin: {
      contents,
      resolveDir: root,
    },
    bundle: true,
    write: false,
    minify: true,
    format: 'esm',
    platform: 'browser',
    target: 'es2022',
    treeShaking: true,
    define: { 'process.env.NODE_ENV': '"production"' },
    external: [
      'react',
      'react-dom',
      'vue',
      'svelte',
      '@angular/core',
      'pdfjs-dist',
    ],
    logLevel: 'silent',
  });
  const chunks = result.outputFiles.filter(
    (item) => !item.path.endsWith('.css'),
  );
  return {
    bytes: chunks.reduce((sum, item) => sum + item.contents.length, 0),
    gzip: chunks.reduce((sum, item) => sum + gzipBytes(item.contents), 0),
    code: chunks.map((item) => item.text).join('\n'),
  };
}

export function checkBudgets(metrics, budgets = limits) {
  const failures = [];
  for (const [name, maximum] of Object.entries(budgets)) {
    if (!metrics[name]) failures.push(`${name}: measurement missing`);
    else if (!Number.isFinite(metrics[name].gzip) || metrics[name].gzip < 0)
      failures.push(`${name}: invalid gzip measurement`);
    else if (metrics[name].gzip > maximum)
      failures.push(
        `${name}: ${metrics[name].gzip} gzip bytes exceeds ${maximum}`,
      );
  }
  if (failures.length) throw new Error(failures.join('\n'));
}

export async function measurePackage(packageRoot = resolve(root, 'dist')) {
  const metrics = {};
  for (const [name, [file, names]] of Object.entries(entries)) {
    const { bytes, gzip } = await measureEntry(file, names, packageRoot);
    metrics[name] = { bytes, gzip };
  }
  for (const name of [
    'styles.css',
    ...styleEntrypoints.map((name) => `styles/${name}.css`),
  ]) {
    const file = resolve(packageRoot, name);
    if (existsSync(file)) {
      const css = readFileSync(file);
      metrics[name] = { bytes: css.length, gzip: gzipBytes(css) };
    }
  }
  return metrics;
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  const metrics = await measurePackage();
  console.log(JSON.stringify(metrics, null, 2));
  if (!process.argv.includes('--report')) checkBudgets(metrics);
}
