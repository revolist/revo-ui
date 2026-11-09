# Shared editor lists

`EditorList` owns single-selection keyboard navigation (arrows, Home and End, skipping disabled rows). `EditorListItem` owns option semantics, selection state, tab stops and button presentation. Callers supply the controlled selection and click handler.

`EditorListItemContent` supplies reusable icon, primary label and optional secondary description layout. Icons are decorative; callers may supply accessible names on the option. `classNames` preserves product-specific styling hooks. `EditorListGroup` supplies an accessible labeled group and visible heading while keeping navigation under the enclosing list.

The Format cells category list and advanced visual-format list both reuse these owners. Format examples, grouping, custom definitions, translation and format evaluation remain in Pro. Gallery: Formatting controls → Icon selection lists.
