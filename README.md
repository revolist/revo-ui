# Revo UI

UI components for financial apps, reporting dashboards, and project management. Build with React, Vue, Angular, Svelte, Preact, or vanilla TypeScript.

This repository contains the Revo UI gallery: interactive finance and planning examples, component variants with formatted usage code, and framework integration guides. The component package remains **`@revolist/ui`**.

## Development

The gallery is consumed as the `apps/revo-ui` submodule in the RevoGrid Pro pnpm workspace. Component implementation and styles remain owned by `packages/ui`; browser tests remain in `tests/shared-ui`.

From the parent workspace:

```sh
git submodule update --init apps/revo-ui
pnpm install
pnpm dev:ui
```

```sh
pnpm --filter @revolist/ui-gallery lint
pnpm --filter @revolist/ui-gallery build
pnpm --filter @revolist/ui-gallery test:browser
```

From the gallery directory, use `pnpm dev` or `pnpm build`. A standalone clone needs the parent workspace's `@revolist/ui` and `@revolist/dates` dependencies; this repository does not duplicate their implementation.

## Integration

Import shared components through `@revolist/ui` exports and load `@revolist/ui/styles.css` once. The Frameworks section explains each adapter's setup, state, events, and lifecycle.

The parent demos Docker image continues to serve the gallery at `/ui-gallery/`, under its configured demos base path.

Component licensing remains governed by the library's existing license. Gallery source availability does not change component licensing.
