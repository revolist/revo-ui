# DurationDraft

Calendar views and date/time fields, ranges, duration drafts, weekly availability and descriptive legends.

[Live examples and formatted usage](https://ui.rv-grid.com/components/duration-and-effort/) · [Component index](../../README.md#complete-component-reference)

Preact: `import { DurationDraft } from '@revolist/ui/duration'`

React: `import { DurationDraft } from '@revolist/ui/react'`

Vue: `import { DurationDraft } from '@revolist/ui/vue'`

Angular/Svelte: pass `component="DurationDraft"` to the framework's `UiComponent` host. See the [framework guides](https://ui.rv-grid.com/frameworks/) for state, callbacks and slots.

## Props

The table lists library-declared props. Standard inherited HTML attributes are omitted to keep the reference focused. Callback and generic types follow the installed package declarations.

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `value` | `string \| number \| ParsedDuration \| null` | Yes |  |
| `options` | `DurationFieldOptions & { label?: string; invalidText?: string; actions?: Partial<import("../editor-actions").EditorActionText>; }` | Yes |  |
| `apply` | `(value: ParsedDuration \| null) => void` | Yes |  |
| `cancel` | `() => void` | Yes |  |

## Composition

Keep controlled values and side effects in your application. Use the matching framework adapter rather than passing another framework’s VNodes through Preact callbacks. The live page groups this control with related variants and composition helpers.

This reference is generated from the local `package` library source. Rebuild it with `node scripts/generate-api.mjs`.
