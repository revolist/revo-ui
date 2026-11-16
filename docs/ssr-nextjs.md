# Next.js App Router and Revo UI

The page remains a Server Component. Only the button needs a Client Component.

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

The starter explicitly uses Next.js's supported Webpack build (`next build --webpack`). With UI 4.0.23, the default Turbopack resolver also resolves the barrel's unused optional PDF dependency. Webpack builds this button-only example without installing PDF.js. The `force-dynamic` page setting makes this a request-time SSR example.

## Files to read

| File                                                                                                           | Responsibility                                         |
| -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| [`app/layout.tsx`](https://github.com/revolist/revo-ui/blob/main/examples/ssr/nextjs/app/layout.tsx)           | Loads the global UI CSS and renders the HTML document. |
| [`app/page.tsx`](https://github.com/revolist/revo-ui/blob/main/examples/ssr/nextjs/app/page.tsx)               | Renders the heading and text on the server.            |
| [`app/save-button.tsx`](https://github.com/revolist/revo-ui/blob/main/examples/ssr/nextjs/app/save-button.tsx) | Owns the button and browser state.                     |

## The small component

```tsx
'use client';

import { useState } from 'react';
import { SvgButton } from '@revolist/ui/react/unstyled';

export function SaveButton() {
  const [count, setCount] = useState(0);
  return (
    <SvgButton
      label={`Save ${count}`}
      visibleLabel={`Save ${count}`}
      onClick={() => setCount((value) => value + 1)}
    />
  );
}
```

## Keep the server page small

```tsx
import { SaveButton } from './save-button';

export const dynamic = 'force-dynamic';

export default function Page() {
  return (
    <main>
      <h1>Next.js report</h1>
      <p>This text is rendered on the server.</p>
      <SaveButton />
    </main>
  );
}
```

The `'use client'` directive belongs at the top of `save-button.tsx`. Keep event handlers there and pass serializable data from the server page. You do not need `dynamic(..., { ssr: false })`, a mounted flag, or an application effect.

## Styles and rendering

Use `@revolist/ui/react/unstyled` with `@revolist/ui/styles/base.css` loaded once through the framework. This supplies the button's styles without runtime stylesheet insertion. Add a component's style family only when using that component.

The adapter renders a host on the server and mounts its control in the browser. Important headings, text and any no-JavaScript experience remain the host framework's responsibility. A stylesheet does not turn that host into full server-rendered control HTML. See the [SSR overview](ssr.md).

## Check your result

Run the production commands above, then check the response, button click, reload, and browser console. Keep server and client dependency versions aligned. Test your own deployment after changing adapters, CSP or hosting settings.

Next.js [Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components) and [CSS](https://nextjs.org/docs/app/getting-started/css).
