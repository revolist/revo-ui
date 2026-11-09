# Shared UI ownership

`@revolist/ui` is the implementation owner for reusable product controls. Pro's
canonical exports and leaf modules contain the current implementations. Product code owns
values, validation, commands, persistence and domain layout.

AI prompt, suggestions, applied-request trail, action status, result and assistant compositions live in
`src/ai/`; `src/ai/_style.scss` owns their token-based presentation. Pro's AI
adapter owns interpretation, field policy, view commands, query execution and
view snapshots. Framework adapters and native mounting reuse the same TSX.

| Component family                                                     | Implementation owner under `src/`                                                                                                  | Style owner under `src/`                                                                                                   |
| -------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Native button, input, select, textarea, summary                      | `control-presentation.tsx`; Preact `native-control.tsx`                                                                            | `styles/_primitives.scss`, `styles/_control.scss`, `_form.scss`                                                            |
| Button variants, icon button, toggle, group                          | `controls.tsx`, `buttons/`                                                                                                         | `styles/_primitives.scss`                                                                                                  |
| Icon                                                                 | `icons/icon.tsx`                                                                                                                   | `styles/_primitives.scss`                                                                                                  |
| Checkbox                                                             | `checkbox/index.ts`                                                                                                                | `checkbox/checkbox.scss`                                                                                                   |
| Switch                                                               | `switch/index.tsx`                                                                                                                 | `styles/_primitives.scss`                                                                                                  |
| Radio group                                                          | `controls.tsx`                                                                                                                     | `_form.scss`, `styles/_compositions.scss`                                                                                  |
| Choice chips, segmented control, tabs                                | `choice-chips/`, `segmented-switch/`; semantic exports in `controls.tsx`                                                           | `styles/_primitives.scss`                                                                                                  |
| Search                                                               | `search-input/native.tsx`; Preact `search-input/index.tsx`                                                                         | `styles/_primitives.scss`                                                                                                  |
| Number/date/time inputs, stepper                                     | `controls.tsx`; grid scalar/counter adapters in `native-controls.tsx`                                                              | `_form.scss`, `styles/_editor-counter.scss`                                                                                |
| Listbox, panes, split layout                                         | `editor-layout/index.tsx`; neutral aliases in `controls.tsx`                                                                       | `editor-layout/style.scss`                                                                                                 |
| Form field, hint, error, section, disclosure                         | `form-controls/`, `controls.tsx`                                                                                                   | `_form.scss`, `styles/_compositions.scss`                                                                                  |
| Chips                                                                | `form-controls/presentation.tsx`                                                                                                   | `styles/_primitives.scss`                                                                                                  |
| Scalar/range sliders                                                 | `filter/filters/slider/`, `native-controls.tsx`                                                                                    | `filter/filters/slider/_slider.scss`, `styles/_editor-slider.scss`                                                         |
| Calendar and date pickers                                            | `calendar/`, `pickers.tsx`                                                                                                         | `calendar/_calendar.scss`, `styles/_compositions.scss`                                                                     |
| Dropdown, combobox, multi-select                                     | `dropdown/`; compositions in `pickers.tsx`                                                                                         | `dropdown/editor-dropdown.style.scss`, `styles/_compositions.scss`                                                         |
| Color palette/picker                                                 | `color-palette/`                                                                                                                   | `color-palette/*.scss`                                                                                                     |
| Resource picker, avatar                                              | `resource-picker/`, `avatar/`                                                                                                      | `resource-picker/resource-picker.scss`, `avatar/avatar.style.scss`                                                         |
| Dialog, popover, tooltip, menu, resize                               | `surfaces.tsx`, `dialog/`, `core/`; Preact compositions in `controls.tsx` and `pickers.tsx`                                        | `_dialog.scss`, `styles/_primitives.scss`, `styles/_compositions.scss`                                                     |
| Toolbar, panel, empty state, alerts                                  | `controls.tsx`                                                                                                                     | `styles/_compositions.scss`                                                                                                |
| Status feedback and badges                                           | `status-feedback/`, `controls.tsx`                                                                                                 | `status-feedback/status-feedback.scss`, `styles/_primitives.scss`                                                          |
| Loading                                                              | `native-controls.tsx`, `controls.tsx`                                                                                              | `styles/_loading.scss`, `styles/_compositions.scss`                                                                        |
| Pagination, progress, rating                                         | `pagination.ts`, `progress/`, `native-controls.tsx`, `controls.tsx`                                                                | `progress/_bar.scss`, `progress/_circular.scss`, `styles/rating.css`, `styles/pagination.css`, `styles/_compositions.scss` |
| BarChart, LineChart, AreaChart; distribution adapter and brush range | `distribution-chart/bar-chart.tsx`, `line-chart.tsx`, `area-chart.tsx`; shared `chart-frame.tsx` and `geometry.ts`; `brush-range/` | `distribution-chart/_distribution-chart.scss`, `brush-range/_brush-range.scss`                                             |
| Option rows, legend, inline fields                                   | `filter-controls.tsx`                                                                                                              | `styles/_filter-controls.scss`                                                                                             |
| Weekly time grid and keyboard/paint gesture lifecycle                | `time-grid.tsx`                                                                                                                    | `styles/_time-grid.scss`                                                                                                   |
| Highlighted text input and scroll synchronization                    | `filter-controls.tsx`                                                                                                              | `styles/_filter-controls.scss`                                                                                             |
| Theme tokens                                                         | `styles/_theme.scss`                                                                                                               | `styles/_tokens.scss` installs light/dark scopes                                                                           |

