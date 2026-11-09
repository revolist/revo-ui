# Shared UI accessibility review

Reviewed 26 October 2026 against [WCAG 2.2](https://www.w3.org/TR/WCAG22/), using the standalone UI gallery as the integration surface. This is a scoped engineering review, not a conformance statement.

## Verified surface and method

- Components and Colors pages, light and dark, Chromium at 1280px and 390px: eight axe-core 4.14.0 scans using WCAG A/AA tags through 2.2. The regression tests require zero reported violations and attach the full results, including items requiring manual review.
- Existing browser tests exercise native inputs, tabs/radios, calendar arrows and selection, menus and submenus, nested dialogs/popovers, Escape, focus return, resizing, selection, RTL, and responsive layouts.
- Additional checks cover a visible keyboard focus outline under forced colors with reduced motion, and a nonoverlapping gallery header at 320 CSS pixels. This width check is not a complete 400% zoom assessment of every component.
- Source review and focused owner tests cover control names, roles, selection state, range inputs, preview announcements, and avatar foreground choices.

Run `pnpm --filter @revolist/ui-gallery test:browser` for integration coverage and `pnpm --filter @revolist/ui test` for owner tests.

## Corrected issues

| Concern                | Change                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Names and speech input | Editable range bounds have localized-label hooks and safe default names. Color-picker trigger names include the displayed value; icon-command names include visible badge counts; timeline move names include the event caption. The custom calendar example includes its displayed price in the date name.                                                                                                               |
| ARIA structure         | Inline resource selection uses native checkboxes within its group. Dropdown option semantics belong to the input rather than an interactive label ancestor; the active descendant identifies that option. The formatting comparison uses table/row/cell relationships and retains a separate live status. Entirely hidden calendar spacer rows are omitted from the accessibility tree. Timeline images have valid roles. |
| Contrast               | Links and calendar text use the existing semantic accent-text token. Colored chips retain their hues in borders/backgrounds and use readable text. Active outside-month dates and weekend labels retain text opacity. Resource avatar text overrides the generic avatar style, with a black fallback for medium-luminance backgrounds. Slider callout text uses contrasting semantic tokens.                              |
| Targets                | Compact remove/info actions and native range controls use 24px targets. Timeline resize handles are 24px and centered on the event edges to preserve the central move target. Track clipping and very short events still need consumer-specific checks.                                                                                                                                                                   |
| Focus and reflow       | Shared buttons have an explicit outline in addition to the focus shadow; forced colors use the system Highlight outline. The narrow gallery header stacks its title, settings, and page navigation.                                                                                                                                                                                                                       |
| Disabled state         | Editable range inputs disable with their native handles.                                                                                                                                                                                                                                                                                                                                                                  |

These changes do not modify data palettes or guarantee contrast for arbitrary consumer overrides.

## Remaining work before a conformance claim

- **Pointer alternatives to dragging (2.5.7):** keyboard movement is covered, but the gallery's timeline and field-reorder examples still need complete click/tap alternatives for moving and resizing without dragging. `TimelineTrack` exposes controlled event updates and `useFieldReorder` exposes `move`; consuming products must present those actions. Keyboard support alone does not meet this criterion.
- **Hover content (1.4.13):** review all tooltip owners for pointer travel, hoverability, persistence, and dismissal. In particular, `TooltipController` currently closes hover content on anchor pointerleave. Existing Escape/focus tests do not establish hoverable-tooltip conformance.
- **Assistive technologies:** perform task-based VoiceOver/Safari and NVDA/Firefox or Chrome testing. No screen reader was used, and no operating-system accessibility setting was changed during this review.
- **All application states:** scan open/nested overlays and product compositions, validation/error states, long translated content, very short timeline events, and custom themes. Default gallery scans do not exercise every state or public component configuration.
- **Manual visual checks:** complete text/non-text contrast assessment for custom paints and states, text spacing, 200% text resize, 400% zoom/reflow, focus obscuration, touch targets, and platform high-contrast behavior. Axe's `incomplete` findings remain review items, not passes.

Consumers retain responsibility for localized names, meaningful validation and status text, focus order in compositions, correct tab/panel IDs, accessible custom cell content, and alternatives to gestures. Keep sibling icons decorative when the control already supplies its name.

## Validation recorded for this change

- The new automated check failed against the initial gallery with nine violation categories. Separate focused checks also reproduced missing forced-colors focus and the 320px header overlap before their fixes.
- Final result: all 65 shared UI browser tests passed, including eight axe scan scenarios, forced-colors focus, reflow, and the existing keyboard/lifecycle checks.
- All 223 UI unit tests passed. Gallery type-check and production builds (including the relative Docker asset base) passed; `git diff --check` passed.
- Local execution reused installed workspace tooling (Vite 8.2.1 / Vitest 5.0.0); lockfile CI tooling is Vite 8.2.4 / Vitest 5.0.5. CI remains the check of the locked toolchain. No full product-suite, deployment, or Docker-image build was performed in this accessibility pass.
