# LookupField

Search remote records and apply linked-record selections.

[Live examples and formatted usage](https://ui.rv-grid.com/components/remote-lookup-field/) · [Component index](../../README.md#complete-component-reference)

Preact: `import { LookupField } from '@revolist/ui/dropdown/lookup-field'`

React: `import { LookupField } from '@revolist/ui/react'`

Vue: `import { LookupField } from '@revolist/ui/vue'`

Angular/Svelte: pass `component="LookupField"` to the framework's `UiComponent` host. See the [framework guides](https://ui.rv-grid.com/frameworks/) for state, callbacks and slots.

## Props

The table lists library-declared props. Standard inherited HTML attributes are omitted to keep the reference focused. Callback and generic types follow the installed package declarations.

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `initial` | `LookupId \| LookupId[] \| null` | Yes | Initial selected record ID, multiple IDs, or null for an empty selection. |
| `options` | `LookupFieldOptions` | Yes | Remote data source, selection mode, validation, text and commit behavior. |
| `context` | `unknown` | Yes | Application context forwarded to the remote data source as dataContext. |
| `apply` | `(value: LookupId \| LookupId[] \| null) => void` | Yes | Commits the selected record IDs. Update application state and close the editor. |
| `cancel` | `() => void` | Yes | Closes the editor without applying the current draft. |

## Composition

Keep controlled values and side effects in your application. Use the matching framework adapter rather than passing another framework’s VNodes through Preact callbacks. The live page groups this control with related variants and composition helpers.

This reference is generated from the local `package/src` library source. Rebuild it with `node scripts/generate-api.mjs`.
