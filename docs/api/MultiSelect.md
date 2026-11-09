# MultiSelect

Single or multiple selections, searchable options, selected-value templates, avatars, resource lists and assignee fields.

[Live examples and formatted usage](https://ui.rv-grid.com/components/selects-chips-and-resources/) · [Component index](../../README.md#complete-component-reference)

Preact: `import { MultiSelect } from '@revolist/ui/preact'`

React: `import { MultiSelect } from '@revolist/ui/react'`

Vue: `import { MultiSelect } from '@revolist/ui/vue'`

Angular/Svelte: pass `component="MultiSelect"` to the framework's `UiComponent` host. See the [framework guides](https://ui.rv-grid.com/frameworks/) for state, callbacks and slots.

## Props

The table lists library-declared props. Standard inherited HTML attributes are omitted to keep the reference focused. Callback and generic types follow the installed package declarations.

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `environment` | `DropdownEnvironment \| undefined` | No |  |
| `triggerAttributes` | `JSX.HTMLAttributes<HTMLDivElement> \| undefined` | No |  |
| `source` | `DropdownOption<T>[]` | Yes |  |
| `dataSource` | `DropdownDataSource<T> \| undefined` | No | Optional application-owned remote search and ID resolver. Values must be string/number IDs. |
| `dataContext` | `unknown` | No | Row/application context; changing its identity invalidates the remote session. |
| `remoteText` | `Partial<DropdownRemoteText> \| undefined` | No |  |
| `value` | `T \| T[] \| undefined` | No |  |
| `placeholder` | `string \| undefined` | No |  |
| `disabled` | `boolean \| undefined` | No | Disable all dropdown interaction, including autoOpen and chip removal. Defaults to false. Disabling an open dropdown closes it once; re-enabling does not reopen it automatically. For grid callbacks, use DropdownColumnProps. See the [Dropdown Editor guide](/guides/editors/editor-dropdown/). |
| `name` | `string \| undefined` | No |  |
| `id` | `string \| undefined` | No |  |
| `className` | `string \| undefined` | No |  |
| `style` | `DropdownStyle \| undefined` | No |  |
| `config` | `DropdownConfig<T> \| undefined` | No |  |
| `onChange` | `((value: T \| T[]) => void) \| undefined` | No |  |
| `onClose` | `((focusNext?: boolean) => void) \| undefined` | No |  |
| `beforeOutsideClose` | `(() => boolean \| void) \| undefined` | No | Validate or save a draft before outside-pointer dismissal. False keeps it open. Escape, selection and programmatic closure never invoke this callback. |
| `renderContent` | `((props: { id: string; close: (focusNext?: boolean) => void; }) => DropdownRenderable) \| undefined` | No | Replace the popup body while retaining the shared trigger, tags and positioning. Custom content owns its keyboard navigation and renders a dialog with &#96;id&#96;. |
| `renderOption` | `((h: HyperFunc<DropdownVNode>, option: DropdownOption<T>, isSelected: boolean) => DropdownRenderable) \| undefined` | No |  |
| `renderValue` | `((h: HyperFunc<DropdownVNode>, option: DropdownOption<T>) => DropdownRenderable) \| undefined` | No | Render the content of each selected value while preserving the built-in single/multi-select wrappers, remove controls, and expand indicator. |
| `renderPlaceholder` | `((h: HyperFunc<DropdownVNode>, placeholder: string, children: DropdownRenderable) => DropdownRenderable) \| undefined` | No |  |
| `renderSelectedValue` | `((h: HyperFunc<DropdownVNode>, selectedOptions: DropdownOption<T>[], children: DropdownRenderable) => DropdownRenderable) \| undefined` | No | Render the selected value |
| `renderNoResults` | `((h: HyperFunc<DropdownVNode>) => DropdownRenderable) \| undefined` | No |  |

## Composition

Keep controlled values and side effects in your application. Use the matching framework adapter rather than passing another framework’s VNodes through Preact callbacks. The live page groups this control with related variants and composition helpers.

This reference is generated from the local `package/src` library source. Rebuild it with `node scripts/generate-api.mjs`.
