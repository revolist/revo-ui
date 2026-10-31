# ChoiceChips

Checkboxes, switches, radio groups, choice chips and option rows for independent or exclusive choices.

[Live examples and formatted usage](https://ui.rv-grid.com/components/selection-controls/) · [Component index](../../README.md#complete-component-reference)

Preact: `import { ChoiceChips } from '@revolist/ui/preact'`

React: `import { ChoiceChips } from '@revolist/ui/react'`

Vue: `import { ChoiceChips } from '@revolist/ui/vue'`

Angular/Svelte: pass `component="ChoiceChips"` to the framework's `UiComponent` host. See the [framework guides](https://ui.rv-grid.com/frameworks/) for state, callbacks and slots.

## Props

The table lists library-declared props. Standard inherited HTML attributes are omitted to keep the reference focused. Callback and generic types follow the installed package declarations.

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `value` | `T \| readonly T[] \| undefined` | No |  |
| `options` | `readonly ChoiceChipOption<T>[]` | Yes |  |
| `onChange` | `(value: T, option: ChoiceChipOption<T>) => void` | Yes |  |
| `ariaLabel` | `string` | Yes |  |
| `appearance` | `"soft" \| "outlined" \| undefined` | No |  |
| `size` | `"small" \| "medium" \| undefined` | No |  |
| `className` | `string \| undefined` | No |  |
| `itemClassName` | `string \| undefined` | No |  |
| `disabled` | `boolean \| undefined` | No |  |
| `testId` | `string \| undefined` | No |  |

## Composition

Keep controlled values and side effects in your application. Use the matching framework adapter rather than passing another framework’s VNodes through Preact callbacks. The live page groups this control with related variants and composition helpers.

This reference is generated from the library source pinned in `library-source.json`. Rebuild it with `node scripts/generate-api.mjs <library-workspace>`.
