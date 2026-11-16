# NestJS and Revo UI

Use NestJS to render the page with Handlebars, then mount one Revo UI button in the browser. This example has no frontend framework and no API to configure.

[Open the complete starter](https://github.com/revolist/revo-ui/tree/main/examples/ssr/nestjs/). It uses NestJS 11, TypeScript 6 and `@revolist/ui`.

## Run the example

Use Node.js 24.15 or newer and pnpm 11. Copy the starter folder, then run inside it:

```sh
pnpm install --frozen-lockfile
pnpm check
pnpm build
pnpm start
```

Open `http://127.0.0.1:3000`. Click **Save 0** to see **Save 1**. Reloading starts a new counter. Nothing is persisted or sent to the server.

## Understand the files

| File              | Responsibility                                          |
| ----------------- | ------------------------------------------------------- |
| `src/main.ts`     | Start NestJS, configure Handlebars and render the page. |
| `views/index.hbs` | Server-render the heading and an empty button host.     |
| `src/client.ts`   | Mount the button and update the count in the browser.   |
| `src/styles.d.ts` | Let TypeScript recognize CSS imports.                   |
| `build.mjs`       | Bundle browser JavaScript and extracted CSS.            |
| `package.json`    | Define dependencies and commands.                       |

## Render the page on the server

The controller passes ordinary data to the template:

```ts
@Controller()
class HomeController {
  @Get("/")
  @Render("index")
  home() {
    return { title: "NestJS report" };
  }
}
```

Nest serves `public/` as static assets and uses `views/` for Handlebars templates. The template includes the stylesheet before the browser script:

```html
<link rel="stylesheet" href="/client.css" />
<h1>{{title}}</h1>
<div id="report-action"></div>
<script type="module" src="/client.js"></script>
```

`{{title}}` is escaped by Handlebars. Keep user-supplied values in escaped expressions.

## Mount the small browser component

```ts
import { createFrameworkMount } from "@revolist/ui/framework/unstyled";
import { SvgButton } from "@revolist/ui/preact/unstyled";
import "@revolist/ui/styles/base.css";

const host = document.getElementById("report-action")!;
const mount = createFrameworkMount(host, () => {}, { styles: false });
let count = 0;

function render() {
  mount.render(SvgButton, {
    label: `Save ${count}`,
    visibleLabel: `Save ${count}`,
    onClick: () => {
      count += 1;
      render();
    },
  });
}

render();
```

The empty callback is for framework-owned content slots, which this button does not use. `styles: false` keeps this mount on extracted CSS; esbuild writes the imported CSS to `public/client.css`. Both the visible and accessible labels reflect the count.

This is a conventional full-page application: the browser discards the mount on navigation. If you later add client-side routing, call `mount.destroy()` when its owning view is removed.

## Server rendering and boundaries

The HTTP response contains the heading and page text, stylesheet link and empty host. The control appears after the browser module executes. There is no attempt to hydrate Handlebars markup as a React or Preact tree. Browser APIs stay in `client.ts`; NestJS never imports that module.

The starter deliberately bundles its own assets. It does not load a floating CDN version, require a remote API or hide global application SSR behind a client-only page.

For a small form, begin with a native labeled input in `index.hbs`; read its value in the button callback. Keep that browser behavior in `client.ts`. A real save endpoint would be a separate Nest controller with validation and persistence.

## Verify the result

Check the initial HTTP response for `<h1>NestJS report</h1>` with JavaScript disabled. With JavaScript enabled, verify the count button works and the console contains no errors. Run the production server from the starter directory so its `public/` and `views/` paths resolve.

Continue with the [SSR overview](ssr.md) or [Next.js guide](ssr-nextjs.md) for a React frontend backed by a separate NestJS API.

References: [NestJS MVC and templates](https://docs.nestjs.com/techniques/mvc), [NestJS static assets](https://docs.nestjs.com/recipes/serve-static), [esbuild CSS bundling](https://esbuild.github.io/content-types/#css).
