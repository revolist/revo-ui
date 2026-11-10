import { frameworkHref, currentRoute, siteHref } from './routing';
import { useEffect, useState } from 'preact/hooks';
import { cdnExamples } from './cdn-examples';
import { Highlight } from './example-source';

const guides = [
  {
    name: 'React',
    entry: '@revolist/ui/react',
    language: 'TSX',
    description:
      'Use named components with normal React state and callbacks. React owns your children and custom content. Install React and react-dom in your application.',
    code: `import { useState } from 'react';
import { Button } from '@revolist/ui/react';

export default function Example() {
  const [count, setCount] = useState(0);
  return (
    <Button rounded variant="primary" onClick={() => setCount(count + 1)}>
      Create report · {count}
    </Button>
  );
}`,
  },
  {
    name: 'Vue',
    entry: '@revolist/ui/vue',
    language: 'Vue',
    description:
      'Import named Vue components in a single-file component. Use Vue events and slots; controls with a declared model also support v-model.',
    code: `<script setup lang="ts">
import { ref } from 'vue';
import { Button } from '@revolist/ui/vue';

const count = ref(0);
</script>

<template>
  <Button rounded variant="primary" @click="count++">
    Create report · {{ count }}
  </Button>
</template>`,
  },
  {
    name: 'Angular',
    entry: '@revolist/ui/angular',
    language: 'TypeScript',
    description:
      'Import the standalone UiComponent, select a component by name, and pass its props. uiEvent exposes callback names and arguments; valueChange handles a component’s declared value model. Use rvUiSlot templates for custom content.',
    code: `import { Component } from '@angular/core';
import { UiComponent, type UiEvent } from '@revolist/ui/angular';

@Component({
  selector: 'app-report-action',
  standalone: true,
  imports: [UiComponent],
  template: \`<rv-ui component="Button"
    [props]="{ rounded: true, variant: 'primary', children: 'Create report · ' + count, onClick: click }"
    (uiEvent)="handle($event)" />\`,
})
export class ReportAction {
  count = 0;
  click = () => {};
  handle(event: UiEvent) {
    if (event.name === 'onClick') this.count++;
  }
}`,
  },
  {
    name: 'Svelte',
    entry: '@revolist/ui/svelte',
    language: 'Svelte',
    description:
      'Use the Svelte 5 UiComponent host with the component name and props. Pass callbacks in props or observe onUiEvent; onValueChange handles declared value models. Svelte snippets provide custom content.',
    code: `<script lang="ts">
import { UiComponent } from '@revolist/ui/svelte';

let count = $state(0);
</script>

<UiComponent
  component="Button"
  props={{
    rounded: true,
    variant: 'primary',
    children: 'Create report · ' + count,
    onClick: () => count++,
  }}
/>`,
  },
  {
    name: 'Preact',
    entry: '@revolist/ui/preact',
    language: 'TSX',
    description:
      'Use the components directly with Preact hooks. Configure your JSX runtime for Preact. Props, variants and callbacks are the same shared contracts used by the adapters.',
    code: `/** @jsxImportSource preact */
import { useState } from 'preact/hooks';
import { Button } from '@revolist/ui/preact';

export function Example() {
  const [count, setCount] = useState(0);
  return (
    <Button rounded variant="primary" onClick={() => setCount(count + 1)}>
      Create report · {count}
    </Button>
  );
}`,
  },
  {
    name: 'Vanilla TypeScript',
    entry: '@revolist/ui/framework',
    language: 'TypeScript',
    description:
      'Mount a catalog component into a DOM element without an application framework. Render again to update props, then destroy the mount when its host is removed. Native controller entries are also available for framework-owned controls.',
    code: `import { createFrameworkMount, uiComponents } from '@revolist/ui/framework';

const host = document.querySelector<HTMLElement>('#report-action')!;
const mount = createFrameworkMount(host, () => {});
let count = 0;

function update() {
  mount.render(uiComponents.Button, {
    rounded: true,
    variant: 'primary',
    children: 'Create report · ' + count,
    onClick: () => { count++; update(); },
  });
}
update();

// Call when your view is disposed:
// mount.destroy();`,
  },
];

