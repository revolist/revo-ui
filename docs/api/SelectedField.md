# SelectedField

Compose field libraries, selected-field lists, ordering, summaries, actions and drop feedback from shared pieces.

[Live examples and formatted usage](https://ui.rv-grid.com/components/field-configurators/) · [Component index](../../README.md#complete-component-reference)

Preact: `import { SelectedField } from '@revolist/ui/preact'`

React: `import { SelectedField } from '@revolist/ui/react'`

Vue: `import { SelectedField } from '@revolist/ui/vue'`

Angular/Svelte: pass `component="SelectedField"` to the framework's `UiComponent` host. See the [framework guides](https://ui.rv-grid.com/frameworks/) for state, callbacks and slots.

## Props

The table lists library-declared props. Standard inherited HTML attributes are omitted to keep the reference focused. Callback and generic types follow the installed package declarations.

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `className` | `string \| (SignalLike<string \| undefined> & string) \| undefined` | No |  |
| `indicator` | `ComponentChildren` | No |  |
| `dropPosition` | `"before" \| "after" \| undefined` | No |  |
| `label` | `ComponentChildren` | Yes |  |
| `icon` | `ComponentChildren` | No |  |
| `actions` | `ComponentChildren` | No |  |
| `contentClassName` | `string \| undefined` | No |  |

## Composition

Keep controlled values and side effects in your application. Use the matching framework adapter rather than passing another framework’s VNodes through Preact callbacks. The live page groups this control with related variants and composition helpers.

This reference is generated from the library source pinned in `library-source.json`. Rebuild it with `node scripts/generate-api.mjs <library-workspace>`.
