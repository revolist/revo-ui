# Trace

Presentation for messages, prompts, suggestions, reasoning, tasks, action state and result summaries. Applications provide the model and tools.

[Live examples and formatted usage](https://ui.rv-grid.com/components/trace/) · [Component index](../../README.md#complete-component-reference)

Preact: `import { Trace } from '@revolist/ui/preact'`

React: `import { Trace } from '@revolist/ui/react'`

Vue: `import { Trace } from '@revolist/ui/vue'`

Angular/Svelte: pass `component="Trace"` to the framework's `UiComponent` host. See the [framework guides](https://ui.rv-grid.com/frameworks/) for state, callbacks and slots.

## Props

The table lists library-declared props. Standard inherited HTML attributes are omitted to keep the reference focused. Callback and generic types follow the installed package declarations.

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `label` | `string` | Yes | Accessible name for the trace. |
| `steps` | `readonly TraceStep[]` | Yes | Steps in display order; status text is supplied and localized by the host. |
| `preset` | `ClassPreset \| undefined` | No | Optional presentation preset. |
| `className` | `string \| undefined` | No | Additional root class names. |

## Composition

Keep controlled values and side effects in your application. Use the matching framework adapter rather than passing another framework’s VNodes through Preact callbacks. The live page groups this control with related variants and composition helpers.

This reference is generated from the local `package` library source. Rebuild it with `node scripts/generate-api.mjs`.
