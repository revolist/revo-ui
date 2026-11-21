# Cursor

Show collaborator presence with a pointer, label and message.

[Live examples and formatted usage](https://ui.rv-grid.com/components/cursor/) · [Component index](../../README.md#complete-component-reference)

Preact: `import { Cursor } from '@revolist/ui/preact'`

React: `import { Cursor } from '@revolist/ui/react'`

Vue: `import { Cursor } from '@revolist/ui/vue'`

Angular/Svelte: pass `component="Cursor"` to the framework's `UiComponent` host. See the [framework guides](https://ui.rv-grid.com/frameworks/) for state, callbacks and slots.

## Props

The table lists library-declared props. Standard inherited HTML attributes are omitted to keep the reference focused. Callback and generic types follow the installed package declarations.

| Prop          | Type                                       | Required | Description                                                                            |
| ------------- | ------------------------------------------ | -------- | -------------------------------------------------------------------------------------- |
| `position`    | `CursorPosition \| undefined`              | No       | Position in a containing surface established by the host. Omit to lay out inline.      |
| `color`       | `string \| undefined`                      | No       | Any CSS color. Defaults to the theme accent.                                           |
| `name`        | `string \| undefined`                      | No       | Collaborator name for the default label.                                               |
| `message`     | `string \| undefined`                      | No       | Optional localized message for the default label.                                      |
| `animate`     | `boolean \| undefined`                     | No       | Animate updates to the provided position using the theme motion settings.              |
| `children`    | `ComponentChildren`                        | No       | Custom cursor parts. Omit to use the shared default pointer and label.                 |
| `aria-hidden` | `h.JSX.Signalish<Booleanish \| undefined>` | No       | Hide the cursor from assistive technology when presence is already listed elsewhere.   |
| `style`       | `h.JSX.CSSProperties \| undefined`         | No       | Additional CSS styling, including caller-managed coordinates when position is omitted. |
| `preset`      | `ClassPreset \| undefined`                 | No       | Optional presentation preset.                                                          |
| `className`   | `string \| undefined`                      | No       | Additional root class names.                                                           |

## Composition

Keep controlled values and side effects in your application. Use the matching framework adapter rather than passing another framework’s VNodes through Preact callbacks. The live page groups this control with related variants and composition helpers.

This reference is generated from the local `package` library source. Rebuild it with `node scripts/generate-api.mjs`.

## Position and accessibility

Give the containing surface a positioning context, then pass the collaborator's offsets in CSS pixels through `position`. Enable `animate` to interpolate updates with the shared motion preferences. Hosts can subscribe to their presence service and pass coordinates, a name and a localized message as data.

Set the CSS color per collaborator. The label uses automatic contrast where available and a theme surface with an accent border elsewhere. The pointer is decorative and allows clicks through to the workspace. Hide the whole cursor from assistive technology with `aria-hidden` if a separate presence list already identifies that collaborator.
