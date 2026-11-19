# DateRangePicker

Calendar views, date selection and date ranges.

[Live examples and formatted usage](https://ui.rv-grid.com/components/calendar-and-dates/) · [Component index](../../README.md#complete-component-reference)

Preact: `import { DateRangePicker } from '@revolist/ui/preact'`

React: `import { DateRangePicker } from '@revolist/ui/react'`

Vue: `import { DateRangePicker } from '@revolist/ui/vue'`

Angular/Svelte: pass `component="DateRangePicker"` to the framework's `UiComponent` host. See the [framework guides](https://ui.rv-grid.com/frameworks/) for state, callbacks and slots.

## Props

The table lists library-declared props. Standard inherited HTML attributes are omitted to keep the reference focused. Callback and generic types follow the installed package declarations.

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `value` | `CalendarDateRange \| undefined` | No |  |
| `defaultValue` | `CalendarDateRange \| undefined` | No | Initial uncontrolled ISO range. |
| `onChange` | `((value: CalendarDateRange) => void) \| undefined` | No | Emits a complete, ordered ISO range. |
| `onClear` | `(() => void) \| undefined` | No | Requests clearing a controlled range. |
| `fromName` | `string \| undefined` | No | Form field name for the ISO start date. |
| `toName` | `string \| undefined` | No | Form field name for the ISO end date. |
| `min` | `number \| undefined` | No | Minimum length in nights. Defaults to zero. |
| `max` | `number \| undefined` | No | Maximum length in nights. |
| `excludeDisabled` | `boolean \| undefined` | No | Reject ranges containing disabled interior dates. |
| `presets` | `readonly ({ label: string; date: ISODateString; } \| { label: string; selection: CalendarDateRange; })[] \| undefined` | No | Preset endpoints or complete ISO ranges. |
| `label` | `string` | Yes |  |
| `fromLabel` | `string` | Yes |  |
| `toLabel` | `string` | Yes |  |
| `openLabel` | `string` | Yes |  |
| `month` | `ISODateString \| undefined` | No | Controlled visible calendar month, specified as an ISO civil date. |
| `onMonthChange` | `((month: ISODateString) => void) \| undefined` | No | Requests the first day of the newly visible month after calendar navigation. |
| `referenceDate` | `ISODateString \| undefined` | No |  |
| `previewInvalid` | `boolean \| undefined` | No | Marks the current preview as unavailable without changing selection. |
| `previewDescription` | `string \| undefined` | No | Localized explanation, announced politely and linked to invalid preview days. |
| `calendarSystem` | `DisplayCalendarSystem \| undefined` | No |  |
| `dir` | `"ltr" \| "rtl" \| undefined` | No |  |
| `numberOfMonths` | `number \| undefined` | No |  |
| `pagedNavigation` | `boolean \| undefined` | No |  |
| `reverseMonths` | `boolean \| undefined` | No |  |
| `captionLayout` | `"label" \| "dropdown" \| "dropdown-months" \| "dropdown-years" \| undefined` | No |  |
| `startMonth` | `ISODateString \| undefined` | No | Navigation bounds; unlike minDate/maxDate these do not disable day values. |
| `endMonth` | `ISODateString \| undefined` | No |  |
| `disableNavigation` | `boolean \| undefined` | No |  |
| `showWeekNumber` | `boolean \| undefined` | No |  |
| `weekNumbering` | `"iso" \| "local" \| undefined` | No |  |
| `formatWeekNumber` | `((week: number) => string) \| undefined` | No |  |
| `footer` | `ComponentChildren` | No |  |
| `cellSize` | `number \| undefined` | No |  |
| `referenceInstant` | `Date \| undefined` | No | Overrides the current instant used to resolve Today and the initial month of an empty picker. Defaults to UTC when no timezone is supplied. |
| `timeZone` | `string \| undefined` | No | IANA timezone used to resolve Today. Uses the current instant by default and leaves ISO selections unchanged. |
| `locale` | `string \| undefined` | No |  |
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
| `translations` | `Partial<CalendarTranslations> \| undefined` | No | Overrides any subset of the exported English calendar translations. |
| `className` | `string \| undefined` | No |  |
| `dayClassName` | `string \| ((date: ISODateString, context: CalendarDayContext) => string \| undefined) \| undefined` | No |  |
| `renderDay` | `((date: ISODateString, context: CalendarDayContext) => ComponentChildren) \| undefined` | No |  |
| `formatMonth` | `((month: ISODateString, locale: string) => string) \| undefined` | No |  |
| `formatWeekday` | `((date: ISODateString, locale: string) => string) \| undefined` | No |  |
| `formatDayLabel` | `((date: ISODateString, locale: string) => string) \| undefined` | No |  |
| `validateSelection` | `((date: ISODateString, context: CalendarSelectionValidationContext) => CalendarSelectionValidationResult) \| undefined` | No |  |
| `onInvalidSelection` | `((reason: string, date: ISODateString) => void) \| undefined` | No |  |
| `onViewChange` | `((view: CalendarView) => void) \| undefined` | No |  |
| `disabled` | `boolean \| undefined` | No |  |
| `open` | `boolean \| undefined` | No | Controlled popup visibility. |
| `defaultOpen` | `boolean \| undefined` | No | Initial popup visibility in uncontrolled mode. Defaults to false. |
| `onOpenChange` | `((open: boolean) => void) \| undefined` | No | Requests a visibility change after trigger, selection or dismissal. |
| `dateInput` | `boolean \| DateInputOptions \| undefined` | No | Configure typed date entry, or hide the input with false. Entry defaults to ISO. |
| `defaultMonth` | `ISODateString \| undefined` | No | Initial visible month for uncontrolled navigation. |
| `closeOnSelect` | `boolean \| undefined` | No | Close after a complete calendar selection. Defaults to true. |
| `required` | `boolean \| undefined` | No | Require a committed selection before submitting the enclosing form. |
| `clearable` | `boolean \| undefined` | No | Show a clear button for an existing selection. |
| `clearLabel` | `string \| undefined` | No | Localized text and accessible name for the clear button. |
| `popup` | `Pick<PopoverProps, "appendTo" \| "closeOnOutside" \| "closeOnEscape"> \| undefined` | No | Mount scope and dismissal options for the calendar popup. |
| `renderTrigger` | `((props: DatePickerTriggerProps) => ComponentChildren) \| undefined` | No | Replace the calendar trigger. Forward the provided props to a button. |
| `readOnly` | `boolean \| undefined` | No |  |

## Composition

Keep controlled values and side effects in your application. Use the matching framework adapter rather than passing another framework’s VNodes through Preact callbacks. The live page groups this control with related variants and composition helpers.

This reference is generated from the local `package` library source. Rebuild it with `node scripts/generate-api.mjs`.
