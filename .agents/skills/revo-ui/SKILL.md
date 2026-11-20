---
name: revo-ui
description: Build or fix controls with @revolist/ui, including framework adapters, date filters, styling and popup lifecycle.
---

# Revo UI

Look up the control in the [gallery](https://ui.rv-grid.com/) and check its props against the installed package. Match the adapter to the host using the [framework guides](https://ui.rv-grid.com/frameworks/). Load `@revolist/ui/styles.css` once at the application entry point when using the aggregate stylesheet.

In React, import named components from `@revolist/ui/react`. Derive callback and value types from the component when the installed adapter already declares them. Keep the selected value in application state and derive displayed records from that state. For a date-range filter, inspect `DateRangePicker` and its required field and trigger labels. Its change callback receives a range with `from` and `to`. For ISO date-only records, compare both endpoints inclusively. For timestamps, first resolve the business time zone. Provide a way to clear the filter if the user needs all rows again.

For Vue, Angular, Svelte and Preact, use the example for that adapter to determine binding and event syntax. For manual vanilla mounts, destroy the mount when its host is removed. For floating controls, verify keyboard opening, dismissal and focus return in the surrounding form. For theme changes, inspect the gallery's public tokens and scope on the element containing the control.

In a Revo UI checkout, start with the exported adapter in `package/`, then inspect the owning component and its tests. In a consumer app, rely on installed declarations and the gallery.
