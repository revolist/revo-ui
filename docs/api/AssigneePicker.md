# AssigneePicker

Single or multiple selections, searchable options, selected-value templates, avatars, resource lists and assignee fields.

[Live examples and formatted usage](https://ui.rv-grid.com/components/selects-chips-and-resources/) · [Component index](../../README.md#complete-component-reference)

Preact: `import { AssigneePicker } from '@revolist/ui/assignee'`

React: `import { AssigneePicker } from '@revolist/ui/react'`

Vue: `import { AssigneePicker } from '@revolist/ui/vue'`

Angular/Svelte: pass `component="AssigneePicker"` to the framework's `UiComponent` host. See the [framework guides](https://ui.rv-grid.com/frameworks/) for state, callbacks and slots.

## Props

The table lists library-declared props. Standard inherited HTML attributes are omitted to keep the reference focused. Callback and generic types follow the installed package declarations.

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | `string` | Yes |  |
| `options` | `AssigneeOption[]` | Yes |  |
| `value` | `AssigneeAssignment[]` | Yes |  |
| `change` | `(value: AssigneeAssignment[]) => void` | Yes |  |
| `apply` | `() => void` | Yes |  |
| `cancel` | `() => void` | Yes |  |
| `theme` | `string \| undefined` | No |  |
| `defaultUnits` | `number` | Yes |  |
| `showAvatars` | `boolean \| undefined` | No |  |
| `text` | `AssigneeText \| undefined` | No |  |
| `autoApply` | `boolean \| undefined` | No | Apply completed edits automatically. Set false to require explicit Apply. |
| `showActions` | `boolean \| undefined` | No | Show Apply/Cancel buttons. Defaults to true only when autoApply is false. |

## Composition

Keep controlled values and side effects in your application. Use the matching framework adapter rather than passing another framework’s VNodes through Preact callbacks. The live page groups this control with related variants and composition helpers.

This reference is generated from the library source pinned in `library-source.json`. Rebuild it with `node scripts/generate-api.mjs <library-workspace>`.