## Renderer and stylesheet contracts

- Preact products use `@revolist/ui/native-control` when they need transparent
  native attributes, native input/change events, or DOM refs. Semantic
  compositions come from `@revolist/ui/preact` or their leaf entry.
- RevoGrid/Stencil templates use `renderControl(h, tag, attributes, ...children)`
  or `controlAttributes` with their existing JSX factory. They retain Core VNodes.
- Element-returning hosts use the Preact mount adapters `createControl` or `createSearchInput`. Set the input type at
  creation. Preserve the shared class when adding product classes.
- Charts keeps its native renderer. It normalizes controls through
  `controlAttributes` and installs `native-styles.scss?inline` inside its control
  hosts. These styles are scoped and include no Preact or Pro runtime.
- Standalone product stylesheet entries include `@revolist/ui/styles.scss`.
  Products customize `--rv-ui-*`, `--rv-control-*`, and `--rv-search-input-*`
  variables. Legacy selector-based Pivot fields include the same `control.scss`
  mixin. Feature styles own layout and documented variants, not a second base.

## Intentional product adapters

Working calendars, task/card/event forms, configurators, chart inspectors and
menus keep domain policy and data operations in their product. Large title
fields and toolbar layouts remain product compositions using shared primitives.
Grid cells, timeline event/task hit targets, dependency handles, card drag
surfaces, grid expansion and virtualization keep their product geometry.
`src/ownership.test.ts` records the explicit scene exceptions and rejects new
local primitive JSX/factories elsewhere. UI's native dependency boundary and
Charts' rendering boundary have separate assertions.

Changes to a shared owner need UI coverage and the affected product's existing
integration tests. Canonical suite selection is documented in `TESTING.md`.

History and export commands use UI's `SvgButton` (or `IconButton` convenience composition) for SVG, count badge and pointer/keyboard tooltip presentation. Element-returning adapters use `decorateIconAction`; Charts renders controls through Preact. Products supply localized labels, permissions, actions and history counts. `ToolbarGroup` groups commands with spacing; `ButtonGroup` remains the bordered choice composition. Both danger button variants use the same red outline presentation.

Structured filter adapters retain aggregation, matching, amount/date validation, timezone policy, preset meaning and commit transactions. UI receives explicit data and formatted labels. Expression parsing, syntax tokens, diagnostics and debounce remain in Pro; UI owns the highlighted input's geometry and scroll synchronization. TimeGrid owns keyboard focus and paint gesture cleanup; Pro expands visual buckets into selected hourly filter values. Filter consumers use the canonical TimeGrid and BrushRange classes and semantic UI tokens.

## Grid-backed filter compositions stay in Pro

