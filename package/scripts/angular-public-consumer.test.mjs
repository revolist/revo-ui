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
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const uiRoot = fileURLToPath(new URL('../', import.meta.url));
const manifest = JSON.parse(readFileSync(join(uiRoot, 'package.json'), 'utf8'));

// Compile a real consumer against the archive, with only public peer/tool packages
// available. No source aliases or private @revolist dependencies enter this fixture.
test('public Angular archive compiles and preserves native template bindings', () => {
  const fixture = mkdtempSync(join(tmpdir(), 'revogrid-ui-angular-public-'));
  try {
    const ui = join(fixture, 'node_modules/@revolist/ui');
    mkdirSync(ui, { recursive: true });
    execFileSync('tar', [
      '-xzf',
      join(uiRoot, `artifacts/revolist-ui-${manifest.version}.tgz`),
      '--strip-components=1',
      '-C',
      ui,
    ]);
    const publicDependencies = Object.keys(
      JSON.parse(readFileSync(join(ui, 'package.json'), 'utf8')).dependencies,
    );
    for (const name of [
      ...publicDependencies,
      '@angular/core',
      '@angular/compiler',
      '@angular/compiler-cli',
      '@angular/platform-browser',
      'typescript',
      'rxjs',
      'tslib',
      'happy-dom',
    ]) {
      const destination = join(fixture, 'node_modules', name);
      mkdirSync(dirname(destination), { recursive: true });
      symlinkSync(
        realpathSync(join(uiRoot, 'node_modules', name)),
        destination,
        'dir',
      );
    }
    assert.equal(existsSync(join(fixture, 'node_modules/preact')), false);
    writeFileSync(
      join(fixture, 'package.json'),
      JSON.stringify({ private: true, type: 'module' }),
    );
    writeFileSync(
      join(fixture, 'tsconfig.json'),
      JSON.stringify({
        compilerOptions: {
          target: 'ES2022',
          module: 'ES2022',
          moduleResolution: 'bundler',
          experimentalDecorators: true,
          strict: true,
          skipLibCheck: true,
          outDir: './out',
        },
        angularCompilerOptions: {
          strictTemplates: true,
          compilationMode: 'full',
        },
        files: ['./main.ts'],
      }),
    );
    writeFileSync(
      join(fixture, 'main.ts'),
      `
      import { Component, signal } from '@angular/core';
      import { UiControlDirective } from '@revolist/ui/angular-control';
      import { UiComponent, UiSlotDirective } from '@revolist/ui/angular';
      @Component({ selector: 'ui-qualification', standalone: true, imports: [UiControlDirective, UiComponent, UiSlotDirective], template: \`
        <form (submit)="submitted.set(submitted() + 1); $event.preventDefault()">
          <button rvControl [disabled]="disabled()" (click)="clicks.set(clicks() + 1)">Save</button>
          <button rvControl type="submit">Submit</button>
          <input rvControl [class]="classes()" [type]="type()" [value]="value()" [checked]="checked()" (input)="inputs.set(inputs() + 1)" (change)="changes.set(changes() + 1)">
          <select rvControl><option value="one">One</option></select>
        </form>
        <rv-ui component="Dropdown" [props]="dropdownProps" (valueChange)="selected = $any($event)">
          <ng-template rvUiSlot="option" let-option="option"><strong data-public-option>{{ option.label }}</strong></ng-template>
        </rv-ui>\` })
      export class Qualification {
        selected = 'a';
        get dropdownProps() { return { source: [{ value: 'a', label: 'Alpha' }, { value: 'b', label: 'Beta' }], value: this.selected }; }

        disabled = signal(false); clicks = signal(0); submitted = signal(0);
        type = signal('text'); value = signal('Draft'); checked = signal(false);
        classes = signal('local'); inputs = signal(0); changes = signal(0);
      }
    `,
    );
    execFileSync(
      process.execPath,
      [
        join(
          fixture,
          'node_modules/@angular/compiler-cli/bundles/src/bin/ngc.js',
        ),
        '-p',
        join(fixture, 'tsconfig.json'),
      ],
      { cwd: fixture, stdio: 'pipe' },
    );
    assert.match(
      readFileSync(join(fixture, 'out/main.js'), 'utf8'),
      /ɵɵdefineComponent/,
    );
    writeFileSync(
      join(fixture, 'runtime.mjs'),
      `
      import { Window } from 'happy-dom';
      import assert from 'node:assert/strict';
      const window = new Window();
      for (const key of ['window','document','navigator','HTMLElement','HTMLInputElement','Node','Event','MouseEvent','CustomEvent','MutationObserver','requestAnimationFrame','cancelAnimationFrame','getComputedStyle']) {
        const value = key === 'window' ? window : window[key];
        Object.defineProperty(globalThis, key, { configurable: true, value: typeof value === 'function' && ['requestAnimationFrame','cancelAnimationFrame','getComputedStyle'].includes(key) ? value.bind(window) : value });
      }
      document.body.innerHTML = '<ui-qualification></ui-qualification>';
      await import('@angular/compiler');
      const { bootstrapApplication } = await import('@angular/platform-browser');
      const { Qualification } = await import('./out/main.js');
      const app = await bootstrapApplication(Qualification);
      const ref = app.components[0], component = ref.instance;
      const check = () => { ref.changeDetectorRef.detectChanges(); app.tick(); };
      check();
      const [button, submit] = document.querySelectorAll('button');
      const input = document.querySelector('input');
      assert.equal(button.className, 'rv-btn');
      assert.equal(button.type, 'button');
      assert.equal(submit.type, 'submit');
      assert.equal(input.className, 'local rv-control');
      assert.equal(input.value, 'Draft');
      button.click(); check();
      assert.equal(component.clicks(), 1);
      assert.equal(component.submitted(), 0);
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true })); check();
      assert.equal(component.inputs(), 1); assert.equal(component.changes(), 1);
      component.type.set('checkbox'); component.classes.set('updated'); component.checked.set(true); check();
      assert.equal(input.type, 'checkbox'); assert.equal(input.className, 'updated rv-checkbox'); assert.equal(input.checked, true);
      component.type.set('text'); check();
      assert.equal(input.className, 'updated rv-control');
      component.disabled.set(true); check();
      assert.equal(button.disabled, true); button.click(); check(); assert.equal(component.clicks(), 1);
      submit.click(); check(); assert.equal(component.submitted(), 1);
      assert.equal(document.querySelector('select').className, 'rv-control');
      document.querySelector('[role="combobox"]').click(); check();
      await new Promise(resolve => setTimeout(resolve, 0)); check();
      const option = [...document.querySelectorAll('[data-public-option]')].find(node => node.textContent === 'Beta');
      assert.ok(option); option.click(); check();
      assert.equal(component.selected, 'b');
      app.destroy();
      assert.equal(document.querySelector('[role="listbox"]'), null);
      console.log('PASS Angular archive: AOT template, native events, submit semantics, dynamic type/class/disabled/checked bindings');
    `,
    );
    const output = execFileSync(
      process.execPath,
      [join(fixture, 'runtime.mjs')],
      { cwd: fixture, encoding: 'utf8' },
    );
    assert.match(output, /PASS Angular archive/);
  } finally {
    rmSync(fixture, { recursive: true, force: true });
  }
});
