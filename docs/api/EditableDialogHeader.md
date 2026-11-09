# EditableDialogHeader

Dialogs, confirmations, contextual surfaces and editable dialog sections with shared actions.

[Live examples and formatted usage](https://ui.rv-grid.com/components/dialogs-and-floating-surfaces/) · [Component index](../../README.md#complete-component-reference)

Preact: `import { EditableDialogHeader } from '@revolist/ui/preact'`

React: `import { EditableDialogHeader } from '@revolist/ui/react'`

Vue: `import { EditableDialogHeader } from '@revolist/ui/vue'`

Angular/Svelte: pass `component="EditableDialogHeader"` to the framework's `UiComponent` host. See the [framework guides](https://ui.rv-grid.com/frameworks/) for state, callbacks and slots.

## Props

The table lists library-declared props. Standard inherited HTML attributes are omitted to keep the reference focused. Callback and generic types follow the installed package declarations.

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `name` | `string \| undefined` | No | Optional dialog name above the editable item title. |
| `title` | `string` | Yes |  |
| `onClose` | `(() => void) \| undefined` | No |  |
| `titleId` | `string` | Yes |  |
| `description` | `ComponentChildren` | No |  |
| `inputLabel` | `string` | Yes |  |
| `titleHidden` | `boolean \| undefined` | No |  |
| `headingClass` | `string \| undefined` | No |  |
| `kickerClass` | `string \| undefined` | No |  |
| `titleClass` | `string \| undefined` | No |  |
| `inputProps` | `false \| (Omit<h.JSX.InputHTMLAttributes<HTMLInputElement>, "ref"> & { [attribute: &#96;data-${string}&#96;]: unknown; }) \| undefined` | No | false renders a static title while retaining the same header layout. |
| `closeLabel` | `string` | Yes |  |
| `closeProps` | `Omit<h.JSX.ButtonHTMLAttributes<HTMLButtonElement>, "ref"> \| undefined` | No |  |

## Composition

Keep controlled values and side effects in your application. Use the matching framework adapter rather than passing another framework’s VNodes through Preact callbacks. The live page groups this control with related variants and composition helpers.

This reference is generated from the local `package` library source. Rebuild it with `node scripts/generate-api.mjs`.
