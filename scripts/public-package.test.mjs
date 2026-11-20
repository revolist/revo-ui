import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import {
  existsSync,
  mkdtempSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import test, { after } from 'node:test';
import ts from 'typescript';
import { validatePublishTarget } from './publish-target.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const sourceManifest = JSON.parse(
  readFileSync(resolve(root, 'package.json'), 'utf8'),
);
const version = sourceManifest.version;
const archive = resolve(root, `artifacts/revolist-ui-${version}.tgz`);
assert.ok(existsSync(archive), 'Run pnpm pack:public before test:public');
const fixture = mkdtempSync(join(tmpdir(), 'revolist-ui-public-'));
after(() => rmSync(fixture, { recursive: true, force: true }));
execFileSync('tar', ['-xf', archive, '-C', fixture]);
const packageRoot = join(fixture, 'package');
const manifest = JSON.parse(
  readFileSync(join(packageRoot, 'package.json'), 'utf8'),
);
const modules = join(fixture, 'node_modules');
mkdirSync(join(modules, '@revolist'), { recursive: true });
symlinkSync(packageRoot, join(modules, '@revolist/ui'), 'dir');
// Resolve only declared public dependencies; no private @revolist workspace
// package is visible to the extracted archive or consumer below.
for (const name of [
  ...Object.keys(manifest.dependencies),
  ...Object.keys(manifest.peerDependencies),
  '@types/react',
  '@types/react-dom',
  '@angular/compiler',
  'react-dom',
  'happy-dom',
]) {
  const target = resolve(root, 'node_modules', name);
  if (!existsSync(target)) continue;
  const link = join(modules, name);
  mkdirSync(dirname(link), { recursive: true });
  if (!existsSync(link)) symlinkSync(target, link, 'dir');
}
function files(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory()
      ? files(join(directory, entry.name))
      : [join(directory, entry.name)],
  );
}

