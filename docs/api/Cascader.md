# Cascader

Single and multiple selects, editable autocomplete, optional tags and remote record lookup.

[Live examples and formatted usage](https://ui.rv-grid.com/components/cascader/) · [Component index](../../README.md#complete-component-reference)

Preact: `import { Cascader } from '@revolist/ui/preact'`

React: `import { Cascader } from '@revolist/ui/react'`

Vue: `import { Cascader } from '@revolist/ui/vue'`

Angular/Svelte: pass `component="Cascader"` to the framework's `UiComponent` host. See the [framework guides](https://ui.rv-grid.com/frameworks/) for state, callbacks and slots.

## Props

The table lists library-declared props. Standard inherited HTML attributes are omitted to keep the reference focused. Callback and generic types follow the installed package declarations.

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `label` | `string` | Yes | Accessible label for the trigger and selection panel. |
| `nodes` | `readonly TreeNode[]` | Yes | Root options with unique IDs. |
| `value` | `string \| undefined` | No | Selected option ID. |
| `placeholder` | `string` | Yes | Text shown when no option is selected. |
| `onValueChange` | `((id: string) => void) \| undefined` | No | Called when a leaf option is selected. |
| `preset` | `ClassPreset \| undefined` | No | Optional presentation preset. |
| `className` | `string \| undefined` | No | Additional root class names. |
| `disabled` | `boolean \| undefined` | No | Disable opening and selection. |

## Composition

Keep controlled values and side effects in your application. Use the matching framework adapter rather than passing another framework’s VNodes through Preact callbacks. The live page groups this control with related variants and composition helpers.

This reference is generated from the local `package` library source. Rebuild it with `node scripts/generate-api.mjs`.
