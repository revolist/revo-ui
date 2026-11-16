# Angular SSR and Revo UI

Keep Angular server rendering and hydration enabled. Render page content with Angular and let `UiComponent` mount the interactive Revo UI control in the browser.

[Open the complete starter](https://github.com/revolist/revo-ui/tree/main/examples/ssr/angular/). It uses Angular 22.2, TypeScript 6 and `@revolist/ui` 4.0.23.

## Run the example

Use Node.js 24.15 or newer and pnpm 11. Copy the starter folder, then run inside it:

```sh
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

In an existing application, append that entry to your existing `build.options.styles` array. Keep your own styles. The starter also configures SVG/GIF asset loaders for optional catalog dependencies. Base contains the button styles; other controls may need an additional [stylesheet family](bundle-size.md#stylesheet-families).

## Keep the component small

```ts
import { Component, signal } from "@angular/core";
import { UiComponent } from "@revolist/ui/angular/unstyled";

@Component({
  selector: "app-root",
  imports: [UiComponent],
  template: `
    <main>
      <h1>Angular report</h1>
      <p>This text renders on the server. The button mounts in the browser.</p>
      <rv-ui
        ngSkipHydration
        component="SvgButton"
        [props]="{
          label: 'Save ' + count(),
          visibleLabel: 'Save ' + count(),
          onClick: save,
        }"
      />
    </main>
  `,
})
export class App {
  readonly count = signal(0);
  readonly save = () => this.count.update((value) => value + 1);
}
```

`label` sets the accessible name and `visibleLabel` sets the button text. Both update with the signal. The adapter forwards the click callback and marks Angular for change detection.

Put `ngSkipHydration` on the `rv-ui` component host. Angular recreates that small imperative region while hydrating the surrounding page. Do not put it on an ordinary wrapper element. No application mounted flag or `afterNextRender` wrapper is needed.

## Keep request-time SSR enabled

The server bootstrap adds a server route:

```ts
provideServerRendering(
  withRoutes([{ path: "**", renderMode: RenderMode.Server }]),
);
```

The browser configuration uses `provideClientHydration()`. The CLI builds the server and browser entries together and links static CSS in the server response. `server.ts` uses Angular's `AngularNodeAppEngine` to render requests and Express to serve assets.

The HTTP response contains the heading, page text and the adapter host. The shared button itself mounts in the browser. This distinction matters for SEO and a no-JavaScript experience: put meaningful text in Angular's page template.

For a small form, add a native labeled input beside the control and bind its value to a second signal. Keep submission in a separate callback; the counter example needs no forms module, data service or network API.

## Verify the result

Check the production HTTP response for `<h1>Angular report</h1>`. Then check browser clicks, reloads, global styles and the console for hydration errors. Test the production server rather than relying only on CLI development mode.

Continue with the [SSR overview](ssr.md).

References: [Angular server rendering](https://angular.dev/guide/ssr), [Angular hydration and skip boundaries](https://angular.dev/guide/hydration), [AngularNodeAppEngine](https://angular.dev/api/ssr/node/AngularNodeAppEngine).
