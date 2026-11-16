# Angular SSR + Revo UI

An Angular server-rendered page with one named Revo UI counter button. Requires Node.js 24.15+ and pnpm 11.

These named adapters preview the local public package. From the repository root:

```sh
pnpm install --frozen-lockfile
pnpm build:public
cd examples/ssr/angular
pnpm install --frozen-lockfile
pnpm check
pnpm build
pnpm start
```

Open http://127.0.0.1:3000. Click Save 0 to get Save 1. Reload resets it.

`src/app.ts` contains the example. The main entries bootstrap browser/server rendering; `src/server.ts` serves the production build. CSS is global in `angular.json`. See [the guide](../../../docs/ssr-angular.md) for the file breakdown and direct component inputs.

The starter installs `file:../../../dist`, the built public package. After the named adapters are released, a standalone application can use that published version instead.
