# Revo UI

UI components for financial apps, reporting dashboards, and project management. Published package name: `@revolist/ui`.

Shared controls for Grid Pro, Pivot, Charts, Gantt, Scheduler, Kanban and standalone examples. The workspace uses source exports; `pnpm pack:public` prepares an independently installable, ESM distribution with JavaScript, declarations, CSS and Angular partial-compilation metadata. Preparing the archive does not publish it to a registry. Revo UI is MIT licensed.

## Entry points

```ts
// No grid or global browser state required at import time.
// Preact is the required shared rendering peer.
import {
  DialogController,
  PopoverController,
  attachMenuKeyboard,
} from '@revolist/ui/native';

// Optional Preact rendering adapters.
import { Button, Switch, Calendar, DateRangePicker } from '@revolist/ui/preact';

// Import once in a product's styles entry.
import '@revolist/ui/styles.scss';
```

The root entry is the native entry. `tokens.scss` exposes tokens separately. The distribution preserves the existing exported subpaths. Import only declared package exports; unexported implementation files are not an API.

## Inline badges

Use `Badge` from `@revolist/ui/preact` or `VueBadge` from
`@revolist/ui/vue-badge`. Both accept `variant="neutral"` for inactive counts,
`variant="accent"` for blue selected states, and `shape="pill"` (default) or
`shape="rounded"`. The default `solid` variant preserves existing badge tokens.
Vue renders the default slot and forwards native attributes and classes.

## Component catalog

| Family            | Components                                                                                                              |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Actions           | Button, IconButton, ToggleButton, ButtonGroup, Icon                                                                     |
| Binary and choice | Checkbox, Switch, RadioGroup, ChoiceChips                                                                               |
| Navigation        | SegmentedControl, Tabs, TabPanel, Listbox, ListboxOption                                                                |
| Fields            | TextInput, Textarea, SearchInput, NumberInput, NumberStepper, Dropdown                                                  |
| Selection         | Dropdown, Combobox, MultiSelect, Chip, RemovableChip, ResourcePicker                                                    |
| Numeric ranges    | TimelineTrack, Slider, RangeSlider; native scalar-slider/counter adapters                                               |
| Dates             | Calendar and its header/day/month/year parts, DateInput, TimeInput, DateTimeInput, DatePicker, DateRangePicker          |
| Appearance        | ColorPalette, ColorPicker, Avatar                                                                                       |
| Forms             | FormField, FieldHint, FieldError, FormSection, Disclosure, DisclosureSummary                                            |
| Surfaces          | Dialog, DialogHeader, DialogBody, DialogFooter, ConfirmDialog, Popover, Tooltip, Menu, MenuItem, MenuSeparator, Submenu |
| Composition       | Toolbar, ToolbarGroup, ToolbarSeparator, SplitLayout, Pane, Panel, ResizeHandle                                         |
| Feedback          | Badge, CountBadge, StatusBadge, Alert, FeedbackPanel, Spinner, LoadingOverlay, EmptyState                               |
| Indicators        | Pagination, ProgressBar, CircularProgress, Rating                                                                       |

Native controllers own lifecycle, keyboard interaction, portal placement and cleanup. Preact adapters own rendered state, while product adapters own grid integration. Exported native rendering helpers accept the host's element factory so Charts can keep its existing DOM renderer.

See [OWNERSHIP.md](./OWNERSHIP.md) for implementation/style owners, renderer contracts and intentional product adapters.

## Ownership and compatibility

- UI does not import Core, Pro, or another product. Dates and working-calendar calculations stay in `@revolist/dates`.
- Existing Pro exports and leaf modules forward to the shared owner. Grid edit events, focus preservation, popup coordination, remote loading and cell/column types stay in Pro adapters.
- Task/card/event editors, working-calendar editors, Pivot configurators and chart inspectors remain product compositions.
- Controlled inputs receive values and callbacks. Date controls use civil date/native input strings; products retain timezone conversion, storage and validation policy.
- Sliders distinguish live input and commit callbacks. Popup/dialog handles have explicit teardown, and returned cleanup functions release listeners.
- `--rv-ui-*` variables define semantic surfaces, text, focus and control tokens. Existing classes and legacy feature variable overrides remain supported.
- Use the separate native entry in Charts. Importing the Preact barrel in Charts would violate the dependency boundary.

