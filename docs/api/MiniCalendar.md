# MiniCalendar

Calendar views, date selection and date ranges.

[Live examples and formatted usage](https://ui.rv-grid.com/components/calendar-and-dates/) · [Component index](../../README.md#complete-component-reference)

Preact: `import { MiniCalendar } from '@revolist/ui/preact'`

React: `import { MiniCalendar } from '@revolist/ui/react'`

Vue: `import { MiniCalendar } from '@revolist/ui/vue'`

Angular/Svelte: pass `component="MiniCalendar"` to the framework's `UiComponent` host. See the [framework guides](https://ui.rv-grid.com/frameworks/) for state, callbacks and slots.

## Props

The table lists library-declared props. Standard inherited HTML attributes are omitted to keep the reference focused. Callback and generic types follow the installed package declarations.

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `label` | `string \| undefined` | No | Accessible name describing what the date is used for. |
| `value` | `ISODateString \| null \| undefined` | No | Selected date when controlled. Pass null for no selection. |
| `defaultValue` | `ISODateString \| undefined` | No | Initially selected date when uncontrolled. |
| `onValueChange` | `((date: ISODateString) => void) \| undefined` | No | Reports selection with a date-only ISO string. |
| `startDate` | `ISODateString \| undefined` | No | First visible date when controlled. |
| `defaultStartDate` | `ISODateString \| undefined` | No | Initial first date when uncontrolled. Defaults to the selection or today. |
| `onStartDateChange` | `((date: ISODateString) => void) \| undefined` | No | Reports the first visible date after navigation. |
| `days` | `number \| undefined` | No | Days to show per page, from 1 through 31. Defaults to 5. |
| `minDate` | `ISODateString \| undefined` | No | Inclusive lower bound for selection and pagination. |
| `maxDate` | `ISODateString \| undefined` | No | Inclusive upper bound for selection and pagination. |
| `isDisabled` | `((date: ISODateString) => boolean) \| undefined` | No | Prevent individual dates from receiving focus or being selected. |
| `referenceDate` | `ISODateString \| undefined` | No | Override today for deterministic rendering or a business time zone. |
| `locale` | `string \| undefined` | No | Locale for month labels, day numbers, and full-date announcements. |
| `dir` | `"ltr" \| "rtl" \| undefined` | No | Text direction. Defaults to the surrounding layout. |
| `translations` | `{ previous?: string; next?: string; } \| undefined` | No | Translated previous and next buttons. Use {days} for the page size. |
| `preset` | `ClassPreset \| undefined` | No | Theme preset for the date strip. |
| `className` | `string \| undefined` | No | Extra class on the date strip. |

## Composition

Keep controlled values and side effects in your application. Use the matching framework adapter rather than passing another framework’s VNodes through Preact callbacks. The live page groups this control with related variants and composition helpers.

This reference is generated from the local `package` library source. Rebuild it with `node scripts/generate-api.mjs`.

Use MiniCalendar for choosing one nearby date. The row pages by its visible day count and works with the same date-only ISO strings as Calendar. The selected day and the page can each be controlled independently. Supply a reference date when today must match across rendering environments.

Arrow keys move focus in the visual direction, Home and End move to the first and last available days, and Page Up and Page Down page by the day count. Enter and Space select the focused day. Date bounds and disabled dates apply to keyboard and pointer selection. Use locale and translated navigation labels for localized interfaces.
