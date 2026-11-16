# Astro and Revo UI

Render the page with Astro and hydrate one small Vue island for the interactive Revo UI control. This example uses Astro's Node adapter for request-time server rendering.

[Open the complete starter](https://github.com/revolist/revo-ui/tree/main/examples/ssr/astro).

## Run the starter

Use Node.js 24.15 or newer and pnpm. From the cloned `revo-ui` repository:

```sh
cd examples/ssr/astro
pnpm install --frozen-lockfile
pnpm check
pnpm build
pnpm start
```

Open `http://localhost:4321`. The starter pins Astro 7.4.12, Vue 3.5.45 and `@revolist/ui` 4.0.23. For development, use `pnpm dev`.

## Three small files

| File                            | Responsibility                                          |
| ------------------------------- | ------------------------------------------------------- |
| `astro.config.mjs`              | Enable Node SSR and Vue islands.                        |
| `src/pages/index.astro`         | Render the document, import CSS and hydrate the island. |
| `src/components/SaveButton.vue` | Own the local counter and click handler.                |

Configure the renderer and the server:

```js
// astro.config.mjs
import { defineConfig } from "astro/config";
import node from "@astrojs/node";
import vue from "@astrojs/vue";

export default defineConfig({
  output: "server",
  adapter: node({ mode: "standalone" }),
  integrations: [vue()],
});
```

The island is an ordinary Vue component:

```vue
<!-- src/components/SaveButton.vue -->
<script setup lang="ts">
import { ref } from "vue";
import { SvgButton } from "@revolist/ui/vue/unstyled";

const count = ref(0);
</script>

<template>
  <SvgButton
    :label="`Save ${count}`"
    :visible-label="`Save ${count}`"
    @click="count++"
  />
</template>
```

Import it into the Astro page and add `client:load`:

```astro
---
// src/pages/index.astro
import '@revolist/ui/styles/base.css';
import SaveButton from '../components/SaveButton.vue';
---

<main>
  <h1>Astro report</h1>
  <p>This page content is rendered on the server.</p>
  <SaveButton client:load />
</main>
```

The complete starter wraps this content in an HTML document with a title, language and viewport metadata. An existing project can place the same content inside its layout.

## What the island does

Astro renders the heading and paragraph on the server. Vue's Revo UI adapter renders its host there; the complete button appears after the island hydrates and the adapter mounts in the browser. Keep important text outside the control host.

`client:load` loads the island's JavaScript when the page loads. Without a client directive the counter will not become interactive. The click handler belongs inside the Vue file because functions cannot be serialized from Astro frontmatter into an island.

The `/unstyled` adapter and page-level CSS import let Astro extract the stylesheet. Add other [style families](bundle-size.md#stylesheet-families) for additional controls. The local count demonstrates state updates and does not save data to a backend.

## Check the result

After `pnpm start`, inspect the response for `Astro report` and a stylesheet reference. Click **Save 0** and confirm **Save 1**. Reload to reset the counter and inspect the console for hydration errors.

For build-time prerendering instead, remove the Node adapter and `output: 'server'` from this small example. Keep the Vue integration and `client:load`; the interactive island still mounts in the browser.

Read the [SSR overview](ssr.md), [Astro Vue integration](https://docs.astro.build/en/guides/integrations-guide/vue/), [client directives](https://docs.astro.build/en/reference/directives-reference/#client-directives), and [on-demand rendering](https://docs.astro.build/en/guides/on-demand-rendering/).