## Gallery and checks

The standalone gallery app lives in [the repository root](../). Run `pnpm dev` from the public repository root or `pnpm dev:ui` from the parent monorepo.

```sh
pnpm --filter @revolist/ui-gallery dev
pnpm --filter @revolist/ui-gallery build
pnpm --filter @revolist/ui lint
pnpm --filter @revolist/ui test
pnpm --filter @revolist/ui-gallery test:browser
```

The gallery shows default, compact, disabled, selected, mixed, invalid, read-only, loading, light/dark and RTL examples. The Chromium suite uses the built gallery and covers keyboard controls, nested overlays, focus return, multiple picker instances and narrow layouts. CI runs UI unit tests in the remaining-package group and browser tests alongside the existing Chromium integration job.

Colocated owner tests cover extracted implementations. Pro keeps consumer integration tests for its event adapters and compatibility exports. The build tooling bundles UI declarations into each product's `_shared/ui` directory so published types do not depend on this private workspace package.

The gallery also demonstrates filter building blocks without a grid: distribution charts with range brushes, generic option rows, weekly time grids and legends, inline field groups and highlighted text inputs. Import these from the Preact entry; consuming products supply data, localized text and domain policy.

Grid-backed selection and filter policy belong to Pro.

Compact `BarChart`, `LineChart` and `AreaChart` render independently of brush controls or grid instances. Import them from `@revolist/ui/preact` or their leaf entries (`@revolist/ui/bar-chart`, `@revolist/ui/line-chart`, `@revolist/ui/area-chart`). They accept explicit `data`, `ariaLabel`, height, selection flags and tooltip content. `DistributionChart` preserves the existing type-switching contract; `BrushRange` remains the slider composition. The gallery includes separate bar and line cards.

Field configurators use `FieldLibrary`, `FieldLibraryList`, `FieldGroup`, `FieldGroupHeading`, `FieldList`, `FieldRow`, `FieldItem`, and `FieldContent` from `@revolist/ui/field-configurator` (also in the Preact entry). They provide native disclosure, row structure, panel shells, field identity icons, expansion state, and rendering slots. Shared action menus, aggregation choices, drop zones and focus restoration are exported through the `configurator-actions`, `configurator-aggregation-list`, `configurator-drop-zone`, `configurator-field-icon`, and `configurator-focus` public entries. Pro owns ordinary-grid provider integration and nested field grids; Pivot owns report search policy, axis assignment, ordering and selection state. Both import the shared UI owner directly. The clean Fields-grid CSS is owned by `package/styles/_fields-grid.scss` and included by the common UI stylesheet. Pro, Pivot and Pivot Charts use `rv-configurator-fields-grid`; do not add product-local copies or hide overflow scrollbars to compensate for column sizing.

### Interactive timeline track

`TimelineTrack` from `@revolist/ui/timeline-track` (also exported through `preact`) renders controlled `{ id, event: { start, end, label? } }` rows. Supply a finite increasing `range`, optional selected ID and label callbacks, `onSelect`, and `onEventChange`. Event changes preserve extra event metadata. The component owns pointer movement, edge resizing, ArrowLeft/ArrowRight edits, selection presentation and range labels; consumers own draft validation, storage and commits. Import the common styles entry once. The Sliders gallery includes an interactive example.

### Editable dialogs and standard actions

Compose `EditableDialogHeader`, `DialogBody`, and `DialogActionFooter` inside `DialogForm`. These parts are exported from `@revolist/ui/dialog/dialog.parts` and `@revolist/ui/preact`; they preserve the consumer's native dialog lifecycle and form callbacks. Scheduler, Kanban and Gantt use this composition.

The header accepts `titleId`, controlled `title`/`inputProps`, an accessible `inputLabel`, optional dialog `name` and description, and a close callback/label. Use `inputProps={false}` for a static heading. Native disabled/readonly semantics pass through.

