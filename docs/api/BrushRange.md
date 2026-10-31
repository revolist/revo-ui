# BrushRange

Compact bar, line and area charts with values, labels, tooltips and a composed range brush.

[Live examples and formatted usage](https://ui.rv-grid.com/components/charts-and-range-selection/) · [Component index](../../README.md#complete-component-reference)

Preact: `import { BrushRange } from '@revolist/ui/preact'`

React: `import { BrushRange } from '@revolist/ui/react'`

Vue: `import { BrushRange } from '@revolist/ui/vue'`

Angular/Svelte: pass `component="BrushRange"` to the framework's `UiComponent` host. See the [framework guides](https://ui.rv-grid.com/frameworks/) for state, callbacks and slots.

## Props

The table lists library-declared props. Standard inherited HTML attributes are omitted to keep the reference focused. Callback and generic types follow the installed package declarations.

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `chart` | `DistributionChartProps \| null \| undefined` | No |  |
| `slider` | `RangeSliderProps` | Yes |  |
| `startLabel` | `ComponentChildren` | Yes |  |
| `selectionLabel` | `ComponentChildren` | Yes |  |
| `endLabel` | `ComponentChildren` | Yes |  |
| `legacyClassPrefix` | `string \| undefined` | No | Retains the established filter-specific selectors while sharing the markup owner. |

## Composition

Keep controlled values and side effects in your application. Use the matching framework adapter rather than passing another framework’s VNodes through Preact callbacks. The live page groups this control with related variants and composition helpers.

This reference is generated from the library source pinned in `library-source.json`. Rebuild it with `node scripts/generate-api.mjs <library-workspace>`.
