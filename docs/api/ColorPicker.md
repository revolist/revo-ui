# ColorPicker

Choose a color from a palette or picker and apply shared semantic interface colors.

[Live examples and formatted usage](https://ui.rv-grid.com/#color) · [Component index](../../README.md#complete-component-reference)

Preact: `import { ColorPicker } from '@revolist/ui/preact'`

React: `import { ColorPicker } from '@revolist/ui/react'`

Vue: `import { ColorPicker } from '@revolist/ui/vue'`

Angular/Svelte: pass `component="ColorPicker"` to the framework's `UiComponent` host. See the [framework guides](https://ui.rv-grid.com/?page=frameworks) for state, callbacks and slots.

## Props

The table lists library-declared props. Standard inherited HTML attributes are omitted to keep the reference focused. Callback and generic types follow the installed package declarations.

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `label` | `string` | Yes |  |
| `value` | `string \| undefined` | No |  |
| `defaultLabel` | `string` | Yes |  |
| `customLabel` | `string` | Yes |  |
| `customHexLabel` | `string \| undefined` | No |  |
| `invalidColor` | `string \| undefined` | No |  |
| `colorLabels` | `Readonly<Record<string, string>>` | Yes |  |
| `optional` | `boolean \| undefined` | No |  |
| `allowHexInput` | `boolean \| undefined` | No | Set false for a selection-only palette and native color chooser. |
| `disabled` | `boolean \| undefined` | No |  |
| `onChange` | `(value: string \| undefined) => void` | Yes |  |

## Composition

Keep controlled values and side effects in your application. Use the matching framework adapter rather than passing another framework’s VNodes through Preact callbacks. The live page groups this control with related variants and composition helpers.

This reference is generated from the library source pinned in `library-source.json`. Rebuild it with `node scripts/generate-api.mjs <library-workspace>`.
