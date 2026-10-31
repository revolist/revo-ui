# Badge

Semantic badges, counters, alerts, progress indicators, loading surfaces, empty states and feedback panels.

[Live examples and formatted usage](https://ui.rv-grid.com/#status-and-feedback) · [Component index](../../README.md#complete-component-reference)

Preact: `import { Badge } from '@revolist/ui/preact'`

React: `import { Badge } from '@revolist/ui/react'`

Vue: `import { Badge } from '@revolist/ui/vue'`

Angular/Svelte: pass `component="Badge"` to the framework's `UiComponent` host. See the [framework guides](https://ui.rv-grid.com/?page=frameworks) for state, callbacks and slots.

## Props

The table lists library-declared props. Standard inherited HTML attributes are omitted to keep the reference focused. Callback and generic types follow the installed package declarations.

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `children` | `ComponentChildren` | No |  |
| `className` | `string \| undefined` | No |  |
| `label` | `string \| undefined` | No |  |
| `variant` | `"solid" \| "neutral" \| "accent" \| undefined` | No | Neutral counters or accent emphasis. Defaults to the existing solid badge. |
| `shape` | `"rounded" \| "pill" \| undefined` | No |  |

## Composition

Keep controlled values and side effects in your application. Use the matching framework adapter rather than passing another framework’s VNodes through Preact callbacks. The live page groups this control with related variants and composition helpers.

This reference is generated from the library source pinned in `library-source.json`. Rebuild it with `node scripts/generate-api.mjs <library-workspace>`.
