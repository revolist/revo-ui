# CalendarYearGrid

Calendar views and date/time fields, ranges, duration drafts, weekly availability and descriptive legends.

[Live examples and formatted usage](https://ui.rv-grid.com/components/calendar-and-dates/) · [Component index](../../README.md#complete-component-reference)

Preact: `import { CalendarYearGrid } from '@revolist/ui/preact'`

React: `import { CalendarYearGrid } from '@revolist/ui/react'`

Vue: `import { CalendarYearGrid } from '@revolist/ui/vue'`

Angular/Svelte: pass `component="CalendarYearGrid"` to the framework's `UiComponent` host. See the [framework guides](https://ui.rv-grid.com/frameworks/) for state, callbacks and slots.

## Props

The table lists library-declared props. Standard inherited HTML attributes are omitted to keep the reference focused. Callback and generic types follow the installed package declarations.

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `month` | `ISODateString` | Yes |  |
| `system` | `DisplayCalendarSystem \| undefined` | No |  |
| `referenceDate` | `ISODateString \| undefined` | No |  |
| `minDate` | `ISODateString \| undefined` | No |  |
| `maxDate` | `ISODateString \| undefined` | No |  |
| `isMonthDisabled` | `((month: ISODateString) => boolean) \| undefined` | No |  |
| `locale` | `string` | Yes |  |
| `ariaLabel` | `string` | Yes |  |
| `onSelect` | `(month: ISODateString) => void` | Yes |  |
| `onEscape` | `() => void` | Yes |  |

## Composition

Keep controlled values and side effects in your application. Use the matching framework adapter rather than passing another framework’s VNodes through Preact callbacks. The live page groups this control with related variants and composition helpers.

This reference is generated from the local `package/src` library source. Rebuild it with `node scripts/generate-api.mjs`.
