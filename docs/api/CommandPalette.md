# CommandPalette

Command menus, nested commands, separators and grouped toolbar actions.

[Live examples and formatted usage](https://ui.rv-grid.com/components/command-palette/) · [Component index](../../README.md#complete-component-reference)

Preact: `import { CommandPalette } from '@revolist/ui/preact'`

React: `import { CommandPalette } from '@revolist/ui/react'`

Vue: `import { CommandPalette } from '@revolist/ui/vue'`

Angular/Svelte: pass `component="CommandPalette"` to the framework's `UiComponent` host. See the [framework guides](https://ui.rv-grid.com/frameworks/) for state, callbacks and slots.

## Props

The table lists library-declared props. Standard inherited HTML attributes are omitted to keep the reference focused. Callback and generic types follow the installed package declarations.

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `open` | `boolean` | Yes | Whether the dialog is open. |
| `label` | `string` | Yes | Localized dialog title. |
| `searchLabel` | `string` | Yes | Localized search label. |
| `closeLabel` | `string` | Yes | Localized close action. |
| `emptyLabel` | `string` | Yes | Localized empty-results message. |
| `commands` | `readonly PaletteCommand[]` | Yes | Commands in display order. |
| `onClose` | `() => void` | Yes | Called when the dialog closes. |
| `onExecute` | `(id: string) => void` | Yes | Called when an enabled command is activated. |
| `preset` | `ClassPreset \| undefined` | No | Optional presentation preset. |

## Composition

Keep controlled values and side effects in your application. Use the matching framework adapter rather than passing another framework’s VNodes through Preact callbacks. The live page groups this control with related variants and composition helpers.

This reference is generated from the local `package` library source. Rebuild it with `node scripts/generate-api.mjs`.
