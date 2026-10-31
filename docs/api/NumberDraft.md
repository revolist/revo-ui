# NumberDraft

Text, search and numeric entry; field labels, validation, inline layouts and editor drafts.

[Live examples and formatted usage](https://ui.rv-grid.com/components/inputs-and-forms/) · [Component index](../../README.md#complete-component-reference)

Preact: `import { NumberDraft } from '@revolist/ui/number-input'`

React: `import { NumberDraft } from '@revolist/ui/react'`

Vue: `import { NumberDraft } from '@revolist/ui/vue'`

Angular/Svelte: pass `component="NumberDraft"` to the framework's `UiComponent` host. See the [framework guides](https://ui.rv-grid.com/frameworks/) for state, callbacks and slots.

## Props

The table lists library-declared props. Standard inherited HTML attributes are omitted to keep the reference focused. Callback and generic types follow the installed package declarations.

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `value` | `unknown` | Yes |  |
| `options` | `NumberInputOptions` | Yes |  |
| `apply` | `(value: number \| null) => void` | Yes |  |
| `cancel` | `() => void` | Yes |  |
| `initialSelection` | `"end" \| "all" \| undefined` | No | Printable-key editors keep the initiating character and continue at its end. |

## Composition

Keep controlled values and side effects in your application. Use the matching framework adapter rather than passing another framework’s VNodes through Preact callbacks. The live page groups this control with related variants and composition helpers.

This reference is generated from the library source pinned in `library-source.json`. Rebuild it with `node scripts/generate-api.mjs <library-workspace>`.
