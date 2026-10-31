# Listbox

Switch content, group options and present plain, icon or descriptive selection rows.

[Live examples and formatted usage](https://ui.rv-grid.com/components/tabs-and-lists/) · [Component index](../../README.md#complete-component-reference)

Preact: `import { Listbox } from '@revolist/ui/preact'`

React: `import { Listbox } from '@revolist/ui/react'`

Vue: `import { Listbox } from '@revolist/ui/vue'`

Angular/Svelte: pass `component="Listbox"` to the framework's `UiComponent` host. See the [framework guides](https://ui.rv-grid.com/frameworks/) for state, callbacks and slots.

## Props

The table lists library-declared props. Standard inherited HTML attributes are omitted to keep the reference focused. Callback and generic types follow the installed package declarations.

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `label` | `string` | Yes |  |
| `onSelect` | `(value: string) => void` | Yes |  |
| `listRef` | `Ref<HTMLDivElement> \| undefined` | No |  |
| `variant` | `"default" \| "plain" \| undefined` | No | Omit the inner frame when the list sits inside an editor pane. |
| `spacing` | `"default" \| "comfortable" \| undefined` | No | Additional room around icon/description rows. |
| `children` | `ComponentChildren` | Yes |  |
| `className` | `string \| undefined` | No |  |

## Composition

Keep controlled values and side effects in your application. Use the matching framework adapter rather than passing another framework’s VNodes through Preact callbacks. The live page groups this control with related variants and composition helpers.

This reference is generated from the library source pinned in `library-source.json`. Rebuild it with `node scripts/generate-api.mjs <library-workspace>`.
