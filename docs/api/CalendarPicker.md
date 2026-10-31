# CalendarPicker

Calendar views and date/time fields, ranges, duration drafts, weekly availability and descriptive legends.

[Live examples and formatted usage](https://ui.rv-grid.com/#calendar-and-dates) · [Component index](../../README.md#complete-component-reference)

Preact: `import { CalendarPicker } from '@revolist/ui/preact'`

React: `import { CalendarPicker } from '@revolist/ui/react'`

Vue: `import { CalendarPicker } from '@revolist/ui/vue'`

Angular/Svelte: pass `component="CalendarPicker"` to the framework's `UiComponent` host. See the [framework guides](https://ui.rv-grid.com/?page=frameworks) for state, callbacks and slots.

## Props

The table lists library-declared props. Standard inherited HTML attributes are omitted to keep the reference focused. Callback and generic types follow the installed package declarations.

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `className` | `string \| undefined` | No |  |
| `dir` | `"ltr" \| "rtl" \| undefined` | No |  |
| `translations` | `Partial<CalendarTranslations> \| undefined` | No | Overrides any subset of the exported English calendar translations. |
| `locale` | `string \| undefined` | No |  |
| `referenceDate` | `ISODateString \| undefined` | No |  |
| `calendarSystem` | `DisplayCalendarSystem \| undefined` | No |  |
| `numberOfMonths` | `number \| undefined` | No |  |
| `pagedNavigation` | `boolean \| undefined` | No |  |
| `reverseMonths` | `boolean \| undefined` | No |  |
| `captionLayout` | `"dropdown" \| "label" \| "dropdown-months" \| "dropdown-years" \| undefined` | No |  |
| `startMonth` | `ISODateString \| undefined` | No | Navigation bounds; unlike minDate/maxDate these do not disable day values. |
| `endMonth` | `ISODateString \| undefined` | No |  |
| `disableNavigation` | `boolean \| undefined` | No |  |
| `showWeekNumber` | `boolean \| undefined` | No |  |
| `weekNumbering` | `"iso" \| "local" \| undefined` | No |  |
| `formatWeekNumber` | `((week: number) => string) \| undefined` | No |  |
| `footer` | `ComponentChildren` | No |  |
| `cellSize` | `number \| undefined` | No |  |
| `referenceInstant` | `Date \| undefined` | No | Optional instant used only to resolve Today in the requested zone. ISO date values never shift. |
| `timeZone` | `string \| undefined` | No |  |
| `weekStartsOn` | `CalendarWeekStart \| undefined` | No |  |
| `minDate` | `ISODateString \| undefined` | No |  |
| `maxDate` | `ISODateString \| undefined` | No |  |
| `isDateDisabled` | `((date: ISODateString) => boolean) \| undefined` | No |  |
| `showOutsideDays` | `boolean \| undefined` | No |  |
| `allowOutsideMonthSelection` | `boolean \| undefined` | No |  |
| `fixedWeeks` | `boolean \| undefined` | No |  |
| `showTodayButton` | `boolean \| undefined` | No |  |
| `showHeader` | `boolean \| undefined` | No | Hides the complete month/year heading and navigation row. |
| `showNavigation` | `boolean \| undefined` | No | Convenience switch for both previous and next actions. |
| `showPreviousButton` | `boolean \| undefined` | No |  |
| `showNextButton` | `boolean \| undefined` | No |  |
| `showMonthLabel` | `boolean \| undefined` | No |  |
| `showWeekdays` | `boolean \| undefined` | No |  |
| `enableYearView` | `boolean \| undefined` | No | Allows the month/year heading to open a twelve-month overview. Defaults to true. |
| `views` | `readonly CalendarView[] \| undefined` | No | Available views. Defaults to month and year; supersedes &#96;enableYearView&#96;. |
| `defaultView` | `CalendarView \| undefined` | No |  |
| `isMonthDisabled` | `((month: ISODateString) => boolean) \| undefined` | No |  |
| `dayClassName` | `string \| ((date: ISODateString, context: CalendarDayContext) => string \| undefined) \| undefined` | No |  |
| `renderDay` | `((date: ISODateString, context: CalendarDayContext) => ComponentChildren) \| undefined` | No |  |
| `formatMonth` | `((month: ISODateString, locale: string) => string) \| undefined` | No |  |
| `formatWeekday` | `((date: ISODateString, locale: string) => string) \| undefined` | No |  |
| `formatDayLabel` | `((date: ISODateString, locale: string) => string) \| undefined` | No |  |
| `validateSelection` | `((date: ISODateString, context: CalendarSelectionValidationContext) => CalendarSelectionValidationResult) \| undefined` | No |  |
| `onInvalidSelection` | `((reason: string, date: ISODateString) => void) \| undefined` | No |  |
| `onViewChange` | `((view: CalendarView) => void) \| undefined` | No |  |
| `month` | `ISODateString \| undefined` | No |  |
| `defaultMonth` | `ISODateString \| undefined` | No |  |
| `onMonthChange` | `((month: ISODateString) => void) \| undefined` | No |  |
| `required` | `boolean \| undefined` | No |  |
| `min` | `number \| undefined` | No | Multiple: selected dates. Range: nights. |
| `max` | `number \| undefined` | No |  |
| `excludeDisabled` | `boolean \| undefined` | No |  |
| `mode` | `"multiple" \| "single" \| "range" \| undefined` | No |  |
| `selected` | `ISODateString \| readonly ISODateString[] \| CalendarRangeSelection \| undefined` | No |  |
| `onSelectionChange` | `((value: ISODateString \| undefined) => void) \| ((value: readonly ISODateString[]) => void) \| ((value: CalendarRangeSelection \| undefined) => void)` | Yes |  |
| `presets` | `readonly Preset<ISODateString>[] \| readonly Preset<readonly ISODateString[]>[] \| readonly Preset<CalendarRangeSelection>[] \| undefined` | No |  |

## Composition

Keep controlled values and side effects in your application. Use the matching framework adapter rather than passing another framework’s VNodes through Preact callbacks. The live page groups this control with related variants and composition helpers.

This reference is generated from the library source pinned in `library-source.json`. Rebuild it with `node scripts/generate-api.mjs <library-workspace>`.
