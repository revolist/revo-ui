# FilterBar

Typography choices, icon choices, inspector sections, preview comparisons and contextual filter badges.

[Live examples and formatted usage](https://ui.rv-grid.com/components/filter-bar/) · [Component index](../../README.md#complete-component-reference)

Preact: `import { FilterBar } from '@revolist/ui/preact'`

React: `import { FilterBar } from '@revolist/ui/react'`

Vue: `import { FilterBar } from '@revolist/ui/vue'`

Angular/Svelte: pass `component="FilterBar"` to the framework's `UiComponent` host. See the [framework guides](https://ui.rv-grid.com/frameworks/) for state, callbacks and slots.

## Props

The table lists library-declared props. Standard inherited HTML attributes are omitted to keep the reference focused. Callback and generic types follow the installed package declarations.

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `label` | `string` | Yes | Accessible name for the filter toolbar. |
| `filters` | `readonly ActiveFilter[]` | Yes | Active filters in display order. |
| `removeLabel` | `(filter: ActiveFilter) => string` | Yes | Localized removal label for each filter. |
| `onRemove` | `((id: string) => void) \| undefined` | No | Called when a filter is removed. |
| `search` | `string \| undefined` | No | Optional controlled search text. |
| `searchLabel` | `string \| undefined` | No | Localized search name; defaults to 'Search filters'. |
| `onSearchChange` | `((value: string) => void) \| undefined` | No | Called when search text changes. |
| `clearLabel` | `string \| undefined` | No | Localized clear action label; defaults to 'Clear filters'. |
| `onClear` | `(() => void) \| undefined` | No | Called when all filters should be cleared. |
| `children` | `ComponentChildren` | No | Optional host-owned filter creation controls. |
| `preset` | `ClassPreset \| undefined` | No | Optional presentation preset. |
| `className` | `string \| undefined` | No | Additional root class names. |

## Composition

Keep controlled values and side effects in your application. Use the matching framework adapter rather than passing another framework’s VNodes through Preact callbacks. The live page groups this control with related variants and composition helpers.

This reference is generated from the local `package` library source. Rebuild it with `node scripts/generate-api.mjs`.
