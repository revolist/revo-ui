# Server rendering and hydration

Revo UI can be used inside server-rendered applications. Its React, Vue, Angular `UiComponent` and Svelte adapters mount the interactive shared UI **in the browser**. They do not render the complete controls into the server response.

Use the host framework to render your page content and a stable loading/fallback region. Load static UI CSS through the application's stylesheet pipeline, then let the adapter mount inside its own host after browser initialization.

## What the server renders

| Entry                        | Server behavior                                                                               | Browser behavior                                                         |
| ---------------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `@revolist/ui/react`         | React renders the adapter's host elements; effects do not mount the underlying control.       | The adapter prepares styles and mounts the control during client commit. |
| `@revolist/ui/vue`           | Vue renders the adapter host without the mounted shared control.                              | The adapter mounts after its host exists.                                |
| `@revolist/ui/angular`       | `UiComponent` skips its shared mount outside the browser platform.                            | Angular creates the shared mount after the view initializes.             |
| `@revolist/ui/svelte`        | The server component renders its host; `onMount` does not run.                                | The client component mounts the shared UI.                               |
| Matching `/unstyled` entries | Same host/component behavior, with no embedded static UI CSS or runtime stylesheet insertion. | The application must supply CSS.                                         |

“SSR-compatible imports” does not mean complete control HTML, server-side interactivity, or automatic collection of CSS into the response. Importing static CSS does not change what an adapter renders. The application remains responsible for meaningful initial text, SEO content and any no-JavaScript experience.

Angular's `UiControlDirective` is a separate native-element path: Angular owns the actual `<button>`, `<input>` and other native markup. For server-rendered native controls, supply global CSS through Angular's build configuration. Do not infer `rv-ui` catalog rendering behavior from native elements decorated with `rvControl`.

## Recommended production setup

1. Keep SSR enabled for the application and its page content.
2. Use the matching `/unstyled` adapter for extracted CSS.
3. Import the aggregate stylesheet or base plus the required families from a global entry/layout included by the SSR framework.
4. Put the interactive adapter behind the framework's client boundary or a mounted-state gate when providing a fallback.
5. Render the same fallback on the server and on the client's first render. Reserve suitable space until the control mounts.

For example, an extracted button needs:

```ts
import { SvgButton } from '@revolist/ui/react/unstyled';
// Import CSS in the application's global stylesheet/layout entry.
import '@revolist/ui/styles/base.css';
```

