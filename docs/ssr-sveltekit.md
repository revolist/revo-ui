# SvelteKit and Revo UI

Load page data on the server and render the interactive control directly in the page. SvelteKit SSR stays enabled; Revo UI's adapter handles browser mounting.

[Open the complete starter](https://github.com/revolist/revo-ui/tree/main/examples/ssr/sveltekit).

## Run the starter

Use Node.js 24.15 or newer and pnpm 11. Named Svelte components are a source preview; npm version 4.0.23 only has the generic host. Build the public package from the cloned `revo-ui` repository before running this starter:

```sh
pnpm install --frozen-lockfile
pnpm build:public
cd examples/ssr/sveltekit
pnpm install --frozen-lockfile
pnpm check
pnpm build
pnpm start
```

Open `http://localhost:3000`. The starter pins SvelteKit 3.2.0, Svelte 5.57.3 and installs the local public `dist` package from this checkout. `adapter-node` produces the standalone Node server. For development, use `pnpm dev`.

## Keep each file focused

| File                         | Responsibility                                     |
| ---------------------------- | -------------------------------------------------- |
| `src/routes/+page.server.ts` | Supply the page title from the server.             |
| `src/routes/+layout.svelte`  | Load global CSS and render child pages.            |
| `src/routes/+page.svelte`    | Display the server data and own the local counter. |

The server loader returns a plain serializable value:

```ts
// src/routes/+page.server.ts
export function load() {
  return { title: 'SvelteKit report' };
}
```

Include CSS once in the root layout:

```svelte
<!-- src/routes/+layout.svelte -->
<script lang="ts">
  import '@revolist/ui/styles/base.css';
  let { children } = $props();
</script>

{@render children()}
```

Use the control directly beside the server-rendered content:

```svelte
<!-- src/routes/+page.svelte -->
<script lang="ts">
  import { SvgButton } from '@revolist/ui/svelte/svg-button/unstyled';
  let { data } = $props();
  let count = $state(0);
</script>

<main>
  <h1>{data.title}</h1>
  <p>This title comes from a server load function.</p>
  <SvgButton
    label={`Save ${count}`}
    visibleLabel={`Save ${count}`}
    onClick={() => { count += 1; }}
  />
</main>
```

The per-component entry imports only the button adapter and its dependencies. It uses the same `SvgButton` name and direct props as React, Vue and Angular.

The click handler updates browser state; it does not persist a report. Keep server data access in a loader and pass plain values into the page rather than sharing mutable module-level state between requests.

## Server HTML and browser mounting

The server response includes the title and an empty adapter host. Svelte's `onMount` runs only in the browser, where the adapter creates the button. Keep meaningful page content outside that host. There is no need for `ssr = false` or an extra application `onMount` wrapper.

Let SvelteKit resolve the package's Svelte entry. The root layout imports extracted CSS; `/unstyled` avoids inserting Revo UI styles during mount. Add further [style families](bundle-size.md#stylesheet-families) only when required.

## Check the result

After `pnpm start`, inspect the response for `SvelteKit report` and the stylesheet link. Click **Save 0** and confirm **Save 1**. Reload: the component's counter returns to zero. Check the browser console for hydration errors.

For deployment, set the Node adapter's documented `ORIGIN` or trusted proxy configuration to match your hosting environment.

Read the [SSR overview](ssr.md), [SvelteKit loading data](https://svelte.dev/docs/kit/load), [Svelte lifecycle](https://svelte.dev/docs/svelte/lifecycle-hooks), and [Node adapter deployment](https://svelte.dev/docs/kit/adapter-node).
