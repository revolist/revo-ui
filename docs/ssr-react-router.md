# React Router and Revo UI

Use React Router framework mode with SSR enabled. A server loader supplies the title; the React adapter mounts its control after hydration.

## Run the example

[Open the complete starter](https://github.com/revolist/revo-ui/tree/main/examples/ssr/react-router/). Use Node.js 24.15 or newer and pnpm 11. The lockfile pins the verified dependency versions, including `@revolist/ui@4.0.23`.

```sh
git clone https://github.com/revolist/revo-ui.git
cd revo-ui/examples/ssr/react-router
pnpm install --frozen-lockfile
pnpm build
pnpm start
```

Open `http://localhost:3000`. The heading is present in the initial server HTML. Click **Save 0** and it becomes **Save 1**. Reloading resets local state. For development, use `pnpm dev`.

## Files to read

| File                                                                                                                 | Responsibility                                            |
| -------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| [`vite.config.ts`](https://github.com/revolist/revo-ui/blob/main/examples/ssr/react-router/vite.config.ts)           | Enables the framework build.                              |
| [`app/routes.ts`](https://github.com/revolist/revo-ui/blob/main/examples/ssr/react-router/app/routes.ts)             | Registers the index route.                                |
| [`app/root.tsx`](https://github.com/revolist/revo-ui/blob/main/examples/ssr/react-router/app/root.tsx)               | Loads UI CSS and includes the framework document helpers. |
| [`app/routes/home.tsx`](https://github.com/revolist/revo-ui/blob/main/examples/ssr/react-router/app/routes/home.tsx) | Loads data, renders the page and owns the button count.   |

## Use the button directly in the route

```tsx
import { useState } from 'react';
import { useLoaderData } from 'react-router';
import { SvgButton } from '@revolist/ui/react/unstyled';

export function loader() {
  return { title: 'React Router report' };
}

export default function Home() {
  const [count, setCount] = useState(0);
  const { title } = useLoaderData<typeof loader>();
  return (
    <main>
      <h1>{title}</h1>
      <p>This title comes from the server loader.</p>
      <SvgButton
        label={`Save ${count}`}
        visibleLabel={`Save ${count}`}
        onClick={() => setCount((value) => value + 1)}
      />
    </main>
  );
}
```

## Keep page content server rendered

The loader runs on the server. On a direct request, its title is already in the HTML response. The route uses local React state, without a `'use client'` directive: this example uses ordinary framework SSR rather than React Server Components.

Keep `<Links />`, `<Scripts />` and `<ScrollRestoration />` in the document. The framework uses them for styles, hydration and navigation.

## Styles and rendering

Use `@revolist/ui/react/unstyled` with `@revolist/ui/styles/base.css` loaded once through the framework. This supplies the button's styles without runtime stylesheet insertion. Add a component's style family only when using that component.

The adapter renders a host on the server and mounts its control in the browser. Important headings, text and any no-JavaScript experience remain the host framework's responsibility. A stylesheet does not turn that host into full server-rendered control HTML. See the [SSR overview](ssr.md).

## Check your result

Run the production commands above, then check the response, button click, reload, and browser console. Keep server and client dependency versions aligned. Test your own deployment after changing adapters, CSP or hosting settings.

React Router [framework installation](https://reactrouter.com/start/framework/installation), [data loading](https://reactrouter.com/start/framework/data-loading), and [rendering strategies](https://reactrouter.com/start/framework/rendering).
