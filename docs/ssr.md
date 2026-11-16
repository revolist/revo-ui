# Server rendering and hydration

Keep your page content on the server and use Revo UI for small interactive controls. Start with the guide for your framework; each includes a runnable example with a heading and a Save button.

## Choose your guide

| Framework or integration                | What you will build                                               |
| --------------------------------------- | ----------------------------------------------------------------- |
| [Next.js App Router](ssr-nextjs.md)     | A server-rendered page using the button directly. |
| [Nuxt](ssr-nuxt.md)                     | A server-rendered page with a Vue control.                        |
| [SvelteKit](ssr-sveltekit.md)           | A server-rendered page and a Svelte control.                      |
| [Astro](ssr-astro.md)                   | Server-rendered content with an interactive island.               |
| [Angular SSR](ssr-angular.md)           | A hydrated page with an isolated control region.                  |
| [React Router](ssr-react-router.md)     | A framework-mode page with server data.                           |
| [TanStack Start](ssr-tanstack-start.md) | A server-rendered route with a React control.                     |
| [NestJS](ssr-nestjs.md)                 | A server template and a browser-mounted control.                  |
| [Refine](integration-refine.md)         | A small resource page using Next.js.                              |
| [Lovable](integration-lovable.md)       | Revo UI in a TanStack Start or legacy React/Vite project.         |

Browse the [complete starter sources](https://github.com/revolist/revo-ui/tree/main/examples/ssr). Each starter has its own dependencies and commands. Most use the published package. Angular and SvelteKit preview named adapters from the locally built public package; follow their setup steps until those APIs are released.

## What the server renders

React, Vue, Angular and Svelte component adapters render their **host elements** on the server. They mount the interactive controls in the browser. A successful server import does not mean that the response contains the complete control HTML.

Render headings, descriptions and important initial data through your host framework. Those remain available before JavaScript loads. A fallback for a control is optional; keep its server and first browser render consistent. Reserve space if the control's appearance would move surrounding content.

Angular's native `UiControlDirective` is a separate path: Angular owns the actual native button or input markup. Do not infer catalog adapter behavior from native controls decorated with `rvControl`.

## Load CSS globally

For predictable initial CSS delivery, use the matching `/unstyled` adapter and import static CSS from the framework's global entry or root layout:

```ts
import "@revolist/ui/styles/base.css";
import { SvgButton } from "@revolist/ui/react/unstyled";
```

This example shows React imports; the individual guides use the matching adapter and stylesheet location. Base covers the button example. Add the required [style families](bundle-size.md#stylesheet-families) when using calendars, dialogs or other controls, or import `@revolist/ui/styles.css` for all families.

The framework's bundler extracts and serves CSS. A raw Node.js script cannot import a CSS file without a loader. Keep server and browser package versions aligned.

Automatic adapters also work, but their CSS arrives with browser JavaScript and is installed when controls mount. They do not collect CSS into the server response.

## Keep browser work in the browser

The framework adapters handle mounting; application mounted flags are unnecessary. Keep event handlers with the interactive component and pass serializable values across server/client boundaries.

For vanilla integration, call `createFrameworkMount` after the browser host exists and destroy the mount when its view is removed. Never call it at server module scope. The [NestJS guide](ssr-nestjs.md) demonstrates this boundary.

## Content Security Policy

Prefer `/unstyled` with external CSS when your policy forbids injected stylesheet elements. Your application still needs to authorize its CSS origin and any dynamic inline style attributes used by the chosen controls.

With automatic styles and a nonce policy, configure the response's nonce **before** controls mount:

```ts
import { configureUiStyles } from "@revolist/ui/style-config";

// Browser bootstrap: the server must supply this escaped meta value
// and authorize the same nonce in this response's CSP header.
const nonce = document.querySelector<HTMLMetaElement>(
  'meta[name="ui-style-nonce"]',
)?.content;
if (nonce) configureUiStyles({ nonce });
```

Use a client bootstrap or framework client plugin that runs before child controls mount. Do not delay this to a child effect. Calling `configureUiStyles` without a browser document is a no-op; it does not collect CSS or transfer configuration to the browser. Keep nonces per response rather than in process-global state.

## Troubleshooting

| Symptom                             | Check                                                                                                |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Empty adapter host in server HTML   | Expected. Render meaningful initial content through the host framework.                              |
| `window` or `document` is undefined | Move application DOM work out of server module scope.                                                |
| Unstyled controls                   | Import base plus required style families globally, or check automatic-style CSP configuration.       |
| Hydration errors                    | Keep server/first-client data consistent and follow the framework-specific boundary in the guide.    |
| TypeScript cannot resolve exports   | Check the installed package and its declarations with your resolver. Avoid hiding errors with `any`. |

## Verify your application

Use each starter's production build and start commands. Inspect the HTTP response for your heading, then open the browser and click Save. The counter should change from Save 0 to Save 1 and reset after a reload. Check the console for runtime or hydration errors and the network panel for missing CSS.

The repository also provides a browser smoke check. Start the example's production server first, then run this from the Revo UI repository with the appropriate address:

```sh
node scripts/verify-ssr-example.mjs http://127.0.0.1:3000
```

The legacy Lovable React/Vite example uses `--client-only` because that starter renders in the browser. These examples establish a small integration baseline; validate additional controls, data and deployment settings in your own application.
