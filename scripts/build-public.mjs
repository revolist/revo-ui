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
import { styleEntrypoints } from './style-entrypoints.mjs';
import { compileAsync } from 'sass-embedded';
import { compile as compileSvelte } from 'svelte/compiler';
import { transform as compactJavaScript } from 'esbuild';
import {
  forwardPublicDeclaration,
  sharePdfWorker,
  compactAngularRuntime,
} from './compact-public-package.mjs';

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
run(['exec', 'vite', 'build', '--mode', 'library-unstyled']);
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
mkdirSync(resolve(output, 'presets'), { recursive: true });
cpSync(resolve(root, 'package/presets/theme.schema.json'), resolve(output, 'presets/theme.schema.json'));
for (const name of [
  'styles',
  'native-styles',
  ...styleEntrypoints.map((name) => `styles/${name}`),
]) {
  const css = await compileAsync(resolve(root, `package/${name}.scss`), {
    style: 'compressed',
  });
  mkdirSync(dirname(resolve(output, `${name}.css`)), { recursive: true });
  writeFileSync(resolve(output, `${name}.css`), css.css);
}

// Angular consumers need partial declarations and static metadata for each
// standalone component. Keep the source directory layout while pointing shared
// UI imports at the already-built public JS/types.
const angularSources = [
  'angular.ts',
  'angular-control.ts',
  'angular-adapter.ts',
];
const angularDirectory = resolve(root, 'package/angular-components');
if (existsSync(angularDirectory)) {
  angularSources.push(
    ...readdirSync(angularDirectory)
      .filter((name) => name.endsWith('.ts') && !name.endsWith('.test.ts'))
      .map((name) => `angular-components/${name}`),
  );
}
const angularFiles = angularSources.filter((name) =>
  existsSync(resolve(root, 'package', name)),
);
for (const angularOutput of [output, resolve(output, 'unstyled')]) {
  const staging = resolve(angularOutput, '.angular-source');
  mkdirSync(staging, { recursive: true });
  for (const name of angularFiles) {
    const destination = resolve(staging, name);
    mkdirSync(dirname(destination), { recursive: true });
    const sourceFile = resolve(root, 'package', name);
    const source = readFileSync(sourceFile, 'utf8').replace(
      /((?:from\s*|import\s*\(\s*)['"])(\.[^'"]+)(['"])/g,
      (match, prefix, specifier, suffix) => {
        const target = relative(
          resolve(root, 'package'),
          resolve(dirname(sourceFile), specifier),
        )
          .replaceAll('\\', '/')
          .replace(/\.js$/, '');
        if (angularFiles.includes(`${target}.ts`))
          return `${prefix}${specifier.replace(/\.js$/, '')}.js${suffix}`;
        if (angularFiles.includes(`${target}/index.ts`))
          return `${prefix}${specifier}/index.js${suffix}`;
        if (angularOutput !== output)
          forwardPublicDeclaration(output, angularOutput, target);
        const external = relative(
          dirname(destination),
          resolve(angularOutput, `${target}.js`),
        ).replaceAll('\\', '/');
        return `${prefix}${external.startsWith('.') ? external : `./${external}`}${suffix}`;
      },
    );
    writeFileSync(destination, source);
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
          declaration: angularOutput === output,
          types: [],
          rootDir: '.',
          outDir: '../angular',
        },
        angularCompilerOptions: {
          compilationMode: 'partial',
          strictInjectionParameters: true,
        },
        files: angularFiles,
      },
      null,
      2,
    ),
  );
  run(['exec', 'ngc', '-p', resolve(staging, 'tsconfig.json')]);
  rmSync(staging, { recursive: true, force: true });
  if (angularOutput !== output) {
    for (const name of angularFiles)
      forwardPublicDeclaration(
        output,
        angularOutput,
        `angular/${name.replace(/\.ts$/, '')}`,
      );
  }
  for (const name of ['angular-control', 'angular'])
    rmSync(resolve(angularOutput, `${name}.d.ts`), { force: true });
}

