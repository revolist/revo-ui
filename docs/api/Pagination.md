# Pagination

Page selection and compact or numbered navigation.

[Live examples and formatted usage](https://ui.rv-grid.com/components/pagination/) · [Component index](../../README.md#complete-component-reference)

Preact: `import { Pagination } from '@revolist/ui/preact'`

React: `import { Pagination } from '@revolist/ui/react'`

Vue: `import { Pagination } from '@revolist/ui/vue'`

Angular/Svelte: pass `component="Pagination"` to the framework's `UiComponent` host. See the [framework guides](https://ui.rv-grid.com/frameworks/) for state, callbacks and slots.

## Props

The table lists library-declared props. Standard inherited HTML attributes are omitted to keep the reference focused. Callback and generic types follow the installed package declarations.

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `page` | `number` | Yes | Zero-based page index. |
| `pageCount` | `number` | Yes |  |
| `onChange` | `(page: number) => void` | Yes |  |
| `label` | `string` | Yes |  |
| `previousLabel` | `string` | Yes |  |
| `nextLabel` | `string` | Yes |  |
| `firstLabel` | `string \| undefined` | No |  |
| `lastLabel` | `string \| undefined` | No |  |
| `variant` | `"compact" \| "numbered" \| "icons" \| undefined` | No |  |
| `disabled` | `boolean \| undefined` | No |  |
| `navigation` | `boolean \| undefined` | No |  |
| `boundaryButtons` | `boolean \| undefined` | No | Show first/last buttons, default false. |
| `buttons` | `Partial<Record<PaginationDirection, false \| PaginationButtonOptions>> \| undefined` | No |  |
| `children` | `ComponentChildren` | No | Optional page field/selector between the previous and next controls. |
| `className` | `string \| undefined` | No |  |

## Composition

Keep controlled values and side effects in your application. Use the matching framework adapter rather than passing another framework’s VNodes through Preact callbacks. The live page groups this control with related variants and composition helpers.

This reference is generated from the local `package` library source. Rebuild it with `node scripts/generate-api.mjs`.
