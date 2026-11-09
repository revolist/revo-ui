# RevoGrid colors

`@revolist/ui` owns shared interface color values. The Sass palette supplies reusable raw colors; the theme assigns semantic roles. Product styles consume semantic `--rv-ui-*` variables. The **Colors** page of the UI gallery (`?page=colors`) shows the light and dark palettes side by side, resolved directly from theme CSS, and provides searchable usage guidance from `package/styles/color-roles.ts`. That catalog stores names and usage, never color values.

## Choose by purpose

- **Surfaces:** canvas for the application background; surface for controls and panels; elevated for floating content; sunken for inset content; hover for neutral hover states. Overlay is a modal scrim; shadow is an elevation color, not a complete box-shadow declaration.
- **Content:** text for primary content, muted for supporting labels, borders for boundaries. Subtle is low emphasis and needs contrast verification before use for readable text.
- **Interaction:** accent and accent-hover for primary actions, accent-fg for content on accent fills, accent-text for accent text on neutral surfaces. Selected-bg/fg describe neutral selection. Focus-ring marks keyboard focus. Disabled-bg/fg describe disabled controls.
- **Feedback:** pair danger, warning, or success content with the corresponding `*-surface` background. Do not communicate status through color alone.
- **Fields:** field tokens support compact inline editors; ordinary controls use the shared surface/content roles.

Component-specific button, badge, switch, and group variables remain supported. Prefer semantic roles in new product UI. Keep component-specific overrides when they intentionally customize that component.

## Theme and customization

Import UI styles once at the host. Select the theme with `data-theme="light"` or `data-theme="dark"`; native controls use the same theme definitions. Detached overlays must receive the originating theme and custom properties through the shared overlay mounting lifecycle.

Set custom properties on the themed host after the theme declarations. Customize `--rv-ui-accent`, `--rv-ui-accent-hover`, and `--rv-ui-accent-fg` together and verify contrast; accent text and focus indicators derive from the accent. Explicit light/dark scopes define their own tokens, so apply overrides within each scope that needs them.

Keep established product override variables at the consumer boundary, resolving them before the shared default:

```scss
.product-panel {
  background: var(--existing-product-surface, var(--rv-ui-surface));
  color: var(--existing-product-text, var(--rv-ui-text));
}
```

Do not move product selectors, geometry, or layout into the palette. Do not add fallback color literals in consumers; the UI theme is the source of defaults.

## Interface versus data colors

Chart series, task/event category palettes, conditional formatting, heatmaps, and explicit user-selected colors describe data. Preserve those palettes and their public configuration. The surrounding toolbar, dialog, label, focus state, and border still use semantic interface colors. Transparent/currentColor declarations and color-mix expressions derived from semantic tokens are intentional CSS behavior, not independent palettes.

Verify light and dark rendering, keyboard focus, disabled states, custom accents, and detached surfaces when changing role assignments. Review contrast on the actual background, especially for translucent colors.

## Audit inventory

Run `node packages/ui/package/scripts/color-inventory.mjs` from the repository root for compact package totals. Add `--json` for normalized color values and exact file/line consumers. Equivalent short and long hexadecimal values are grouped. The scanner is read-only and labels uncertain occurrences `review`; its path-based hints are not an automatic approval to replace colors.

Built-in product colors now live in named UI palettes: chart series and drawing themes, Gantt and Scheduler categories/states, identity colors, Pro syntax and formatting, Excel palettes, notes, feedback, portable exports, and trial notices. Products retain the behavior and override contracts while importing the fixed defaults. CSS keywords such as transparent/currentColor, system colors, dynamically calculated colors, parser recognition strings, documentation examples, and explicit user colors are not independent built-in palette values.

The legacy Sass variables remain available through `_variables.scss`; their raw values are now references into `_palette.scss`. They preserve compatibility for older consumers. New interface styles use semantic tokens rather than these legacy primitives.

## Selectable swatches

The Colors page also lists each selectable swatch name and hexadecimal value. `@revolist/ui/color-palette/palette` owns `DEFAULT_COLOR_PALETTE_OPTIONS`, `ColorPaletteOption`, and `ColorPaletteValue`. UI controls, Pro menu adapters, and Charts picker localization import this pure data module. Chart series defaults remain separate and unchanged.

## Named built-in palettes

`package/color-palette/built-in-palettes.ts` is the catalog of palette IDs, titles, usage, consumers, and exact values. The Colors page lists every palette with searchable usage and expandable swatches. These fixed palettes intentionally preserve their distinct appearance; semantic theme tokens remain the interface customization layer.

Product TypeScript imports the smallest purpose-specific export so unrelated palettes can be removed from bundles:

```ts
import { CHART_SERIES_COLORS } from '@revolist/ui/color-palette/chart-palettes';
```

Product Sass reads the generated lookup without creating product-local color defaults:

```scss
@use '@revolist/ui/palettes.scss' as palettes;
.task {
  background: var(
    --existing-task-background,
    #{palettes.color('chart-series', 'violet')}
  );
}
```

Edit the named TypeScript palette, then run `pnpm --filter @revolist/ui generate:palettes`. Commit the generated Sass alongside its source. `pnpm --filter @revolist/ui check:palettes` and the palette contract tests detect stale generated values; the tests also verify that Sass preserves every exact string, including alpha and ordering-sensitive palette entries. No product reads the gallery registry at runtime.

## Extraction regression gate

Run `pnpm --filter @revolist/ui check:product-colors` to reject fixed built-in values in production product source. The same check runs in UI palette unit tests. It checks named CSS colors, hexadecimal/functional colors, encoded SVG colors, and hexadecimal numeric colors. Comments, type declarations, palette lookup keys, semantic tone classes, parser recognition, and the documented validation example are contextual identifiers rather than paint defaults. Tests, developer demos, generated output, and the read-only Core submodule are outside this product-source gate.

For hexadecimal colors embedded in SVG data URIs, use `palettes.uri-color(id, key)`; it preserves the original hex spelling while producing `%23` encoding.

## Primitive ownership

`package/color-palette/common-palettes.ts` owns `commonColors`, the exact primitive strings used by every built-in product palette, picker swatch, and picker default. Product palette files import these primitives and keep their own semantic keys and order. Avatar gradients compose shared stops; Sass `_palette.scss` reads the generated `common` palette.

Hexadecimal keys identify fixed paint without assigning a product role. Exact serialization variants (hexadecimal case, short hex, CSS keywords, and RGB spellings) remain distinct for portable exports and existing contracts. Do not add a repeated literal to another palette; reference the shared value and regenerate Sass with `pnpm --filter @revolist/ui generate:palettes`.
