# Dialog

Dialogs, confirmations, contextual surfaces and editable dialog sections with shared actions.

[Live examples and formatted usage](https://ui.rv-grid.com/#dialogs-and-floating-surfaces) · [Component index](../../README.md#complete-component-reference)

Preact: `import { Dialog } from '@revolist/ui/preact'`

React: `import { Dialog } from '@revolist/ui/react'`

Vue: `import { Dialog } from '@revolist/ui/vue'`

Angular/Svelte: pass `component="Dialog"` to the framework's `UiComponent` host. See the [framework guides](https://ui.rv-grid.com/?page=frameworks) for state, callbacks and slots.

## Props

The table lists library-declared props. Standard inherited HTML attributes are omitted to keep the reference focused. Callback and generic types follow the installed package declarations.

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `open` | `boolean` | Yes |  |
| `title` | `string` | Yes |  |
| `closeLabel` | `string` | Yes |  |
| `onClose` | `() => void` | Yes |  |
| `children` | `ComponentChildren` | No |  |
| `footer` | `ComponentChildren` | No |  |
| `draggable` | `boolean \| undefined` | No |  |
| `returnFocus` | `HTMLElement \| undefined` | No |  |

## Composition

Keep controlled values and side effects in your application. Use the matching framework adapter rather than passing another framework’s VNodes through Preact callbacks. The live page groups this control with related variants and composition helpers.

This reference is generated from the library source pinned in `library-source.json`. Rebuild it with `node scripts/generate-api.mjs <library-workspace>`.
