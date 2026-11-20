import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
} from '@tanstack/react-router';
import css from '@revolist/ui/styles/base.css?url';

export const Route = createRootRoute({
  head: () => ({ links: [{ rel: 'stylesheet', href: css }] }),
  component: Root,
});

function Root() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <HeadContent />
      </head>
      <body>
        <Outlet />
        <Scripts />
      </body>
    </html>
  );
}
