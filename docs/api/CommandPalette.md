# CommandPalette

Search and run commands in a dialog or inline list.

[Live examples and formatted usage](https://ui.rv-grid.com/components/command-palette/) · [Component index](../../README.md#complete-component-reference)

Preact: `import { CommandPalette } from '@revolist/ui/preact'`

React: `import { CommandPalette } from '@revolist/ui/react'`

Vue: `import { CommandPalette } from '@revolist/ui/vue'`

Angular/Svelte: pass `component="CommandPalette"` to the framework's `UiComponent` host. See the [framework guides](https://ui.rv-grid.com/frameworks/) for state, callbacks and slots.

## Props

The table lists library-declared props. Standard inherited HTML attributes are omitted to keep the reference focused. Callback and generic types follow the installed package declarations.

| Prop          | Type                        | Required | Description                                                                   |
| ------------- | --------------------------- | -------- | ----------------------------------------------------------------------------- |
| `open`        | `boolean \| undefined`      | No       | Whether the dialog is open.                                                   |
| `label`       | `string`                    | Yes      | Localized dialog or inline palette title.                                     |
| `searchLabel` | `string`                    | Yes      | Localized search label and placeholder.                                       |
| `closeLabel`  | `string \| undefined`       | No       | Localized close action.                                                       |
| `emptyLabel`  | `string`                    | Yes      | Localized empty-results message.                                              |
| `commands`    | `readonly PaletteCommand[]` | Yes      | Commands in display order. Commands with the same group appear together.      |
| `inline`      | `boolean \| undefined`      | No       | Show a persistent inline command list. Dialog props are ignored in this mode. |
| `loop`        | `boolean \| undefined`      | No       | Wrap arrow navigation at the beginning and end of the results.                |
| `onClose`     | `(() => void) \| undefined` | No       | Called when the dialog closes.                                                |
| `onExecute`   | `(id: string) => void`      | Yes      | Called when an enabled command is activated.                                  |
| `preset`      | `ClassPreset \| undefined`  | No       | Optional presentation preset.                                                 |

## Composition

Keep controlled values and side effects in your application. Use the matching framework adapter rather than passing another framework’s VNodes through Preact callbacks. The live page groups this control with related variants and composition helpers.

This reference is generated from the local `package` library source. Rebuild it with `node scripts/generate-api.mjs`.

## Command groups and keyboard

Provide a command's optional `group`, decorative `icon`, and `shortcut` to organize the list. A shortcut describes a key binding registered by your application. Use `<kbd class="rv-keycap">⌘K</kbd>` for the same keyboard hint style in a launcher or help text. Use `inline` for a persistent list, or control `open` and `onClose` for a dialog.

The field keeps keyboard focus while Up and Down move the highlighted option. Alt with Up or Down jumps between groups. Home and End reach the ends of the list. Enter runs the highlighted command, and Escape dismisses the dialog.
