# Revo UI + sveltekit

See the [step-by-step guide](../../../docs/ssr-sveltekit.md).

Requires Node.js 24.15+ and pnpm.

These named adapters preview the local public package. From the repository root:

```sh
pnpm install --frozen-lockfile
pnpm build:public
cd examples/ssr/sveltekit
pnpm install --frozen-lockfile
pnpm check
pnpm build
pnpm start
```

The heading is server-rendered. The Revo UI button mounts in the browser.
Click Save 0 to see Save 1; the count is local and resets on reload.