// Keep compiler-aware Svelte source and precompiled SSR fallbacks aligned with
// all named components. The browser build is emitted by Vite's Svelte plugin.
const svelteFiles = readdirSync(resolve(root, 'package/svelte')).filter(
  (name) => name.endsWith('.svelte'),
);
const svelteComponents = svelteFiles.filter(
  (name) => !['Mount.svelte'].includes(name),
);
for (const svelteOutput of [output, resolve(output, 'unstyled')]) {
  mkdirSync(resolve(svelteOutput, 'svelte'), { recursive: true });
  for (const name of svelteFiles) {
    const source = readFileSync(resolve(root, 'package/svelte', name), 'utf8');
    writeFileSync(resolve(svelteOutput, 'svelte', name), source);
    const declaration = resolve(root, 'package/svelte', `${name}.d.ts`);
    if (svelteOutput === output && existsSync(declaration))
      cpSync(declaration, resolve(svelteOutput, 'svelte', `${name}.d.ts`));
    if (svelteOutput !== output) {
      for (const match of source.matchAll(/from\s*['"](\.[^'"]+)['"]/g)) {
        if (match[1].endsWith('.svelte')) continue;
        const target = relative(
          resolve(root, 'package'),
          resolve(root, 'package/svelte', match[1]),
        ).replaceAll('\\', '/');
        forwardPublicDeclaration(output, svelteOutput, target);
      }
    }
    const server = compileSvelte(source, {
      generate: 'server',
      filename: name,
    });
    const code = server.js.code.replace(
      /from (['"])(\.[^'"]+)\1/g,
      (_, quote, path) =>
        `from ${quote}${path.endsWith('.svelte') ? path.replace(/\.svelte$/, '.server.js') : /\.[cm]?js$/.test(path) ? path : `${path}.js`}${quote}`,
    );
    // Keep compiler output semantics and names; discard only formatting bytes.
    // esbuild discards pure-call annotations even in whitespace-only mode.
    // Preserve annotated compiler output verbatim for downstream tree shaking.
    const compactServer = /[@#]__PURE__/.test(code)
      ? { code }
      : await compactJavaScript(code, {
          loader: 'js',
          minifyWhitespace: true,
          minifySyntax: false,
          minifyIdentifiers: false,
          treeShaking: false,
          legalComments: 'inline',
        });
    writeFileSync(
      resolve(svelteOutput, 'svelte', name.replace(/\.svelte$/, '.server.js')),
      compactServer.code,
    );
  }
  mkdirSync(resolve(svelteOutput, 'svelte-entries'), { recursive: true });
  for (const file of Object.values(source.exports).filter((file) =>
    file.startsWith('./package/svelte-entries/'),
  )) {
    const entry = file.replace('./package/', './').replace(/\.ts$/, '');
    const code = readFileSync(resolve(root, file), 'utf8');
    writeFileSync(resolve(svelteOutput, `${entry}.source.js`), code);
    writeFileSync(
      resolve(svelteOutput, `${entry}.server.js`),
      code.replace(/\.svelte(['"])/g, '.server.js$1'),
    );
  }
  for (const [entry, extension] of [
    ['svelte-source.js', '.svelte'],
    ['svelte-server.js', '.server.js'],
  ]) {
    const named = svelteComponents
      .map(
        (file) =>
          `export { default as ${file.replace(/\.svelte$/, '')} } from './svelte/${file.replace(/\.svelte$/, extension)}';`,
      )
      .join('\n');
    writeFileSync(
      resolve(svelteOutput, entry),
      `${named}\nexport { defaultPdfViewerText } from './pdf-viewer/translations.js';\nexport { createTooltipGroup, TooltipGroup } from './core/tooltip-options.js';\n`,
    );
  }
}

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
  const content = readFileSync(sourceFile, 'utf8')
    .replace(
      /export\s*\{\s*default\s+as\s+(\w+)\s*\}\s*from\s*['"][^'"]+\?raw['"];?/g,
      'export declare const $1: string;',
    )
    .replace(
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
// Upstream Preact declarations use CommonJS export assignments. Preserve that
// package scope when vendoring them inside this ESM package.
writeFileSync(resolve(preactTypes, 'package.json'), '{"type":"commonjs"}\n');

// Normalize after every declaration emitter, including bundled utilities and
// vendored Preact. Resolve directory imports to their actual index declaration.
function normalizeDeclarationImports(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const file = resolve(directory, entry.name);
    if (entry.isDirectory()) {
      normalizeDeclarationImports(file);
      continue;
    }
    if (!entry.name.endsWith('.d.ts')) continue;
    const content = readFileSync(file, 'utf8');
    const sourceFile = ts.createSourceFile(
      file,
      content,
      ts.ScriptTarget.Latest,
    );
    const edits = [];
    function visit(node) {
      const specifier =
        ts.isImportDeclaration(node) || ts.isExportDeclaration(node)
          ? node.moduleSpecifier
          : ts.isImportTypeNode(node) && ts.isLiteralTypeNode(node.argument)
            ? node.argument.literal
            : ts.isExternalModuleReference(node)
              ? node.expression
              : undefined;
      if (
        specifier &&
        ts.isStringLiteral(specifier) &&
        specifier.text.startsWith('.')
      ) {
        const target = ts.resolveModuleName(
          specifier.text,
          file,
          { moduleResolution: ts.ModuleResolutionKind.Bundler },
          ts.sys,
        ).resolvedModule?.resolvedFileName;
        if (!target || !target.endsWith('.d.ts'))
          throw new Error(
            `Cannot resolve declaration: ${specifier.text} from ${file}`,
          );
        let path = relative(dirname(file), target)
          .replaceAll('\\', '/')
          .replace(/\.d\.ts$/, '.js');
        if (!path.startsWith('.')) path = './' + path;
        edits.push({
          start: specifier.getStart(sourceFile) + 1,
          end: specifier.end - 1,
          path,
        });
      }
      ts.forEachChild(node, visit);
    }
    visit(sourceFile);
    let rewritten = content;
    for (const { start, end, path } of edits.sort((a, b) => b.start - a.start))
      rewritten = rewritten.slice(0, start) + path + rewritten.slice(end);
    writeFileSync(file, rewritten);
  }
}
normalizeDeclarationImports(output);

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
      if (file.startsWith('./package/angular-components/')) {
        const target = file
          .replace('./package/', './angular/')
          .replace(/\.ts$/, '');
        return [
          name,
          {
            types: `${target}.d.ts`,
            import: `${target}.js`,
            default: `${target}.js`,
          },
        ];
      }
      if (file.startsWith('./package/svelte-entries/')) {
        const target = file.replace('./package/', './').replace(/\.ts$/, '');
        return [
          name,
          {
            types: `${target}.d.ts`,
            svelte: `${target}.source.js`,
            browser: `${target}.js`,
            default: `${target}.server.js`,
          },
        ];
      }
      if (file.endsWith('.svelte')) {
        const target = file.replace('./package/', './');
        return [
          name,
          {
            types: `${target}.d.ts`,
            svelte: target,
            browser: target.replace(/\.svelte$/, '.js'),
            default: target.replace(/\.svelte$/, '.server.js'),
          },
        ];
      }
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
for (const name of [
  'react',
  'vue',
  'angular',
  'angular-control',
  'preact',
  'framework',
  'native',
]) {
  const original = exports[`./${name}`];
  exports[`./${name}/unstyled`] = Object.fromEntries(
    Object.entries(original).map(([condition, target]) => [
      condition,
      condition === 'types' ? target : target.replace('./', './unstyled/'),
    ]),
  );
}
exports['./svelte/unstyled'] = {
  types: './svelte.d.ts',
  svelte: './unstyled/svelte-source.js',
  browser: './unstyled/svelte.js',
  default: './unstyled/svelte-server.js',
};
for (const [name, conditions] of Object.entries(exports)) {
  if (
    (name.startsWith('./angular/') || name.startsWith('./svelte/')) &&
    !name.endsWith('/unstyled')
  ) {
    exports[`${name}/unstyled`] = Object.fromEntries(
      Object.entries(conditions).map(([condition, target]) => [
        condition,
        condition === 'types' ? target : target.replace('./', './unstyled/'),
      ]),
    );
  }
}
exports['./style-config'] = {
  types: './core/component-styles.d.ts',
  import: './core/component-styles.js',
  default: './core/component-styles.js',
};
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
exports['./presets/theme.schema.json'] = './presets/theme.schema.json';
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
sharePdfWorker(output);
await compactAngularRuntime(output);
console.log(
  `Public package prepared at ${output}; no registry publication performed.`,
);
