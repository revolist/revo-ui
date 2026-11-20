---
name: revo-ui
description: Build or fix controls with @revolist/ui, including framework adapters, date filters, styling and popup lifecycle.
---

# Revo UI

When developing Revo UI itself, use the current checkout. Follow the public export in `package.json` to the framework adapter in `package/`, then inspect the control’s implementation and colocated tests for its props and behavior. For example, trace React’s `DateRangePicker` from `package/react.ts` to `package/pickers.tsx` and `package/pickers.test.tsx`. Find local usage examples under `src/` or run `pnpm dev` from the Revo UI root to open the gallery for this branch.

When integrating Revo UI into an app, check which version or workspace dependency the app resolves. Use its exported types for the API and the [gallery](https://ui.rv-grid.com/) and [framework guides](https://ui.rv-grid.com/frameworks/) for examples. Load `@revolist/ui/styles.css` once at the application entry point when using the aggregate stylesheet.

In React, import named components from `@revolist/ui/react`. Derive callback and value types from the component when the installed adapter already declares them. Keep the selected value in application state and derive displayed records from that state. For a date-range filter, inspect `DateRangePicker` and its required field and trigger labels. Its change callback receives a range with `from` and `to`. For ISO date-only records, compare both endpoints inclusively. For timestamps, first resolve the business time zone. Provide a way to clear the filter if the user needs all rows again.

For Vue, Angular, Svelte and Preact, use the example for that adapter to determine binding and event syntax. For manual vanilla mounts, destroy the mount when its host is removed. For floating controls, verify keyboard opening, dismissal and focus return in the surrounding form. For theme changes, inspect the gallery's public tokens and scope on the element containing the control.
