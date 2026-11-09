# Current UI APIs

This change removes compatibility-only component names, CSS hooks and forwarding modules. Native mounting APIs (`createPreactElement`, `mountColorPicker`, native controls and dialogs) and React, Vue, Angular and Svelte adapters remain supported.

## Component names

Use the current names from the matching framework entry:

| Removed name     | Current name           |
| ---------------- | ---------------------- |
| `Icon`           | `SvgIcon`              |
| `RemovableChip`  | `FilterChip`           |
| `Slider`         | `SingleValueSlider`    |
| `RangeSlider`    | `PreactRangeSlider`    |
| `ResourcePicker` | `SharedResourcePicker` |
| `FeedbackPanel`  | `StatusFeedbackPanel`  |

The same names apply to the Angular/Svelte `UiComponent` component selector. Local import aliases are ordinary language aliases and remain available, for example `import { SingleValueSlider as Slider } from '@revolist/ui/react'`.

Import `Legend` from `@revolist/ui/legend` or the framework entry, rather than `@revolist/ui/filter-controls`. Use `ControlTooltip` instead of the unused `TooltipSurface` export. Render `DialogActionFooter` or `ActionFooterView` directly instead of calling the removed `renderDialogActionFooter(h, props)` signature.

## Styling

`TimeGrid` and `BrushRange` no longer accept `legacyClassPrefix`. Use `rv-time-grid__*` and `brush-range__*` respectively. Slider endpoints use the shared `fromSlider` and `toSlider` classes. Product-owned filter headers, summaries and action controls retain their product-owned names.

Checkbox customization uses `--rv-ui-checkbox-bg`, `--rv-ui-checkbox-border`, `--rv-ui-checkbox-checked`, `--rv-ui-checkbox-check` and `--rv-ui-checkbox-focus`; RowSelect/ColumnDialog variable aliases are removed.

The active rating and pagination style rules are now in `styles/rating.css` and `styles/pagination.css`, and remain included by the main stylesheet. Primitive `$legacy-*` Sass aliases are removed; internal styles use the existing palette lookup API. The unused scalar-slider fill element is removed; its current range input owns the fill.

## Date/time labels

A time picker uses `text.chooseTime`, falling back to its default time label. It no longer borrows `text.chooseDate`. Date pickers continue to use `text.chooseDate`.

## Source ownership

Forwarding-only `.ts` modules have been replaced by their owning TSX implementations at the canonical module paths. Public package entry names stay unchanged. The native mounting bridge remains the shared owner of element-returning adapters.
