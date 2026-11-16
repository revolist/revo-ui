# Revo UI integration starters

Each folder is a separate, small application using the published `@revolist/ui` package. Use Node.js 24.22.1 or newer and pnpm 11.25.0. Copy one folder to start; you do not need the gallery source or its parent monorepo.

| Folder                           | Rendering                             | Guide                                              |
| -------------------------------- | ------------------------------------- | -------------------------------------------------- |
| [nextjs](nextjs)                 | Next.js App Router                    | [Next.js](../../docs/ssr-nextjs.md)                |
| [nuxt](nuxt)                     | Nuxt SSR                              | [Nuxt](../../docs/ssr-nuxt.md)                     |
| [sveltekit](sveltekit)           | SvelteKit SSR                         | [SvelteKit](../../docs/ssr-sveltekit.md)           |
| [astro](astro)                   | Astro server route and Vue island     | [Astro](../../docs/ssr-astro.md)                   |
| [angular](angular)               | Angular SSR and hydration             | [Angular](../../docs/ssr-angular.md)               |
| [react-router](react-router)     | React Router framework SSR            | [React Router](../../docs/ssr-react-router.md)     |
| [tanstack-start](tanstack-start) | TanStack Start SSR                    | [TanStack Start](../../docs/ssr-tanstack-start.md) |
| [nestjs](nestjs)                 | NestJS MVC template and browser mount | [NestJS](../../docs/ssr-nestjs.md)                 |
| [refine](refine)                 | Refine inside Next.js                 | [Refine](../../docs/integration-refine.md)         |
| [lovable](lovable)               | Legacy React/Vite client rendering    | [Lovable](../../docs/integration-lovable.md)       |

Newer Lovable projects use TanStack Start: use that starter and the Lovable guide. The legacy example explicitly remains client-rendered.

## Run one example

```sh
cd nextjs
pnpm install --frozen-lockfile
pnpm build
pnpm start
```

Follow the folder README for its address and any framework-specific commands. SSR examples return a meaningful heading in the HTTP response. Revo UI adapters mount the interactive button in the browser; they do not render complete control HTML on the server. Click Save 0 to see Save 1. Reloading resets the local counter.

## Verification

The `SSR examples` workflow installs and builds every starter independently, checks its types, starts the production server, and verifies the server heading and browser interaction. The legacy Lovable starter's build includes its TypeScript check and skips the server-heading assertion.

To run the same browser check locally, install the gallery's dependencies and Chromium, start one starter's production server, then run from the repository root:

```sh
node scripts/verify-ssr-example.mjs http://127.0.0.1:3000
```

For the legacy Vite starter, pass its preview address and `--client-only`.
