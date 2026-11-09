# FilterBadge

Typography choices, icon choices, inspector sections, preview comparisons and contextual filter badges.

[Live examples and formatted usage](https://ui.rv-grid.com/components/formatting-controls/) · [Component index](../../README.md#complete-component-reference)

Preact: `import { FilterBadge } from '@revolist/ui/preact'`

React: `import { FilterBadge } from '@revolist/ui/react'`

Vue: `import { FilterBadge } from '@revolist/ui/vue'`

Angular/Svelte: pass `component="FilterBadge"` to the framework's `UiComponent` host. See the [framework guides](https://ui.rv-grid.com/frameworks/) for state, callbacks and slots.

## Props

The table lists library-declared props. Standard inherited HTML attributes are omitted to keep the reference focused. Callback and generic types follow the installed package declarations.

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `className` | `string \| undefined` | No |  |
| `role` | `"listitem" \| undefined` | No |  |
| `removeLabel` | `string \| undefined` | No |  |
| `onRemove` | `(() => void) \| undefined` | No |  |
| `removeClassName` | `string \| undefined` | No |  |
| `label` | `ComponentChildren` | Yes |  |
| `color` | `string \| undefined` | No |  |
| `details` | `string \| undefined` | No |  |
| `detailsLabel` | `string \| undefined` | No |  |
| `descriptionId` | `string \| undefined` | No |  |

## Composition

Keep controlled values and side effects in your application. Use the matching framework adapter rather than passing another framework’s VNodes through Preact callbacks. The live page groups this control with related variants and composition helpers.

This reference is generated from the local `package/src` library source. Rebuild it with `node scripts/generate-api.mjs`.