The equivalent entries are `vue/unstyled`, `angular/unstyled`, `angular-control/unstyled` and `svelte/unstyled`. Base includes common controls and tooltips. Add `styles/calendar.css`, `styles/dialogs.css` and other [style families](bundle-size.md#stylesheet-families) for the components you render, or use `@revolist/ui/styles.css` for the complete collection.

The SSR framework's bundler handles CSS extraction and stylesheet references in the response. Do not add a raw CSS import to an unbundled Node.js script: Node does not provide a CSS loader. Keep server and client package versions aligned and use one style mode consistently in the application.

## React and Next.js App Router

Use a Client Component for the adapter, event handlers and React hooks. In Next.js, `'use client'` establishes that module boundary; it does **not** mean the component is excluded from server prerendering. Keep server data fetching and static page content in Server Components.

Load CSS in the root layout:

```tsx
// app/layout.tsx
import type { ReactNode } from 'react';
import '@revolist/ui/styles/base.css';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

Provide a matching server/initial-client fallback and mount the control after hydration:

```tsx
// app/report-action.tsx
'use client';

import { useEffect, useState } from 'react';
import { SvgButton } from '@revolist/ui/react/unstyled';

export default function ReportAction() {
  const [mounted, setMounted] = useState(false);
  const [count, setCount] = useState(0);
  useEffect(() => setMounted(true), []);

  return (
    <div style={{ minHeight: 32 }} aria-busy={!mounted}>
      {mounted ? (
        <SvgButton
          label="Save"
          visibleLabel={`Save ${count}`}
          onClick={() => setCount((value) => value + 1)}
        />
      ) : (
        <button type="button" disabled>
          Save
        </button>
      )}
    </div>
  );
}
```

Import `ReportAction` into a Server Component page as usual. The mounted-state gate is for the fallback; the adapter itself can also prerender its empty host without this gate. Do not pass event-handler functions across a Server Component boundary: define them in the Client Component. Pass only values your framework can serialize.

For other React SSR systems, load CSS from their global entry, render the same initial tree on server/client and use their normal hydration entry. Do not render raw Preact control HTML and try to hydrate it as a React adapter host.

## Vue and Nuxt

In Nuxt, load CSS globally so it is available even when the control is inside `ClientOnly`:

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  css: ['@revolist/ui/styles/base.css'],
});
```

```vue
<!-- app/components/ReportAction.vue -->
<script setup lang="ts">
import { ref } from 'vue';
import { SvgButton } from '@revolist/ui/vue/unstyled';
const count = ref(0);
</script>

<template>
  <SvgButton label="Save" :visible-label="`Save ${count}`" @click="count++" />
</template>
```

```vue
<!-- app/pages/index.vue -->
<template>
  <div style="min-height: 32px">
    <ClientOnly>
      <ReportAction />
      <template #fallback
        ><button type="button" disabled>Save</button></template
      >
    </ClientOnly>
  </div>
</template>
```

Adjust the source directory for your Nuxt project. `ClientOnly` renders the fallback on the server and replaces it after client mount. Its default-slot dependencies can be excluded from the server build, so do not rely on a CSS import located only inside that slot to deliver initial CSS.

For plain Vue SSR, use a wrapper with `const mounted = ref(false)` and `onMounted(() => { mounted.value = true; })`, with the same `v-if` fallback on server and initial client render. Keep CSS in the application's global entry and use Vue's normal hydration process.

## Angular SSR and hydration

Keep Angular's SSR/hydration configuration. Load static styles through the CLI's global styles list. Append these entries to the existing `build.options.styles` configuration rather than replacing application styles:

```json
{
  "styles": ["src/styles.scss", "node_modules/@revolist/ui/styles/base.css"]
}
```

Use `@revolist/ui/styles.css` instead of base for all component families. Add the needed family files when using base alone. The files are resolved from the installed package; keep normal Angular build and production linking enabled.

A mounted-state gate provides an Angular-owned fallback and initializes the catalog host after browser rendering:

```ts
// report-action.component.ts
import { afterNextRender, Component, signal } from '@angular/core';
import { UiComponent } from '@revolist/ui/angular/unstyled';

@Component({
  selector: 'app-report-action',
  standalone: true,
  imports: [UiComponent],
  template: `
    <div style="min-height: 32px" [attr.aria-busy]="!mounted()">
      @if (mounted()) {
        <rv-ui
          component="SvgButton"
          [props]="{
            label: 'Save',
            visibleLabel: 'Save ' + count(),
            onClick: save,
          }"
        />
      } @else {
        <button type="button" disabled>Save</button>
      }
    </div>
  `,
})
export class ReportAction {
  readonly mounted = signal(false);
  readonly count = signal(0);
  readonly save = () => this.count.update((value) => value + 1);

  constructor() {
    afterNextRender(() => this.mounted.set(true));
  }
}
```

`afterNextRender` initializes the client region without accessing `window` or `document` in a server-executed template. Keep this post-render gate for an SSR/hydrated Angular integration unless you have separately verified its DOM ownership and hydration behavior. `UiComponent` also checks the Angular platform before creating its shared mount, but a browser-platform check alone is not a guarantee that arbitrary imperative DOM work is hydration-safe. It does not itself prerender the catalog control's HTML.

## SvelteKit and Svelte 5

Import CSS from the root layout so the SSR build sees it:

```svelte
<!-- src/routes/+layout.svelte -->
<script lang="ts">
  import '@revolist/ui/styles/base.css';
  let { children } = $props();
</script>

{@render children()}
```

Keep page SSR enabled and use `onMount` for a stable fallback:

```svelte
<!-- src/routes/+page.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { UiComponent } from '@revolist/ui/svelte/unstyled';
  let mounted = $state(false);
  let count = $state(0);
  onMount(() => { mounted = true; });
</script>

<div style="min-height: 32px" aria-busy={!mounted}>
  {#if mounted}
    <UiComponent component="SvgButton" props={{
      label: 'Save',
      visibleLabel: `Save ${count}`,
      onClick: () => { count += 1; },
    }} />
  {:else}
    <button type="button" disabled>Save</button>
  {/if}
</div>
```

`onMount` does not run on the server. The package provides a Svelte source condition and server/client fallbacks; let the normal SvelteKit resolver choose them. Do not force the browser bundle into a server build. Disabling SSR for the whole application is not required to mount these controls.

## Automatic styles and CSP

Automatic adapters can also be used in SSR applications: use the normal framework entry instead of `/unstyled` and omit the explicit UI CSS imports. In that mode, CSS arrives with client JavaScript and is installed when controls mount. It is not collected into the initial response by `configureUiStyles`.

