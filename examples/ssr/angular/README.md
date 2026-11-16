# Angular SSR + Revo UI

An Angular server-rendered page with one browser-mounted counter button. Requires Node.js 24.15+ and pnpm 11.

```sh
pnpm install --frozen-lockfile
pnpm check
pnpm build
pnpm start
```

Open http://127.0.0.1:3000. Click Save 0 to get Save 1. Reload resets it.

`src/app.ts` contains the example. The main entries bootstrap browser/server rendering; `src/server.ts` serves the production build. CSS is global in `angular.json`. See [the guide](../../../docs/ssr-angular.md) for the file breakdown and hydration boundary.

The workspace allows the exact recent release `@revolist/ui@4.0.23` through pnpm's release-age gate; other dependencies retain the default policy.
