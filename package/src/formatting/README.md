# Formatting presentation

`@revolist/ui/formatting` contains optional Preact components with no grid, Pro or format-engine dependency:

| Component                              | Responsibility                                                         | Pro adapter                                                                          |
| -------------------------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `InspectorSection`                     | Native disclosure, icon, expanded state and localized action labels    | Resolves grid locale templates; supplies section contents                            |
| `IconChoiceGroup`                      | Controlled single-choice icon buttons and accessible labels            | Supplies horizontal/vertical alignment choices                                       |
| `IconToggleButton`                     | Controlled pressed icon control                                        | Supplies typography and wrapping patches                                             |
| `useControlTooltip` / `ControlTooltip` | Inline focus/hover hints; first Escape dismisses only the visible hint | Existing import path re-exports this owner                                           |
| `TypographyControls`                   | Font selection, optional size and independent text-style toggles       | Maps `DataGridCellAppearance`, allowed fonts and locale into explicit values/patches |
| `ComparisonPreview`                    | Original/formatted presentation, hint and supplied styles/content      | Computes formatted content, grid alignment and appearance color precedence           |

Inspector `open` supplies its initial state; native details toggling owns subsequent state. Choice and typography values remain controlled by consumers. SVG strings must be trusted application assets. The tooltip is inline for controls that need local Escape consumption; floating tooltip/popover controllers retain their separate placement owner.

Import `@revolist/ui/styles.scss` once. The shared stylesheet preserves existing `rv-format-*` hooks and honors Pro's `--rv-format-divider` / `--rv-format-muted` aliases, with standalone UI token fallbacks. The comparison's optional `formattedClassName` preserves consumer-specific selectors without embedding grid class names into UI.

Already shared and reused: split panes, preset lists, native inputs/selects/checkboxes/buttons, color picker and cell visuals. The advanced presentation list now uses the shared `EditorList` keyboard owner, including grouped entries and the None choice. Its format definitions and controls schema remain in Pro.

Keep these in Pro: selected cell/column discovery, readonly compatibility, format catalog/grouping, advanced option defaults, number/date/currency/Excel code evaluation, preview alignment policy, formatting persistence, apply/clear/history and grid-specific locale resolution. These are product policy rather than standalone controls.

The gallery's Formatting controls section contains four independent examples. Tests cover typography patches and clearing, controlled selection, inspector expansion, literal comparison values, and tooltip-first Escape. Real-grid tests separately cover custom code validity, selection, non-destructive formatting and panel lifecycle.