The footer shows standard Cancel and submit Save actions by default. `cancel`, `save`, `deleteAction`, and `reset` accept labels and native button attributes/callbacks; set any action to `false` to hide it. Delete and Reset are opt-in and default to `type="button"`, so they never accidentally submit. `start` and `end` accept custom content on each side; `children` adds validation or other content above the action panel. Product translations and permissions remain explicit. See the Dialogs and floating surfaces gallery example for all actions, custom slots and hidden defaults.

### Selection lists

`Listbox`, `ListboxOption`, and `ListboxGroup` are available from `@revolist/ui/selection-list` and the Preact entry. Options support `icon`, `label`, and `description` directly, or arbitrary children for custom content. Groups add visible headings and accessible group labels. List selection and ArrowUp/ArrowDown/Home/End handling share one owner, including disabled-option skipping. Plain text, rich and grouped variants are demonstrated together in the Selection list gallery example. Format Cells consumes this same option API; it has no separate selection-list implementation. Existing EditorList and content-wrapper imports remain compatible.

### Interface colors

See [Colors and usage](COLORS.md) for semantic roles, theming, and compatibility overrides. The gallery header links to the independent Colors page (`?page=colors`).

Built-in product defaults live in named `package/color-palette/*-palettes.ts` modules. The Colors page shows each palette's values, usage, and consumers. Products import purpose-specific constants or the generated `@revolist/ui/palettes.scss` lookup; run `pnpm --filter @revolist/ui generate:palettes` after changing definitions. `check:palettes` verifies the generated source is current.

## Accessibility

See [Accessibility review and integration requirements](ACCESSIBILITY.md) for tested coverage, remaining gaps, and consumer responsibilities. Automated gallery checks are part of the shared UI browser suite.

## Motion

See [Shared UI motion](MOTION.md) for the component review, timings, and disable policy. Add `data-rv-ui-motion="off"` to the document or a region to disable motion; OS reduced motion is always respected. The gallery includes a Motion selector.

### Busy buttons

`Button`, `IconButton`, `ToggleButton`, `SvgButton` and `ButtonControl` accept `busy?: boolean`. Set `busy` while an action is pending, then clear it when the action completes (including failure). A loading ring appears, the accessible name stays intact, and native disabling blocks clicks, keyboard activation and form submission. Busy buttons retain their normal variant colors; an explicit `disabled` prop still takes precedence visually and remains disabled after busy clears. The same option is supported by `createControl(document, 'button', { busy: true })`.

```tsx
<Button variant="primary" busy={saving} onClick={save}>
  Save changes
</Button>
```

The ring inherits the button text color. Motion Off (`data-rv-ui-motion="off"`) and `prefers-reduced-motion` keep the loading ring visible without spinning. Busy state is controlled by the caller; it does not start or finish an asynchronous task itself.

## Standalone framework controls

Import `@revolist/ui/styles.css` once for compiled standard styles. The public build bundles private date/chart utilities; customers do not need private workspace packages or a TypeScript/Sass source compiler. The public distribution includes its Preact renderer and declarations; consumers do not need to install Preact. React, Vue, Angular and Svelte are optional peers used only by their adapter subpaths.

```ts
import { createControl, applyControlPresentation } from '@revolist/ui';
import {
  ButtonControl,
  Input,
  Select,
  TextArea,
} from '@revolist/ui/react-control';
import { vRvControl } from '@revolist/ui/vue-control'; // <button v-rv-control>
import { UiControlDirective } from '@revolist/ui/angular-control'; // standalone imports; <button rvControl>
import { rvControl } from '@revolist/ui/svelte-control'; // <button use:rvControl>
import '@revolist/ui/styles.css';
```

Each adapter preserves native elements, events, values and form bindings. React controls forward native refs. Vue and Angular directives and the Svelte action retain native refs and bindings. `applyControlPresentation(root)` handles existing static toolbar HTML; call it after replacing that HTML or changing a control type.

## Build and release preparation

