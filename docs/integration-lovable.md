# Lovable and Revo UI

First identify the generated project. Newer Lovable projects use TanStack Start; older projects use React and Vite. The UI import is the same, but their rendering and stylesheet setup differ.

## Run the example

[Open the complete starter](https://github.com/revolist/revo-ui/tree/main/examples/ssr/lovable/). Use Node.js 24.15 or newer and pnpm 11. The lockfile pins the verified dependency versions.

```sh
git clone https://github.com/revolist/revo-ui.git
cd revo-ui/examples/ssr/lovable
pnpm install --frozen-lockfile
pnpm build
pnpm start
```

Open `http://localhost:4173`. The page renders in the browser. Click **Save 0** and it becomes **Save 1**. Reloading resets local state. For development, use `pnpm dev`.

## Files to read

| File                                                                                              | Responsibility                                             |
| ------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| [`package.json`](https://github.com/revolist/revo-ui/blob/main/examples/ssr/lovable/package.json) | Identifies the generated framework and installed versions. |
| [`src/main.tsx`](https://github.com/revolist/revo-ui/blob/main/examples/ssr/lovable/src/main.tsx) | Loads CSS and renders the page with its button count.      |

## Use the button directly in the page

The legacy React/Vite starter keeps the count and `SvgButton` in its existing `App` component:

```tsx
import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { SvgButton } from '@revolist/ui/react/unstyled';
import '@revolist/ui/styles/base.css';

function App() {
  const [count, setCount] = useState(0);
  return (
    <main>
      <h1>React/Vite report</h1>
      <p>This legacy Lovable-style example renders in the browser.</p>
      <SvgButton
        label={`Save ${count}`}
        visibleLabel={`Save ${count}`}
        onClick={() => setCount((value) => value + 1)}
      />
    </main>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
```

## Choose the matching setup

| Generated project                                   | Guide to follow                                                                   |
| --------------------------------------------------- | --------------------------------------------------------------------------------- |
| `@tanstack/react-start` in `package.json`           | [TanStack Start](ssr-tanstack-start.md): keep its root route and stylesheet link. |
| `vite` with `react-dom/client` and no SSR framework | The React/Vite starter: load CSS from `src/main.tsx`.                             |

Use the actual dependencies and entry files as the decision point. Do not infer the stack from a project's age alone. Keep Lovable's generated plugins, authentication, routes and backend integration.

## A small prompt to copy

```text
Install @revolist/ui using this project's package manager.
In the existing page or route, use the named import { SvgButton } from
@revolist/ui/react/unstyled. Add local count state there, starting at 0.
Render SvgButton directly in that page.
Use matching label and visibleLabel values: Save 0, Save 1, etc.
Load @revolist/ui/styles/base.css globally through this project's
existing framework stylesheet entry. Preserve the current routes,
authentication and build plugins. Keep the example to one button.
```

For a TanStack Start project, use the [complete SSR starter](ssr-tanstack-start.md). For a legacy React/Vite project, the runnable source linked here uses `createRoot` and intentionally renders in the browser. It demonstrates adding Revo UI to that stack; it is not a Lovable-generated or Lovable-hosted project and has no SSR claim.

## Styles and rendering

In the React/Vite example, `src/main.tsx` imports `@revolist/ui/styles/base.css` once. The control uses the `/unstyled` adapter. A static Vite build supplies an HTML shell and browser JavaScript; installing Revo UI does not add SSR. For server output, follow the TanStack Start setup above.

## Check your result

Run the production commands above, then check the response, button click, reload, and browser console. Keep server and client dependency versions aligned. Test your own deployment after changing adapters, CSP or hosting settings.

Lovable [TanStack Start overview](https://lovable.dev/blog/building-apps-using-tanstack-start) and [FAQ](https://docs.lovable.dev/introduction/faq).