test('archive exposes real typed ESM/CSS exports without private dependencies or source compilers', () => {
  assert.equal(manifest.private, undefined);
  assert.equal(manifest.publishConfig.access, 'public');
  assert.equal(manifest.publishConfig.registry, 'https://registry.npmjs.org/');
  validatePublishTarget(manifest, 'https://registry.npmjs.org/', 'public');
  assert.throws(() =>
    validatePublishTarget(
      manifest,
      'https://npm.pkg.github.com/',
      'restricted',
    ),
  );
  for (const key of [
    'description',
    'author',
    'homepage',
    'repository',
    'bugs',
    'keywords',
  ]) {
    assert.deepEqual(
      manifest[key],
      sourceManifest[key],
      `Published ${key} must preserve package metadata`,
    );
  }
  assert.equal(
    manifest.repository.url,
    'https://github.com/revolist/revo-ui.git',
  );
  assert.equal(
    readFileSync(join(packageRoot, 'README.md'), 'utf8'),
    readFileSync(resolve(root, 'README.md'), 'utf8'),
  );
  assert(
    !Object.keys(manifest.exports).some((name) => name.startsWith('./demo/')),
  );
  assert.equal(manifest.license, 'MIT');
  assert.match(
    readFileSync(join(packageRoot, 'LICENSE'), 'utf8'),
    /MIT License/,
  );
  assert.equal(manifest.type, 'module');
  assert.equal(manifest.peerDependencies.preact, undefined);
  assert.equal(manifest.dependencies.preact, undefined);
  assert.equal(manifest.peerDependenciesMeta.preact, undefined);
  assert.equal(existsSync(join(modules, 'preact')), false);
  assert.ok(existsSync(join(packageRoot, '_vendor/preact/LICENSE')));
  assert.ok(!JSON.stringify(manifest.dependencies).includes('workspace:'));
  assert.ok(
    Object.keys(manifest.dependencies).every(
      (name) => !name.startsWith('@revolist/'),
    ),
  );
  for (const [name, entry] of Object.entries(manifest.exports)) {
    for (const file of typeof entry === 'string'
      ? [entry]
      : Object.values(entry)) {
      assert.ok(existsSync(join(packageRoot, file)), `${name}: ${file}`);
      assert.ok(
        !/\.tsx?$/.test(file) || file.endsWith('.d.ts'),
        `${name} must not expose TS source`,
      );
    }
  }
  for (const file of files(packageRoot)) {
    assert.ok(!/\.(?:test|spec)\./.test(file), `test shipped: ${file}`);
    if (/\.(?:js|d\.ts)$/.test(file))
      assert.doesNotMatch(
        readFileSync(file, 'utf8'),
        /(?:from\s*|import\s*\()['"]preact(?:\/[^'"]*)?['"]/,
      );
    if (/\.(?:js|d\.ts)$/.test(file))
      assert.doesNotMatch(
        readFileSync(file, 'utf8'),
        /(?:from\s*|import\s*\()['"]@revolist\/(?:dates|ui-dates|chart-utils|ui-chart-utils|data-query|ui|revogrid-pro)(?:\/[^'"]*)?['"]/,
      );
  }
  assert.match(
    readFileSync(join(packageRoot, 'styles.css'), 'utf8'),
    /\.rv-btn/,
  );
  assert.match(
    readFileSync(join(packageRoot, 'angular/angular-control.js'), 'utf8'),
    /ɵɵngDeclareDirective/,
  );
  assert.match(
    readFileSync(join(packageRoot, 'angular/angular-control.d.ts'), 'utf8'),
    /ɵdir/,
  );
});

test('every relative declaration import has an explicit resolvable file extension', () => {
  for (const file of files(packageRoot).filter((file) =>
    file.endsWith('.d.ts'),
  )) {
    const content = readFileSync(file, 'utf8');
    for (const { fileName } of ts.preProcessFile(content, true, true)
      .importedFiles) {
      if (!fileName.startsWith('.')) continue;
      assert.match(fileName, /\.js$/, `${file}: ${fileName}`);
      assert.ok(
        existsSync(resolve(dirname(file), fileName.replace(/\.js$/, '.d.ts'))),
        `${file}: ${fileName}`,
      );
    }
  }
});

test('archive excludes commercial scheduling and conditional-format rules', () => {
  for (const file of files(packageRoot)) {
    assert.doesNotMatch(
      file,
      /[/\\](?:calendars|working-days|conditional-rule)\.d\.ts$/,
    );
    if (/\.(?:js|d\.ts)$/.test(file)) {
      assert.doesNotMatch(
        readFileSync(file, 'utf8'),
        /\b(?:offsetByLagCalendar|resolveTaskEndDate|resolveTaskStartDateFromEnd|countWorkingDuration|CalendarExceptionRecurrence|CalendarEntity|resolveDurationSettings|durationToWorkingDays|formatWorkingDuration|diffInTaskDuration|moveDateTimeRange|shiftDateTimeByCalendarDays|snapDateTime|evaluateConditionalRule)\b/,
        `Commercial helper shipped: ${file}`,
      );
    }
  }
});

test('date utilities execute in Node without a DOM or private workspace packages', () => {
  const script = `
    import assert from 'node:assert/strict';
    import { addDays, diffInCalendarDays, startOfMonth, isValidIsoDate,
      formatCalendarDateDisplay } from '@revolist/ui/dates';
    assert.equal(typeof document, 'undefined');
    assert.equal(isValidIsoDate('2026-02-29'), false);
    assert.equal(addDays('2024-03-01', -1), '2024-02-29');
    assert.equal(diffInCalendarDays('2026-03-28', '2026-03-30'), 2);
    assert.equal(startOfMonth('2026-11-16'), '2026-11-01');
    assert.equal(formatCalendarDateDisplay('2026-11-16', 'fr-FR', 'America/Los_Angeles'), '16 nov. 2026');
  `;
  writeFileSync(join(fixture, 'dates-consumer.mjs'), script);
  execFileSync(process.execPath, [join(fixture, 'dates-consumer.mjs')], {
    cwd: fixture,
    stdio: 'pipe',
  });
});

test('an isolated consumer executes native, React, Vue and Svelte adapters from the archive', () => {
  const script = `
    import assert from 'node:assert/strict';
    import { Window } from 'happy-dom';
    const window = new Window();
    globalThis.window = window; globalThis.document = window.document;
    const ui = await import('@revolist/ui');
    const button = ui.createControl(document, 'button', { onClick: () => button.dataset.clicked = 'true' });
    assert.equal(button.className, 'rv-btn'); button.click(); assert.equal(button.dataset.clicked, 'true');
    const React = await import('react'); const { renderToStaticMarkup } = await import('react-dom/server');
    const { Input } = await import('@revolist/ui/react-control');
    assert.match(renderToStaticMarkup(React.createElement(Input, { type: 'checkbox', defaultChecked: true })), /rv-checkbox/);
    const { vRvControl } = await import('@revolist/ui/vue-control');
    const input = document.createElement('input'); vRvControl.beforeMount(input); assert.equal(input.className, 'rv-control');
    const { rvControl } = await import('@revolist/ui/svelte-control');
    const checkbox = document.createElement('input'); checkbox.type = 'checkbox';
    const action = rvControl(checkbox); assert.equal(checkbox.className, 'rv-checkbox'); action.destroy();
    const { UiComponent, defaultPdfViewerText } = await import('@revolist/ui/svelte');
    assert.equal(defaultPdfViewerText.open, 'Open PDF');
    const { render } = await import('svelte/server');
    const html = render(UiComponent, { props: { component: 'Button', props: {} } }).body;
    assert.match(html, /data-rv-svelte-host/);
    const { Button } = await import('@revolist/ui/react');
    assert.match(renderToStaticMarkup(React.createElement(Button, null, 'Save')), /data-rv-react-host/);
    window.happyDOM.abort();
  `;
  writeFileSync(join(fixture, 'consumer.mjs'), script);
  execFileSync(process.execPath, [join(fixture, 'consumer.mjs')], {
    cwd: fixture,
    stdio: 'pipe',
  });
});

test('an isolated TypeScript consumer resolves published declarations without workspace aliases', async (t) => {
  const allPublicTypes = Object.entries(manifest.exports)
    .filter(([, entry]) => typeof entry === 'object' && entry.types)
    .map(
      ([name], index) =>
        `import type * as PublicEntry${index} from '${manifest.name}${name === '.' ? '' : name.slice(1)}';`,
    )
    .join('\n');
  writeFileSync(
    join(fixture, 'consumer.mts'),
    allPublicTypes +
      `
    import { addDays, diffInCalendarDays, isValidIsoDate, formatCalendarDateDisplay, type ISODateString } from '@revolist/ui/dates';
    const date: ISODateString = addDays('2026-11-16', -6);
    const count: number = diffInCalendarDays(date, '2026-11-16');
    const caption: string | undefined = formatCalendarDateDisplay(date, 'fr-FR');
    const candidate: string = '2026-11-16';
    if (isValidIsoDate(candidate)) { const valid: ISODateString = candidate; void valid; }
    void [count, caption];
    import { createControl, mountAiAssistant, type ControlTag } from '@revolist/ui';
    import { createFrameworkMount, uiComponents } from '@revolist/ui/framework';
    import { Button } from '@revolist/ui/react';
    void [createFrameworkMount, uiComponents];
    // @ts-expect-error mount functions must retain their declared types
    const invalidMount: symbol = mountAiAssistant;
    // @ts-expect-error adapter components must not degrade to any
    const invalidComponent: symbol = Button;
    import { Input } from '@revolist/ui/react-control';
    import { createElement } from 'react';
    import { Dropdown, FieldGroupHeading, FieldGroup, FieldList, FieldRow, PdfViewer, PdfViewerToolbar, ProgressBar } from '@revolist/ui/react';
    import { DatePicker as ReactDatePicker } from '@revolist/ui/react';
    createElement(ReactDatePicker, { label: 'Date', openLabel: 'Choose date',
      renderTrigger: props => createElement('button', props) });
    import { themeToCss, presetProps, type UiTheme } from '@revolist/ui/presets';
    const theme: UiTheme = { version: 1, components: { Switch: { branded: { className: 'branded-switch', styles: { parts: { thumb: { 'border-radius': '50%' } } } } }, ProgressBar: { capacity: { defaults: { max: 200 } } } } };
    const compiledStyles: string = themeToCss(theme);
    void compiledStyles;
    const switchDefaults = presetProps(theme.components.Switch?.branded);
    void switchDefaults;
    createElement(ProgressBar, { ...presetProps(theme.components.ProgressBar?.capacity), value: 65, ariaLabel: 'Capacity' });
    createElement(PdfViewer, { toolbar: { buttons: { print: false } },
      renderToolbar: (_controller, _state, props) => createElement(PdfViewerToolbar, props) });
    import type { PdfViewerProps as AngularPdfProps } from '@revolist/ui/angular';
    import type { PdfViewerProps as SveltePdfProps } from '@revolist/ui/svelte';
    const pdfProps: AngularPdfProps & SveltePdfProps = { toolbar: ['search'] };
    void pdfProps;
    const dropdown = createElement(Dropdown, {
      source: [{ value: 'a', label: 'Alpha' }],
      renderOption: option => createElement('strong', null, option.label),
    });
    void dropdown;
    createElement(FieldGroupHeading, { actions: createElement('button', null, 'Add') });
    createElement(FieldGroup, { heading: createElement('strong', null, 'Heading') });
    createElement(FieldList, { empty: true, placeholder: createElement('em', null, 'Empty') });
    createElement(FieldRow, { indicator: createElement('span', null, 'Drop') });
    import { vRvControl } from '@revolist/ui/vue-control';
    import { rvControl } from '@revolist/ui/svelte-control';
    import { UiControlDirective } from '@revolist/ui/angular-control';
    const tag: ControlTag = 'button'; const button: HTMLButtonElement = createControl(document, tag);
    void [button, Input, vRvControl, rvControl, UiControlDirective];
  `,
  );
  for (const [module, moduleResolution] of [
    ['ESNext', 'bundler'],
    ['Node16', 'node16'],
    ['NodeNext', 'nodenext'],
  ]) {
    for (const skipLibCheck of [false, true]) {
      await t.test(`${moduleResolution}, skipLibCheck=${skipLibCheck}`, () => {
        writeFileSync(
          join(fixture, 'tsconfig.json'),
          JSON.stringify({
            compilerOptions: {
              target: 'ES2022',
              module,
              moduleResolution,
              strict: true,
              skipLibCheck,
              types: [],
              noEmit: true,
              lib: ['ES2022', 'DOM', 'DOM.Iterable'],
            },
            files: ['consumer.mts'],
          }),
        );
        const config = ts.readConfigFile(
          join(fixture, 'tsconfig.json'),
          ts.sys.readFile,
        );
        assert.equal(config.error, undefined);
        const parsed = ts.parseJsonConfigFileContent(
          config.config,
          ts.sys,
          fixture,
        );
        assert.deepEqual(parsed.errors, []);
        const program = ts.createProgram(parsed.fileNames, parsed.options);
        const diagnostics = ts
          .getPreEmitDiagnostics(program)
          .filter((diagnostic) => {
            // The hoisted Angular Babel 8 dev dependency leaks into Vue's own
            // declarations in this symlinked fixture. Ignore only that external
            // CJS/ESM diagnostic; every archived declaration is checked normally.
            return !(
              diagnostic.code === 1479 &&
              diagnostic.file?.fileName.includes(
                '/node_modules/@vue/compiler-core/',
              )
            );
          });
        assert.equal(
          ts.formatDiagnosticsWithColorAndContext(diagnostics, {
            getCanonicalFileName: (file) => file,
            getCurrentDirectory: () => fixture,
            getNewLine: () => '\n',
          }),
          '',
        );
      });
    }
  }
});

test('archive exposes standalone module and classic browser builds with CDN defaults', () => {
  assert.equal(manifest.unpkg, './browser/revo-ui.global.js');
  assert.equal(manifest.jsdelivr, manifest.unpkg);
  assert.equal(manifest.exports['./browser'].import, './browser/revo-ui.js');
  for (const file of ['revo-ui.js', 'revo-ui.global.js']) {
    const code = readFileSync(join(packageRoot, 'browser', file), 'utf8');
    assert.match(code, /createFrameworkMount/);
    assert.match(code, /uiComponents/);
    assert.doesNotMatch(
      code,
      /(?:from\s*|import\s*\()['"](?:preact|pdfjs-dist|@revolist\/)/,
    );
  }
  assert.match(
    readFileSync(join(packageRoot, 'browser/revo-ui.global.js'), 'utf8'),
    /RevoUI/,
  );
  for (const file of [
    'browser/pdf-viewer.css',
    'browser/pdf.worker.min.mjs',
    'browser/pdfjs-LICENSE',
  ])
    assert.ok(existsSync(join(packageRoot, file)), file);
});

test('the same exported theme works in separate React and Vue consumers', () => {
  const theme = JSON.stringify({
    version: 1,
    components: {
      Switch: {
        custom: {
          className: 'shared-switch',
          props: { labelPosition: 'after' },
          tokens: { trackWidth: '46px' },
          defaults: { disabled: true },
          styles: { parts: { thumb: { 'border-radius': '50%' } } },
        },
      },
    },
  });
  const css = '.shared-switch { --rv-ui-switch-track-on: #6d28d9; }';
  for (const framework of ['react', 'vue']) {
    const project = join(fixture, `${framework}-theme-project`);
    mkdirSync(project, { recursive: true });
    writeFileSync(join(project, 'theme.json'), theme);
    writeFileSync(join(project, 'theme.css'), css);
    const script = `
      import assert from 'node:assert/strict';
      import { readFileSync } from 'node:fs';
      import { Window } from 'happy-dom';
      const window = new Window();
      for (const name of ['window', 'document', 'HTMLElement', 'Element', 'Node', 'SVGElement', 'MutationObserver']) globalThis[name] = name === 'window' ? window : name === 'document' ? window.document : window[name];
      const theme = JSON.parse(readFileSync(new URL('./theme.json', import.meta.url)));
      const preset = theme.components.Switch.custom;
      const { themeToCss, presetProps } = await import('@revolist/ui/presets');
      const defaults = presetProps(preset);
      const generatedCss = themeToCss(theme);
      assert.match(generatedCss, /border-radius: 50%/);
      const style = document.createElement('style'); style.textContent = generatedCss + readFileSync(new URL('./theme.css', import.meta.url), 'utf8'); document.head.append(style);
      const host = document.createElement('div'); document.body.append(host);
      if (${JSON.stringify(framework)} === 'react') {
        const React = await import('react');
        const { createRoot } = await import('react-dom/client');
        const { Switch } = await import('@revolist/ui/react');
        const root = createRoot(host);
        root.render(React.createElement(Switch, { ...defaults, label: 'Enabled', checked: true, onChange() {}, disabled: false }));
        await new Promise(resolve => setTimeout(resolve, 60));
      } else {
        const { createApp, h, nextTick } = await import('vue');
        const { Switch } = await import('@revolist/ui/vue');
        createApp({ render: () => h(Switch, { ...defaults, label: 'Enabled', modelValue: true, disabled: false }) }).mount(host);
        await nextTick(); await new Promise(resolve => setTimeout(resolve, 0));
      }
      const button = host.querySelector('button');
      assert.ok(button?.classList.contains('shared-switch'));
      assert.equal(button.disabled, false);
      assert.equal(button.style.getPropertyValue('--rv-ui-switch-preset-track-width'), '46px');
      assert.equal(button.firstElementChild.getAttribute('data-part'), 'track');
      assert.match(style.textContent, /shared-switch/);
      window.happyDOM.abort();
    `;
    writeFileSync(join(project, 'consumer.mjs'), script);
    execFileSync(process.execPath, [join(project, 'consumer.mjs')], {
      cwd: project,
      stdio: 'pipe',
    });
  }
});
