# DropdownPopup

Single or multiple selections, searchable options, selected-value templates, avatars, resource lists and assignee fields.

[Live examples and formatted usage](https://ui.rv-grid.com/components/selects-chips-and-resources/) · [Component index](../../README.md#complete-component-reference)

Preact: `import { DropdownPopup } from '@revolist/ui/preact'`

React: `import { DropdownPopup } from '@revolist/ui/react'`

Vue: `import { DropdownPopup } from '@revolist/ui/vue'`

Angular/Svelte: pass `component="DropdownPopup"` to the framework's `UiComponent` host. See the [framework guides](https://ui.rv-grid.com/frameworks/) for state, callbacks and slots.

## Props

The table lists library-declared props. Standard inherited HTML attributes are omitted to keep the reference focused. Callback and generic types follow the installed package declarations.

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `onPointerRelease` | `((event: MouseEvent \| TouchEvent) => void) \| undefined` | No |  |
| `triggerRef` | `RefObject<HTMLDivElement>` | Yes |  |
| `children` | `ComponentChildren` | Yes |  |
| `portalTarget` | `HTMLElement \| null \| undefined` | No |  |
| `theme` | `string \| null \| undefined` | No |  |
| `dropdownMenuId` | `string \| undefined` | No |  |
| `popupClassName` | `string \| undefined` | No |  |
| `closeOnClickOutside` | `boolean \| undefined` | No |  |
| `onClose` | `(() => void) \| undefined` | No |  |
| `align` | `"start" \| "end" \| undefined` | No |  |
| `matchTriggerWidth` | `boolean \| undefined` | No |  |
| `maxHeight` | `number \| undefined` | No |  |
| `observePopupResize` | `boolean \| undefined` | No |  |
| `topLayer` | `boolean \| undefined` | No | Promotes the popup above modal dialogs without joining an ancestor's scroll context. |

## Composition

Keep controlled values and side effects in your application. Use the matching framework adapter rather than passing another framework’s VNodes through Preact callbacks. The live page groups this control with related variants and composition helpers.

This reference is generated from the local `package` library source. Rebuild it with `node scripts/generate-api.mjs`.
