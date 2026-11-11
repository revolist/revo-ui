# Bundle size and selective styles

The library provides tree-shakeable ESM exports and optional framework adapters. Preact is included in the UI implementation; React, Vue, Angular, Svelte and PDF.js remain optional peer dependencies. Import the components you use. The browser/CDN entrypoints are complete standalone builds and are not the small-import benchmark.

## Automatic styles across framework adapters

React and Vue named components, Angular `UiComponent` and `UiControlDirective`, and Svelte `UiComponent` automatically install the styles they need. No separate CSS import is necessary for these adapters:

```ts
import { SvgButton } from '@revolist/ui/react';
// Vue: import { SvgButton } from '@revolist/ui/vue';
// Angular: import { UiComponent } from '@revolist/ui/angular';
// Svelte: import { UiComponent } from '@revolist/ui/svelte';
```

Component metadata and style families belong to the shared UI layer. React installs styles in its insertion effect; all adapters prepare the owning document/shadow root before mounting the underlying UI. Styles are deduplicated per root, keep a stable family order, survive unmounts and precede application overrides. Repeated mounts reuse a root registry rather than scanning the document for each stylesheet. Existing styles are not removed while other components may need them.

Named React/Vue imports tree-shake unused components and families. Angular/Svelte select components by name from a complete catalog, so their catalog includes all available families. Future adapters using `createFrameworkMount` and the public shared components inherit the same preparation policy. Direct Preact rendering and low-level native DOM render helpers still use explicit CSS; the framework mount API prepares registered component styles automatically.

Imports and React server rendering do not insert styles or access the DOM. Styles are installed on the client before the adapter mounts its contents. Automatic styles are static, compiled from the existing Sass owners; application props are never interpolated into stylesheet text.

## Extracted CSS for production

For independently cached CSS, restrictive CSP, or applications that already load styles globally, use the matching `/unstyled` adapter and load static CSS through the application bundler:

```ts
import { SvgButton } from '@revolist/ui/react/unstyled';
import '@revolist/ui/styles/base.css';
```

The same option is available as `vue/unstyled`, `angular/unstyled`, `angular-control/unstyled`, `svelte/unstyled`, `framework/unstyled`, `preact/unstyled` and `native/unstyled`. These builds share the implementation and public types, omit embedded static component/tooltip CSS, and do not insert runtime stylesheet tags. Use one style mode consistently within an application.

For Angular, for example:

```ts
import { UiComponent } from '@revolist/ui/angular/unstyled';
// main.ts: import the aggregate once, or base plus the required families.
import '@revolist/ui/styles.css';
```

Base includes tooltip presentation. Add family styles for complex components:

```ts
import '@revolist/ui/styles/base.css';
import '@revolist/ui/styles/calendar.css';
import '@revolist/ui/styles/dialogs.css';
```

The aggregate `@revolist/ui/styles.css` remains supported for every adapter. Loading it alongside automatic styles is compatible but duplicates CSS transfer; prefer the extracted entry when managing styles yourself.

## CSP and root configuration

Automatic mode needs a nonce allowed by the application's `style-src` policy. Configure it before bootstrapping any framework:

```ts
import { configureUiStyles } from '@revolist/ui/style-config';
configureUiStyles({ nonce: serverProvidedNonce });
```

The shared configuration applies across adapters and tooltip surfaces. It is owned by a document or shadow root, including across separate entrypoint bundles. Pass that root as the second argument for iframe/shadow applications. If no nonce is configured, installation can reuse a nonce from an existing style/script element; explicit configuration avoids ambiguity when script and style nonces differ. Calling the configuration helper without a document during SSR is a no-op; never store request-specific nonces in process-global configuration.

`configureUiStyles({ mode: 'external' })` suppresses automatic insertion for applications already loading CSS, but keeps the automatic build's CSS strings in JS. Choose `/unstyled` to remove those bytes as well. Configure the mode before mounting; switching it does not remove previously installed styles. The same root configuration is used by every adapter.

Browser regressions exercise nonce-restricted automatic styles and external-only stylesheet policies for React, Vue, Angular AOT and Svelte, including tooltips. Components retain their existing dynamic layout/positioning styles; the tested policy permits inline style attributes while restricting stylesheet elements. This is not a claim that every application-specific CSP is supported without configuration.

## Stylesheet families

Import base first. It provides shared theme tokens, buttons, native fields, checkboxes and control primitives, including light/dark and accessibility states. Tooltip surfaces install their shared styles through the existing tooltip owner. Add family styles when using those components:

| Family           | Coverage                                                                     |
| ---------------- | ---------------------------------------------------------------------------- |
| `calendar.css`   | Calendar views and date selection                                            |
| `dialogs.css`    | Dialog surfaces, headers, bodies and footers                                 |
| `pickers.css`    | Resource and color pickers                                                   |
| `layout.css`     | Panels, toolbars, menus, form compositions and editor layout                 |
| `feedback.css`   | Avatars, status feedback, progress, rating, pagination and activity messages |
| `fields.css`     | Field configurators, sliders, counters, filters and time grids               |
| `charts.css`     | Cell visuals, distribution charts, brush ranges and legends                  |
| `formatting.css` | Formatting inspector and controls                                            |
| `timeline.css`   | Timeline track                                                               |
| `ai.css`         | AI assistant components                                                      |
| `pdf-viewer.css` | PDF viewer chrome; PDF.js is still a separate optional dependency            |

All families are under `@revolist/ui/styles/`. Matching `.scss` entrypoints are available for Sass consumers. These compose the existing component style owners; they do not introduce alternative themes or component classes. `native-styles.css` keeps its existing scoped native-control purpose and is not a replacement for the global base stylesheet.

## Measuring and enforcing size

Run after building the public distribution:

```sh
pnpm build:public
pnpm test:size
```

This bundles consumer imports from the emitted distribution with pinned esbuild, ES2022, production minification and tree shaking, then measures gzip level 9. Bundled Preact and automatically included component CSS are counted. Optional framework/PDF peers are external. It checks the button, three common controls, complete React/native exports, aggregate CSS, base CSS and each family. Application code, peer frameworks and separately loaded PDF.js are not included.

`pnpm test:size` is enforced by UI coverage CI after the public package checks. Limits live in `scripts/bundle-size.mjs`; missing measurements, invalid values and over-budget results fail. Limits are not rewritten automatically. `node scripts/bundle-size.mjs --report` prints measurements for investigation without updating any limit.

Measure automatic JavaScript (including embedded CSS), extracted JavaScript and required external CSS separately when comparing consumer builds. The original three-control React consumer required 26,245 gzip bytes of JavaScript plus 28,576 bytes of aggregate CSS. Exact current measurements are printed by the budget command; optional peers, application code and separately loaded PDF.js are excluded.
