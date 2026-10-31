# InspectorSection

Typography choices, icon choices, inspector sections, preview comparisons and contextual filter badges.

[Live examples and formatted usage](https://ui.rv-grid.com/components/formatting-controls/) · [Component index](../../README.md#complete-component-reference)

Preact: `import { InspectorSection } from '@revolist/ui/preact'`

React: `import { InspectorSection } from '@revolist/ui/react'`

Vue: `import { InspectorSection } from '@revolist/ui/vue'`

Angular/Svelte: pass `component="InspectorSection"` to the framework's `UiComponent` host. See the [framework guides](https://ui.rv-grid.com/frameworks/) for state, callbacks and slots.

## Props

The table lists library-declared props. Standard inherited HTML attributes are omitted to keep the reference focused. Callback and generic types follow the installed package declarations.

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `title` | `string` | Yes |  |
| `icon` | `string` | Yes |  |
| `expandLabel` | `string` | Yes |  |
| `collapseLabel` | `string` | Yes |  |
| `open` | `boolean \| undefined` | No |  |
| `children` | `ComponentChildren` | Yes |  |

## Composition

Keep controlled values and side effects in your application. Use the matching framework adapter rather than passing another framework’s VNodes through Preact callbacks. The live page groups this control with related variants and composition helpers.

This reference is generated from the library source pinned in `library-source.json`. Rebuild it with `node scripts/generate-api.mjs <library-workspace>`.