Run `pnpm --dir packages/ui/package pack:public` from the monorepo, then `pnpm --dir packages/ui/package test:public`. The generated public package is `dist/`, and the archive is `artifacts/revolist-ui-<version>.tgz`. The generated distribution manifest declares public access and contains no workspace dependencies.

Before publication, standalone repositories consume an identical archive in their own `vendor/` directory using relative `file:` dependencies and a lockfile generated against that real archive. These paths are portable with the cloned repository. Include its vendor archive when copying a starter out of that repository. After an authorized registry release, dependencies can switch to the published version and locks can be regenerated from the registry. Do not substitute unverified registry URLs or integrity values for the prepared archive.

The Publish NPM workflow includes UI in `all` releases and supports a standalone `ui` selection. It applies the release tag version, runs the public build and archive consumer checks, then signs and publishes the compiled `dist/` package to npm with public access using the `NPM_TOKEN` repository secret. Local build and preparation scripts do not publish. Once the release is available, demos can install `@revolist/ui` from npm with their required framework peers.

## Vue component wrappers

`@revolist/ui/vue` exposes Vue wrappers for the Preact component catalog and the
standalone number, mask, duration, temporal, assignee and Markdown editors.
These wrappers retain the existing Preact implementation, bundled in the public
distribution, and require Vue. Use `vue-control` for native HTML controls that
only need presentation;
its runtime presentation helpers do not import Preact.

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { Dropdown, DatePicker, Dialog } from '@revolist/ui/vue';
import '@revolist/ui/styles.css';

const status = ref('open');
const source = [
  { value: 'open', label: 'Open' },
  { value: 'closed', label: 'Closed' },
];
</script>

<template>
  <Dropdown v-model="status" :source="source">
    <template #option="{ option, selected }">
      <strong>{{ option.label }}</strong>
      <span v-if="selected"> Selected</span>
    </template>
  </Dropdown>
</template>
```

- Values, callback props and configuration keep their existing contracts.
  `v-model` additionally connects Dropdown/Combobox/MultiSelect, the scalar
  inputs, Switch/Checkbox, choice controls, rating, color and date pickers.
  ResourcePicker uses `selectedResourceIds`; CalendarPicker uses `selected`.
  RangeSlider keeps `fromValue`, `toValue`, `onRangeChange` and `onRangeCommit`;
  it does not flatten a two-handle range into a scalar model.
- Default slots supply `children`; named content slots supply the matching
  component prop (for example Dialog's `footer` and Switch's `label`). Dropdown
  has scoped `option` (`option`, `selected`), `value` (`option`), `content`
  (`content.id`, `content.close`) and `noResults` slots. ReorderList has `item`
  and `handle` slots (`item`, `index`). Use Vue slots for Vue VNodes, rather than
  returning them from a Preact render callback.
- Vue owns slot content via Teleport, preserving injection and reactive updates.
  Preact owns the surrounding control. Mount and slot boundaries add elements
  styled with `display: contents`; DOM code depending on direct-child selectors
  must account for these boundaries. Supply explicit accessible labels and input
  associations instead of relying on Preact inspecting Vue slot VNodes.
- The exposed `element` ref is the mount boundary, not the component's internal
  input. Existing explicit `inputRef` callback props remain available.
- Wrappers render empty boundaries on the server and mount interactive UI on the
  client. They do not provide server-rendered component content.
- Unmounting disposes the Preact root and its effects, portals and controllers.

`createVueAdapter` is exported for application-owned Preact compositions using the
same lifecycle. The catalog's wrapper factory calls are marked pure for consumer
bundle tree shaking.

The focused browser check runs against its own framework fixture, independently of the
Preact gallery:

```sh
pnpm --filter @revolist/ui-gallery exec playwright test --config ../../tests/shared-ui/playwright.framework-adapters.config.ts
```

## React, Angular and Svelte component adapters

All adapters reuse the existing Preact controls and their interaction lifecycle.
Import `@revolist/ui/styles.css` once. Install your host framework;
React component wrappers also require `react-dom`. The primitive `*-control`
entries remain available for framework-owned native elements.

### React

`@revolist/ui/react` provides named components matching the shared catalog and
standalone editors. Props and controlled callbacks keep their shared names.
React owns children and custom content through portals, preserving React context
and state. `renderPlaceholder` receives only placeholder text; `renderSelectedValue`
receives only selected options. Built-in Preact child VNodes are not passed to React. Dropdown render callbacks omit the Preact element-factory argument:

```tsx
import { Dropdown, Dialog } from '@revolist/ui/react';

