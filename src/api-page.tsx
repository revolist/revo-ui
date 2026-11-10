import { ApiContents } from './api-contents';
import { h } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import { Button, SearchInput } from '@revolist/ui/preact';
import { ComponentReference, type ComponentApi } from './component-api';
import { apiHref, componentHref, currentRoute } from './routing';

export function ApiPage() {
  const [api, setApi] = useState<ComponentApi[]>();
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [query, setQuery] = useState(
    new URLSearchParams(location.search).get('family') ?? '',
  );
  const [mobileOpen, setMobileOpen] = useState(false);
  const sidebar = useRef<HTMLElement>(null);
  const id = currentRoute();
  useEffect(() => {
    setError(false);
    import('virtual:component-api')
      .then(({ default: data }) =>
        setApi([...data].sort((a, b) => a.name.localeCompare(b.name))),
      )
      .catch(() => setError(true));
  }, [attempt]);
  const selected = api?.find((item) => item.name.toLowerCase() === id);
  useEffect(() => {
    const container = sidebar.current;
    const active = container?.querySelector<HTMLElement>(
      'a[aria-current="page"]',
    );
    if (container && active)
      container.scrollTop = Math.max(
        0,
        active.offsetTop - container.offsetTop - container.clientHeight / 2,
      );
  }, [selected]);
  const title = selected
    ? `${selected.name} API`
    : id
      ? 'API not found'
      : 'API reference';
  useEffect(() => {
    if (!api) return;
    document.title = `${title} · Revo UI`;
    for (const selector of [
      'meta[property="og:title"]',
      'meta[name="twitter:title"]',
    ])
      document.querySelector(selector)?.setAttribute('content', document.title);
    document
      .querySelector('meta[name="robots"]')
      ?.setAttribute(
        'content',
        selected || !id
          ? 'index, follow, max-image-preview:large'
          : 'noindex, follow',
      );
    const description = selected
      ? `Explore ${selected.name} props, events, callbacks and methods, with expandable TypeScript interfaces and configuration fields.`
      : 'Browse every Revo UI component API, inspect TypeScript interfaces and discover props, callbacks and public methods.';
    const canonical = `https://ui.rv-grid.com${apiHref(selected?.name)}`;
    for (const selector of [
      'meta[name="description"]',
      'meta[property="og:description"]',
      'meta[name="twitter:description"]',
    ])
      document.querySelector(selector)?.setAttribute('content', description);
    document
      .querySelector('link[rel="canonical"]')
      ?.setAttribute('href', canonical);
    document
      .querySelector('meta[property="og:url"]')
      ?.setAttribute('content', canonical);
  }, [api, title, selected]);
  const visible =
    api?.filter((item) =>
      `${item.name} ${item.families.join(' ')}`
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
    ) ?? [];
  return (
    <div class={`api-workspace${selected ? ' api-workspace--detail' : ''}`} aria-busy={!api}>
      <Button
        className="api-browse"
        aria-expanded={mobileOpen}
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        Browse API
      </Button>
      <aside
        class={`api-sidebar ${mobileOpen ? 'is-open' : ''}`}
        aria-label="API navigation"
      >
        <a class="api-sidebar-title" href={apiHref()}>
          API reference <span>v{__UI_VERSION__}</span>
        </a>
        <SearchInput
          aria-label="Find an API component"
          placeholder="Find a component…"
          value={query}
          onInput={(event) => setQuery(event.currentTarget.value)}
        />
        <nav aria-label="Component APIs" ref={sidebar}>
          <a href={apiHref()} aria-current={!id ? 'page' : undefined}>
            Overview
          </a>
          <p>
            Components <span>{visible.length}</span>
          </p>
          {visible.map((item) => (
            <a
              href={apiHref(item.name)}
              aria-current={selected === item ? 'page' : undefined}
            >
              {item.name}
            </a>
          ))}
          {api && !visible.length && <p role="status">No components found.</p>}
        </nav>
      </aside>
      <article class="api-document">
        <header class="api-document-heading">
          <span class="api-eyebrow">
            DEVELOPER REFERENCE · v{__UI_VERSION__}
          </span>
          <h1>{title}</h1>
          <p>
            {selected
              ? 'Props, callbacks and methods. Select an underlined type to explore its fields, allowed values and callback arguments.'
              : 'The complete component contract, in one place. Choose a component to explore its props, callbacks, methods and configuration types.'}
          </p>
          {selected && (
            <div class="api-family-links">
              {selected.families.map((family) => (
                <a
                  href={componentHref(
                    family.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                  )}
                >
                  View {family.toLowerCase()} examples →
                </a>
              ))}
            </div>
          )}
        </header>
        {error ? (
          <p role="alert">
            Could not load the API.{' '}
            <Button onClick={() => setAttempt(attempt + 1)}>Retry</Button>
          </p>
        ) : !api ? (
          <p role="status">Loading API reference…</p>
        ) : selected ? (
          <div class="component-api api-document-reference">
            <ComponentReference
              key={selected.name}
              component={selected}
              expanded
            />
          </div>
        ) : !id ? (
          <div class="api-directory">
            {visible.map((item) => (
              <a href={apiHref(item.name)}>
                <strong>{item.name}</strong>
                <span>{item.families[0]}</span>
                <small>
                  {item.props.filter((prop) => !prop.inherited).length} props ·{' '}
                  {item.events.filter((prop) => !prop.inherited).length}{' '}
                  callbacks
                </small>
              </a>
            ))}
          </div>
        ) : (
          <a href={apiHref()}>Browse all component APIs</a>
        )}
      </article>
      {selected && <ApiContents component={selected} />}
    </div>
  );
}
