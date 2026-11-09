# Shared calendar

The visual reference is [shadcn Calendar](https://ui.shadcn.com/docs/components/base/calendar). We retain the product's standard blue selection, ISO civil-date values and Preact/native controls. This is an additive shared API, not a React DayPicker compatibility layer.

## Supported compositions

| Reference/example         | Shared API                                                                                                           |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Basic date selection      | `CalendarPicker` with controlled `selected` / `onSelectionChange`                                                    |
| Multiple dates            | `mode="multiple"`, optional `required`, `min`, `max` (date count)                                                    |
| Range and multiple months | `mode="range"`, `numberOfMonths`, `pagedNavigation`, `reverseMonths`; responsive month wrapping                      |
| Month/year selectors      | `captionLayout="dropdown"`, `dropdown-months`, or `dropdown-years`                                                   |
| Presets                   | Typed `presets` for a date, date array or range; low-level Calendar also accepts date presets                        |
| Date/time                 | `footer` composes shared native time inputs; converting civil time to an instant stays with Dates/product policy     |
| Booked dates              | `isDateDisabled`, min/max dates, optional `dayClassName` / `renderDay`                                               |
| Cell sizing               | `cellSize` or `--revo-calendar-cell-size` (`--cell-size` alias), minimum 24px for the numeric option                 |
| Week numbers              | `showWeekNumber`, `weekNumbering="iso"` (default) or `local`, optional formatter                                     |
| RTL/localization          | `dir`, locale, translated controls and custom formatters; mirrored arrows and horizontal keys; logical range corners |
| Persian/Jalali            | `calendarSystem="persian"`, e.g. `locale="fa-IR"`, `weekStartsOn={6}`                                                |
| Hijri                     | `calendarSystem="islamic-umalqura"`, e.g. `locale="ar-SA"`; distinct from Persian                                    |
| Today in a timezone       | `referenceInstant` + `timeZone`, or explicit `referenceDate`                                                         |

Range `min` / `max` measure nights (difference between endpoints), not inclusive date count. `excludeDisabled` rejects an interval through unavailable dates and restarts its pending anchor at the clicked endpoint. Controlled range state may contain `{ from }` while awaiting the end date. Required single selection cannot be cleared by clicking itself; multiple selection can be built up to its minimum but cannot be removed below it. Presets commit complete supplied selections atomically. Selection callbacks can provide additional error presentation via `onInvalidSelection`.

While choosing a range end, candidates blocked by `min`, `max`, or `excludeDisabled` receive a red preview and the translated `invalidSelection` explanation. Keyboard focus uses the same preview. A rejected click keeps the existing selection policy, and moving to a valid date or leaving the preview clears the feedback. Custom `validateSelection` callbacks retain their commit-time behavior; their returned messages appear when a click is rejected. The low-level `Calendar` exposes optional `previewInvalid` and `previewDescription` properties for controlled consumers.

New `CalendarPicker` compositions default to natural weeks and visible/selectable outside days, matching the reference examples; the low-level Calendar retains its legacy fixed-week/outside-day defaults. All can be configured explicitly.

The low-level `Calendar` remains controlled by `month`, `focusedDate`, `selection`, and the existing day-level callbacks. This preserves Pro's filter/operator and range-validation policy. `selectedDates` additionally supports disjoint selection. `onPresetSelect` optionally distinguishes Today/presets from day toggling; existing consumers fall back to `onSelect`. Existing date and range picker popovers forward the new presentation options and open in the correct calendar-system month.

`startMonth` / `endMonth` bound navigation. `minDate` / `maxDate` also disable dates and bound navigation. Paged windows clamp to the final valid month so an incomplete final page remains reachable. Caption dropdowns default to a window 50 years before and 10 years after the visible year; explicit bounds select a different span. Existing header/view visibility switches, natural/fixed weeks, outside-day display/selection, disabled months, render hooks and selection validation remain available.

Dates owns calendar boundaries, month arithmetic, formatting and week numbering. Non-Gregorian display uses the browser's Intl/ICU calendar data, with a clear RangeError if unavailable. All selected values remain Gregorian `YYYY-MM-DD` civil dates; they do not shift when the user's timezone changes. `timeZone` only converts the optional reference instant for Today. Custom time controls do not introduce booking or scheduling semantics.

Week numbering uses ISO's Gregorian week-year (the row's Thursday) or local first-week rules within the chosen display system. The default week starts Monday for compatibility. Calendar systems supported here have twelve months: Gregorian, Persian and Umm al-Qura. Other Intl systems are not implicitly supported. Live locale changes can retain an explicit calendar system; formatting locale alone never changes month boundaries.

Shared styles use UI tokens and legacy filter aliases. Selected endpoints use `--rv-ui-accent` with white foreground; interiors use a blue tint. Pro calendar filters retain their compact cell size and full-width panel through consumer layout variables. Disabled-date evaluation is cached once per date per render, including keyboard focus fallback.

The gallery includes basic, range, multiple, dropdowns, presets, time, booked/custom cells, week numbers, both non-Gregorian systems, timezone-safe Today and natural-week/locked-navigation examples. Tests separately cover date arithmetic, new selection behavior and existing Pro date-filter commits.

Use `Legend` from `@revolist/ui/legend` beside a calendar or another visual control. It accepts a labelled `items` list with optional `tone`, CSS `color`, and `marker` (`solid`, `outline`, or `dashed`). Entries flow inline and wrap within their container. The older `@revolist/ui/filter-controls` export remains supported. A shared legend example appears next to Calendar in the gallery.
