# Checkbox

Checkboxes, switches, radio groups, choice chips and option rows for independent or exclusive choices.

[Live examples and formatted usage](https://ui.rv-grid.com/components/selection-controls/) · [Component index](../../README.md#complete-component-reference)

Preact: `import { Checkbox } from '@revolist/ui/preact'`

React: `import { Checkbox } from '@revolist/ui/react'`

Vue: `import { Checkbox } from '@revolist/ui/vue'`

Angular/Svelte: pass `component="Checkbox"` to the framework's `UiComponent` host. See the [framework guides](https://ui.rv-grid.com/frameworks/) for state, callbacks and slots.

## Props

The table lists library-declared props. Standard inherited HTML attributes are omitted to keep the reference focused. Callback and generic types follow the installed package declarations.

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `checked` | `boolean \| undefined` | No |  |
| `indeterminate` | `boolean \| undefined` | No |  |
| `label` | `any` | No |  |
| `description` | `any` | No |  |
| `ariaLabel` | `string \| undefined` | No |  |
| `controlClassName` | `string \| undefined` | No |  |
| `inputRef` | `((input: HTMLInputElement \| null) => void) \| undefined` | No |  |
| `onChange` | `((checked: boolean, event: Event & { currentTarget: HTMLInputElement; }) => void) \| undefined` | No |  |

## Composition

Keep controlled values and side effects in your application. Use the matching framework adapter rather than passing another framework’s VNodes through Preact callbacks. The live page groups this control with related variants and composition helpers.

This reference is generated from the local `package` library source. Rebuild it with `node scripts/generate-api.mjs`.
