# Stepper

Linear/circular completion and star-based rating controls.

[Live examples and formatted usage](https://ui.rv-grid.com/components/stepper/) · [Component index](../../README.md#complete-component-reference)

Preact: `import { Stepper } from '@revolist/ui/preact'`

React: `import { Stepper } from '@revolist/ui/react'`

Vue: `import { Stepper } from '@revolist/ui/vue'`

Angular/Svelte: pass `component="Stepper"` to the framework's `UiComponent` host. See the [framework guides](https://ui.rv-grid.com/frameworks/) for state, callbacks and slots.

## Props

The table lists library-declared props. Standard inherited HTML attributes are omitted to keep the reference focused. Callback and generic types follow the installed package declarations.

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `label` | `string` | Yes | Accessible label for the workflow. |
| `steps` | `readonly WorkflowStep[]` | Yes | Steps in their displayed order. |
| `value` | `string` | Yes | ID of the active step. |
| `onValueChange` | `((id: string) => void) \| undefined` | No | Called when an enabled step is activated. Omit for a read-only indicator. |
| `completedLabel` | `string \| undefined` | No | Localized status announced for completed steps. |
| `preset` | `ClassPreset \| undefined` | No | Optional presentation preset. |
| `className` | `string \| undefined` | No | Additional root class names. |

## Composition

Keep controlled values and side effects in your application. Use the matching framework adapter rather than passing another framework’s VNodes through Preact callbacks. The live page groups this control with related variants and composition helpers.

This reference is generated from the local `package` library source. Rebuild it with `node scripts/generate-api.mjs`.
