# FileTree

Browse nested files and folders, select paths, and show file changes.

[Live examples and formatted usage](https://ui.rv-grid.com/components/tree/#example-changed-files) · [Component index](../../README.md#complete-component-reference)

Preact: `import { FileTree } from '@revolist/ui/preact'`

React: `import { FileTree } from '@revolist/ui/react'`

Vue: `import { FileTree } from '@revolist/ui/vue'`

Angular/Svelte: pass `component="FileTree"` to the framework's `UiComponent` host. See the [framework guides](https://ui.rv-grid.com/frameworks/) for state, callbacks and slots.

## Props

The table lists library-declared props. Standard inherited HTML attributes are omitted to keep the reference focused. Callback and generic types follow the installed package declarations.

| Prop               | Type                                                                                  | Required | Description                                                            |
| ------------------ | ------------------------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------- |
| `label`            | `string`                                                                              | Yes      | Accessible name of the file list.                                      |
| `nodes`            | `readonly FileTreeNode[]`                                                             | Yes      | Files and folders in display order.                                    |
| `value`            | `string \| undefined`                                                                 | No       | Controlled selected path. Use an empty string for no selection.        |
| `defaultValue`     | `string \| undefined`                                                                 | No       | Initially selected path when uncontrolled.                             |
| `expanded`         | `readonly string[] \| undefined`                                                      | No       | Controlled list of open folder paths.                                  |
| `onExpandedChange` | `((paths: string[]) => void) \| undefined`                                            | No       | Called with the open folder paths after a folder toggles.              |
| `defaultExpanded`  | `readonly string[] \| undefined`                                                      | No       | Initially open folders. Omit to start with all folders open.           |
| `onValueChange`    | `((path: string) => void) \| undefined`                                               | No       | Called when a file is selected.                                        |
| `statusLabels`     | `Partial<Record<FileChangeStatus, { label: string; marker?: string; }>> \| undefined` | No       | Localized accessible status names and optional visible marker letters. |
| `preset`           | `ClassPreset \| undefined`                                                            | No       | Optional presentation preset.                                          |
| `className`        | `string \| undefined`                                                                 | No       | Additional root class names.                                           |

## Composition

Keep controlled values and side effects in your application. Use the matching framework adapter rather than passing another framework’s VNodes through Preact callbacks. The live page groups this control with related variants and composition helpers.

This reference is generated from the local `package` library source. Rebuild it with `node scripts/generate-api.mjs`.

## Selection and expansion

The selected file uses its relative path and exposes `aria-current`. Pass `expanded` with `onExpandedChange` to control open folders and implement Expand all or Collapse all. When omitted, folders open initially unless `defaultExpanded` specifies paths.

Use `fileTreeFromPaths` from `@revolist/ui/file-tree` to group and deduplicate flat relative file paths, such as the paths returned by completed write operations. Assign the optional `added`, `modified`, or `deleted` status on file nodes. The indicator's letter is part of the visible action name, and its localized description announces the full status.
