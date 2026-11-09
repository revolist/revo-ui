# ProgressBar

Linear/circular completion and star-based rating controls.

[Live examples and formatted usage](https://ui.rv-grid.com/components/progress-and-rating/) · [Component index](../../README.md#complete-component-reference)

Preact: `import { ProgressBar } from '@revolist/ui/preact'`

React: `import { ProgressBar } from '@revolist/ui/react'`

Vue: `import { ProgressBar } from '@revolist/ui/vue'`

Angular/Svelte: pass `component="ProgressBar"` to the framework's `UiComponent` host. See the [framework guides](https://ui.rv-grid.com/frameworks/) for state, callbacks and slots.

## Props

The table lists library-declared props. Standard inherited HTML attributes are omitted to keep the reference focused. Callback and generic types follow the installed package declarations.

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `value` | `number` | Yes |  |
| `min` | `number \| undefined` | No |  |
| `max` | `number \| undefined` | No |  |
| `ariaLabel` | `string \| undefined` | No |  |
| `className` | `string \| undefined` | No |  |
| `fillClass` | `string \| Record<string, boolean> \| undefined` | No |  |

## Composition

Keep controlled values and side effects in your application. Use the matching framework adapter rather than passing another framework’s VNodes through Preact callbacks. The live page groups this control with related variants and composition helpers.

This reference is generated from the local `package/src` library source. Rebuild it with `node scripts/generate-api.mjs`.
