# DropdownPopupContent

Single or multiple selections, searchable options, selected-value templates, avatars, resource lists and assignee fields.

[Live examples and formatted usage](https://ui.rv-grid.com/components/selects-chips-and-resources/) · [Component index](../../README.md#complete-component-reference)

Preact: `import { DropdownPopupContent } from '@revolist/ui/preact'`

React: `import { DropdownPopupContent } from '@revolist/ui/react'`

Vue: `import { DropdownPopupContent } from '@revolist/ui/vue'`

Angular/Svelte: pass `component="DropdownPopupContent"` to the framework's `UiComponent` host. See the [framework guides](https://ui.rv-grid.com/frameworks/) for state, callbacks and slots.

## Props

The table lists library-declared props. Standard inherited HTML attributes are omitted to keep the reference focused. Callback and generic types follow the installed package declarations.

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `options` | `DropdownOption<T>[]` | Yes |  |
| `selectedValues` | `DropdownOption<T>[] \| undefined` | No |  |
| `remote` | `(RemoteDropdownState<T> & { text: DropdownRemoteText; search: (query: string) => void; loadMore: () => void; retry: () => void; }) \| undefined` | No |  |
| `value` | `T \| T[] \| undefined` | Yes |  |
| `onChange` | `(value: T \| T[]) => void` | Yes |  |
| `config` | `DropdownConfig<T>` | Yes |  |
| `multiSelect` | `boolean` | Yes |  |
| `search` | `boolean` | Yes |  |
| `searchPlaceholder` | `string` | Yes |  |
| `listboxId` | `string` | Yes |  |
| `searchId` | `string` | Yes |  |
| `renderOption` | `((h: any, option: DropdownOption<T>, isSelected: boolean) => ComponentChildren) \| undefined` | No |  |
| `renderNoResults` | `((h: any) => ComponentChildren) \| undefined` | No |  |
| `onClose` | `(focusNext?: boolean) => void` | Yes |  |
| `onTabNavigation` | `(() => void) \| undefined` | No |  |
| `theme` | `string \| null \| undefined` | No |  |

## Composition

Keep controlled values and side effects in your application. Use the matching framework adapter rather than passing another framework’s VNodes through Preact callbacks. The live page groups this control with related variants and composition helpers.

This reference is generated from the library source pinned in `library-source.json`. Rebuild it with `node scripts/generate-api.mjs <library-workspace>`.
