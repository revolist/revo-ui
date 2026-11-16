# Angular SSR and Revo UI

Import the standalone `SvgButton` component and bind its inputs directly. Keep page content server-rendered; the adapter handles the button’s browser mount.

[Open the complete starter](https://github.com/revolist/revo-ui/tree/main/examples/ssr/angular/). It uses Angular 22.2, TypeScript 6 and the public package built from this checkout. Named Angular components are a source preview and are not exported by npm version 4.0.23.

## Run the example

Use Node.js 24.15 or newer and pnpm 11. Build the library from the cloned repository, then run the starter:

```sh
pnpm install --frozen-lockfile
pnpm build:public
cd examples/ssr/angular
pnpm install --frozen-lockfile
pnpm check
pnpm build
pnpm start
```

Open `http://127.0.0.1:3000`. Click **Save 0** to see **Save 1**. Reloading resets the count. The example does not submit data or save it remotely.

## Understand the files

| File                 | Responsibility                                   |
| -------------------- | ------------------------------------------------ |
| `src/app.ts`         | Page markup and a small count button.            |
| `src/app.config.ts`  | Enable Angular client hydration.                 |
| `src/main.ts`        | Bootstrap the browser application.               |
| `src/main.server.ts` | Bootstrap request-time server rendering.         |
| `src/server.ts`      | Serve built assets and pass requests to Angular. |
| `angular.json`       | Configure Angular CLI SSR and global CSS.        |

## Load CSS globally

The starter includes the base stylesheet in Angular's build configuration:

```json
{
  "styles": ["node_modules/@revolist/ui/styles/base.css"]
}
```

In an existing application, append that entry to your existing `build.options.styles` array. Keep your own styles. Base contains the button styles; other controls may need an additional [stylesheet family](bundle-size.md#stylesheet-families).

## Keep the component small

```ts
import { Component, signal } from "@angular/core";
import { SvgButton } from "@revolist/ui/angular/svg-button/unstyled";

@Component({
  selector: "app-root",
  imports: [SvgButton],
  template: `
    <main>
      <h1>Angular report</h1>
      <p>This text renders on the server. The button mounts in the browser.</p>
      <rv-svg-button
        [label]="'Save ' + count()"
        [visibleLabel]="'Save ' + count()"
        (click)="count.set(count() + 1)"
      />
    </main>
  `,
})
export class App {
  readonly count = signal(0);
}
```

The per-component entry imports only the button adapter and its dependencies. `SvgButton` has the same name and control props as the React, Vue and Svelte adapters. Angular uses the `rv-svg-button` selector, direct typed inputs and a normal click binding. `label` supplies the accessible name; `visibleLabel` supplies the visible text.

The component manages its own hydration boundary, so this example needs no `[props]` bag, callback wrapper or manual `ngSkipHydration`. Angular renders the component host on the server and the adapter mounts its button in the browser. Important initial text belongs in the page template.

## Other controls

Import the named control you use, such as `Dropdown`, `Calendar` or `SearchInput`. The generic `UiComponent` remains available when your application intentionally chooses controls dynamically by catalog name. For native `<button>`, `<input>`, `<select>` and `<textarea>` markup, the separate `UiControlDirective` is also available.

## Keep request-time SSR enabled

The server bootstrap adds a server route:

```ts
provideServerRendering(
  withRoutes([{ path: "**", renderMode: RenderMode.Server }]),
);
```

The browser configuration uses `provideClientHydration()`. The CLI builds the server and browser entries together and links static CSS in the server response. `server.ts` uses Angular's `AngularNodeAppEngine` to render requests and Express to serve assets.

The HTTP response contains the heading, page text and the adapter host. The button appears when the browser adapter mounts.

For a small form, add a labeled native input beside the button and bind its value to a second signal. Keep submission in a separate callback; the counter example needs no forms module, data service or network API.

## Verify the result

Check the production HTTP response for `<h1>Angular report</h1>`. Then check browser clicks, reloads, global styles and the console for hydration errors. Test the production server rather than relying only on CLI development mode.

Continue with the [SSR overview](ssr.md).

References: [Angular server rendering](https://angular.dev/guide/ssr), [Angular hydration and skip boundaries](https://angular.dev/guide/hydration), [AngularNodeAppEngine](https://angular.dev/api/ssr/node/AngularNodeAppEngine).
