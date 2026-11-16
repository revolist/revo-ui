import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import {
  existsSync,
  mkdtempSync,
  mkdirSync,
  readFileSync,
  realpathSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { gzipSync } from 'node:zlib';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import test, { after } from 'node:test';
import ts from 'typescript';
import { build } from 'esbuild';
import { compile } from 'svelte/compiler';

const root = fileURLToPath(new URL('../', import.meta.url));
const version = JSON.parse(readFileSync(join(root, 'package.json'))).version;
const archive = join(root, `artifacts/revolist-ui-${version}.tgz`);
assert(existsSync(archive), 'Run pnpm pack:public before this archive test');
const fixture = mkdtempSync(join(tmpdir(), 'revo-ui-named-frameworks-'));
after(() => rmSync(fixture, { recursive: true, force: true }));
const packageRoot = join(fixture, 'node_modules/@revolist/ui');
mkdirSync(packageRoot, { recursive: true });
execFileSync('tar', [
  '-xzf',
  archive,
  '--strip-components=1',
  '-C',
  packageRoot,
]);
const manifest = JSON.parse(readFileSync(join(packageRoot, 'package.json')));
for (const name of new Set([
  ...Object.keys(manifest.dependencies),
  ...Object.keys(manifest.peerDependencies),
  '@angular/compiler',
  '@angular/compiler-cli',
  'typescript',
  'rxjs',
  'tslib',
])) {
  // A button consumer must not need the optional PDF implementation installed.
  if (name === 'pdfjs-dist') continue;
  const installed = join(root, 'node_modules', name);
  if (!existsSync(installed)) continue;
  const target = join(fixture, 'node_modules', name);
  mkdirSync(dirname(target), { recursive: true });
  if (!existsSync(target)) symlinkSync(realpathSync(installed), target, 'dir');
}
writeFileSync(
  join(fixture, 'package.json'),
  JSON.stringify({ type: 'module', private: true }),
);

// Read names from the source contract without executing its runtime catalog.
const catalog = ts.createSourceFile(
  'catalog.ts',
  readFileSync(join(root, 'package/component-catalog.ts'), 'utf8'),
  ts.ScriptTarget.Latest,
);
const declaration = catalog.statements
  .flatMap((statement) =>
    ts.isVariableStatement(statement)
      ? [...statement.declarationList.declarations]
      : [],
  )
  .find((node) => node.name.getText(catalog) === 'uiComponents');
let object = declaration.initializer;
while (ts.isAsExpression(object) || ts.isSatisfiesExpression(object))
  object = object.expression;
const names = object.properties.map((property) => property.name.text);

function run(script) {
  const file = join(fixture, 'consumer.mjs');
  writeFileSync(file, script);
  return execFileSync(process.execPath, [file], {
    cwd: fixture,
    encoding: 'utf8',
  });
}

function angularCompile(template) {
  writeFileSync(
    join(fixture, 'angular.ts'),
    `
    import { Component } from '@angular/core';
    import { SvgButton } from '@revolist/ui/angular/svg-button';
    import { SearchInput } from '@revolist/ui/angular/search-input';
    import { Input as NativeInput } from '@revolist/ui/angular/input';
    import { Checkbox } from '@revolist/ui/angular/checkbox';
    import { CalendarPicker } from '@revolist/ui/angular/calendar-picker';
    @Component({ selector: 'named-test', imports: [SvgButton, SearchInput, NativeInput, Checkbox, CalendarPicker], template: ${JSON.stringify(template)} })
    export class App {
      count = 0;
      query = '';
      checked = false;
      buttonTarget(event: { currentTarget: HTMLButtonElement }) {}
      inputTarget(event: { currentTarget: HTMLInputElement }) {}
      numberEvent(value: number) {}
    }
  `,
  );
  writeFileSync(
    join(fixture, 'tsconfig.angular.json'),
    JSON.stringify({
      compilerOptions: {
        target: 'ES2022',
        module: 'ES2022',
        moduleResolution: 'bundler',
        experimentalDecorators: true,
        strict: true,
        skipLibCheck: true,
        outDir: './angular-out',
      },
      angularCompilerOptions: {
        strictTemplates: true,
        compilationMode: 'full',
      },
      files: ['./angular.ts'],
    }),
  );
  return execFileSync(
    process.execPath,
    [
      join(
        fixture,
        'node_modules/@angular/compiler-cli/bundles/src/bin/ngc.js',
      ),
      '-p',
      join(fixture, 'tsconfig.angular.json'),
    ],
    { cwd: fixture, encoding: 'utf8', stdio: 'pipe' },
  );
}

async function buttonBundle(framework, unstyled, selective = false) {
  const entry = `@revolist/ui/${framework}${selective ? '/svg-button' : ''}${unstyled ? '/unstyled' : ''}`;
  const exportName =
    selective && framework === 'svelte' ? 'default as SvgButton' : 'SvgButton';
  return build({
    stdin: {
      contents: `export { ${exportName} } from '${entry}';`,
      resolveDir: fixture,
      loader: 'js',
    },
    bundle: true,
    write: false,
    minify: true,
    metafile: true,
    format: 'esm',
    platform: 'browser',
    target: 'es2022',
    treeShaking: true,
    conditions: framework === 'svelte' ? ['svelte', 'browser'] : ['browser'],
    external: [
      '@angular/core',
      '@angular/common',
      'svelte',
      'svelte/*',
      ...(selective ? [] : ['pdfjs-dist', 'pdfjs-dist/*']),
    ],
    define: { 'process.env.NODE_ENV': '"production"' },
    plugins: [
      {
        name: 'published-svelte-source',
        setup(build) {
          build.onLoad({ filter: /\.svelte$/ }, ({ path }) => ({
            contents: compile(readFileSync(path, 'utf8'), {
              filename: path,
              generate: 'client',
            }).js.code,
            loader: 'js',
            resolveDir: dirname(path),
          }));
        },
      },
    ],
    logLevel: 'silent',
  });
}

test('named Angular and Svelte archive exports cover the complete catalog in both style modes', () => {
  for (const entry of [
    'angular',
    'angular/unstyled',
    'svelte',
    'svelte/unstyled',
  ]) {
    // Style modes are separate consumer applications, not duplicate Angular libraries.
    const exports = JSON.parse(
      run(`
      import '@angular/compiler';
      const module = await import(${JSON.stringify('@revolist/ui/' + entry)});
      console.log(JSON.stringify(Object.keys(module)));
    `),
    );
    for (const name of names)
      assert(exports.includes(name), `${entry} is missing ${name}`);
    assert(
      exports.includes('UiComponent'),
      `${entry} retains the existing dynamic adapter`,
    );
  }
});

test('named Svelte server components render hosts without a DOM or browser-only execution', () => {
  const output = run(`
    import assert from 'node:assert/strict';
    import { render } from 'svelte/server';
    assert.equal(typeof document, 'undefined');
    for (const entry of ['svelte', 'svelte/unstyled']) {
      const { SvgButton } = await import('@revolist/ui/' + entry);
      const html = render(SvgButton, { props: { label: 'Save', visibleLabel: 'Save' } }).body;
      assert.match(html, /data-rv-svelte-host/);
      assert(!html.includes('<button'), 'The underlying button is client mounted');
    }
    console.log('server hosts verified');
  `);
  assert.match(output, /server hosts verified/);
});

test('every selective Svelte server entry preserves named/default exports, models and handles in both style modes', () => {
  const controls = names.map((name) => ({
    name,
    slug: name
      .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
      .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
      .toLowerCase(),
  }));
  run(`
    import assert from 'node:assert/strict';
    import { render } from 'svelte/server';
    assert.equal(typeof document, 'undefined');
    for (const { name, slug } of ${JSON.stringify(controls)}) {
      for (const mode of ['', '/unstyled']) {
        const entry = '@revolist/ui/svelte/' + slug + mode;
        const module = await import(entry);
        assert.equal(module.default, module[name], entry);
        let handle;
        const selection = ['a'];
        const props = {
          label: 'Save', value: 'draft', checked: true, selected: selection,
          selectedResourceIds: selection,
          children: () => { throw new Error('Adapter snippets are browser mounted'); },
        };
        Object.defineProperty(props, 'getElement', {
          get: () => handle,
          set: (value) => { handle = value; },
        });
        const html = render(module.default, { props }).body;
        assert(html.includes('data-rv-svelte-host="' + name + '"'), entry);
        assert(!html.includes('<button') && !html.includes('<input'), entry);
        assert.equal(handle(), null, entry + ' server handle');
        assert.equal(props.value, 'draft');
        assert.equal(props.checked, true);
        assert.equal(props.selected, selection);
        assert.equal(props.selectedResourceIds, selection);
      }
    }
  `);
});

test('Svelte browser fallback exports named components without requiring the svelte condition', async () => {
  for (const entry of ['svelte', 'svelte/unstyled']) {
    const browser = manifest.exports['./' + entry].browser;
    const result = await build({
      stdin: {
        contents: `export { SvgButton } from ${JSON.stringify(resolve(packageRoot, browser))};`,
        resolveDir: fixture,
      },
      bundle: true,
      write: false,
      minify: true,
      format: 'esm',
      platform: 'browser',
      treeShaking: true,
      external: ['svelte', 'svelte/*', 'pdfjs-dist', 'pdfjs-dist/*'],
      define: { 'process.env.NODE_ENV': '"production"' },
      logLevel: 'silent',
    });
    const code = result.outputFiles.map((file) => file.text).join('\n');
    assert(
      code.includes('SvgButton'),
      `${entry} retains the requested named control`,
    );
    assert(
      !code.includes('combobox'),
      `${entry} removes Dropdown from its browser fallback`,
    );
    assert(
      !code.includes('pdfjs-dist'),
      `${entry} removes PDF runtime from its browser fallback`,
    );
  }
});

test('Angular inherited native inputs, event targets and model outputs retain their exact AOT types', () => {
  angularCompile(
    `<rv-svg-button label="Save" visibleLabel="Save" [tabIndex]="0" [aria-hidden]="false" (clickEvent)="buttonTarget($event)" />
     <rv-input (clickEvent)="inputTarget($event)" />
     <rv-search-input [value]="query" [aria-label]="'Search reports'" [placeholder]="'Find reports'" (valueChange)="query = $event" />
     <rv-checkbox [(checked)]="checked" />
     <rv-calendar-picker mode="single" />`,
  );
  assert.match(
    readFileSync(join(fixture, 'angular-out/angular.js'), 'utf8'),
    /ɵɵdefineComponent/,
  );
  for (const [template, diagnostic] of [
    ['<rv-svg-button />', /Required input.*label|label.*required/i],
    ['<rv-svg-button [label]="123" />', /number.*string|not assignable/i],
    [`<rv-svg-button label="Save" [tabIndex]="'bad'" />`, /not assignable/i],
    ['<rv-svg-button label="Save" (clickEvent)="numberEvent($event)" />', /not assignable/i],
    ['<rv-input (clickEvent)="buttonTarget($event)" />', /not assignable/i],
    ['<rv-search-input (valueChange)="count = $event" />', /string.*number|not assignable/i],
  ]) {
    assert.throws(
      () => angularCompile(template),
      (error) => {
        assert.match(String(error.stdout) + String(error.stderr), diagnostic);
        return true;
      },
      template,
    );
  }
});

test('Svelte named public declarations enforce component props without consumer Preact', () => {
  assert(!existsSync(join(fixture, 'node_modules/preact')));
  writeFileSync(
    join(fixture, 'typed.mts'),
    `
    import type { ComponentProps } from 'svelte';
    import { SvgButton, SearchInput } from '@revolist/ui/svelte';
    import SelectiveButton, { SvgButton as NamedSelectiveButton } from '@revolist/ui/svelte/svg-button';
    import { SvgButton as Unstyled } from '@revolist/ui/svelte/unstyled';
    const button: ComponentProps<typeof SvgButton> = { label: 'Save', visibleLabel: 'Save', onClick: () => {} };
    const unstyled: ComponentProps<typeof Unstyled> = button;
    const selective: ComponentProps<typeof SelectiveButton> = button;
    const namedSelective: ComponentProps<typeof NamedSelectiveButton> = button;
    // @ts-expect-error Selective entry preserves required accessible label.
    const selectiveMissing: ComponentProps<typeof SelectiveButton> = {};
    const search: ComponentProps<typeof SearchInput> = { value: '', 'aria-label': 'Search reports', placeholder: 'Find reports', disabled: false, onValueChange: (value) => { const text: string = value; } };
    // @ts-expect-error SvgButton requires an accessible label.
    const missing: ComponentProps<typeof SvgButton> = {};
    // @ts-expect-error A numeric label is invalid.
    const invalid: ComponentProps<typeof SvgButton> = { label: 123 };
    // @ts-expect-error SearchInput's callback receives text.
    const wrongEvent: ComponentProps<typeof SearchInput> = { onValueChange: (value: number) => {} };
    void [button, unstyled, selective, namedSelective, selectiveMissing, search, missing, invalid, wrongEvent];
  `,
  );
  const program = ts.createProgram([join(fixture, 'typed.mts')], {
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.NodeNext,
    moduleResolution: ts.ModuleResolutionKind.NodeNext,
    strict: true,
    skipLibCheck: true,
    noEmit: true,
    types: [],
  });
  const errors = ts.getPreEmitDiagnostics(program);
  assert.deepEqual(
    errors.map((error) =>
      ts.flattenDiagnosticMessageText(error.messageText, '\n'),
    ),
    [],
  );
});

test('a public Svelte consumer accepts model bindings and rejects binding ordinary props', () => {
  const config = join(fixture, 'tsconfig.svelte.json');
  writeFileSync(
    config,
    JSON.stringify({
      compilerOptions: {
        target: 'ES2022',
        module: 'ESNext',
        moduleResolution: 'bundler',
        strict: true,
        skipLibCheck: true,
        allowJs: true,
      },
      include: ['./consumer.svelte'],
    }),
  );
  const file = join(fixture, 'consumer.svelte');
  const check = () =>
    execFileSync(
      process.execPath,
      [
        join(root, 'node_modules/svelte-check/bin/svelte-check'),
        '--workspace',
        fixture,
        '--tsconfig',
        config,
        '--output',
        'human',
      ],
      { cwd: fixture, encoding: 'utf8', stdio: 'pipe' },
    );
  writeFileSync(
    file,
    `<script lang="ts">
    import { SvgButton, SearchInput } from '@revolist/ui/svelte';
    let query = $state('');
  </script>
  <SvgButton label="Save" visibleLabel="Save" />
  <SearchInput bind:value={query} />`,
  );
  check();
  writeFileSync(
    file,
    `<script lang="ts">
    import { SvgButton } from '@revolist/ui/svelte';
    let label = $state('Save');
  </script>
  <SvgButton bind:label />`,
  );
  assert.throws(check, (error) => {
    assert.match(
      String(error.stdout) + String(error.stderr),
      /Cannot use.*bind:.*label|not bindable|not.*bind/i,
    );
    return true;
  });
});

for (const framework of ['angular', 'svelte']) {
  for (const unstyled of [false, true]) {
    test(`${framework}/svg-button${unstyled ? '/unstyled' : ''} resolves without optional PDF dependencies or asset loaders`, async () => {
      const entry = `./${framework}/svg-button${unstyled ? '/unstyled' : ''}`;
      const mapping = manifest.exports[entry];
      assert(mapping, `${entry} must be publicly exported`);
      for (const condition of framework === 'svelte'
        ? ['types', 'svelte', 'browser', 'default']
        : ['types', 'import', 'default']) {
        assert(
          existsSync(resolve(packageRoot, mapping[condition])),
          `${entry} has an existing ${condition} target`,
        );
      }
      assert(!existsSync(join(fixture, 'node_modules/pdfjs-dist')));
      const result = await buttonBundle(framework, unstyled, true);
      const code = result.outputFiles.map((file) => file.text).join('\n');
      assert(
        !code.includes('pdfjs-dist'),
        'Selective button must never reach PDF.js',
      );
      assert(
        !code.includes('combobox'),
        'Selective button must not retain Dropdown',
      );
    });
  }
}

for (const framework of ['angular', 'svelte']) {
  for (const unstyled of [false, true]) {
    test(`${framework}${unstyled ? '/unstyled' : ''} SvgButton tree-shakes the dynamic catalog and unused components`, async (t) => {
      const result = await buttonBundle(framework, unstyled);
      const code = result.outputFiles.map((file) => file.text).join('\n');
      t.diagnostic(
        JSON.stringify({
          component: 'SvgButton',
          framework,
          unstyled,
          bytes: Buffer.byteLength(code),
          gzip: gzipSync(code, { level: 9 }).length,
        }),
      );
      assert(
        !code.includes('combobox'),
        'Dropdown implementation must be removed',
      );
      assert(!code.includes('pdfjs-dist'), 'PDF runtime must be removed');
      assert(!code.includes('.rv-ai-prompt'), 'AI styles must be removed');
      assert(
        !code.includes('.revo-calendar__header{'),
        'Calendar styles must be removed',
      );
      if (unstyled)
        assert(
          !code.includes('.rv-btn{'),
          'Unstyled entry must not embed button CSS',
        );
      else
        assert(
          code.includes('.rv-btn'),
          'Automatic entry retains its own button CSS',
        );
      const retained = Object.values(result.metafile.outputs).flatMap(
        (output) =>
          Object.entries(output.inputs)
            .filter(([, record]) => record.bytesInOutput > 0)
            .map(([path]) => path),
      );
      assert(
        !retained.some((path) =>
          /component-catalog|pdf-viewer\/|dropdown\/|ai-chat\//.test(path),
        ),
        retained.join('\n'),
      );
    });
  }
}
