# Contributing to Revo UI

Bug reports, runnable reproductions, documentation, tests, accessibility improvements, and code contributions are welcome. Please follow our [Code of Conduct](CODE_OF_CONDUCT.md).

## Before you start

- Search [existing issues](https://github.com/revolist/revo-ui/issues), including closed reports, before opening a new issue. Add useful details or a reaction to an existing report instead of duplicating it.
- For substantial changes, open an issue describing the use case and proposed approach before implementation. Comment if you plan to work on an existing issue so others can coordinate. Small documentation corrections can go straight to a pull request.
- Report suspected vulnerabilities privately using [SECURITY.md](SECURITY.md).

For bugs, include the Revo UI version, framework and version, browser, operating system, reproduction steps, and expected versus actual behavior. A minimal runnable example is especially helpful. For feature requests, explain the use case and alternatives you have tried. Keep each report focused on one problem.

## Local setup

Use Node.js 24 and the pnpm version declared in `package.json` (currently 11.25.0), matching the repository's workflows. Fork the repository, then:

```sh
git clone https://github.com/YOUR-USERNAME/revo-ui.git
cd revo-ui
git remote add upstream https://github.com/revolist/revo-ui.git
git switch -c docs/describe-your-change
pnpm install --frozen-lockfile
pnpm dev
```

Choose a descriptive branch name appropriate to your change. No private repository access is needed. Keep dependency and lockfile updates limited to changes required by your work.

## Find the right source

- `package/` contains library source; the root `package.json` owns public exports.
- `internal/` contains workspace date and chart utilities bundled into the public distribution.
- `src/` contains the gallery demo.
- `docs/` contains public guides; [MAINTAINERS.md](MAINTAINERS.md) documents implementation details and [OWNERSHIP.md](OWNERSHIP.md) describes component boundaries.
- Unit tests are configured in `vitest.config.ts`; browser tests live in `tests/browser/`.

Keep reusable components independent of RevoGrid and commercial product logic. Follow nearby code conventions, reuse shared controls and utilities, and preserve framework-specific adapter behavior. When changing public behavior, update the relevant docs, examples, and regression coverage. Consider keyboard interaction, focus handling, accessibility, styling, and component cleanup.

Generated distribution and gallery output should be produced by the build scripts rather than edited by hand. See [release documentation](docs/releases.md) for maintainer publication procedures.

## Validate your change

Run checks relevant to your changes and include commands and results in the pull request:

| Check                                                 | Command                |
| ----------------------------------------------------- | ---------------------- |
| TypeScript                                            | `pnpm lint`            |
| Svelte adapters                                       | `pnpm lint:svelte`     |
| Unit tests                                            | `pnpm test`            |
| Component API contracts                               | `pnpm test:api`        |
| Public package build                                  | `pnpm build`           |
| Package archive                                       | `pnpm pack:public`     |
| Public package consumers, after preparing the archive | `pnpm test:public`     |
| Gallery build                                         | `pnpm build:demo`      |
| Browser interaction                                   | `pnpm test:browser`    |
| Framework adapters                                    | `pnpm test:frameworks` |
| Documentation rendering                               | `pnpm test:docs`       |

For browser tests, install Chromium once with `pnpm exec playwright install chromium`. The default browser suite builds and serves the gallery automatically. To run a focused regression:

```sh
pnpm exec playwright test tests/browser/shared-ui.spec.ts --list
pnpm exec playwright test tests/browser/shared-ui.spec.ts
```

Use the file relevant to your change. PDF, CDN, tooltip, field-style, and framework fixtures have dedicated scripts and configurations listed in `package.json`; run those when affected. Reuse existing Playwright helpers and add browser coverage for rendering, keyboard, mouse, focus, and lifecycle changes.

For documentation-only changes, check Markdown formatting, links, and documented commands. Explain any checks you could not run.

## Submit a pull request

1. Keep the change focused on one problem and exclude unrelated generated output or dependency updates.
2. Use descriptive commits, such as `fix(dialog): restore focus on close` or `docs: clarify local setup`.
3. Push your branch and open a pull request against `main` using the template. Explain the problem, resulting behavior, and important tradeoffs. Link the related issue; use `Closes #123` only if the PR resolves it.
4. Include validation results and screenshots or recordings for visual changes. Update documentation when APIs or behavior change.
5. Respond to review feedback and address relevant CI failures before merge.

By contributing, you agree that your contributions are licensed under the [MIT License](LICENSE).
