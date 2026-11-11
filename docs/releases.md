# Publishing Revo UI

The UI-owned `publish.yml` builds, validates, signs and publishes public `@revolist/ui` on npm and its GitHub Packages mirror. It supports standalone releases, manual dry runs, and native `workflow_call` from Pro. No dispatch API or `REPO_TOKEN` is needed.

## Access

The existing GitHub Packages **Manage Actions access** grants both `revogrid-pro` and `revo-ui` Admin access to `@revolist/ui`. The job requests `packages: write` and uses the caller's `GITHUB_TOKEN` for the mirror. Each checkout explicitly selects `revolist/revo-ui`, because a reusable workflow otherwise checks out the caller repository.

npm publication uses OIDC only, with `id-token: write` on both caller and reusable publication jobs and npm CLI >=11.5.1. Existing npm trusted publisher entries authorize `revolist/revogrid-pro / publish.yml` (verified Valid) and `revolist/revo-ui / publish.yml` (pending first publication at the time of this fix). No npm token or auth placeholder is supplied. A reusable workflow uses its caller's identity, so Pro calls use the existing Pro publisher entry and standalone UI releases use the UI entry. No new registry or repository credential is required.

The UI repository Actions policy must allow its workflow dependencies. It now uses a selected-actions list for the exact existing references: `actions/checkout@v5`, `actions/setup-node@v5`, `actions/upload-artifact@v4`, `actions/upload-pages-artifact@v4`, `actions/deploy-pages@v4`, `pnpm/action-setup@v4`, and `sigstore/cosign-installer@v3`. A local-only policy blocks validation before checkout. Update this list deliberately when upgrading action versions.

## Pro-synchronized releases

Merge the reusable UI workflow before the Pro caller. Pin the workflow reference and `automation_ref` input to the same immutable UI commit. Pro supplies its exact resolved version and the UI gitlink from the selected release tree through `source_ref`; it waits for the native job result before paid packages publish. Failures and cancellation stop that gate. Product-only selections and trial-only publications are unchanged.

The UI source commit must belong to UI main. Automation is checked out separately from source, so a release can build older pinned source without relying on its release scripts. Install the locked dependencies, stamp the source, run TypeScript and unit checks, build, stamp the compiled distribution, and validate both archives before publishing. This never moves tags, changes branches or advances Pro's gitlink.

## Independent releases and validation

Run **Actions → Publish UI package → Run workflow** with `version`, optionally `source_ref`, and `dry_run=true` to build, validate, pack and sign without publishing. A UI GitHub release uses its tag/version. Stable versions publish to `latest`; prereleases publish to `next`. Version and source validation reject malformed input, commits outside main, and conflicting existing registry versions.

Both archives and Sigstore bundles are retained as artifacts. The manifest records `revoUiRelease.version` and `.commit`; retrying skips a registry only when both match. A partial npm-success/mirror-failure can safely retry the same version/source. Existing versions without matching metadata require a new version and are never overwritten or unpublished.

Publication concurrency is serialized within each caller repository; standalone UI and Pro runs have separate concurrency scopes. Avoid starting competing releases of the same version. Registry conflict checks remain authoritative. Native reusable jobs follow the caller's cancellation and timeout lifecycle; inspect the job and registry state before retrying.

[GitHub reusable workflows](https://docs.github.com/en/actions/sharing-automations/reusing-workflows) · [GitHub Packages Actions access](https://docs.github.com/en/packages/learn-github-packages/configuring-a-packages-access-control-and-visibility) · [npm trusted publishing](https://docs.npmjs.com/trusted-publishers/)
