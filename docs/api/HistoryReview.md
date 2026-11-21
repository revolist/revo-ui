# HistoryReview

Inspect saved versions and compare changes to grid cells.

[Live examples and formatted usage](https://ui.rv-grid.com/components/history/#example-grid-version-history) · [Component index](../../README.md#complete-component-reference)

Preact: `import { HistoryReview } from '@revolist/ui/preact'`

React: `import { HistoryReview } from '@revolist/ui/react'`

Vue: `import { HistoryReview } from '@revolist/ui/vue'`

Angular/Svelte: pass `component="HistoryReview"` to the framework's `UiComponent` host. See the [framework guides](https://ui.rv-grid.com/frameworks/) for state, callbacks and slots.

## Props

The table lists library-declared props. Standard inherited HTML attributes are omitted to keep the reference focused. Callback and generic types follow the installed package declarations.

| Prop            | Type                                  | Required | Description                                                               |
| --------------- | ------------------------------------- | -------- | ------------------------------------------------------------------------- |
| `label`         | `string`                              | Yes      | Accessible title for the review.                                          |
| `versions`      | `readonly HistoryVersion[]`           | Yes      | Versions in newest-first order.                                           |
| `currentId`     | `string \| undefined`                 | No       | Current version ID. Defaults to the first version.                        |
| `value`         | `string \| undefined`                 | No       | Controlled ID of the version being inspected.                             |
| `onValueChange` | `((id: string) => void) \| undefined` | No       | Reports a selected version ID.                                            |
| `open`          | `boolean \| undefined`                | No       | Omit for inline rendering or control modal visibility with a boolean.     |
| `onClose`       | `(() => void) \| undefined`           | No       | Reports that the modal should close.                                      |
| `onRestore`     | `((id: string) => void) \| undefined` | No       | Runs after confirming a restore. The host persists the resulting version. |
| `labels`        | `HistoryReviewLabels`                 | Yes      | Localized review, comparison and restore strings.                         |
| `preset`        | `ClassPreset \| undefined`            | No       | Optional presentation preset.                                             |
| `className`     | `string \| undefined`                 | No       | Additional root classes.                                                  |

## Composition

Keep controlled values and side effects in your application. Use the matching framework adapter rather than passing another framework’s VNodes through Preact callbacks. The live page groups this control with related variants and composition helpers.

This reference is generated from the local `package` library source. Rebuild it with `node scripts/generate-api.mjs`.

## Reviewing grid changes

Supply full snapshots newest first. Use stable cell IDs across revisions, including the sheet identity for multi-sheet workbooks. Addresses and display values are supplied by the host. Set a cell's value to `null` or omit its ID when the cell is empty. The comparison shows values before and after the selected revision, using either the preceding snapshot or the current version as the starting point.

Use `labels.comparison` for the visible and accessible switch label, and `labels.previous` and `labels.current` for its options. Set `labels.changesTable` to give the changes table a separate accessible name. The current-version badge, change counts, empty states, and restore labels can also be localized.

Supply an author name to show a shared avatar with initials. An optional `authorAvatarUrl` supplies the photo, with initials used if the photo cannot load.

Use the inline review for an audit panel or a comment's edit history. Pass `open` and `onClose` for a modal review. The optional restore handler receives the confirmed revision ID. The host can persist a new revision while retaining the earlier snapshots.
