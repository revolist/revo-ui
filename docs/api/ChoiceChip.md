# ChoiceChip

Checkboxes, switches, radio groups, choice chips and option rows for independent or exclusive choices.

[Live examples and formatted usage](https://ui.rv-grid.com/components/selection-controls/) · [Component index](../../README.md#complete-component-reference)

Preact: `import { ChoiceChip } from '@revolist/ui/preact'`

React: `import { ChoiceChip } from '@revolist/ui/react'`

Vue: `import { ChoiceChip } from '@revolist/ui/vue'`

Angular/Svelte: pass `component="ChoiceChip"` to the framework's `UiComponent` host. See the [framework guides](https://ui.rv-grid.com/frameworks/) for state, callbacks and slots.

## Props

The table lists library-declared props. Standard inherited HTML attributes are omitted to keep the reference focused. Callback and generic types follow the installed package declarations.

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `children` | `ComponentChildren` | Yes |  |
| `color` | `string \| undefined` | No |  |
| `selected` | `boolean \| undefined` | No |  |
| `onSelect` | `h.JSX.MouseEventHandler<HTMLButtonElement> \| undefined` | No |  |
| `info` | `ComponentChildren` | No |  |
| `onRemove` | `(() => void) \| undefined` | No |  |
| `removeLabel` | `string \| undefined` | No |  |
| `removeClassName` | `string \| undefined` | No |  |

## Composition

Keep controlled values and side effects in your application. Use the matching framework adapter rather than passing another framework’s VNodes through Preact callbacks. The live page groups this control with related variants and composition helpers.

This reference is generated from the library source pinned in `library-source.json`. Rebuild it with `node scripts/generate-api.mjs <library-workspace>`.
