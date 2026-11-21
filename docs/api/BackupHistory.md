# BackupHistory

Browse snapshots and choose a restore point.

[Live examples and formatted usage](https://ui.rv-grid.com/components/backup-history/) · [Component index](../../README.md#complete-component-reference)

Preact: `import { BackupHistory } from '@revolist/ui/preact'`

React: `import { BackupHistory } from '@revolist/ui/react'`

Vue: `import { BackupHistory } from '@revolist/ui/vue'`

Angular/Svelte: pass `component="BackupHistory"` to the framework's `UiComponent` host. See the [framework guides](https://ui.rv-grid.com/frameworks/) for state, callbacks and slots.

## Props

The table lists library-declared props. Standard inherited HTML attributes are omitted to keep the reference focused. Callback and generic types follow the installed package declarations.

| Prop            | Type                                  | Required | Description                                                                 |
| --------------- | ------------------------------------- | -------- | --------------------------------------------------------------------------- |
| `label`         | `string`                              | Yes      | Accessible title for the history region.                                    |
| `snapshots`     | `readonly BackupSnapshot[]`           | Yes      | Snapshots ordered from oldest to newest.                                    |
| `value`         | `string \| undefined`                 | No       | Controlled snapshot ID. Initially selects the newest snapshot when omitted. |
| `onValueChange` | `((id: string) => void) \| undefined` | No       | Reports a selected snapshot ID.                                             |
| `onPreview`     | `((id: string) => void) \| undefined` | No       | Requests a non-destructive preview of the selected snapshot.                |
| `onRestore`     | `((id: string) => void) \| undefined` | No       | Requests a restore after confirmation.                                      |
| `labels`        | `BackupHistoryLabels`                 | Yes      | Localized navigation, preview and restore strings.                          |
| `preset`        | `ClassPreset \| undefined`            | No       | Optional presentation preset.                                               |
| `className`     | `string \| undefined`                 | No       | Additional root classes.                                                    |

## Composition

Keep controlled values and side effects in your application. Use the matching framework adapter rather than passing another framework’s VNodes through Preact callbacks. The live page groups this control with related variants and composition helpers.

This reference is generated from the local `package` library source. Rebuild it with `node scripts/generate-api.mjs`.

## Snapshot order

Supply snapshots from oldest to newest. The newest snapshot is initially selected, and the slider, buttons, arrow keys and touch track all change the same selection. The slider uses chronological left-to-right order, including in an RTL host.

Supply localized, display-ready dates, sizes and verification states. Mark unsuccessful or unavailable backups with `restoreDisabled`. Preview and confirmed restore callbacks receive the snapshot ID so the application can manage data and persistence.
