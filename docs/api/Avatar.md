# Avatar

Single or multiple selections, searchable options, selected-value templates, avatars, resource lists and assignee fields.

[Live examples and formatted usage](https://ui.rv-grid.com/components/selects-chips-and-resources/) · [Component index](../../README.md#complete-component-reference)

Preact: `import { Avatar } from '@revolist/ui/preact'`

React: `import { Avatar } from '@revolist/ui/react'`

Vue: `import { Avatar } from '@revolist/ui/vue'`

Angular/Svelte: pass `component="Avatar"` to the framework's `UiComponent` host. See the [framework guides](https://ui.rv-grid.com/frameworks/) for state, callbacks and slots.

## Props

The table lists library-declared props. Standard inherited HTML attributes are omitted to keep the reference focused. Callback and generic types follow the installed package declarations.

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `ariaLabel` | `string \| undefined` | No |  |
| `className` | `string \| undefined` | No |  |
| `index` | `number \| undefined` | No |  |
| `initials` | `string \| undefined` | No |  |
| `key` | `string \| number \| undefined` | No |  |
| `label` | `string \| undefined` | No |  |
| `rectangular` | `boolean \| undefined` | No |  |
| `size` | `number \| undefined` | No |  |
| `style` | `Record<string, string \| number \| null \| undefined> \| undefined` | No |  |
| `value` | `unknown` | No |  |

## Composition

Keep controlled values and side effects in your application. Use the matching framework adapter rather than passing another framework’s VNodes through Preact callbacks. The live page groups this control with related variants and composition helpers.

This reference is generated from the local `package` library source. Rebuild it with `node scripts/generate-api.mjs`.
