# EditorListItem

Switch content, group options and present plain, icon or descriptive selection rows.

[Live examples and formatted usage](https://ui.rv-grid.com/components/tabs-and-lists/) · [Component index](../../README.md#complete-component-reference)

Preact: `import { EditorListItem } from '@revolist/ui/preact'`

React: `import { EditorListItem } from '@revolist/ui/react'`

Vue: `import { EditorListItem } from '@revolist/ui/vue'`

Angular/Svelte: pass `component="EditorListItem"` to the framework's `UiComponent` host. See the [framework guides](https://ui.rv-grid.com/frameworks/) for state, callbacks and slots.

## Props

The table lists library-declared props. Standard inherited HTML attributes are omitted to keep the reference focused. Callback and generic types follow the installed package declarations.

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `value` | `string` | Yes |  |
| `selected` | `boolean` | Yes |  |
| `className` | `string \| undefined` | No |  |
| `icon` | `ComponentChildren` | No |  |
| `label` | `ComponentChildren` | No |  |
| `description` | `ComponentChildren` | No |  |
| `contentClassNames` | `{ readonly icon?: string; readonly copy?: string; readonly label?: string; readonly description?: string; } \| undefined` | No |  |

## Composition

Keep controlled values and side effects in your application. Use the matching framework adapter rather than passing another framework’s VNodes through Preact callbacks. The live page groups this control with related variants and composition helpers.

This reference is generated from the local `package/src` library source. Rebuild it with `node scripts/generate-api.mjs`.
