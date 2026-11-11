# Bundle size and selective styles

The library provides tree-shakeable ESM exports and optional framework adapters. Preact is included in the UI implementation; React, Vue, Angular, Svelte and PDF.js remain optional peer dependencies. Import the components you use. The browser/CDN entrypoints are complete standalone builds and are not the small-import benchmark.

## Automatic React styles

React named imports include their required styles:

```ts
import { SvgButton, Calendar } from '@revolist/ui/react';
```

No CSS import is necessary for these components. Each retained adapter carries its shared base and component-family styles; unused families are tree-shaken with unused components. The existing Sass owners provide the CSS. Styles install once per document (and shadow root, when applicable), before mounting the component's contents, and stay installed across unmounts. Family order is stable regardless of mount order. Application styles remain later in the cascade so existing overrides keep working. A nonce from an existing script/style element is copied for CSP applications.

Importing or server-rendering the components does not access the DOM. The adapters mount their contents on the client, where they install their presentation before paint. React size measurements below include this automatic CSS inside the JS payload. Other framework/native adapters retain explicit stylesheet imports.

## Choosing styles for other adapters

**Angular requires an explicit global stylesheet import.** Importing `UiComponent` or `UiControlDirective` does not automatically load component CSS. Add this once in your application's `main.ts` (or import the stylesheet through your global styles configuration):

```ts
import '@revolist/ui/styles.css';
```

This also applies to Vue, Svelte, Preact and native adapters. Automatic component styles currently apply only to the named React components from `@revolist/ui/react`.

For a small application, use the base stylesheet and only the component families it renders **instead of** the aggregate stylesheet:

```ts
import '@revolist/ui/styles/base.css';
import '@revolist/ui/styles/calendar.css';
import '@revolist/ui/styles/dialogs.css';
import { SvgButton, Input, Checkbox, Calendar } from '@revolist/ui/preact';
```

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

This bundles consumer imports from the emitted distribution with pinned esbuild, ES2022, production minification and tree shaking, then measures gzip level 9. Bundled Preact and automatic React CSS are counted. Optional framework/PDF peers are external. It checks the button, three common controls, complete React/native exports, aggregate CSS, base CSS and each family. Application code, peer frameworks and separately loaded PDF.js are not included.

`pnpm test:size` is enforced by UI coverage CI after the public package checks. Limits live in `scripts/bundle-size.mjs`; missing measurements, invalid values and over-budget results fail. Limits are not rewritten automatically. `node scripts/bundle-size.mjs --report` prints measurements for investigation without updating any limit.

Baseline measured on the same source before/after this optimization (gzip level 9):

| Consumer                           | Before: JS + required aggregate CSS | After: JS including automatic CSS |
| ---------------------------------- | ----------------------------------: | --------------------------------: |
| React SvgButton                    |                        54,562 bytes |                      24,371 bytes |
| React SvgButton + Input + Checkbox |                        54,821 bytes |                      24,720 bytes |

The three-control consumer is about 55% smaller overall, without an extra CSS import. The existing aggregate stylesheet remains 28,576 gzip bytes; the optional base stylesheet is 6,782 bytes for adapters that use explicit CSS. Larger component sets include their corresponding families. Transfer compression and consumer bundler versions can change the exact result.
