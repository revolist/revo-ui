# Revo UI + astro

See the [step-by-step guide](../../../docs/ssr-astro.md).

Requires Node.js 24.15+ and pnpm.

```sh
pnpm install --frozen-lockfile
pnpm check
pnpm build
pnpm start
```

The heading is server-rendered. The Revo UI button mounts in the browser.
Click Save 0 to see Save 1; the count is local and resets on reload.
