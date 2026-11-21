# Stepper

Linear/circular completion and star-based rating controls.

[Live examples and formatted usage](https://ui.rv-grid.com/components/progress-and-rating/) · [Component index](../../README.md#complete-component-reference)

Preact: `import { Stepper } from '@revolist/ui/preact'`

React: `import { Stepper } from '@revolist/ui/react'`

Vue: `import { Stepper } from '@revolist/ui/vue'`

Angular/Svelte: pass `component="Stepper"` to the framework's `UiComponent` host. See the [framework guides](https://ui.rv-grid.com/frameworks/) for state, callbacks and slots.

## Props

The table lists library-declared props. Standard inherited HTML attributes are omitted to keep the reference focused. Callback and generic types follow the installed package declarations.

| Prop               | Type                                                                                                                           | Required | Description                                                                         |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------ | -------- | ----------------------------------------------------------------------------------- |
| `label`            | `string`                                                                                                                       | Yes      | Accessible label for the workflow.                                                  |
| `steps`            | `readonly WorkflowStep[]`                                                                                                      | Yes      | Steps in display order. The list determines the step count.                         |
| `value`            | `string \| undefined`                                                                                                          | No       | Controlled ID of the active step. Without a callback, renders read-only indicators. |
| `onValueChange`    | `((id: string) => void) \| undefined`                                                                                          | No       | Called when an enabled step is selected by ID.                                      |
| `step`             | `number \| undefined`                                                                                                          | No       | Controlled zero-based index. Use the step count to indicate completion.             |
| `defaultStep`      | `number \| undefined`                                                                                                          | No       | Initial zero-based index for uncontrolled use.                                      |
| `onStepChange`     | `((details: StepperChangeDetails) => void) \| undefined`                                                                       | No       | Called with the new zero-based index, including completion.                         |
| `orientation`      | `"auto" \| "horizontal" \| "vertical" \| undefined`                                                                            | No       | Explicit horizontal or vertical layout. Auto stacks at narrow widths.               |
| `layout`           | `"standard" \| "accordion" \| undefined`                                                                                       | No       | Show one inline disclosure panel at a time in a vertical list.                      |
| `dir`              | `"ltr" \| "rtl" \| undefined`                                                                                                  | No       | Override the inherited text direction.                                              |
| `id`               | `string \| undefined`                                                                                                          | No       | Optional DOM identifier for the stepper.                                            |
| `ids`              | `{ root?: string; list?: string; triggerId?: (index: number) => string; contentId?: (index: number) => string; } \| undefined` | No       | Override root, list, trigger or panel DOM IDs.                                      |
| `linear`           | `boolean \| undefined`                                                                                                         | No       | Require Back and Next navigation instead of direct step activation.                 |
| `busy`             | `boolean \| undefined`                                                                                                         | No       | Prevent navigation while work is in progress.                                       |
| `busyLabel`        | `string \| undefined`                                                                                                          | No       | Localized accessible busy text for the current step.                                |
| `isStepSkippable`  | `((index: number) => boolean) \| undefined`                                                                                    | No       | Optional steps may be bypassed when navigating with Back and Next.                  |
| `isStepValid`      | `((index: number) => boolean) \| undefined`                                                                                    | No       | Check the active step before moving forward.                                        |
| `onStepInvalid`    | `((details: StepperInvalidDetails) => void) \| undefined`                                                                      | No       | Called when validation blocks a forward action.                                     |
| `onStepComplete`   | `(() => void) \| undefined`                                                                                                    | No       | Called when the workflow reaches the completion state.                              |
| `completedContent` | `ComponentChildren`                                                                                                            | No       | Completion panel displayed after the final step.                                    |
| `completedLabel`   | `string \| undefined`                                                                                                          | No       | Localized status announced for completed steps.                                     |
| `previousLabel`    | `string \| undefined`                                                                                                          | No       | Localized label for the optional Back button.                                       |
| `nextLabel`        | `string \| undefined`                                                                                                          | No       | Localized label for the optional Next button.                                       |
| `preset`           | `ClassPreset \| undefined`                                                                                                     | No       | Optional presentation preset.                                                       |
| `className`        | `string \| undefined`                                                                                                          | No       | Additional root class names.                                                        |

## Composition

Keep controlled values and side effects in your application. Use the matching framework adapter rather than passing another framework’s VNodes through Preact callbacks. The live page groups this control with related variants and composition helpers.

This reference is generated from the local `package` library source. Rebuild it with `node scripts/generate-api.mjs`.

## Layout and state

Use `orientation="horizontal"`, `orientation="vertical"`, or the default responsive layout. Set `dir="rtl"` or inherit writing direction. Horizontal arrows follow writing direction and vertical arrows use Up and Down. Home and End move to the first and last enabled trigger. Arrow keys move focus. Enter and Space activate the focused step.

For a wizard, use `defaultStep` or controlled `step` and `onStepChange`. The number of `steps` determines the count. A step index equal to that count displays `completedContent`. Step content stays mounted while hidden. Pass localized `previousLabel` and `nextLabel` to render shared navigation buttons.

Existing ID-based consumers can continue using `value` with `onValueChange`. When omitted, the component owns its index. Use indexed state for a controlled workflow with a completion panel.

Use `linear` to restrict navigation to Back and Next. `isStepValid` checks forward moves and `onStepInvalid` lets the application surface errors. `isStepSkippable` bypasses optional steps during sequential navigation. Use `busy` to prevent navigation during asynchronous work. Each step can override its marker with a decorative icon and provide a separate title and description.

The list, indicator, title, description, panels and actions are exposed as CSS parts. Revo UI uses an array of step definitions in place of a compound component hierarchy.

## Accordion checklist

Set `layout="accordion"` to place each panel below its vertical step heading. The current step opens when progress changes. Users can open another heading to inspect it while the current step stays marked. The inline Back and Next buttons change progress and focus the new current step.

See the [Stepper examples](https://ui.rv-grid.com/components/stepper/) for a checklist, a validated workspace setup, and left-to-right and right-to-left navigation.
