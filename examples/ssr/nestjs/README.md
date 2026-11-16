# NestJS + Revo UI

A Handlebars page with one browser-mounted counter button. Requires Node.js 24.15+ and pnpm 11.

```sh
pnpm install --frozen-lockfile
pnpm check
pnpm build
pnpm start
```

Open http://127.0.0.1:3000. Click Save 0 to get Save 1. Reload resets it.

`src/main.ts` serves `views/index.hbs`. `src/client.ts` owns the browser button. The build emits browser JS/CSS into `public/` and the server into `dist/`. Run from this directory.

See [the guide](../../../docs/ssr-nestjs.md) for file-by-file explanations. No server persistence or external API is involved.

The workspace allows the pinned Revo UI dependency through pnpm's release-age gate; other dependencies retain the default policy.
