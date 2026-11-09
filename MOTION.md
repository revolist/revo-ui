# Shared UI motion

Shared UI uses brief state feedback: 120ms for hover/selection, 160ms for switch/disclosure changes, and a 180ms opacity reveal for surfaces. Focus, typing, numeric values, calendar navigation, dragging, resizing, and layout changes remain immediate. Closing a dialog or menu never waits for an animation. Only busy indicators loop.

## Disable motion

Set one attribute on the document to disable CSS motion and shared Web Animations:

```html
<html data-rv-ui-motion="off"></html>
```

Or disable a region without affecting other components:

```html
<section data-rv-ui-motion="off">
  <!-- shared UI components -->
</section>
```

Remove the attribute to restore the default policy. The attribute disables descendant transitions/animations, including pseudo-elements, so apply it only to the region you intend to control. Open shared portals follow their opener's policy and restore their prior attributes on close. Changing the flag while shared feedback animation runs cancels that animation. CSS-only state changes still apply immediately.

`prefers-reduced-motion: reduce` always disables motion. There is no force-on override of the OS preference. Loading indicators remain visible and retain their status semantics when static. The gallery header offers **Motion: System** and **Motion: Off** to preview these modes.

The shared policy is included in `styles.scss`, `native-styles.scss`, and standalone animated Sass owners. Custom standalone styles can import `@revolist/ui/motion.scss`.

## Customize timing

Set CSS time values on the root or a component region:

| Token                   | Default                     | Purpose                                                          |
| ----------------------- | --------------------------- | ---------------------------------------------------------------- |
| `--rv-ui-motion-fast`   | `120ms`                     | Hover, selection, validation colors and control opacity          |
| `--rv-ui-motion-normal` | `160ms`                     | Switch thumb, disclosure content expansion/collapse and chevrons |
| `--rv-ui-motion-enter`  | `180ms`                     | Surface opacity reveal                                           |
| `--rv-ui-motion-exit`   | `120ms`                     | Noninteractive feedback exit snapshot                            |
| `--rv-ui-motion-ease`   | `cubic-bezier(.2, 0, 0, 1)` | Shared easing                                                    |

`--rv-ui-transition` remains a compatibility alias. Root overrides also apply to body-level portals; only disabled policy is automatically copied from an opener's subtree to its portal. Outside the shared disclosure transition, keep value dimensions, positions and drag feedback immediate.

Native `Disclosure`, `InspectorSection`, `FieldLibrary`, and other `<details>` sections inside `.rv-ui` share a height/opacity transition in both directions. They retain native open state and keyboard semantics, size to their content without a fixed maximum, and reserve clipping space for focus outlines. Global/subtree Motion Off and OS reduced motion also stop `::details-content` transitions immediately, including while an animation is running. The [native details-content approach](https://developer.chrome.com/blog/styling-details) requires intrinsic-size and discrete-transition support; other browsers retain immediate native expansion/collapse.

Custom animation adapters can import `isUiMotionEnabled`, `getUiMotionDuration`, or `inheritUiMotion` from `@revolist/ui/motion`. Always call the cleanup returned by `inheritUiMotion` when a portal closes. Shared feedback animation uses these same utilities, releases listeners when finished, and handles animation cancellation without unhandled promise rejections.

## Component review

Every gallery family was reviewed against its source owner and existing state/lifecycle coverage. Deliberately static states are part of the design, not missing animation.

| Family                                | Polished state feedback                                                                    | Kept immediate/static                                                      |
| ------------------------------------- | ------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------- |
| Buttons, icon/remove actions          | Hover/pressed/disabled colors and opacity                                                  | Focus outline, glyphs, counts; removed decorative spinning/press scaling   |
| Checkboxes, radios, switches, chips   | Selection/disabled colors; conventional switch thumb slide                                 | Checkbox glyphs, radio geometry, focus                                     |
| Tabs and selection lists              | Hover/selected colors                                                                      | Tab-panel content/layout and keyboard focus                                |
| Inputs, search, forms, counters       | Borders, background and disabled opacity                                                   | Focus, labels/errors, text/caret, numeric values; no `transition: all`     |
| Selects and resource pickers          | Option colors and popup opacity                                                            | Search filtering, chip layout, selection updates                           |
| Scalar/range sliders                  | Tooltip/halo/threshold colors                                                              | Thumb positions, fills and value changes; removed scaling/interpolation    |
| Calendars and date/time pickers       | Day hover/selected colors and popover opacity                                              | Month changes, custom cells, date/time input, keyboard focus               |
| Color controls                        | Swatch border/opacity and popup reveal                                                     | Chosen color, swatch geometry, color preview                               |
| Field configurators/reordering        | Row and status colors; disclosure content and chevron                                      | Drag/drop geometry, insertion marker, row order; no settings-icon spin     |
| Formatting controls                   | Toggle/option colors, tooltip opacity/2px reveal, inspector expansion/collapse and chevron | Preview values and typography                                              |
| Cell visuals and avatars              | Semantic progress/bar/sparkline colors                                                     | Numbers, widths, arcs, pie/heatmap geometry, static pictograms and avatars |
| Charts and brushes                    | Fill/stroke/selection/tooltip colors                                                       | Data paths, brush bounds/labels and pointer movement                       |
| Dialogs, popovers and tooltips        | Opacity-only surface entrance                                                              | Mount/unmount, positioning, nested focus, Escape and focus return          |
| Menus and toolbars                    | Row hover/selection colors and surface opacity                                             | Command execution, submenu placement, badges                               |
| Status/feedback and activity messages | Semantic tones; opacity entry/exit for floating feedback                                   | Collapse sizing, message/list layout, announcements, focus                 |
| Layout and panes                      | Resize-handle halo/color; native disclosure expansion/collapse                             | Pane dimensions, pointer/keyboard resizing and other layout                |
| Pagination                            | Shared button/select state colors                                                          | Page changes, count text and layout                                        |
| Progress and ratings                  | Semantic colors and star fills                                                             | Completion widths/arcs and rating values                                   |
| Loading                               | Existing busy rotation only                                                                | A legible static indicator under reduced/off motion                        |

These motion changes preserve the accessibility review boundaries in [ACCESSIBILITY.md](ACCESSIBILITY.md); they do not close its outstanding drag-alternative, tooltip-hoverability or assistive-technology gaps.

## Verification

Owner tests cover inherited flags, live portal policy updates, shadow-boundary opt-out, timing values, cancellation and cleanup. Gallery browser coverage in `tests/shared-ui/motion.spec.ts` checks enabled/off restoration, both themes, pseudo-elements/loading indicators, portaled dialogs and nested dropdowns, OS reduced motion, and immediate value/drag geometry. Existing accessibility, keyboard and responsive suites remain canonical.

Validation for this change: all 236 UI unit tests and 69 shared UI browser tests passed; gallery type-check, full/native/standalone Sass compilation, production build with relative asset URLs, and `git diff --check` passed. Desktop/mobile and a dark dialog were visually inspected. Local runs reused installed Vite 8.2.1 / Vitest 5.0.0; CI validates locked Vite 8.2.4 / Vitest 5.0.5. No full product suite, Docker-image build, publication, or non-Chromium motion qualification was performed.

Disclosure follow-up: 239 UI unit tests and 79 gallery browser tests passed. Browser checks measure growing/shrinking content across frames, rapid reversal, dynamic content, keyboard focus, and global/subtree/OS opt-out even with custom timing. Gallery build/type check, native/standalone Sass compilation and diff checks passed. Browser animation verification used Chromium.
