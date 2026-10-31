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

## GitHub Pages

The gallery is deployed independently from demos: [Open Revo UI](https://ui.rv-grid.com/).

`.github/workflows/pages.yml` builds and deploys on pushes to `main` and manual dispatch. It checks out the exact library commit recorded in `library-source.json`, prepares an isolated UI/dates/chart-utils workspace, installs `pages.pnpm-lock.yaml` with `--frozen-lockfile`, typechecks, and builds with the `/` asset base for `ui.rv-grid.com`. Only the static `dist` output is uploaded to Pages.

The workflow uses `REVO_UI_LIBRARY_READ_KEY`, a read-only deploy key for the private library repository. It does not publish that repository's source tree. To update the component version, change `library-source.json` to a published source commit and regenerate the Pages lockfile if dependency manifests changed.

The demos Docker image no longer builds or serves Revo UI.

Component licensing remains governed by the library's existing license. Gallery source availability does not change component licensing.

The custom domain requires a DNS CNAME record: `ui.rv-grid.com` → `revolist.github.io`. Use DNS-only mode until GitHub validates DNS and provisions HTTPS.
