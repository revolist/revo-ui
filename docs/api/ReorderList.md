# ReorderList

Compose field libraries, selected-field lists, ordering, summaries, actions and drop feedback from shared pieces.

[Live examples and formatted usage](https://ui.rv-grid.com/components/field-configurators/) · [Component index](../../README.md#complete-component-reference)

Preact: `import { ReorderList } from '@revolist/ui/preact'`

React: `import { ReorderList } from '@revolist/ui/react'`

Vue: `import { ReorderList } from '@revolist/ui/vue'`

Angular/Svelte: pass `component="ReorderList"` to the framework's `UiComponent` host. See the [framework guides](https://ui.rv-grid.com/frameworks/) for state, callbacks and slots.

## Props

The table lists library-declared props. Standard inherited HTML attributes are omitted to keep the reference focused. Callback and generic types follow the installed package declarations.

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `items` | `readonly T[]` | Yes |  |
| `itemKey` | `(item: T) => string \| number` | Yes |  |
| `renderItem` | `(item: T, index: number) => ComponentChildren` | Yes |  |
| `renderHandle` | `((item: T, index: number) => ComponentChildren) \| undefined` | No |  |
| `itemAttributes` | `((item: T, index: number) => JSX.HTMLAttributes<HTMLDivElement> & Record<string, unknown>) \| undefined` | No |  |
| `className` | `string \| undefined` | No |  |
| `rowClassName` | `string \| ((item: T, index: number) => string) \| undefined` | No |  |
| `endClassName` | `string \| undefined` | No |  |
| `draggedKey` | `string \| number \| undefined` | No |  |
| `dropIndex` | `number \| undefined` | No |  |
| `empty` | `ComponentChildren` | No |  |
| `onDragOver` | `(event: DragEvent, boundary: number) => void` | Yes |  |
| `onDrop` | `(event: DragEvent, boundary: number) => void` | Yes |  |

## Composition

Keep controlled values and side effects in your application. Use the matching framework adapter rather than passing another framework’s VNodes through Preact callbacks. The live page groups this control with related variants and composition helpers.

This reference is generated from the local `package/src` library source. Rebuild it with `node scripts/generate-api.mjs`.