<Dropdown
  source={source}
  value={selected}
  onChange={setSelected}
  renderOption={(option, selected) => (
    <strong aria-current={selected}>{option.label}</strong>
  )}
/>

<Dialog open={open} title="Edit" closeLabel="Close" onClose={close}
  footer={<button onClick={save}>Save</button>}>
  <Editor />
</Dialog>
```

Wrappers expose `{ element }` through their React ref: this is the mount boundary,
not an internal input. Shared control callbacks receive native DOM events; they
do not synthesize React events. Dropdown receives option data through `source` and reports selected values through `onChange`.

### Angular

Import standalone `UiComponent` and `UiSlotDirective` from `@revolist/ui/angular`.
The generic `<rv-ui>` host accepts any shared catalog name in `component` and its
controlled values/configuration in `props`. `valueChange` forwards the component's
primary model callback; `uiEvent` forwards `{ name, args }` for supplied `on*`
callbacks, the primary model callback, and `onClose`. Supplied callbacks still run
and retain their return values. Use immutable `props` updates so Angular can
observe configuration changes.

```html
<rv-ui
  component="Dropdown"
  [props]="{ source: source, value: selected }"
  (valueChange)="selected = $any($event)"
>
  <ng-template rvUiSlot="option" let-option="option" let-selected="selected">
    <strong>{{ option.label }}</strong>
  </ng-template>
</rv-ui>
```

Use `rvUiSlot="default"` for children, `rvUiSlot="footer"` for a dialog footer,
and the same scoped option/value/content slots described for Vue. Angular keeps
ownership and change detection of embedded views after they move into controls.
Use `component="Dropdown"` with a `source` array and handle `valueChange` for selections. Public Angular entries ship partial-compilation metadata.

### Svelte 5

`@revolist/ui/svelte` exports `UiComponent`, a generic catalog host. Supply shared
props and callbacks, or use `onValueChange` to observe the primary controlled
callback. `onUiEvent` receives the same event envelope as Angular. Named snippets
use the same scope names as Angular/Vue slots. Replace the `props` object when
changing configuration.

```svelte
<script lang="ts">
  import { UiComponent } from '@revolist/ui/svelte';
  let selected = $state('open');
  const source = [{ value: 'open', label: 'Open' }];
</script>

<UiComponent
  component="Dropdown"
  props={{ source, value: selected }}
  onValueChange={(value) => (selected = value as string)}
  slots={{ option }}
/>

