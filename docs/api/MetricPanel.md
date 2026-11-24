# MetricPanel

Semantic badges, counters, alerts, progress indicators, loading surfaces, empty states and feedback panels.

[Live examples and formatted usage](https://ui.rv-grid.com/components/status-and-feedback/) · [Component index](../../README.md#complete-component-reference)

Preact: `import { MetricPanel } from '@revolist/ui/preact'`

React: `import { MetricPanel } from '@revolist/ui/react'`

Vue: `import { MetricPanel } from '@revolist/ui/vue'`

Angular/Svelte: pass `component="MetricPanel"` to the framework's `UiComponent` host. See the [framework guides](https://ui.rv-grid.com/frameworks/) for state, callbacks and slots.

## Props

The table lists library-declared props. Standard inherited HTML attributes are omitted to keep the reference focused. Callback and generic types follow the installed package declarations.

| Prop        | Type                                     | Required | Description                                                |
| ----------- | ---------------------------------------- | -------- | ---------------------------------------------------------- |
| `preset`    | `ClassPreset \| undefined`               | No       | Portable presentation preset.                              |
| `items`     | `readonly MetricTileData[] \| undefined` | No       | Metrics to render in the panel.                            |
| `label`     | `string \| undefined`                    | No       | Accessible name for this group, supplied by the host.      |
| `className` | `string \| undefined`                    | No       | Additional host class.                                     |
| `children`  | `ComponentChildren`                      | No       | Compose individual MetricTile components or other content. |

## Composition

Keep controlled values and side effects in your application. Use the matching framework adapter rather than passing another framework’s VNodes through Preact callbacks. The live page groups this control with related variants and composition helpers.

This reference is generated from the local `package` library source. Rebuild it with `node scripts/generate-api.mjs`.
