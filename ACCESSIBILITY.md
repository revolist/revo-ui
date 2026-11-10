# Revo UI accessibility

Revo UI supports keyboard navigation, screen readers, browser zoom, touch input and display preferences. Shared accessibility behavior is available through the React, Vue, Angular, Svelte, Preact and vanilla TypeScript adapters.

We use [WCAG 2.2 Level A and AA](https://www.w3.org/TR/WCAG22/) to guide component design and testing. The following list describes the features provided by the shared components.

## Keyboard navigation

- Tab and Shift+Tab move between controls, with a visible focus indicator.
- Arrow keys navigate composite controls such as menus, lists, tabs, radio groups and calendars.
- Enter and Space activate controls according to their interaction pattern.
- Escape dismisses tooltips and popups. Nested overlays close one layer at a time.
- Dialogs keep keyboard focus within the active dialog and return focus to the opening control when closed.
- Dropdowns support keyboard opening, search, option navigation and selection.
- Active options are brought into view as users navigate.
- Timeline events and resize controls provide keyboard interactions.

## Screen reader support

- Controls expose accessible names, roles and values.
- Selected, checked, expanded, disabled, required and invalid states are available to assistive technology.
- Form fields connect labels, instructions and validation messages to their inputs.
- Icon buttons have action names, and decorative icons are kept out of the reading sequence.
- Dialogs and other named surfaces expose their purpose and focus context.
- Tooltips describe their triggers through accessible relationships and work with keyboard focus as well as hover.
- Status and alert regions communicate results, loading states and errors.
- Calendars expose date names and selection state.
- Charts provide accessible labels.
- Gallery pages include headings, landmarks, descriptive page titles and a skip link.

## Zoom, larger text and reflow

- Browser zoom and text enlargement are supported.
- Calendar rows, month controls and timeline lanes grow with text size.
- Narrow layouts wrap navigation and text, with gallery navigation available at 320 CSS pixels.
- Long text and increased line, paragraph, letter and word spacing are supported by the shared layouts.
- Two-dimensional content, such as time grids, uses a local scroll area.
- Floating surfaces use viewport bounds and scrollable content areas to keep their content reachable.

## Color, contrast and motion

- Light and dark themes use shared semantic text, surface and state colors.
- Focus indicators remain visible in forced-colors mode.
- Shared styles support high-contrast presentation through forced colors.
- Reduced-motion preferences and the gallery animation setting control shared motion.
- Labels, icons and text communicate state alongside color.

## Touch and alternatives to dragging

- Controls support click and tap activation.
- Timeline events include commands to move an event and adjust either endpoint without dragging.
- Timeline handles and move actions have separate interaction areas, including short events and milestones.
- Field reordering provides move-up and move-down actions through the shared reorder API.
- The gallery’s resizable-panel example includes numeric and click/tap controls for changing width.
- Hover tooltips remain open while the pointer moves onto their content and can be dismissed with Escape.

## Forms, language and direction

- Shared form components provide labels, help text, required state, invalid state and error feedback.
- Visible labels, accessible names, instructions, status messages and errors support application-supplied translations.
- Components support right-to-left layouts and localized date labels.
- Shared interaction patterns and accessibility behavior are reused across framework adapters.

## Component coverage

| Component family | Accessibility features |
| --- | --- |
| Buttons and toolbars | Named actions, keyboard activation, visible focus, pressed and disabled states. |
| Inputs and forms | Connected labels and descriptions, required and invalid states, validation feedback. |
| Dropdowns, lists and resource pickers | Search, keyboard navigation, selection state, named options and status feedback. |
| Tabs, radio groups and selection controls | Group semantics, arrow-key navigation and selected or checked states. |
| Calendars and date pickers | Named dates, keyboard navigation, selection and range feedback, text-responsive layout. |
| Dialogs, menus and popovers | Named surfaces, focus management, nested dismissal and focus return. |
| Tooltips | Hover and focus access, trigger descriptions, pointer travel, persistence and Escape dismissal. |
| Sliders and resize controls | Keyboard input, accessible values and focus indicators. |
| Timeline tracks | Keyboard interaction, click/tap movement and endpoint commands, named events and responsive lanes. |
| Field configurators | Named field actions, selection and move-up/move-down commands. |
| Status, feedback and badges | Accessible names, status and alert announcements, text and icon state cues. |
| Charts | Accessible chart labels and shared tooltip behavior. |
| PDF viewer | Named viewer controls, keyboard interaction and document text-layer support. |

## How we check accessibility

- Unit tests verify control semantics, state, keyboard contracts and lifecycle behavior.
- Browser tests cover keyboard and touch interactions, focus, nested overlays, tooltip behavior, enlarged text, text spacing, responsive layouts, forced colors and reduced motion.
- Automated accessibility scans exercise component examples and open, empty and invalid states in light and dark themes.
- Framework tests check shared behavior through the React, Vue, Angular and Svelte adapters.

See the [interactive accessibility guide](https://ui.rv-grid.com/accessibility/) for examples and the [component reference](https://ui.rv-grid.com/api/) for component APIs.

## Report an accessibility issue

[Open an issue on GitHub](https://github.com/revolist/revo-ui/issues) with the component, browser, operating system, assistive technology when applicable, and steps to reproduce the problem.
