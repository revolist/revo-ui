# ActionBar

Run contextual actions for a selection.

[Live examples and formatted usage](https://ui.rv-grid.com/components/menus-and-toolbars/#example-bulk-file-actions) · [Component index](../../README.md#complete-component-reference)

Preact: `import { ActionBar } from '@revolist/ui/preact'`

React: `import { ActionBar } from '@revolist/ui/react'`

Vue: `import { ActionBar } from '@revolist/ui/vue'`

Angular/Svelte: pass `component="ActionBar"` to the framework's `UiComponent` host. See the [framework guides](https://ui.rv-grid.com/frameworks/) for state, callbacks and slots.

## Props

The table lists library-declared props. Standard inherited HTML attributes are omitted to keep the reference focused. Callback and generic types follow the installed package declarations.

| Prop             | Type                                                                                                                    | Required | Description                                                             |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------- | -------- | ----------------------------------------------------------------------- |
| `label`          | `string`                                                                                                                | Yes      | Accessible name of the bulk actions toolbar.                            |
| `count`          | `number`                                                                                                                | Yes      | Number of selected items. A positive count opens the bar by default.    |
| `selectionLabel` | `string`                                                                                                                | Yes      | Localized summary of the selection, for example “3 files selected”.     |
| `open`           | `boolean \| undefined`                                                                                                  | No       | Override the visibility derived from count.                             |
| `closeLabel`     | `string \| undefined`                                                                                                   | No       | Localized name of the dismiss button.                                   |
| `onOpenChange`   | `((open: boolean) => void) \| undefined`                                                                                | No       | Handle close requests from the dismiss button or Escape.                |
| `closeOnEscape`  | `boolean \| undefined`                                                                                                  | No       | Allow Escape to request dismissal. Defaults to true.                    |
| `positioning`    | `{ placement?: "bottom" \| "bottom-start" \| "bottom-end"; gutter?: string; mode?: "fixed" \| "inline"; } \| undefined` | No       | Logical bottom placement and optional CSS length from the edge.         |
| `actions`        | `readonly ActionBarAction[] \| undefined`                                                                               | No       | Actions displayed in order.                                             |
| `onAction`       | `((id: string) => void) \| undefined`                                                                                   | No       | Called with the selected action. The host owns the selection afterward. |
| `children`       | `ComponentChildren`                                                                                                     | No       | Additional controls such as a menu trigger.                             |
| `preset`         | `ClassPreset \| undefined`                                                                                              | No       | Optional presentation preset.                                           |
| `className`      | `string \| undefined`                                                                                                   | No       | Additional CSS classes on the toolbar.                                  |

## Composition

Keep controlled values and side effects in your application. Use the matching framework adapter rather than passing another framework’s VNodes through Preact callbacks. The live page groups this control with related variants and composition helpers.

This reference is generated from the local `package` library source. Rebuild it with `node scripts/generate-api.mjs`.

## Bulk selection

Pass the selection count and its localized summary. The bar opens when the count is positive. Use `open` to control visibility and clear your host selection in `onOpenChange(false)`. Use the optional children slot for extra controls such as a menu trigger.

The default is fixed to the bottom of the viewport. Allow enough room beneath the host content for rows to scroll clear of the bar. Use the inline mode for embedded layouts. Focus stays on the selection when the bar opens. Left and Right move between actions in writing order, and Home and End move to the ends.
