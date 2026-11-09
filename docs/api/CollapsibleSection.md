# CollapsibleSection

Expandable sections with keyboard controls and persistent draft content.

[Live examples and formatted usage](https://ui.rv-grid.com/components/accordion/) · [Component index](../../README.md#complete-component-reference)

Preact: `import { CollapsibleSection } from '@revolist/ui/preact'`

React: `import { CollapsibleSection } from '@revolist/ui/react'`

Vue: `import { CollapsibleSection } from '@revolist/ui/vue'`

Angular/Svelte: pass `component="CollapsibleSection"` to the framework's `UiComponent` host. See the [framework guides](https://ui.rv-grid.com/frameworks/) for state, callbacks and slots.

## Props

The table lists library-declared props. Standard inherited HTML attributes are omitted to keep the reference focused. Callback and generic types follow the installed package declarations.

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `title` | `ComponentChildren` | Yes | Heading displayed in the keyboard-accessible expand/collapse trigger. |
| `description` | `ComponentChildren` | No | Supporting text displayed above the expanded content. |
| `defaultOpen` | `boolean \| undefined` | No | Expand initially. Later toggles are owned by the native disclosure. |
| `children` | `ComponentChildren` | Yes | Section content; stays mounted when collapsed to preserve drafts. |
| `className` | `string \| undefined` | No | Additional CSS classes on the outer disclosure. |
| `summaryClassName` | `string \| undefined` | No | Additional CSS classes on the summary trigger. |
| `contentClassName` | `string \| undefined` | No | Additional CSS classes on the content container. |
| `descriptionClassName` | `string \| undefined` | No | Additional CSS classes on the supporting description. |
| `renderRoot` | `((props: JSX.IntrinsicElements["details"]) => ComponentChildren) \| undefined` | No | Host policies can wrap the native details without owning its presentation. |

## Composition

Keep controlled values and side effects in your application. Use the matching framework adapter rather than passing another framework’s VNodes through Preact callbacks. The live page groups this control with related variants and composition helpers.

This reference is generated from the local `package` library source. Rebuild it with `node scripts/generate-api.mjs`.
