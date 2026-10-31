# Popover

Dialogs, confirmations, contextual surfaces and editable dialog sections with shared actions.

[Live examples and formatted usage](https://ui.rv-grid.com/components/dialogs-and-floating-surfaces/) · [Component index](../../README.md#complete-component-reference)

Preact: `import { Popover } from '@revolist/ui/preact'`

React: `import { Popover } from '@revolist/ui/react'`

Vue: `import { Popover } from '@revolist/ui/vue'`

Angular/Svelte: pass `component="Popover"` to the framework's `UiComponent` host. See the [framework guides](https://ui.rv-grid.com/frameworks/) for state, callbacks and slots.

## Props

The table lists library-declared props. Standard inherited HTML attributes are omitted to keep the reference focused. Callback and generic types follow the installed package declarations.

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `open` | `boolean` | Yes |  |
| `anchor` | `HTMLElement \| null` | Yes |  |
| `appendTo` | `HTMLElement \| undefined` | No | Optional mount scope for inherited theme tokens and text direction. |
| `onClose` | `() => void` | Yes |  |
| `children` | `ComponentChildren` | No |  |
| `label` | `string \| undefined` | No |  |
| `className` | `string \| undefined` | No |  |
| `role` | `"dialog" \| "menu" \| undefined` | No |  |

## Composition

Keep controlled values and side effects in your application. Use the matching framework adapter rather than passing another framework’s VNodes through Preact callbacks. The live page groups this control with related variants and composition helpers.

This reference is generated from the library source pinned in `library-source.json`. Rebuild it with `node scripts/generate-api.mjs <library-workspace>`.
