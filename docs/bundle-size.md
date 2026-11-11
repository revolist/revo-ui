# Bundle size and selective styles

The library provides tree-shakeable ESM exports and optional framework adapters. Preact is included in the UI implementation; React, Vue, Angular, Svelte and PDF.js remain optional peer dependencies. Import the components you use. The browser/CDN entrypoints are complete standalone builds and are not the small-import benchmark.

## Choosing styles

The existing convenience import remains supported:

```ts
import '@revolist/ui/styles.css';
```

For a small application, use the base stylesheet and only the component families it renders **instead of** the aggregate stylesheet:

```ts
import '@revolist/ui/styles/base.css';
import '@revolist/ui/styles/calendar.css';
import '@revolist/ui/styles/dialogs.css';
import { SvgButton, Input, Checkbox, Calendar } from '@revolist/ui/react';
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

This bundles consumer imports from the emitted distribution with pinned esbuild, ES2022, production minification and tree shaking, then measures gzip level 9. Bundled Preact is counted. Optional framework/PDF peers are external. It checks the button, three common controls, complete React/native exports, aggregate CSS, base CSS and each family. Application code, peer frameworks and separately loaded PDF.js are not included.

`pnpm test:size` is enforced by UI coverage CI after the public package checks. Limits live in `scripts/bundle-size.mjs`; missing measurements, invalid values and over-budget results fail. Limits are not rewritten automatically. `node scripts/bundle-size.mjs --report` prints measurements for investigation without updating any limit.

Baseline measured on the same source before/after this optimization:

| Consumer                           | Before, gzip bytes | After, gzip bytes |
| ---------------------------------- | -----------------: | ----------------: |
| React SvgButton                    |             25,986 |            17,209 |
| React SvgButton + Input + Checkbox |             26,245 |            17,534 |
| Existing aggregate styles          |             28,576 |            28,576 |
| Optional base styles               |                  — |             6,782 |

For those three controls, choosing base CSS reduces combined JS/CSS from about 53.5 KiB to 23.7 KiB gzipped. Larger component sets need their corresponding families. Transfer compression and consumer bundler versions can change the exact result.
