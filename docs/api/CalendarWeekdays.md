# CalendarWeekdays

Calendar views and date/time fields, ranges, duration drafts, weekly availability and descriptive legends.

[Live examples and formatted usage](https://ui.rv-grid.com/components/calendar-and-dates/) · [Component index](../../README.md#complete-component-reference)

Preact: `import { CalendarWeekdays } from '@revolist/ui/preact'`

React: `import { CalendarWeekdays } from '@revolist/ui/react'`

Vue: `import { CalendarWeekdays } from '@revolist/ui/vue'`

Angular/Svelte: pass `component="CalendarWeekdays"` to the framework's `UiComponent` host. See the [framework guides](https://ui.rv-grid.com/frameworks/) for state, callbacks and slots.

## Props

The table lists library-declared props. Standard inherited HTML attributes are omitted to keep the reference focused. Callback and generic types follow the installed package declarations.

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `dates` | `readonly ISODateString[]` | Yes |  |
| `weekNumberLabel` | `string \| undefined` | No |  |
| `locale` | `string` | Yes |  |
| `format` | `(date: ISODateString, locale: string) => string` | Yes |  |

## Composition

Keep controlled values and side effects in your application. Use the matching framework adapter rather than passing another framework’s VNodes through Preact callbacks. The live page groups this control with related variants and composition helpers.

This reference is generated from the local `package` library source. Rebuild it with `node scripts/generate-api.mjs`.
