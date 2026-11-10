# Publishing Revo UI

The `Publish UI package` workflow in **revolist/revo-ui** owns both publications: public `@revolist/ui` on npm and its restricted GitHub Packages mirror. The gallery's Pages workflow remains separate. Pro builds may still bundle UI source, but Pro no longer packs or publishes the UI package itself.

## One-time setup and rollout

1. Merge this UI workflow before the Pro delegation change. The workflow must exist on UI `main` before Pro can dispatch it.
2. npm uses the existing **trusted publisher** for `@revolist/ui`: ensure it authorizes owner `revolist`, repository `revo-ui`, and workflow filename `publish.yml` (and the same environment, if one is configured). The job grants `id-token: write` and uses npm CLI >=11.5.1 on a GitHub-hosted runner. No `NPM_TOKEN` secret is required. GitHub Packages continues to use the job’s separate `GITHUB_TOKEN`.
3. For the existing GitHub Packages `@revolist/ui`, grant **revolist/revo-ui** write access under its **Manage Actions access** settings. Reconnect its repository to revo-ui where appropriate. Its existing Pro association does not automatically grant the new workflow access. Keep Pro/consumer read access if they install the mirror.
4. In **revogrid-pro**, `REPO_TOKEN` must have Actions read/write permission for **revolist/revo-ui** (fine-grained token or GitHub App token). The repository-local `GITHUB_TOKEN` cannot supply cross-repository access. Pro retains its own `NPM_TOKEN` for chart adapters.
5. Update Pro's `packages/ui` submodule pointer to the UI commit intended for the next release. The commit must already belong to UI `main`. Pro's Git tree, rather than whichever UI main happens to contain later, selects the released code.

Do not launch the first real publication until these access settings are configured. Test via the workflow's **dry_run** input first; it builds, validates, packs and signs the two archives without publishing either registry. No real publication is part of validating these workflow changes.

## Pro-synchronized releases

Pro's Publish NPM workflow delegates UI publication for GitHub releases and the `all`, `pro`, and `ui` manual selections. It sends:

- The exact resolved Pro release version.
- The immutable UI submodule commit from the selected Pro release source.
- A request ID linking the initiating Pro run.

UI validates that the source commit is on main and applies the requested version to the build checkout and compiled package. Pro waits for the exact run ID returned by GitHub's workflow-dispatch API. A timeout, cancellation or failure stops the paid publication gate; it is never treated as success. Standalone product selections remain independent. Trial-only publication remains unchanged and does not publish UI.

This synchronizes **published package versions**, without rewriting main, moving release tags or automatically advancing the Pro submodule. It preserves the UI code selected by the Pro release. New release tags should include the delegated workflow; intentionally building older source tags still uses the dispatching workflow's automation to read their UI gitlinks.

## Independent UI releases

Use **Actions → Publish UI package → Run workflow** in revo-ui. Supply `version`, optionally `source_ref` (a full UI SHA or existing tag), and optionally `dry_run`. Without a source override, the selected workflow ref is used. Publishing a GitHub release also invokes this workflow using its tag/version.

Versions may have a `v` tag prefix and standard prerelease identifiers, such as `4.1.0-rc.1`. Build metadata and malformed/leading-zero versions are rejected. Stable versions publish to `latest`; prereleases use `next`. Independent UI releases may therefore use versions ahead of Pro; reserve the next synchronized version or explicitly pin a new Pro version rather than reusing an already published version with different source.

## Validation, signatures and retries

Trusted release automation is checked out separately from the selected source, so Pro can publish an older main commit that predates these workflow scripts. Installation uses the source lockfile before its version is stamped. The source's TypeScript, unit and public-archive checks must pass. Archives for both registries and their Sigstore bundles are retained as Actions artifacts.

The compiled manifest records `revoUiRelease.version` and `revoUiRelease.commit`; the mirror preserves them and points to the UI repository. A retry skips an already published version only when this metadata matches. A partial npm-success/GitHub-failure can therefore be retried using the same version and source. Conflicting or older releases without this metadata require a new version. Authentication errors and unexpected registry responses fail the workflow. Already published versions are never overwritten or unpublished.

Publication jobs share a concurrency group with queue: max (up to 100 waiting jobs); an active publication is not canceled. A full queue is reported as a failed/canceled release by Pro. PR validation uses no publication lock. A failed/timed-out Pro monitor does not cancel a remote UI publication: inspect the linked UI run before retrying. Trusted publisher configuration is managed in npm settings; mirror/dispatch permissions are managed in GitHub settings. Local tests cannot prove those permissions.

[GitHub concurrency queues](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/control-workflow-concurrency) · [GitHub workflow dispatch API](https://docs.github.com/en/rest/actions/workflows#create-a-workflow-dispatch-event) · [GitHub Packages Actions access](https://docs.github.com/en/packages/learn-github-packages/configuring-a-packages-access-control-and-visibility)

[npm trusted publishing requirements](https://docs.npmjs.com/trusted-publishers/)
