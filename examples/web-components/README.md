# Revo UI Web Component example

Run Revo UI controls through the example `<revo-ui>` custom element using the
published MIT-licensed npm package.

## Run

Use Node.js 22.12 or later and pnpm 10.

```sh
cd examples/web-components
pnpm install --frozen-lockfile
pnpm dev
```

The page mounts a report-name field and an Apply button. Add `?lang=pt` to
the local URL for Portuguese labels.

```sh
pnpm build
pnpm preview
```

## Use the adapter

Import [src/revo-ui-element.ts](src/revo-ui-element.ts) once in your application.
It registers the custom element and imports the package stylesheet.

```html
<revo-ui id="apply" component="Button"></revo-ui>
```

```ts
import './revo-ui-element';
import type { RevoUiElement } from './revo-ui-element';

const button = document.querySelector<RevoUiElement>('#apply')!;
button.props = { children: 'Apply report', variant: 'primary' };
button.addEventListener('click', () => {
  console.log('Apply the current report');
});
```

The `component` attribute selects a component from the public `uiComponents`
catalog. The `props` property accepts its ordinary JavaScript props, including
callback functions. Reassign `props` to update the rendered control. This example
exercises `TextInput` and `Button`; each control retains its documented props.

The adapter uses light DOM so the package stylesheet, native input labels, and
bubbling click/input events work with the host page. It cleans up the component
when disconnected and mounts it again when reconnected. Properties assigned
before custom-element registration are preserved during upgrade.
Unknown component names emit a bubbling `ui-error` event.

This is an integration example maintained in this repository. It uses the
published `@revolist/ui/framework` API and shares the root MIT license.

[Component documentation](https://ui.rv-grid.com/) ·
[Adapter source](src/revo-ui-element.ts)
