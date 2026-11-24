# MetricTile

Semantic badges, counters, alerts, progress indicators, loading surfaces, empty states and feedback panels.

[Live examples and formatted usage](https://ui.rv-grid.com/components/status-and-feedback/) · [Component index](../../README.md#complete-component-reference)

Preact: `import { MetricTile } from '@revolist/ui/preact'`

React: `import { MetricTile } from '@revolist/ui/react'`

Vue: `import { MetricTile } from '@revolist/ui/vue'`

Angular/Svelte: pass `component="MetricTile"` to the framework's `UiComponent` host. See the [framework guides](https://ui.rv-grid.com/frameworks/) for state, callbacks and slots.

## Props

The table lists library-declared props. Standard inherited HTML attributes are omitted to keep the reference focused. Callback and generic types follow the installed package declarations.

| Prop         | Type                                                                                                                                                                                                                                                                                       | Required | Description                                                                   |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------- | ----------------------------------------------------------------------------- |
| `preset`     | `ClassPreset \| undefined`                                                                                                                                                                                                                                                                 | No       | Portable presentation preset.                                                 |
| `className`  | `string \| undefined`                                                                                                                                                                                                                                                                      | No       | Additional host class.                                                        |
| `children`   | `ComponentChildren`                                                                                                                                                                                                                                                                        | No       | Optional extra content such as a compact chart.                               |
| `label`      | `string`                                                                                                                                                                                                                                                                                   | Yes      | Localized name of the metric.                                                 |
| `value`      | `string \| number`                                                                                                                                                                                                                                                                         | Yes      | Formatted value shown prominently.                                            |
| `detail`     | `string \| number \| undefined`                                                                                                                                                                                                                                                            | No       | Optional formatted context or change.                                         |
| `valueTone`  | `MetricTone \| undefined`                                                                                                                                                                                                                                                                  | No       | Explicitly override the inferred tone of a signed value.                      |
| `detailTone` | `MetricTone \| undefined`                                                                                                                                                                                                                                                                  | No       | Override the inferred tone of the detail.                                     |
| `summary`    | `{ markerColor: string; legend?: string; detailColor?: string; } \| undefined`                                                                                                                                                                                                             | No       | Compact heading with a color marker and optional comparison legend.           |
| `visual`     | `{ accent: string; icon?: ComponentChildren; iconSvg?: string; showIcon?: boolean; detailLead?: string; detailRest?: string; detailTone?: MetricTone; trend?: readonly number[]; progress?: { value: number; label: string; captionLead?: string; captionRest?: string; }; } \| undefined` | No       | Optional illustrated card presentation; all labels and data are caller-owned. |

## Composition

Keep controlled values and side effects in your application. Use the matching framework adapter rather than passing another framework’s VNodes through Preact callbacks. The live page groups this control with related variants and composition helpers.

This reference is generated from the local `package` library source. Rebuild it with `node scripts/generate-api.mjs`.
