# Rating

Linear/circular completion and star-based rating controls.

[Live examples and formatted usage](https://ui.rv-grid.com/#progress-and-rating) · [Component index](../../README.md#complete-component-reference)

Preact: `import { Rating } from '@revolist/ui/preact'`

React: `import { Rating } from '@revolist/ui/react'`

Vue: `import { Rating } from '@revolist/ui/vue'`

Angular/Svelte: pass `component="Rating"` to the framework's `UiComponent` host. See the [framework guides](https://ui.rv-grid.com/?page=frameworks) for state, callbacks and slots.

## Props

The table lists library-declared props. Standard inherited HTML attributes are omitted to keep the reference focused. Callback and generic types follow the installed package declarations.

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `value` | `number` | Yes |  |
| `max` | `number \| undefined` | No |  |
| `label` | `string` | Yes |  |
| `onChange` | `((value: number) => void) \| undefined` | No |  |
| `disabled` | `boolean \| undefined` | No |  |

## Composition

Keep controlled values and side effects in your application. Use the matching framework adapter rather than passing another framework’s VNodes through Preact callbacks. The live page groups this control with related variants and composition helpers.

This reference is generated from the library source pinned in `library-source.json`. Rebuild it with `node scripts/generate-api.mjs <library-workspace>`.
