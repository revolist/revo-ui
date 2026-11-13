# SharedResourcePicker

Search and select people or other resources.

[Live examples and formatted usage](https://ui.rv-grid.com/components/resource-selection/) · [Component index](../../README.md#complete-component-reference)

Preact: `import { SharedResourcePicker } from '@revolist/ui/preact'`

React: `import { SharedResourcePicker } from '@revolist/ui/react'`

Vue: `import { SharedResourcePicker } from '@revolist/ui/vue'`

Angular/Svelte: pass `component="SharedResourcePicker"` to the framework's `UiComponent` host. See the [framework guides](https://ui.rv-grid.com/frameworks/) for state, callbacks and slots.

## Props

The table lists library-declared props. Standard inherited HTML attributes are omitted to keep the reference focused. Callback and generic types follow the installed package declarations.

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `resources` | `readonly Resource[]` | Yes |  |
| `selectedResourceIds` | `readonly Id[]` | Yes |  |
| `text` | `ResourcePickerText` | Yes |  |
| `onChange` | `(resourceIds: readonly Id[]) => void` | Yes |  |
| `classNames` | `ResourcePickerClassNames \| undefined` | No |  |
| `disabled` | `boolean \| undefined` | No |  |
| `readOnly` | `boolean \| undefined` | No | Shows resource details without checkbox controls or selection changes. |
| `presentation` | `"inline" \| "dropdown" \| undefined` | No | Keeps the full list visible or presents it as a compact combobox. |
| `multiple` | `boolean \| undefined` | No | Allows more than one selected resource. Defaults to true. |
| `preserveOrder` | `boolean \| undefined` | No | Keeps resources in caller-provided order instead of sorting by name. |
| `unassigned` | `ResourcePickerUnassignedOption \| undefined` | No |  |
| `resourceDataAttribute` | `string \| undefined` | No |  |
| `isResourceDisabled` | `((resource: Resource) => boolean) \| undefined` | No |  |
| `getAvatarColor` | `((resource: Resource) => string \| undefined) \| undefined` | No |  |

## Composition

Keep controlled values and side effects in your application. Use the matching framework adapter rather than passing another framework’s VNodes through Preact callbacks. The live page groups this control with related variants and composition helpers.

This reference is generated from the local `package` library source. Rebuild it with `node scripts/generate-api.mjs`.
