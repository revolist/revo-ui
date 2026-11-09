# Shared dialogs

Native DOM consumers use `DialogController` / `createDialogElements`. Pro's `DialogPlugin` adapts that owner to grid theme, popup and focus coordination. Scheduler dispatch uses that adapter.

Preact editors compose `DialogForm`, `DialogHeader`, `DialogBody`, `DialogFooter`, `DialogActions`, `DialogCloseButton` and `DialogTitleInput` from `@revolist/ui/dialog/dialog.parts`. Header and title refs refer to native elements. Existing `DialogHeader`, `DialogBody` and `DialogFooter` exports from `pickers` remain aliases to this owner.

Import shared UI styles once. Parts add the same `rv-dialog__*` classes as native DOM dialogs. Product classes and native attributes/events pass through. The close control always uses `type="button"`; submit buttons remain explicit in the consumer. Editable titles are transparent, inherit dialog colors and expose the focus accent on the header. Titles still require a visible or screen-reader label supplied by the editor.

Kanban card, Gantt task and Scheduler event editors share these parts. They retain native `<dialog>` roots, opening/closing, drag hooks, accessible names and form policy. Custom Gantt editor renderers retain their existing lifecycle. Resource/color/date controls already use shared UI primitives with product adapters; parsing, validation, readonly state and data commits stay in their products.

Products retain layout widths, field grids, schema-specific labels/icons and theme-variable aliases. This avoids replacing rich editors with a generic schema engine. Use `--rv-dialog-*` variables for panel customization; `--rv-dialog-title-size` and `--rv-dialog-title-accent` customize the editable heading.