Selection lists and their search/select-all composition are owned by
`packages/pro/plugins/filter/filters/selection/list/`. They render the existing
RevoGrid `SelectionGrid`, including virtualization, grouping, option columns and
selection transactions. They must not be replaced with a shared checkbox list.
Faceted-list composition also stays in Pro; it already used native rows before
this migration. Both consume UI primitives for checkbox, search and progress.

The independent UI gallery contains no imitation selection filter.
Statistical/date preset meaning, expression parsing and time-matrix bucket
conversion remain Pro policy; generic option rows, highlighted input geometry,
distribution rendering and time-grid gestures remain UI presentation.

BarChart and LineChart are independent compact visual components, exported through the Preact entry and `@revolist/ui/bar-chart` / `@revolist/ui/line-chart`. Each owns its series rendering. The shared chart frame owns keyboard focus and tooltips; DistributionChart only dispatches to the selected standalone chart. BrushRange composes that adapter with the existing range slider; Pro retains bins, matching, date semantics and filter commits.

### Field configurators

`src/field-configurator.tsx` owns field libraries, headings, lists, drag-ready rows, neutral items and icon/caption slots. `src/styles/_field-configurator.scss` owns presentation and UI-token fallbacks. Pivot configurator exports remain aliases; its SCSS mixin delegates to UI. Query rules, native policy inspection, field metadata icons, tooltips and grid drag/drop stay in Pivot. The gallery demonstrates these primitives independently.

Pivot configuration and chart query searchable fields both use `PivotDimensionsGrid` and Pro `TreeDataPlugin` in Pivot. The UI field library is a neutral disclosure/list shell, never a substitute for these grid-backed browsers.

Active filter badges use `filter-badge.tsx` (`FilterBadge` and `FilterBadgeInfoButton`) and `styles/_filter-badge.scss`. Pro owns filter state, localization, custom render values, slots and tooltip lifecycle; its old stylesheet is a compatibility import.

FilterBadge composes ChoiceChip; ChoiceChip owns optional info and close actions as siblings of the selection button. ChoiceChipInfoButton owns the common details action appearance.

Active filter badges in Pro, Audit History, Order Explorer, planning and Pivot compose shared Choice chips. Consumers retain filter state and layout only; chip shape, surfaces, font weight and actions belong to UI.

ChoiceChip, ChoiceChips options and FilterBadge accept optional `color`. UI owns colored selected text/border/tint; chip-badge filter descriptors only supply color values, labels and filter policy.

Link-style action buttons use `Button variant="link"` or `SvgButton variant="link"`. UI owns the borderless blue text, icon spacing, hover/focus and disabled presentation; grouped-filter TextIconButton is a compatibility adapter without local appearance CSS.

## Interactive timeline track

`src/timeline-track/` owns controlled bar rendering, selection, pointer capture/movement/resizing, keyboard edits, numeric geometry helpers and track styles. Pro's Timeline editor adapter retains draft validation, localization and commits; its existing model helper exports forward to the shared model. The read-only cell timeline renderer remains in `cell-visuals/timeline.ts`.

## Editable dialog composition

`dialog/dialog.parts.tsx` owns editable-name headers (including optional dialog caption), close controls and the standard action footer with start/end slots. `_dialog.scss` owns header insets, message separation and footer layout. Scheduler, Kanban and Gantt retain validation, permissions, translations and persistence, without local footer-button appearance overrides.

## Selection lists

`selection-list.ts` exposes the general Listbox/option/group API backed by `editor-layout/index.tsx` and its existing stylesheet. Optional icon/label/description content lives in the shared option owner. Format Cells and generic gallery lists use the same markup, keyboard handling and styles; formatter-specific IDs and data policy stay in Pro.

## Preact element construction

All shared UI markup is Preact TSX. Element-returning native APIs mount the same TSX through `preact-mount.ts`; they do not build parallel DOM trees. Lifecycle controllers may attach, position, focus and dispose rendered roots. Grid/Stencil VNode adapters retain the Core rendering contract. Charts controls use Preact through the same mount boundary; chart scene/export geometry remains scene-owned.
