# Toaster

Semantic badges, counters, alerts, progress indicators, loading surfaces, empty states and feedback panels.

[Live examples and formatted usage](https://ui.rv-grid.com/components/status-and-feedback/) · [Component index](../../README.md#complete-component-reference)

Preact: `import { Toaster } from '@revolist/ui/preact'`

React: `import { Toaster } from '@revolist/ui/react'`

Vue: `import { Toaster } from '@revolist/ui/vue'`

Angular/Svelte: pass `component="Toaster"` to the framework's `UiComponent` host. See the [framework guides](https://ui.rv-grid.com/frameworks/) for state, callbacks and slots.

## Props

The table lists library-declared props. Standard inherited HTML attributes are omitted to keep the reference focused. Callback and generic types follow the installed package declarations.

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `toaster` | `ToastController` | Yes | Notification controller created with createToaster. Mount one viewport per controller. |
| `position` | `ToastPosition \| "inline" \| undefined` | No | Logical viewport corner or edge. Use inline to render within a layout. |
| `visibleCount` | `number \| undefined` | No | Maximum visible notifications. The newest are shown first; older entries wait in the queue. |
| `text` | `{ notifications?: string; dismiss?: string; } \| undefined` | No | Accessible names supplied by the host's localization system. |
| `preset` | `ClassPreset \| undefined` | No |  |
| `className` | `string \| undefined` | No |  |

## Composition

Keep controlled values and side effects in your application. Use the matching framework adapter rather than passing another framework’s VNodes through Preact callbacks. The live page groups this control with related variants and composition helpers.

This reference is generated from the local `package` library source. Rebuild it with `node scripts/generate-api.mjs`.

Import `createToaster` from the Preact, React or Vue entry, or from `@revolist/ui/toast-store` with any adapter. Create a controller and mount one `<Toaster toaster={toaster} />` in the themed app or surface. Call `toaster.show({ title, description, tone })` from an event handler. It returns the ID for `update(id, changes)` and `dismiss(id)`. Call `dismiss()` to clear the queue.

Use `toaster.promise(task, { loading, success, error })` to update one notification as a promise settles. Each message takes toast options and success and error can derive their options from the settled value. The returned promise preserves the task result or rejection.

Notifications expire after four seconds by default. Loading notifications and notifications with actions stay visible by default. Pass `duration: 0` to keep other messages visible or set a duration in milliseconds. The timer pauses while the viewport is hovered or focused and while the document is hidden.

Use logical start and end positions for RTL layouts, or `inline` within a panel. Pass translated message text, action labels, and `text.notifications` and `text.dismiss` for the accessible names. Keyboard users can Tab into the actions and press Escape within a notification to dismiss it.