{#snippet option(scope: Record<string, any>)}
  <strong>{scope.option.label}</strong>
{/snippet}
```

Default children and named snippets remain Svelte-owned, with their original
context and reactive updates. Dropdown options use the shared `source` contract.
The public package supplies a Svelte source condition plus precompiled browser
and server entry points, so server imports do not execute client mounting code.

### Rendering boundaries and verification

Complex wrappers mount on the client and render empty boundaries on the server;
full server-rendered control markup is not provided. Content uses additional elements styled with
`display: contents`; direct-child DOM selectors must account for those elements.
Provide explicit labels and associations when child-VNode inspection would
otherwise determine them. Unmounting releases Preact effects and portals along
with the host framework's content. Angular/Svelte's generic hosts include the
catalog lookup; React's named factory calls are marked pure for tree shaking.

`UiComponentName` and `UiComponentProps<Name>` are available from the Angular,
Svelte and framework entries for explicitly typing application configurations.
The dedicated browser fixture covers all four frameworks:

```sh
pnpm --filter @revolist/ui lint:svelte
pnpm --filter @revolist/ui-gallery exec playwright test --config ../../tests/shared-ui/playwright.framework-adapters.config.ts
```

### PDF viewer

`PdfViewer` adds PDF rendering, text selection/search, page navigation, zoom/fit,
rotation, local files, download and printing. It is available through the Preact,
React and Vue entries and the Angular/Svelte component catalog. Install the optional
`pdfjs-dist` peer and provide its matching worker URL. See
[`package/pdf-viewer/README.md`](package/pdf-viewer/README.md) for setup, API and lifecycle.

Pagination supports `boundaryButtons` to show or hide the first/last page buttons.
The native `PaginationPanel` (and Pro pagination) defaults to `true`; the framework
`Pagination` component defaults to `false` to preserve its existing appearance.
Set `boundaryButtons={false}` to keep only previous/next controls. With
`navigation={false}`, all navigation buttons are hidden. Framework `Pagination`
also accepts localized `firstLabel`/`lastLabel` and children for a page field or selector.

`DateTimeField` and the native date/time popup adapter share a compact time selector: typed entry plus keyboard-accessible hour/minute columns, optional seconds (`precision: 'second'`) and localized AM/PM (`timeFormat: '12h'` or `'locale'`). `minTime`, `maxTime` and `timeStep` constrain each choice; intervals are anchored to `minTime` when supplied. Single datetime pickers place the same panel beside the calendar and stack it on narrow screens. Existing `autoApply`, `showActions`, `required` and action labels retain their behavior. Override `text.hours`, `minutes`, `seconds`, `dayPeriod` and `noTimes` alongside the existing time labels for translations. Vue, React and Angular fields use the same shared implementation.

### Select migration

Use `Dropdown` for single selection, `Combobox` for searchable choices, and `MultiSelect` for multiple choices. `NativeSelect` has been removed from the component catalog and framework adapters. Pass option data through `source` instead of native `<option>` children.

DOM consumers can import `createDropdownControl` from `@revolist/ui/dropdown/control`. Append `control.element`, read or set `control.value`, update `control.source` / `control.disabled`, and call `control.destroy()` when removing the owner. `name` submits the raw string value; disabled controls are omitted from FormData.

Preact code that already defines JSX options can use `Select` from `@revolist/ui/select` (also available through `native-control` for existing consumers). It turns option descriptors into shared Dropdown data and never mounts native select/option nodes. Handle `onValueChange` directly; callbacks receive a string, or an array when `multiple` is enabled.

## HTML rich text editor

`HtmlEditor` from `@revolist/ui/rich-text` owns the independent writing surface, sanitization, formatting toolbar, and local undo/redo. Pro supplies only its grid adapter and renderer. The gallery's Editors page is the standalone reference.

- Enter splits paragraphs/list items. Heading-end Enter returns to a paragraph; Shift+Enter inserts a soft break.
- Code blocks contain literal text. Enter inserts a newline; three Enters at the end return to a paragraph. ArrowDown at the end and ArrowUp at the start move outside the block. Shift+Enter stays in code. Backspace at the start converts the block to a paragraph.
- Enter in an empty quote paragraph exits the quote. Enter in an empty list item outdents one level, then exits at the top level. Tab/Shift+Tab indent/outdent lists; Tab on the first item remains available to leave the editor.
- ArrowRight at the end of inline code or a link continues outside that wrapper. Alt+F10 focuses formatting; Left/Right/Home/End navigate toolbar controls and Escape returns to the saved caret. Ctrl/Cmd+Enter commits.
- HTML source is parsed inertly and sanitized. Paste imports plain text. Code removes rich marks; whitespace between source blocks does not create blank paragraphs. A changed `value` replaces the draft and resets local history.

The writing area owns scoped paragraph, heading, list, quote, code and focus styles. Keyboard help is localizable with `text.keyboardHelp` and `text.codeHelp`. `autoApply` and `showActions` retain the shared editor commit contract.

Rich-text grid cells use a compact presentation: a neutral quote rail, accent underlined links with a keyboard focus ring, 1.5 text line-height and bounded row-aware insets. The renderer preserves semantic HTML; row heights and overflow remain grid/application policy. Set sufficient row height for the number of blocks to display. `--rg-theme-row-size` supplies the normal single-line inset without stretching each rich-text line to the full row height.

## Icon toolbar

`IconToolbar` from `@revolist/ui/icon-toolbar` (also `preact` and the framework catalog) renders a compact SVG control group from explicit `{ id, label, icon?, text?, disabled? }` actions and calls `onAction(id)` for pointer/Enter/Space activation. `icon` accepts trusted SVG assets; `ICON_TOOLBAR_ICONS` includes plus, minus, directional arrows and reset. Consumers own action state and localization. The gallery's Menus and toolbars page demonstrates zoom, pan and reset.

`SvgToolbarButton` is the lower-level SVG button used by Charts for measured layouts and localized labels. Its rectangle/text refs allow consumers to fit long captions. Include `SVG_TOOLBAR_BUTTON_STYLES` once in an SVG `<style>` to preserve hover, disabled and focus presentation in portable SVG exports. Chart navigation calculations, synchronization and export placement stay in Charts.

The rich-text formatting toolbar composes four shared `IconToolbar` panels for marks, headings, blocks and links. `IconToolbarAction.pressed` adds optional toggle semantics/highlighting; `suffixIcon` composes a secondary bundled icon for numbered headings. Existing zoom/pan actions retain their behavior. The editor manages one roving focus stop across the panels and preserves the text selection during pointer activation.

Shared buttons render supplied `title` text with the shared tooltip instead of a native browser hint. This covers `ButtonControl`, `Button` navigation links and explicit titles on `SvgButton`; SVG toolbar actions use `title` or their accessible label. Native title attributes/elements are omitted to prevent duplicate hints. Tooltips preserve consumer handlers, external native-button refs and existing descriptions, and clean up on title changes or unmount. Shared tooltip/popover anchors accept HTML or SVG elements.

`formatRichTextHtml` is exported from `@revolist/ui/rich-text`. It is the shared, dependency-free formatter used by the editor's HTML tab and the gallery's Saved HTML output. The HTML tab formats when opened and on external value refresh; it does not reformat keystrokes. Two-space block indentation preserves inline phrases, mixed-content containers and literal code whitespace. Empty input stays empty. Applications may override presentation through `HtmlEditorProps.formatSource`; commits still use the sanitizer. The formatter is a presentation utility, not a replacement for sanitization.

`HtmlSyntax` from `@revolist/ui/rich-text` paints escaped HTML source with shared theme colors for tags, attributes, quoted values and comments. The HTML tab composes it with `HighlightedTextInput`, retaining a native textarea for typing, selection, IME and resizing. Highlighting is hidden from assistive technology, scrolls with the textarea and never mounts source HTML. Gallery Saved HTML uses the same component.

### Unified tooltips

All product hints use the UI tooltip surface (`rv-tooltip`), including native
button titles, SVG toolbar actions, formatting controls and chart readouts.
Import `useTooltip` / `TooltipSurface` or `TooltipController` from
`@revolist/ui/surfaces`. The hook supplies `triggerProps` and `tooltip`; spread
the props onto an accessible trigger and render the tooltip alongside it. Rich
content uses the hook's `content` option; delayed hints use `delay`. The older
`useControlTooltip` formatting export is a compatibility alias to the same owner.

Imperative renderers use `prepareTooltipSurface` from the same entry point and
retain only their domain-specific content and pointer/plot positioning. Shared
styles install into the relevant document or shadow root; do not add a local
background, border, font, shadow, or native `title` hint. Theme overrides use
`--rv-tooltip-bg`, `--rv-tooltip-fg` and `--rv-tooltip-muted`.

Tooltips support HTML/SVG anchors, keyboard focus, Escape, pointer exit, viewport
bounds and top-layer rendering. A document-wide owner retires other hints before
showing the next. Always dispose imperative bindings on teardown. The RevoGrid
TooltipPlugin remains a separate grid integration and is not migrated here.

Tooltip lifecycle has one internal owner, `core/tooltip-session.ts`. The Preact
hook supplies markup/events and the imperative controller binds native events;
both delegate delays, visibility, positioning, descriptions, dismissal and
cleanup to that session. Keep new lifecycle behavior there, not in an adapter.
Tooltip content is informational; use a Popover for interactive controls.
