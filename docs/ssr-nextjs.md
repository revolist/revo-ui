# Next.js App Router and Revo UI

Import `SvgButton` directly in the page and keep its count state there. The server layout loads CSS and enables request-time rendering.

## Run the example

[Open the complete starter](https://github.com/revolist/revo-ui/tree/main/examples/ssr/nextjs/). Use Node.js 24.15 or newer and pnpm 11. The lockfile pins the verified dependency versions, including `@revolist/ui@4.0.23`.

```sh
git clone https://github.com/revolist/revo-ui.git
cd revo-ui/examples/ssr/nextjs
pnpm install --frozen-lockfile
pnpm build
pnpm start
```

Open `http://localhost:3000`. The heading is present in the initial server HTML. Click **Save 0** and it becomes **Save 1**. Reloading resets local state. For development, use `pnpm dev`.

The starter explicitly uses Next.js's supported Webpack build (`next build --webpack`). With UI 4.0.23, the default Turbopack resolver also resolves the barrel's unused optional PDF dependency. Webpack builds this button-only example without installing PDF.js. The server layout's `force-dynamic` setting makes this a request-time SSR example.

## Files to read

| File                                                                                                 | Responsibility                                                       |
| ---------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| [`app/layout.tsx`](https://github.com/revolist/revo-ui/blob/main/examples/ssr/nextjs/app/layout.tsx) | Loads global CSS, enables request-time SSR and renders the document. |
| [`app/page.tsx`](https://github.com/revolist/revo-ui/blob/main/examples/ssr/nextjs/app/page.tsx)     | Renders the page and owns the button count.                          |

## Use the button directly in the page

`app/page.tsx` contains the page, count state and button:

```tsx
'use client';

import { useState } from 'react';
import { SvgButton } from '@revolist/ui/react/unstyled';

export default function Page() {
  const [count, setCount] = useState(0);
  return (
    <main>
      <h1>Next.js report</h1>
      <p>This text is rendered on the server.</p>
      <SvgButton
        label={`Save ${count}`}
        visibleLabel={`Save ${count}`}
        onClick={() => setCount((value) => value + 1)}
      />
    </main>
  );
}
```

## Keep the layout on the server

`app/layout.tsx` loads the stylesheet once and enables request-time rendering:

```tsx
import type { ReactNode } from 'react';
import '@revolist/ui/styles/base.css';

export const dynamic = 'force-dynamic';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

`'use client'` enables the page's state and click handler. Next.js still renders its initial heading and text on the server. The server layout owns the rendering configuration; no mounted flag or application effect is needed.

## Styles and rendering

Use `@revolist/ui/react/unstyled` with `@revolist/ui/styles/base.css` loaded once through the framework. This supplies the button's styles without runtime stylesheet insertion. Add a component's style family only when using that component.

The adapter renders a host on the server and mounts its control in the browser. Important headings, text and any no-JavaScript experience remain the host framework's responsibility. A stylesheet does not turn that host into full server-rendered control HTML. See the [SSR overview](ssr.md).

## Check your result

Run the production commands above, then check the response, button click, reload, and browser console. Keep server and client dependency versions aligned. Test your own deployment after changing adapters, CSP or hosting settings.

Next.js [Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components) and [CSS](https://nextjs.org/docs/app/getting-started/css).
