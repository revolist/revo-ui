# CircularSlider

Adjust an angle on a themed dial.

[Live examples and formatted usage](https://ui.rv-grid.com/components/sliders/#example-controlled-rotation) · [Component index](../../README.md#complete-component-reference)

Preact: `import { CircularSlider } from '@revolist/ui/preact'`

React: `import { CircularSlider } from '@revolist/ui/react'`

Vue: `import { CircularSlider } from '@revolist/ui/vue'`

Angular/Svelte: pass `component="CircularSlider"` to the framework's `UiComponent` host. See the [framework guides](https://ui.rv-grid.com/frameworks/) for state, callbacks and slots.

## Props

The table lists library-declared props. Standard inherited HTML attributes are omitted to keep the reference focused. Callback and generic types follow the installed package declarations.

| Prop              | Type                                        | Required | Description                                                                        |
| ----------------- | ------------------------------------------- | -------- | ---------------------------------------------------------------------------------- |
| `label`           | `string`                                    | Yes      | Visible and accessible slider name.                                                |
| `value`           | `number \| undefined`                       | No       | Current angle in degrees when controlled.                                          |
| `defaultValue`    | `number \| undefined`                       | No       | Initial uncontrolled angle in degrees.                                             |
| `step`            | `number \| undefined`                       | No       | Angle increment for pointer and keyboard interaction.                              |
| `onValueChange`   | `((value: number) => void) \| undefined`    | No       | Reports the angle while the user adjusts it.                                       |
| `onValueCommit`   | `((value: number) => void) \| undefined`    | No       | Reports a completed pointer gesture or keyboard adjustment.                        |
| `formatValue`     | `((value: number) => string) \| undefined`  | No       | Accessible and visible value formatter. Defaults to an angle with a degree symbol. |
| `showValue`       | `boolean \| undefined`                      | No       | Set to false to hide the value in the center of the dial.                          |
| `markers`         | `boolean \| readonly number[] \| undefined` | No       | Set to true to display ticks every 60 degrees, or pass exact angles.               |
| `markersAtSteps`  | `boolean \| undefined`                      | No       | When markers is true, render ticks at step intervals, capped at 120 ticks.         |
| `size`            | `number \| undefined`                       | No       | Dial diameter, in CSS pixels.                                                      |
| `thickness`       | `number \| undefined`                       | No       | Track thickness, in CSS pixels.                                                    |
| `disabled`        | `boolean \| undefined`                      | No       | Prevent focus and changes. Disabled values are excluded from forms.                |
| `readOnly`        | `boolean \| undefined`                      | No       | Keep the angle focusable and submittable while preventing changes.                 |
| `invalid`         | `boolean \| undefined`                      | No       | Mark the slider as needing correction.                                             |
| `ariaDescribedBy` | `string \| undefined`                       | No       | DOM ID of help or validation text.                                                 |
| `name`            | `string \| undefined`                       | No       | Optional form field name.                                                          |
| `id`              | `string \| undefined`                       | No       | Optional ID for the focusable dial.                                                |
| `dir`             | `"ltr" \| "rtl" \| undefined`               | No       | Override the inherited writing direction.                                          |
| `preset`          | `ClassPreset \| undefined`                  | No       | Optional presentation preset.                                                      |
| `className`       | `string \| undefined`                       | No       | Additional root classes.                                                           |

## Composition

Keep controlled values and side effects in your application. Use the matching framework adapter rather than passing another framework’s VNodes through Preact callbacks. The live page groups this control with related variants and composition helpers.

This reference is generated from the local `package` library source. Rebuild it with `node scripts/generate-api.mjs`.

## Angle and input

The dial uses degrees from zero at the top through 360 for a complete clockwise turn. Pass an angle with `value` to control it, or use `defaultValue` for local state. Set `step` for adjustment increments and supply `formatValue` to display another unit.

Use `onValueChange` for live updates and `onValueCommit` for completed pointer or keyboard adjustments. Arrow keys move one step, and Home and End reach the endpoints. Hold Shift with an arrow key, or use Page Up or Page Down, to move ten steps. Set `name` to submit the angle with a form.
