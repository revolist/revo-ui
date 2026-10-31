# RemovableChip

Single or multiple selections, searchable options, selected-value templates, avatars, resource lists and assignee fields.

[Live examples and formatted usage](https://ui.rv-grid.com/#selects-chips-and-resources) · [Component index](../../README.md#complete-component-reference)

Preact: `import { RemovableChip } from '@revolist/ui/preact'`

React: `import { RemovableChip } from '@revolist/ui/react'`

Vue: `import { RemovableChip } from '@revolist/ui/vue'`

Angular/Svelte: pass `component="RemovableChip"` to the framework's `UiComponent` host. See the [framework guides](https://ui.rv-grid.com/?page=frameworks) for state, callbacks and slots.

## Props

The table lists library-declared props. Standard inherited HTML attributes are omitted to keep the reference focused. Callback and generic types follow the installed package declarations.

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `children` | `ComponentChildren` | Yes |  |
| `removeLabel` | `string \| undefined` | No |  |
| `onRemove` | `(() => void) \| undefined` | No |  |
| `className` | `string \| undefined` | No |  |
| `removeClassName` | `string \| undefined` | No |  |
| `role` | `"listitem" \| undefined` | No |  |

## Composition

Keep controlled values and side effects in your application. Use the matching framework adapter rather than passing another framework’s VNodes through Preact callbacks. The live page groups this control with related variants and composition helpers.

This reference is generated from the library source pinned in `library-source.json`. Rebuild it with `node scripts/generate-api.mjs <library-workspace>`.
