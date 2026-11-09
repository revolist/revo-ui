# StatusFeedbackPanel

Semantic badges, counters, alerts, progress indicators, loading surfaces, empty states and feedback panels.

[Live examples and formatted usage](https://ui.rv-grid.com/components/status-and-feedback/) · [Component index](../../README.md#complete-component-reference)

Preact: `import { StatusFeedbackPanel } from '@revolist/ui/preact'`

React: `import { StatusFeedbackPanel } from '@revolist/ui/react'`

Vue: `import { StatusFeedbackPanel } from '@revolist/ui/vue'`

Angular/Svelte: pass `component="StatusFeedbackPanel"` to the framework's `UiComponent` host. See the [framework guides](https://ui.rv-grid.com/frameworks/) for state, callbacks and slots.

## Props

The table lists library-declared props. Standard inherited HTML attributes are omitted to keep the reference focused. Callback and generic types follow the installed package declarations.

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `autoDismissMs` | `number \| undefined` | No | Component adapters only: dismiss settled neutral/success items after this delay. Disabled by default. |
| `onDismissItem` | `((id: string) => void) \| undefined` | No | The owner removes the item after its exit animation. |
| `compact` | `boolean \| undefined` | No |  |
| `onClose` | `(() => void) \| undefined` | No |  |
| `closeLabel` | `string \| undefined` | No |  |
| `localeText` | `Partial<StatusFeedbackLocaleText> \| undefined` | No |  |
| `title` | `string` | Yes |  |
| `items` | `readonly StatusFeedbackItem[]` | Yes |  |
| `ariaLabel` | `string \| undefined` | No |  |
| `className` | `string \| undefined` | No |  |
| `collapsed` | `boolean \| undefined` | No |  |
| `onCollapsedChange` | `((collapsed: boolean) => void) \| undefined` | No |  |
| `collapseLabel` | `string \| undefined` | No |  |
| `expandLabel` | `string \| undefined` | No |  |
| `popover` | `StatusFeedbackPopoverController \| undefined` | No |  |

## Composition

Keep controlled values and side effects in your application. Use the matching framework adapter rather than passing another framework’s VNodes through Preact callbacks. The live page groups this control with related variants and composition helpers.

This reference is generated from the local `package` library source. Rebuild it with `node scripts/generate-api.mjs`.
