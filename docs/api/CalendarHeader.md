# CalendarHeader

Calendar views and date/time fields, ranges, duration drafts, weekly availability and descriptive legends.

[Live examples and formatted usage](https://ui.rv-grid.com/components/calendar-and-dates/) · [Component index](../../README.md#complete-component-reference)

Preact: `import { CalendarHeader } from '@revolist/ui/preact'`

React: `import { CalendarHeader } from '@revolist/ui/react'`

Vue: `import { CalendarHeader } from '@revolist/ui/vue'`

Angular/Svelte: pass `component="CalendarHeader"` to the framework's `UiComponent` host. See the [framework guides](https://ui.rv-grid.com/frameworks/) for state, callbacks and slots.

## Props

The table lists library-declared props. Standard inherited HTML attributes are omitted to keep the reference focused. Callback and generic types follow the installed package declarations.

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `label` | `string` | Yes |  |
| `previousLabel` | `string` | Yes |  |
| `nextLabel` | `string` | Yes |  |
| `caption` | `ComponentChildren` | No |  |
| `labelAction` | `{ ariaLabel: string; onClick: () => void; } \| undefined` | No |  |
| `showLabel` | `boolean \| undefined` | No |  |
| `showPrevious` | `boolean \| undefined` | No |  |
| `showNext` | `boolean \| undefined` | No |  |
| `previousDisabled` | `boolean \| undefined` | No |  |
| `nextDisabled` | `boolean \| undefined` | No |  |
| `onPrevious` | `() => void` | Yes |  |
| `onNext` | `() => void` | Yes |  |

## Composition

Keep controlled values and side effects in your application. Use the matching framework adapter rather than passing another framework’s VNodes through Preact callbacks. The live page groups this control with related variants and composition helpers.

This reference is generated from the library source pinned in `library-source.json`. Rebuild it with `node scripts/generate-api.mjs <library-workspace>`.
