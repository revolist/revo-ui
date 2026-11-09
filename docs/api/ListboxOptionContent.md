# ListboxOptionContent

Switch content, group options and present plain, icon or descriptive selection rows.

[Live examples and formatted usage](https://ui.rv-grid.com/components/tabs-and-lists/) · [Component index](../../README.md#complete-component-reference)

Preact: `import { ListboxOptionContent } from '@revolist/ui/preact'`

React: `import { ListboxOptionContent } from '@revolist/ui/react'`

Vue: `import { ListboxOptionContent } from '@revolist/ui/vue'`

Angular/Svelte: pass `component="ListboxOptionContent"` to the framework's `UiComponent` host. See the [framework guides](https://ui.rv-grid.com/frameworks/) for state, callbacks and slots.

## Props

The table lists library-declared props. Standard inherited HTML attributes are omitted to keep the reference focused. Callback and generic types follow the installed package declarations.

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `icon` | `ComponentChildren` | No |  |
| `label` | `ComponentChildren` | Yes |  |
| `description` | `ComponentChildren` | No |  |
| `classNames` | `{ readonly icon?: string; readonly copy?: string; readonly label?: string; readonly description?: string; } \| undefined` | No |  |

## Composition

Keep controlled values and side effects in your application. Use the matching framework adapter rather than passing another framework’s VNodes through Preact callbacks. The live page groups this control with related variants and composition helpers.

This reference is generated from the local `package/src` library source. Rebuild it with `node scripts/generate-api.mjs`.
