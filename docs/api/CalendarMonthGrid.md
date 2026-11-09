# CalendarMonthGrid

Calendar views and date/time fields, ranges, duration drafts, weekly availability and descriptive legends.

[Live examples and formatted usage](https://ui.rv-grid.com/components/calendar-and-dates/) · [Component index](../../README.md#complete-component-reference)

Preact: `import { CalendarMonthGrid } from '@revolist/ui/preact'`

React: `import { CalendarMonthGrid } from '@revolist/ui/react'`

Vue: `import { CalendarMonthGrid } from '@revolist/ui/vue'`

Angular/Svelte: pass `component="CalendarMonthGrid"` to the framework's `UiComponent` host. See the [framework guides](https://ui.rv-grid.com/frameworks/) for state, callbacks and slots.

## Props

The table lists library-declared props. Standard inherited HTML attributes are omitted to keep the reference focused. Callback and generic types follow the installed package declarations.

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `dates` | `readonly ISODateString[]` | Yes |  |
| `system` | `DisplayCalendarSystem \| undefined` | No |  |
| `selectedDates` | `readonly ISODateString[] \| undefined` | No |  |
| `visibleMonths` | `readonly ISODateString[] \| undefined` | No |  |
| `weekNumber` | `((date: ISODateString) => string) \| undefined` | No |  |
| `weekNumberLabel` | `string \| undefined` | No |  |
| `month` | `ISODateString` | Yes |  |
| `focusedDate` | `ISODateString` | Yes |  |
| `referenceDate` | `ISODateString \| undefined` | No |  |
| `selection` | `CalendarDateRange \| undefined` | No |  |
| `preview` | `CalendarDateRange \| undefined` | No |  |
| `previewInvalid` | `boolean \| undefined` | No |  |
| `previewDescriptionId` | `string \| undefined` | No |  |
| `showOutsideDays` | `boolean` | Yes |  |
| `allowOutsideMonthSelection` | `boolean` | Yes |  |
| `dayClassName` | `string \| ((date: ISODateString, context: CalendarDayContext) => string \| undefined) \| undefined` | No |  |
| `renderDay` | `((date: ISODateString, context: CalendarDayContext) => ComponentChildren) \| undefined` | No |  |
| `isDisabled` | `(date: ISODateString) => boolean` | Yes |  |
| `formatDayLabel` | `(date: ISODateString) => string` | Yes |  |
| `setDayRef` | `(date: ISODateString, element: HTMLButtonElement \| null) => void` | Yes |  |
| `onFocus` | `(date: ISODateString) => void` | Yes |  |
| `onPreview` | `(date?: ISODateString) => void` | Yes |  |
| `onKeyDown` | `(event: h.JSX.TargetedKeyboardEvent<HTMLButtonElement>, date: ISODateString) => void` | Yes |  |
| `onSelect` | `(date: ISODateString) => void` | Yes |  |

## Composition

Keep controlled values and side effects in your application. Use the matching framework adapter rather than passing another framework’s VNodes through Preact callbacks. The live page groups this control with related variants and composition helpers.

This reference is generated from the local `package` library source. Rebuild it with `node scripts/generate-api.mjs`.
