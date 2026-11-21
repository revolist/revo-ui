# Attachments

Text, search and numeric entry; field labels, validation, inline layouts and editor drafts.

[Live examples and formatted usage](https://ui.rv-grid.com/components/attachments/) · [Component index](../../README.md#complete-component-reference)

Preact: `import { Attachments } from '@revolist/ui/preact'`

React: `import { Attachments } from '@revolist/ui/react'`

Vue: `import { Attachments } from '@revolist/ui/vue'`

Angular/Svelte: pass `component="Attachments"` to the framework's `UiComponent` host. See the [framework guides](https://ui.rv-grid.com/frameworks/) for state, callbacks and slots.

## Props

The table lists library-declared props. Standard inherited HTML attributes are omitted to keep the reference focused. Callback and generic types follow the installed package declarations.

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `label` | `string` | Yes | Accessible label for the file list. |
| `items` | `readonly AttachmentItem[]` | Yes | Files in display order. |
| `onRemove` | `((id: string) => void) \| undefined` | No | Called when a file is removed; omit for a read-only list. |
| `removeLabel` | `(item: AttachmentItem) => string` | Yes | Localized remove action label for a file. |
| `preset` | `ClassPreset \| undefined` | No | Optional presentation preset. |
| `className` | `string \| undefined` | No | Additional root class names. |

## Composition

Keep controlled values and side effects in your application. Use the matching framework adapter rather than passing another framework’s VNodes through Preact callbacks. The live page groups this control with related variants and composition helpers.

This reference is generated from the local `package` library source. Rebuild it with `node scripts/generate-api.mjs`.
