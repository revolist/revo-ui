import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import ts from 'typescript';
import { compileAsync } from 'sass-embedded';
import { compile as compileSvelte } from 'svelte/compiler';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = resolve(root, 'dist');
const source = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'));
function run(args) {
  const result = spawnSync('pnpm', args, {
    cwd: root,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });
  if (result.status !== 0)
    throw new Error(`pnpm ${args.join(' ')} failed (${result.status})`);
}
run(['exec', 'vite', 'build', '--mode', 'library']);
run(['exec', 'vite', 'build', '--mode', 'browser']);

// Preserve every Sass/CSS export, including its relative imports, and also offer
// compiled CSS so ordinary consumers don't need a Sass toolchain.
function copyStyles(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const file = resolve(directory, entry.name);
    if (entry.isDirectory()) copyStyles(file);
    else if (/\.(?:scss|css|svg|woff2?)$/.test(entry.name)) {
      const target = resolve(output, relative(resolve(root, 'package'), file));
      mkdirSync(dirname(target), { recursive: true });
      cpSync(file, target);
    }
  }
}
copyStyles(resolve(root, 'package'));
for (const name of ['styles', 'native-styles']) {
  const css = await compileAsync(resolve(root, `package/${name}.scss`), {
    style: 'compressed',
  });
  writeFileSync(resolve(output, `${name}.css`), css.css);
}

// Angular consumers need partial declarations and static ɵdir metadata, not a
// generic JS decorator transform. Compile against the already-emitted UI types.
const staging = resolve(output, '.angular-source');
mkdirSync(staging, { recursive: true });
for (const name of ['angular-control', 'angular']) {
  writeFileSync(
    resolve(staging, `${name}.ts`),
    readFileSync(resolve(root, `package/${name}.ts`), 'utf8')
      .replaceAll("'./control-attributes'", "'../control-attributes.js'")
      .replaceAll("'./framework'", "'../framework.js'")
      .replace(/'\.\/pdf-viewer\/([^']+)'/g, "'../pdf-viewer/$1.js'"),
  );
}
writeFileSync(
  resolve(staging, 'tsconfig.json'),
  JSON.stringify(
    {
      compilerOptions: {
        target: 'ES2022',
        module: 'ES2022',
        moduleResolution: 'bundler',
        strict: true,
        skipLibCheck: true,
        experimentalDecorators: true,
        declaration: true,
        types: [],
        rootDir: '.',
        outDir: '../angular',
      },
      angularCompilerOptions: {
        compilationMode: 'partial',
        strictInjectionParameters: true,
      },
      files: ['angular-control.ts', 'angular.ts'],
    },
    null,
    2,
  ),
);
run(['exec', 'ngc', '-p', resolve(staging, 'tsconfig.json')]);
rmSync(staging, { recursive: true, force: true });
// Remove the non-Angular declaration emitted by the general TS pass.
for (const name of ['angular-control', 'angular'])
  rmSync(resolve(output, `${name}.d.ts`), { force: true });

// Preserve Svelte source for compiler-aware consumers and provide precompiled
// browser/server fallbacks for bundlers that do not resolve the svelte condition.
const svelteSource = readFileSync(
  resolve(root, 'package/svelte/UiComponent.svelte'),
  'utf8',
);
mkdirSync(resolve(output, 'svelte'), { recursive: true });
writeFileSync(resolve(output, 'svelte/UiComponent.svelte'), svelteSource);
const server = compileSvelte(svelteSource, {
  generate: 'server',
  filename: 'UiComponent.svelte',
});
writeFileSync(
  resolve(output, 'svelte/UiComponent.server.js'),
  server.js.code.replace(
    /from '(\.\.\/[^']+)'/g,
    (_, path) => `from '${path}.js'`,
  ),
);
writeFileSync(
  resolve(output, 'svelte-server.js'),
  "export { default as UiComponent } from './svelte/UiComponent.server.js';\nexport { defaultPdfViewerText } from './pdf-viewer/index.js';\n",
);
writeFileSync(
  resolve(output, 'svelte-source.js'),
  "export { default as UiComponent } from './svelte/UiComponent.svelte';\nexport { defaultPdfViewerText } from './pdf-viewer/index.js';\n",
);

// Public declarations must resolve without a consumer installation of Preact.
// Copy only reachable declarations, preserving their upstream license.
const require = createRequire(import.meta.url);
const pdfRoot = dirname(require.resolve('pdfjs-dist/package.json'));
cpSync(
  resolve(pdfRoot, 'build/pdf.worker.min.mjs'),
  resolve(output, 'browser/pdf.worker.min.mjs'),
);
for (const name of ['LICENSE', 'NOTICE'])
  if (existsSync(resolve(pdfRoot, name)))
    cpSync(resolve(pdfRoot, name), resolve(output, `browser/pdfjs-${name}`));