export function FrameworksPage() {
  const [active, setActive] = useState(currentRoute());
  useEffect(() => {
    const update = () => setActive(currentRoute());
    window.addEventListener('hashchange', update);
    return () => window.removeEventListener('hashchange', update);
  }, []);
  const selected = guides.find(
    (guide) => guide.name.toLowerCase().replaceAll(' ', '-') === active,
  );
  return (
    <div class="framework-guide">
      <div class="component-intro">
        <span class="home-eyebrow">ONE LIBRARY. YOUR STACK.</span>
        <h1>
          {selected
            ? `${selected.name} integration`
            : 'Build with your framework.'}
        </h1>
        <p>
          The same components, styling, and interaction patterns for financial
          apps, reporting, and project management—across React, Vue, Angular,
          Svelte, Preact, and vanilla TypeScript.
        </p>
      </div>
      {!selected && (
        <>
          <section
            class="framework-setup"
            aria-labelledby="framework-setup-title"
          >
            <h2 id="framework-setup-title">Start with the shared styles</h2>
            <p>
              Add the UI package to your app, then import its stylesheet once in
              your application entry point. Keep your framework’s usual build
              setup.
            </p>
            <pre>
              <code>pnpm add @revolist/ui</code>
            </pre>
            <pre>
              <Highlight code={`import '@revolist/ui/styles.css';`} />
            </pre>
            <p>
              Choose your adapter below. These examples use the same rounded
              primary button and a local click counter. Other frameworks can use
              the vanilla mount API.
            </p>
          </section>
          <nav class="framework-jump-links" aria-label="Framework guides">
            {guides.map((guide) => (
              <a
                href={frameworkHref(guide.name.toLowerCase().replaceAll(' ', '-'))}
              >
                {guide.name}
              </a>
            ))}
          </nav>
        </>
      )}
      {guides
        .filter((guide) => guide === selected)
        .map((guide) => (
          <section
            class="framework-card"
            id={guide.name.toLowerCase().replaceAll(' ', '-')}
            key={guide.name}
          >
            <div>
              <h2>{guide.name}</h2>
              <code>{guide.entry}</code>
            </div>
            <p>{guide.description}</p>
            <details open>
              <summary>Usage example · {guide.language}</summary>
              <pre>
                <Highlight code={guide.code} />
              </pre>
            </details>
          </section>
        ))}
      <section class="framework-setup" id="browser-cdn" aria-labelledby="browser-cdn-title">
        <h2 id="browser-cdn-title">Use JavaScript from a CDN, without a build step</h2>
        <p>Load Revo UI from a URL with a standard browser import, or use a classic script and the RevoUI global. Both browser builds bundle the rendering runtime and shared utilities: no npm install, JSX compiler, import map or framework runtime is required. Modern browsers are required.</p>
        <p>The examples below target version {__UI_VERSION__}. These new browser files become available on jsDelivr and unpkg after that npm version is published. Keep JavaScript and CSS pinned to the same version; use a local HTTP server rather than opening an HTML file directly.</p>
        <h3>Browser ES module import</h3>
        <pre><Highlight code={cdnExamples(__UI_VERSION__).module} /></pre>
        <h3>Classic script tag</h3>
        <pre><Highlight code={cdnExamples(__UI_VERSION__).classic} /></pre>
        <p>For unpkg, replace the prefix with <code>https://unpkg.com/@revolist/ui@{__UI_VERSION__}</code> and keep the same file paths. Self-hosting the published files uses the same API. Call <code>mount.render</code> to update a control and <code>mount.destroy()</code> when its host view is disposed. Your labels and callbacks stay in ordinary JavaScript.</p>
        <p>The complete browser bundles include the component catalog and PDF engine. For smaller, tree-shaken application builds, use the npm framework entries above. React, Vue, Angular and Svelte adapters still require their own framework.</p>
        <h3>Optional PDF viewer setup</h3>
        <p>Also load <code>browser/pdf-viewer.css</code>. Copy <code>browser/pdf.worker.min.mjs</code> from the same package version to your own origin and pass its URL as <code>workerSrc</code>. The worker must be served over HTTP(S); a cross-origin CDN worker URL cannot be passed directly to the browser Worker constructor. Your PDF files and additional PDF assets must allow access from your page.</p>
      </section>
      <section class="framework-setup" aria-labelledby="framework-accessibility-title">
        <h2 id="framework-accessibility-title">Build accessible applications</h2>
        <p>Learn how to preserve keyboard navigation, label controls, explain errors and provide alternatives to dragging. Try live examples and review the checks your application needs before release.</p>
        <a href={siteHref('accessibility/')}>Read the accessibility guide →</a>
      </section>
      <p class="framework-lifecycle">
        Framework adapters manage their mount lifecycle. For manual mounts,
        always call destroy() when the view is removed. Styles are shared;
        application state stays in your framework.
      </p>
    </div>
  );
}
