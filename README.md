# Revo UI — Open-source components for data-rich applications

[![npm version](https://img.shields.io/npm/v/%40revolist%2Fui?style=flat&color=2563eb)](https://www.npmjs.com/package/@revolist/ui)
[![MIT license](https://img.shields.io/github/license/revolist/revo-ui?style=flat&color=16a34a)](LICENSE)
[![Build status](https://img.shields.io/github/actions/workflow/status/revolist/revo-ui/pages.yml?branch=main&style=flat&label=build)](https://github.com/revolist/revo-ui/actions/workflows/pages.yml)
[![0 runtime dependencies](https://img.shields.io/badge/dependencies-0-16a34a?style=flat)](https://www.npmjs.com/package/@revolist/ui?activeTab=dependencies)
[![Tree-shakeable ESM](https://img.shields.io/badge/tree%20shaking-supported-16a34a?style=flat)](https://github.com/revolist/revo-ui/blob/main/package.json)
[![Component + styles (4.0.12): 25.4 KiB gzip](https://img.shields.io/badge/Component%20%2B%20styles%20(4.0.12)-25.4%20KiB%20gzip-16a34a?style=flat)](docs/bundle-size.md)

**Build data-rich applications with charts, AI chat, a PDF viewer, editable timelines, date controls, and more.**

Revo UI brings these components to React, Vue, Angular, Svelte, Preact, and vanilla TypeScript, alongside the controls and layouts needed to compose complete workflows.

Lightweight and tree-shakeable: import only the controls you use. The bundle-size badge measures the published 4.0.12 React `SvgButton` import, including automatic styles and bundled Preact; React is excluded as a peer dependency.

[Live components](https://ui.rv-grid.com/components/buttons/) · [Interactive overview](https://ui.rv-grid.com/) · [Framework guides](https://ui.rv-grid.com/frameworks/) · [RevoGrid](https://rv-grid.com/) · [Pro documentation](https://pro.rv-grid.com/)

[![Weekly planner demo showing member selection, time-grid editing, and a live daily-hours chart](docs/assets/components-demo.gif)](https://ui.rv-grid.com/)

[View a static preview](docs/assets/planner-preview.png)

## Get started

```sh
pnpm add @revolist/ui
```

For a quick start in vanilla TypeScript, add `<div id="app"></div>` to your page and render a button:

```ts
import { createFrameworkMount, uiComponents } from '@revolist/ui/framework';

const mount = createFrameworkMount(document.querySelector<HTMLElement>('#app')!, () => {});
mount.render(uiComponents.Button, {
  children: 'Create report',
  onClick: () => alert('Report created'),
});
// Call mount.destroy() when removing the view.
```

[Try the live gallery](https://ui.rv-grid.com/components/buttons/) or choose a framework guide: [React](https://ui.rv-grid.com/frameworks/react/) · [Vue](https://ui.rv-grid.com/frameworks/vue/) · [Angular](https://ui.rv-grid.com/frameworks/angular/) · [Svelte](https://ui.rv-grid.com/frameworks/svelte/) · [Preact](https://ui.rv-grid.com/frameworks/preact/) · [Vanilla TypeScript](https://ui.rv-grid.com/frameworks/vanilla-typescript/).

React, Vue, Angular and Svelte adapters automatically load their component styles. For extracted CSS, use the matching `/unstyled` entry and import shared styles once:

```ts
import '@revolist/ui/styles.css';
```

For smaller extracted stylesheets, use `styles/base.css` and only the required families. Direct Preact/native rendering also uses explicit CSS. See [automatic/extracted styles, CSP configuration and bundle-size budgets](docs/bundle-size.md).


For server-rendered applications, see the [SSR and hydration guide](docs/ssr.md) for framework recipes, initial CSS delivery, fallbacks and CSP.

## Browser JavaScript / CDN (no build step)

The standalone browser builds below use the published **4.0.12** release. Pin CSS and JavaScript to the same released version.

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@revolist/ui@4.0.12/styles.css">
<div id="report-action" class="rv-ui"></div>
<script type="module">
import { createFrameworkMount, uiComponents } from
  'https://cdn.jsdelivr.net/npm/@revolist/ui@4.0.12/browser/revo-ui.js';

const mount = createFrameworkMount(document.querySelector('#report-action'), () => {});
let count = 0;
function update() {
  mount.render(uiComponents.Button, {
    variant: 'primary',
    children: 'Create report · ' + count,
    onClick: () => { count++; update(); },
  });
}
update();
// Call mount.destroy() before removing the host view.
</script>
```

For a classic script, load `https://cdn.jsdelivr.net/npm/@revolist/ui@4.0.12/browser/revo-ui.global.js` and use `const { createFrameworkMount, uiComponents } = RevoUI` instead of the import. Both builds bundle their renderer and shared utilities; no import map or framework runtime is needed. Serve your HTML over HTTP(S) in a modern browser.

You can replace the CDN prefix with `https://unpkg.com/@revolist/ui@4.0.12`, or self-host the package files. The `unpkg` and `jsdelivr` package defaults point to the classic script. The `@revolist/ui/browser` export points to the standalone ES module. Existing npm/framework ESM entries remain available for tree-shaking; host-framework adapters still require their respective frameworks.

The complete browser bundles include the component catalog and PDF engine. PDF viewers also need `browser/pdf-viewer.css` and the matching `browser/pdf.worker.min.mjs` served from **your own origin**, with its URL supplied as `workerSrc`. Direct cross-origin CDN Worker URLs are not supported by the browser Worker constructor. Configure PDF document/asset access for your application.

See the [CDN examples in Docs](https://ui.rv-grid.com/frameworks/javascript-cdn/) for complete module and classic-script HTML and lifecycle guidance.

## Framework support

Use the same component library and shared styles across frameworks, while keeping application state in your chosen stack.

| Framework | Integration |
| --- | --- |
| <img src="src/assets/frameworks/react.svg" width="24" height="24" alt=""> React | Named components from `@revolist/ui/react`, with React state, children, and callbacks. |
| <img src="src/assets/frameworks/vue.svg" width="24" height="24" alt=""> Vue | Named components from `@revolist/ui/vue`, with events, slots, and `v-model` for controls with a declared model. |
| <img src="src/assets/frameworks/angular.svg" width="24" height="24" alt=""> Angular | Standalone `UiComponent` from `@revolist/ui/angular`, with props, events, and templates for custom content. |
| <img src="src/assets/frameworks/svelte.svg" width="24" height="24" alt=""> Svelte | Svelte 5 `UiComponent` from `@revolist/ui/svelte`, with reactive props, callbacks, and snippets. |
| <img src="src/assets/frameworks/preact.svg" width="24" height="24" alt=""> Preact | Components from `@revolist/ui/preact`, with Preact hooks and JSX. |
| <img src="src/assets/frameworks/typescript.svg" width="24" height="24" alt=""> Vanilla TypeScript | Mount components into a DOM element with `createFrameworkMount` from `@revolist/ui/framework`. |

## Components

Explore live previews, variants, and expandable code examples on the website.

- [Buttons](https://ui.rv-grid.com/components/buttons/) — Actions, icon buttons, toggles, and button groups.
- [Inputs and forms](https://ui.rv-grid.com/components/inputs-and-forms/) — Text, search, numbers, validation, and field layouts.
- [Selects and pickers](https://ui.rv-grid.com/components/selects-chips-and-resources/) — Searchable dropdowns, multiple selections, user images, and assignees.
- [Selection controls](https://ui.rv-grid.com/components/selection-controls/) — Checkboxes, switches, radio buttons, and choice chips.
- [Tabs and lists](https://ui.rv-grid.com/components/tabs-and-lists/) — Tabs, segmented controls, and selectable lists.
- [Sliders](https://ui.rv-grid.com/components/sliders/) — Single values and ranges with labels and value badges.
- [Timeline](https://ui.rv-grid.com/components/timeline-track/) — Draggable, resizable events with colors and tooltips.
- [Calendars and dates](https://ui.rv-grid.com/components/calendar-and-dates/) — Date and time pickers, ranges, and weekly planning.
- [Charts](https://ui.rv-grid.com/components/charts-and-range-selection/) — Bar, line, and area charts with tooltips and range selection.
- [Tooltip API and behavior](docs/tooltip.md) — Placement, timing groups, controlled state, rich/async content, delegation, events, and imperative methods.
- [Dialogs and tooltips](https://ui.rv-grid.com/components/dialogs-and-floating-surfaces/) — Dialogs, confirmations, popovers, and tooltips.
- [Menus and toolbars](https://ui.rv-grid.com/components/menus-and-toolbars/) — Dropdown menus, nested commands, and toolbar actions.
- [Status and feedback](https://ui.rv-grid.com/components/status-and-feedback/) — Badges, alerts, loading indicators, and empty states.
- [Layout](https://ui.rv-grid.com/components/layout/) — Panels, resizable split views, and expandable sections.
- [Pagination](https://ui.rv-grid.com/components/pagination/) — Page navigation for tables and lists.
- [Progress and rating](https://ui.rv-grid.com/components/progress-and-rating/) — Progress bars, circular indicators, and star ratings.
- [Activity messages](https://ui.rv-grid.com/components/activity-messages/) — Updates with avatars, timestamps, and actions.
- [AI assistant](https://ui.rv-grid.com/components/ai-assistant/) — Chat messages, prompts, suggestions, and task states.
- [PDF viewer](https://ui.rv-grid.com/components/pdf-viewer/) — PDF navigation, search, zoom, and download controls.
- [Color](https://ui.rv-grid.com/components/color/) — Choose a color from a palette or picker and apply shared semantic interface colors.
- [Field configurators](https://ui.rv-grid.com/components/field-configurators/) — Compose field libraries, selected-field lists, ordering, summaries, actions and drop feedback from shared pieces.
- [Formatting controls](https://ui.rv-grid.com/components/formatting-controls/) — Typography choices, icon choices, inspector sections, preview comparisons and contextual filter badges.

## Complete component reference

For individual component props and API details, see the [complete component reference](docs/component-reference.md#complete-component-reference).

## RevoGrid products

Build alongside [RevoGrid](https://rv-grid.com/), [Grid Pro](https://pro.rv-grid.com/), [Charts](https://rv-grid.com/charts/), [Pivot](https://rv-grid.com/pivot/), [Gantt](https://rv-grid.com/gantt/), [Scheduler](https://rv-grid.com/jsscheduler/), and [Kanban](https://rv-grid.com/kanban/).

## Licensing

Revo UI is [MIT licensed](LICENSE). Anyone can use, modify, and distribute it, including in commercial projects.

## Contributing

Bug reports, documentation, tests, accessibility improvements, and code contributions are welcome. See the [contributing guide](CONTRIBUTING.md) for setup, validation, and pull request guidance.

Please follow our [Code of Conduct](CODE_OF_CONDUCT.md). Report vulnerabilities privately using the [security policy](SECURITY.md).

## Develop from source

This repository contains the MIT-licensed Revo UI library and its gallery demo. No private repository access is needed.

```sh
pnpm install --frozen-lockfile
pnpm dev
pnpm --filter @revolist/ui lint
pnpm --filter @revolist/ui test
pnpm build
pnpm --filter @revolist/ui pack:public
pnpm --filter @revolist/ui test:public
pnpm build:demo
```

Library source lives directly in `package/`; the root manifest owns its public exports. The internal workspace packages in `internal/` provide date and chart utilities that are bundled into the public distribution. Gallery source lives in `src/`.

Gallery and package builds share `vite.config.ts`; library builds select `--mode library`. The npm archive uses this README. The `package/` folder contains source only. All manifests, scripts, configuration and project documentation live at the repository root. The gallery in `src/` is the demo.

Package maintainers: [UI publication and synchronized Pro releases](docs/releases.md).
