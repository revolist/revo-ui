# Nuxt and Revo UI

Keep Nuxt server rendering enabled. Render page text with Vue and let Revo UI mount its interactive control in the browser. No `ClientOnly` wrapper or application mounted flag is needed.

[Open the complete starter](https://github.com/revolist/revo-ui/tree/main/examples/ssr/nuxt).

## Run the starter

Use Node.js 24.15 or newer and pnpm. From the cloned `revo-ui` repository:

```sh
cd examples/ssr/nuxt
pnpm install --frozen-lockfile
pnpm check
pnpm build
pnpm start
```

Open `http://localhost:3000`. The starter pins Nuxt 4.6.4 and `@revolist/ui` 4.0.23. For development, use `pnpm dev`.

## Three small files

| File                            | Responsibility                           |
| ------------------------------- | ---------------------------------------- |
| `nuxt.config.ts`                | Include the control's CSS in the page.   |
| `app/app.vue`                   | Render the heading and place the button. |
| `app/components/SaveButton.vue` | Own the click counter.                   |

Load extracted CSS globally:

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  css: ["@revolist/ui/styles/base.css"],
});
```

Keep the interaction in one component:

```vue
<!-- app/components/SaveButton.vue -->
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

Use it directly in the server-rendered page:

```vue
<!-- app/app.vue -->
<script setup lang="ts">
import SaveButton from "./components/SaveButton.vue";
</script>

<template>
  <main>
    <h1>Nuxt report</h1>
    <p>This page content is rendered on the server.</p>
    <SaveButton />
  </main>
</template>
```

`label` supplies the accessible name; `visible-label` supplies the visible caption. Both update together. The counter is local to this component instance; clicking does not save data to a server.

## What arrives before JavaScript

The heading and paragraph appear in the initial HTML. The Vue adapter renders a host element on the server, then mounts the button when its browser host exists. Complete Revo UI button HTML is not server-rendered. Keep important text outside the adapter.

The `/unstyled` entry avoids automatic stylesheet insertion. The global CSS entry makes Nuxt include the stylesheet in the rendered page. Add other [style families](bundle-size.md#stylesheet-families) when introducing calendars or dialogs.

## Check the result

After `pnpm start`, inspect the document response for `Nuxt report` and its stylesheet link. In the browser, click **Save 0** and confirm it becomes **Save 1**. Reload to confirm the local counter resets. The console should contain no hydration errors.

For your own app, preserve Nuxt's normal SSR configuration and import `SaveButton` into an existing page. If you opt into `ClientOnly`, keep CSS global so it remains in the server build.

Read the [SSR overview](ssr.md), [Nuxt rendering modes](https://nuxt.com/docs/4.x/guide/concepts/rendering), and [Nuxt CSS configuration](https://nuxt.com/docs/4.x/getting-started/styling).
