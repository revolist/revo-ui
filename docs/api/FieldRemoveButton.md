# FieldRemoveButton

Compose field libraries, selected-field lists, ordering, summaries, actions and drop feedback from shared pieces.

[Live examples and formatted usage](https://ui.rv-grid.com/components/field-configurators/) · [Component index](../../README.md#complete-component-reference)

Preact: `import { FieldRemoveButton } from '@revolist/ui/preact'`

React: `import { FieldRemoveButton } from '@revolist/ui/react'`

Vue: `import { FieldRemoveButton } from '@revolist/ui/vue'`

Angular/Svelte: pass `component="FieldRemoveButton"` to the framework's `UiComponent` host. See the [framework guides](https://ui.rv-grid.com/frameworks/) for state, callbacks and slots.

## Props

The table lists library-declared props. Standard inherited HTML attributes are omitted to keep the reference focused. Callback and generic types follow the installed package declarations.

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `onClick` | `(e: MouseEvent) => void` | Yes |  |
| `disabled` | `boolean \| undefined` | No |  |
| `rounded` | `boolean \| undefined` | No |  |
| `onMouseDown` | `((event: MouseEvent) => void) \| undefined` | No |  |
| `onDblClick` | `((event: MouseEvent) => void) \| undefined` | No |  |
| `className` | `string \| undefined` | No |  |
| `locale` | `{ title?: string; ariaLabel?: string; } \| undefined` | No |  |
| `compact` | `boolean \| undefined` | No | Compact hit area for an action embedded inside a selected-value chip. |

## Composition

Keep controlled values and side effects in your application. Use the matching framework adapter rather than passing another framework’s VNodes through Preact callbacks. The live page groups this control with related variants and composition helpers.

This reference is generated from the library source pinned in `library-source.json`. Rebuild it with `node scripts/generate-api.mjs <library-workspace>`.
