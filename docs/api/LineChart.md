# LineChart

Compact bar, line and area charts with values, labels, tooltips and a composed range brush.

[Live examples and formatted usage](https://ui.rv-grid.com/components/charts-and-range-selection/) · [Component index](../../README.md#complete-component-reference)

Preact: `import { LineChart } from '@revolist/ui/preact'`

React: `import { LineChart } from '@revolist/ui/react'`

Vue: `import { LineChart } from '@revolist/ui/vue'`

Angular/Svelte: pass `component="LineChart"` to the framework's `UiComponent` host. See the [framework guides](https://ui.rv-grid.com/frameworks/) for state, callbacks and slots.

## Props

The table lists library-declared props. Standard inherited HTML attributes are omitted to keep the reference focused. Callback and generic types follow the installed package declarations.

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `className` | `string \| undefined` | No |  |
| `height` | `number \| undefined` | No |  |
| `ariaLabel` | `string` | Yes |  |
| `data` | `readonly DistributionChartDatum[]` | Yes |  |
| `showPoints` | `boolean \| undefined` | No |  |
| `showLabels` | `boolean \| undefined` | No | Optional category text; defaults to the tooltip title. |
| `showValues` | `boolean \| undefined` | No |  |
| `showGrid` | `boolean \| undefined` | No |  |
| `legend` | `string \| undefined` | No |  |
| `formatValue` | `((value: number) => string) \| undefined` | No |  |
| `tooltip` | `boolean \| undefined` | No |  |
| `tooltipIndicator` | `"none" \| "line" \| "dot" \| "dashed" \| undefined` | No |  |
| `interpolation` | `"step" \| "linear" \| undefined` | No |  |
| `areaFill` | `"solid" \| "gradient" \| undefined` | No |  |
| `renderTooltip` | `((datum: DistributionChartDatum, index: number) => ComponentChildren) \| undefined` | No |  |

## Composition

Keep controlled values and side effects in your application. Use the matching framework adapter rather than passing another framework’s VNodes through Preact callbacks. The live page groups this control with related variants and composition helpers.

This reference is generated from the local `package/src` library source. Rebuild it with `node scripts/generate-api.mjs`.
