# Search action bar

`SearchActionBar` combines the shared search input with caller-supplied `actions`. Provide a localized input label and placeholder; the action slot accepts buttons, dropdowns and disclosure controls. Import `@revolist/ui/search-action-bar.scss` with the base UI styles for native usage. Preact, React and Vue consumers can use the named `SearchActionBar` component; Angular and Svelte hosts can use the dynamic component catalog.

For native applications, `createSearchActionBar(document, { label, placeholder, shortcut })` returns `{ element, input, setActions, destroy }`. `setActions` adopts the supplied elements without changing their listeners. A shortcut such as `/` focuses search when the user is not editing and no native dialog is open. Call `destroy` on teardown to release the shortcut listener and search mount.
