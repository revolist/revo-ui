# Refine and Revo UI

Use Refine for resource mutations and Revo UI for presentation. This small Next.js example has one report form, one data provider, and one local API route.

## Run the example

[Open the complete starter](https://github.com/revolist/revo-ui/tree/main/examples/ssr/refine/). Use Node.js 24.15 or newer and pnpm 11. The lockfile pins the verified dependency versions.

```sh
git clone https://github.com/revolist/revo-ui.git
cd revo-ui/examples/ssr/refine
pnpm install --frozen-lockfile
pnpm build
pnpm start
```

Open `http://localhost:3000`. The heading is present in the initial server HTML. Click **Save 0** and it becomes **Save 1**. Reloading resets local state. For development, use `pnpm dev`.

The starter explicitly uses Next.js's supported Webpack build (`next build --webpack`). This avoids resolving the component barrel's unused optional PDF dependency. Webpack builds this small form example without installing PDF.js. The `force-dynamic` setting in the server layout makes this a request-time SSR example.

## Files to read

| File                                                                                                                               | Responsibility                                                                   |
| ---------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| [`app/layout.tsx`](https://github.com/revolist/revo-ui/blob/main/examples/ssr/refine/app/layout.tsx)                               | Loads global CSS and enables request-time server rendering.                      |
| [`app/page.tsx`](https://github.com/revolist/revo-ui/blob/main/examples/ssr/refine/app/page.tsx)                                   | Provides Refine context and renders the editable form with `SvgButton` directly. |
| [`app/api/reports/[id]/route.ts`](https://github.com/revolist/revo-ui/blob/main/examples/ssr/refine/app/api/reports/[id]/route.ts) | Validates a PATCH request and echoes the report.                                 |

## Use the component directly

The page imports `SvgButton` directly. Its two functions share one file: `Page` supplies Refine context and `ReportForm` calls `useUpdate` inside that context. The hook must run in a descendant of the provider. No separate button or provider wrapper file is needed.

```tsx
// app/page.tsx
'use client';

import { useState } from 'react';
import { Refine, useUpdate } from '@refinedev/core';
import dataProvider from '@refinedev/simple-rest';
import { SvgButton } from '@revolist/ui/react/unstyled';

const provider = dataProvider('/api');

export default function Page() {
  return (
    <Refine
      dataProvider={provider}
      resources={[{ name: 'reports' }]}
      options={{ disableTelemetry: true }}
    >
      <main>
        <h1>Refine report</h1>
        <p>Edit one report with Refine and Revo UI.</p>
        <ReportForm />
      </main>
    </Refine>
  );
}

function ReportForm() {
  const [title, setTitle] = useState('Quarterly report');
  const [count, setCount] = useState(0);
  const { mutate, mutation } = useUpdate();

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        mutate(
          { resource: 'reports', id: 1, values: { title } },
          { onSuccess: () => setCount((value) => value + 1) },
        );
      }}
    >
      <label>
        Report title{' '}
        <input
          required
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
      </label>
      <SvgButton
        type="submit"
        label={`Save ${count}`}
        visibleLabel={`Save ${count}`}
        disabled={mutation.isPending}
      />
      {mutation.isError && <p role="alert">Could not save. Try again.</p>}
      <p role="status">
        {count ? `Saved ${count} time(s).` : 'Ready to save.'}
      </p>
    </form>
  );
}
```

The submit button uses `type="submit"`, so clicking it and pressing Enter in the input follow the same form handler. The count advances only when Refine's update succeeds. An error leaves the form available to retry.

The local PATCH route validates and returns the submitted title. **It does not persist changes.** Reloading resets the example. Replace that route with your authenticated API to store real reports; keep credentials and authorization on the server.

The server renders the title and native input. The Revo UI submit button mounts in the browser. Next.js still prerenders this Client Component page on the server. The client boundary enables its state and event handlers; it does not disable SSR. Adding Refine does not server-render the underlying UI control.

## Styles and rendering

Use `@revolist/ui/react/unstyled` with `@revolist/ui/styles/base.css` loaded once through the framework. This supplies the button's styles without runtime stylesheet insertion. Add a component's style family only when using that component.

The adapter renders a host on the server and mounts its control in the browser. Important headings, text and any no-JavaScript experience remain the host framework's responsibility. A stylesheet does not turn that host into full server-rendered control HTML. See the [SSR overview](ssr.md).

## Check your result

Run the production commands above, then check the response, button click, reload, and browser console. Keep server and client dependency versions aligned. Test your own deployment after changing adapters, CSP or hosting settings.

Refine [Next.js integration](https://refine.dev/core/docs/routing/integrations/next-js/), [useUpdate](https://refine.dev/core/docs/data/hooks/use-update/) and [Simple REST provider](https://refine.dev/core/docs/data/packages/simple-rest/).
