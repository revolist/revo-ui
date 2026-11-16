# TanStack Start and Revo UI

TanStack Start renders the route on the server and hydrates it in the browser. Keep the normal SSR route and render the Revo UI React adapter directly.

## Run the example

[Open the complete starter](https://github.com/revolist/revo-ui/tree/main/examples/ssr/tanstack-start/). Use Node.js 24.15 or newer and pnpm 11. The lockfile pins the verified dependency versions, including `@revolist/ui@4.0.23`.

```sh
git clone https://github.com/revolist/revo-ui.git
cd revo-ui/examples/ssr/tanstack-start
pnpm install --frozen-lockfile
pnpm build
pnpm start
```

Open `http://localhost:3000`. The heading is present in the initial server HTML. Click **Save 0** and it becomes **Save 1**. Reloading resets local state. For development, use `pnpm dev`.

## Files to read

| File                                                                                                                       | Responsibility                                                  |
| -------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| [`vite.config.ts`](https://github.com/revolist/revo-ui/blob/main/examples/ssr/tanstack-start/vite.config.ts)               | Enables Start, a Node server build through Nitro, and React.    |
| [`src/router.tsx`](https://github.com/revolist/revo-ui/blob/main/examples/ssr/tanstack-start/src/router.tsx)               | Creates a fresh router.                                         |
| [`src/routes/__root.tsx`](https://github.com/revolist/revo-ui/blob/main/examples/ssr/tanstack-start/src/routes/__root.tsx) | Renders the document and links the extracted UI stylesheet.     |
| [`src/routes/index.tsx`](https://github.com/revolist/revo-ui/blob/main/examples/ssr/tanstack-start/src/routes/index.tsx)   | Loads the title through a server function and renders the page. |
| [`src/save-button.tsx`](https://github.com/revolist/revo-ui/blob/main/examples/ssr/tanstack-start/src/save-button.tsx)     | Owns the interactive control.                                   |

## The small component

```tsx
import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
} from '@tanstack/react-router';
import css from '@revolist/ui/styles/base.css?url';

export const Route = createRootRoute({
  head: () => ({ links: [{ rel: 'stylesheet', href: css }] }),
  component: Root,
});

function Root() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <HeadContent />
      </head>
      <body>
        <Outlet />
        <Scripts />
      </body>
    </html>
  );
}
```

## Load data through a server function

`createServerFn` keeps the report function on the server. The route loader calls it for the initial request and for framework navigation. This sample returns one fixed title; replace that function body with your server data access when needed.

```tsx
import { createFileRoute } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { SaveButton } from '../save-button';

const getReport = createServerFn().handler(() => ({
  title: 'TanStack Start report',
}));

export const Route = createFileRoute('/')({
  loader: () => getReport(),
  component: Home,
});

function Home() {
  const report = Route.useLoaderData();
  return (
    <main>
      <h1>{report.title}</h1>
      <p>This title comes from a server function.</p>
      <SaveButton />
    </main>
  );
}
```

## Use the framework stylesheet link

The `?url` import gives the root route an emitted CSS URL. `HeadContent` writes its stylesheet link into the server response. The Start plugin generates `src/routeTree.gen.ts`; do not edit that file.

The example uses Nitro's Node server output. Its start command runs `.output/server/index.mjs`; a different hosting platform needs its own deployment adapter. There is no database or server mutation in the button example.

## Styles and rendering

Use `@revolist/ui/react/unstyled` with `@revolist/ui/styles/base.css` loaded once through the framework. This supplies the button's styles without runtime stylesheet insertion. Add a component's style family only when using that component.

The adapter renders a host on the server and mounts its control in the browser. Important headings, text and any no-JavaScript experience remain the host framework's responsibility. A stylesheet does not turn that host into full server-rendered control HTML. See the [SSR overview](ssr.md).

## Check your result

Run the production commands above, then check the response, button click, reload, and browser console. Keep server and client dependency versions aligned. Test your own deployment after changing adapters, CSP or hosting settings.

TanStack Start [build from scratch](https://tanstack.com/start/latest/docs/framework/react/build-from-scratch) and [hosting](https://tanstack.com/start/latest/docs/framework/react/guide/hosting).