const preactRoot = dirname(require.resolve('preact/package.json'));
const preactTypes = resolve(output, '_vendor/preact');
const copiedTypes = new Set();
function bundlePreactTypes(sourceFile, targetFile, vendor = false) {
  if (copiedTypes.has(targetFile)) return;
  copiedTypes.add(targetFile);
  const content = readFileSync(sourceFile, 'utf8').replace(
    /((?:from\s*|import\s*\(\s*)['"])([^'"]+)(['"])/g,
    (match, prefix, specifier, suffix) => {
      if (
        !/^preact(?:\/|$)/.test(specifier) &&
        !(vendor && specifier.startsWith('.'))
      )
        return match;
      const resolved = ts.resolveModuleName(
        specifier,
        sourceFile,
        {
          moduleResolution: ts.ModuleResolutionKind.Bundler,
        },
        ts.sys,
      ).resolvedModule?.resolvedFileName;
      if (!resolved || !resolved.startsWith(preactRoot + '/'))
        throw new Error(
          `Cannot bundle Preact type: ${specifier} from ${sourceFile}`,
        );
      const target = resolve(preactTypes, relative(preactRoot, resolved));
      bundlePreactTypes(resolved, target, true);
      let path = relative(dirname(targetFile), target)
        .replaceAll('\\', '/')
        .replace(/\.d\.ts$/, '');
      if (!path.startsWith('.')) path = './' + path;
      return prefix + path + suffix;
    },
  );
  mkdirSync(dirname(targetFile), { recursive: true });
  writeFileSync(targetFile, content);
}
function rewriteDeclarations(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const file = resolve(directory, entry.name);
    if (file === resolve(output, '_vendor')) continue;
    if (entry.isDirectory()) rewriteDeclarations(file);
    else if (entry.name.endsWith('.d.ts')) bundlePreactTypes(file, file);
  }
}
rewriteDeclarations(output);
mkdirSync(preactTypes, { recursive: true });
cpSync(resolve(preactRoot, 'LICENSE'), resolve(preactTypes, 'LICENSE'));

const exports = Object.fromEntries(
  Object.entries(source.exports)
    .filter(([name]) => !name.startsWith('./demo/'))
    .map(([name, file]) => {
      if (name === './svelte')
        return [
          name,
          {
            types: './svelte.d.ts',
            svelte: './svelte-source.js',
            browser: './svelte.js',
            default: './svelte-server.js',
          },
        ];
      if (name === './angular-control' || name === './angular')
        return [
          name,
          {
            types: `./angular/${name.slice(2)}.d.ts`,
            import: `./angular/${name.slice(2)}.js`,
            default: `./angular/${name.slice(2)}.js`,
          },
        ];
      const target = file.replace('./package/', './');
      return [
        name,
        /\.tsx?$/.test(target)
          ? {
              types: target.replace(/\.tsx?$/, '.d.ts'),
              import: target.replace(/\.tsx?$/, '.js'),
              default: target.replace(/\.tsx?$/, '.js'),
            }
          : target,
      ];
    }),
);
exports['./browser'] = {
  types: './browser.d.ts',
  import: './browser/revo-ui.js',
  default: './browser/revo-ui.js',
};
exports['./browser/revo-ui.js'] = './browser/revo-ui.js';
exports['./browser/revo-ui.global.js'] = './browser/revo-ui.global.js';
exports['./browser/pdf-viewer.css'] = './browser/pdf-viewer.css';
exports['./browser/pdf.worker.min.mjs'] = './browser/pdf.worker.min.mjs';
exports['./styles.css'] = './styles.css';
exports['./native-styles.css'] = './native-styles.css';
exports['./package.json'] = './package.json';
const dependencies = Object.fromEntries(
  Object.entries(source.dependencies).filter(
    ([name]) => !name.startsWith('@revolist/'),
  ),
);
const manifest = {
  name: source.name,
  version: source.version,
  type: 'module',
  description: source.description,
  author: source.author,
  homepage: source.homepage,
  repository: source.repository,
  bugs: source.bugs,
  keywords: source.keywords,
  license: source.license,
  publishConfig: { registry: 'https://registry.npmjs.org/', access: 'public' },
  main: './native.js',
  module: './native.js',
  unpkg: './browser/revo-ui.global.js',
  jsdelivr: './browser/revo-ui.global.js',
  types: './native.d.ts',
  exports,
  sideEffects: source.sideEffects,
  dependencies,
  peerDependencies: Object.fromEntries(
    Object.entries(source.peerDependencies).filter(
      ([name]) => name !== 'preact',
    ),
  ),
  // Preact is bundled; only consumer framework adapters remain optional peers.
  peerDependenciesMeta: Object.fromEntries(
    Object.entries(source.peerDependenciesMeta).filter(
      ([name]) => name !== 'preact',
    ),
  ),
};
writeFileSync(
  resolve(output, 'package.json'),
  JSON.stringify(manifest, null, 2) + '\n',
);
cpSync(resolve(root, 'README.md'), resolve(output, 'README.md'));
for (const name of ['OWNERSHIP.md', 'MIGRATION.md', 'LICENSE'])
  if (existsSync(resolve(root, name)))
    cpSync(resolve(root, name), resolve(output, name));
console.log(
  `Public package prepared at ${output}; no registry publication performed.`,
);
