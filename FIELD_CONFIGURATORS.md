# Field configuration presentation

Shared Preact components are exported from `@revolist/ui/field-configurator` and the optional Preact barrel:

- `FieldGroup` / `FieldGroupHeading`: section heading with caller-owned actions.
- `FieldList` / `FieldRow`: list, empty state, drag grip, indicator slot and native event forwarding.
- `FieldContent`: field icon and caption.
- `SelectedField`: composition of the same row/content with an action slot, preserving the row DOM and consumer class names.
- `FieldActions`: common action-strip layout.
- `FieldRemoveButton`: compact neutral adapter over the existing animated DeleteButton; retains hover rotation, disabled behavior and reduced-motion support.
- `FieldStatusBadge`: compact status with an accessible summary and active appearance. The caller supplies the text and active state.

Pivot uses these components for selected Rows, Columns, Values and Filters. It retains its settings menus, aggregation/filter calculations, field metadata, provider updates, undo/history and drag/drop logic. Existing Pivot classes and data attributes remain available to themes and tests.

Field search and the RevoGrid Pro tree are unchanged and remain product-owned. The gallery's Selected field group example demonstrates presentation and callbacks, without implementing a substitute searchable field browser.

Field appearance is owned by `package/styles/_field-configurator.scss`, with shared field palette tokens in `package/styles/_theme.scss`. Native Pivot action adapters and gallery buttons use `rv-configurator-action-button`; remove controls use `FieldRemoveButton`. Both resolve the same 28px button, 12px SVG, neutral color, hover/focus/disabled treatment and animated removal icon. Pivot styles retain host/shelf layout and domain-specific editors, rather than overriding these shared field controls.

Reordering uses `reorderFields` and `fieldDropIndex` from `@revolist/ui/field-reorder` (framework-neutral). The insertion index is a boundary in the original list, so moving downward adjusts for the removed source. No-op or invalid moves retain the original list, and repeated fields preserve their distinct instances. Full and compact Pivot delegate to these helpers and retain their domain commits and cross-section policies.

`useFieldReorder` from `@revolist/ui/field-configurator` supplies the same within-section drag events and `move` action for the gallery and chart query rows. It rejects external, canceled, stale-order and disabled gestures. Charts pass group/move policy into this adapter; their move-up buttons use its `move` action too.

Settings actions use `data-configurator-action="settings"`. Their cog remains neutral on hover, press and expansion; `data-configured="true"` adds a 5px accent dot as the only persistent configured indicator. The SVG rotates 90 degrees on hover, with motion disabled for reduced-motion preferences. Shared status badges supply the spacing before the action button and active (`SUM`, `IN 1`) or neutral (`ALL`) presentation.

`useFieldDropTarget` owns insertion feedback, midpoint hit testing, drops in row gaps, section/list whitespace, accepted `move` effects and cleanup. `useFieldReorder` delegates to it; the vertical Pivot configurator also consumes it directly for provider-owned cross-section placement. `FieldDropIndicator` is the common marker. Pivot's vertical section no longer maintains a separate drop-position or marker state machine.