For a nonce-based policy, generate the nonce per response, authorize it in that response's CSP header and safely deliver the corresponding value to the browser. Configure it **before** hydrating/bootstrapping the UI, in the client entry or a framework client plugin that runs before child components mount:

```ts
import { configureUiStyles } from '@revolist/ui/style-config';

// Client bootstrap: application/server integration must supply this meta tag
// with an HTML-escaped nonce that matches this response's style-src policy.
if (typeof document !== 'undefined') {
  const nonce = document.querySelector<HTMLMetaElement>(
    'meta[name="ui-style-nonce"]',
  )?.content;
  if (nonce) configureUiStyles({ nonce });
}
```

Do not postpone nonce configuration to `useEffect`, `onMounted` or a child component mount: automatic styles may already have been inserted. For frameworks without an application-controlled pre-hydration entry, prefer `/unstyled` and let the framework deliver CSS and manage its own CSP. For example, a Nuxt client plugin or Angular browser `main.ts` can configure the nonce before components mount; a Next.js application can use extracted CSS from its root layout.

Calling `configureUiStyles` without a browser document is a **no-op**: it returns without inserting styles, collecting CSS or retaining configuration for the later browser session. A server-side call does not transfer a nonce to the client. Explicitly targeting a server-owned document configures only that document; it is not a CSS extraction or serialization API.

Do not keep request nonces in a process-global variable or cache rendered responses across different nonces without updating the associated CSP/HTML. The host framework remains responsible for its own script/style nonces and hydration serialization. Revo UI configuration applies to Revo UI's styles and tooltips.

Use `/unstyled` plus external CSS for a policy that forbids injected stylesheet elements. No nonce configuration is needed for Revo UI stylesheet insertion in that mode because it does not insert those tags. Your application must still authorize its CSS origin and the components' existing dynamic layout styles. The tested policies permit inline style attributes while restricting stylesheet elements; do not assume that every stricter application policy works unchanged.

## Vanilla mounts and future adapters

Call `createFrameworkMount` only in a browser lifecycle after the host element exists; call `destroy()` when the owning view is disposed. Do not call it at server module scope. Future adapters should use the shared mount API and public shared components so they inherit style preparation, then leave the host region empty or show a host-framework-owned fallback until mounting.

Direct Preact rendering and low-level native helpers have their own rendering contracts. The framework adapter's empty-host SSR behavior is not a promise that every imperative/native helper can execute against a server document. Import their required CSS explicitly and keep DOM operations in the browser unless that helper explicitly documents server rendering.

## Troubleshooting and verification

| Symptom                                            | Check                                                                                                                                                                          |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `/unstyled` is not exported                        | Verify the installed package version includes these entrypoints, and use the same version for server and client builds.                                                        |
| Server reports `document` or `window` is undefined | Move application DOM work and imperative mounts out of server module scope. Importing a CSS file in raw Node also needs a bundler/CSS loader.                                  |
| Server HTML contains an empty adapter host         | Expected for these adapters. Render important static content and a fallback in the host framework.                                                                             |
| CSS is absent from the first response              | Put extracted CSS in a global entry/layout; automatic styling and client-only component imports do not collect server CSS.                                                     |
| Controls are unstyled after mount                  | Verify the `/unstyled` build has base plus required families, or that automatic mode has a valid CSP nonce. Inspect CSP violations.                                            |
| Hydration warnings                                 | Keep server/initial-client data and placeholders identical. Avoid generating browser-only values during the server render, and do not mix raw control HTML with adapter hosts. |
| The page jumps when controls appear                | Reserve appropriate space around the client region and load CSS globally. Choose dimensions suitable for your component and responsive layout.                                 |

The library verifies DOM-free React import/server rendering, public package consumers, Svelte server entry resolution, framework browser behavior and automatic/extracted CSP modes, including an Angular AOT production-linked browser fixture. These checks do not constitute end-to-end builds of every Next.js, Nuxt, Angular SSR or SvelteKit application. Verify your application's production server response, hydration, fallback, CSP and browser console with its chosen framework version.

Framework references: [Next.js Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components), [Next.js CSS](https://nextjs.org/docs/app/getting-started/css), [Nuxt ClientOnly](https://nuxt.com/docs/4.x/api/components/client-only), [Angular SSR](https://angular.dev/guide/ssr), [Angular afterNextRender](https://angular.dev/api/core/afterNextRender), [Svelte lifecycle](https://svelte.dev/docs/svelte/lifecycle-hooks).
