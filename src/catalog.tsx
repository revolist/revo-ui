import { GalleryHome } from './home';
import { ApiReference } from './component-api';
import { ExampleCode, examples, slug } from './example-source';
import revogridLogo from './assets/revogrid.svg';
import {
  createContext,
  h,
  isValidElement,
  toChildArray,
  type ComponentChildren,
} from 'preact';
import { useContext, useEffect, useState } from 'preact/hooks';
import { Button, SearchInput, Switch, Toolbar } from '@revolist/ui/preact';

import pages from './pages.json';
import { currentRoute, componentHref, frameworkHref, siteHref } from './routing';
const families = pages.components;
const groups = ['Controls', 'Pickers', 'Compositions', 'Advanced'];
const Route = createContext('');
export const sectionId = (title: string) =>
  title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
const matches = (family: (typeof families)[number], query: string) =>
  `${family.title} ${family.keywords}`
    .toLowerCase()
    .includes(query.trim().toLowerCase());

export function Section({
  title,
  children,
  columns,
}: {
  title: string;
  children: ComponentChildren;
  /** Explicit count for examples composed inside a child component. */
  columns?: number;
}) {
  const route = useContext(Route);
  if (
    route &&
    route !== 'components' &&
    !route.startsWith('component/') &&
    route !== sectionId(title)
  )
    return null;
  if (route.startsWith('component/')) {
    const selected = examples.find((item) => `component/${item.id}` === route);
    if (selected?.family && selected.family !== title) return null;
  }
  const family = families.find((family) => family.title === title)!;
  const id = sectionId(title);
  const cardCount =
    toChildArray(children).filter(
      (child) => isValidElement(child) && child.type === Example,
    ).length || 3;
  return (
    <section id={id} class="catalog-section" aria-labelledby={`${id}-title`}>
      <div class="catalog-section-heading">
        <div>
          <h2 id={`${id}-title`}>{title}</h2>
          <p>{family.description}</p>
        </div>
        <a
          class="catalog-anchor"
          href={componentHref(id)}
          aria-label={`Link to ${title}`}
        >
          ↗
        </a>
      </div>
      <div
        class="examples"
        style={{ '--catalog-columns': Math.min(3, columns ?? cardCount) }}
      >
        {children}
      </div>
      <ApiReference family={title} />
    </section>
  );
}

export function Example({
  title,
  children,
  wide = false,
}: {
  title: string;
  children: ComponentChildren;
  wide?: boolean;
}) {
  return (
    <div
      id={`example-${slug(title)}`}
      class={`catalog-example${wide ? ' catalog-example--wide' : ''}`}
    >
      <div class="catalog-example-heading">
        <h3>
          <a
            href={/^(colors|built-in-palettes)\.tsx$/.test(examples.find((item) => item.title === title)?.file ?? '') ? siteHref('colors/') : componentHref(sectionId(examples.find((item) => item.title === title)?.family ?? title))}
          >
            {title}
          </a>
        </h3>
      </div>
      <div class="catalog-specimen">{children}</div>
      <ExampleCode title={title} />
    </div>
  );
}

export function CatalogShell({
  children,
  page = 'components',
  theme,
  rtl,
  onThemeChange,
  onRtlChange,
}: {
  children: ComponentChildren;
  page?: 'components' | 'colors' | 'frameworks';
  theme: string;
  rtl: boolean;
  onThemeChange: (value: string) => void;
  onRtlChange: (value: boolean) => void;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [motion, setMotion] = useState('system');
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(currentRoute());
  useEffect(() => {
    const update = () => {
      setActive(currentRoute());
      setMobileOpen(false);
      if (location.hash === '#frameworks') requestAnimationFrame(() => document.getElementById('frameworks')?.scrollIntoView({ behavior: 'smooth' }));
      else window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', update);
    return () => window.removeEventListener('hashchange', update);
  }, []);
  const knownRoute =
    (page === 'frameworks' && (!active || pages.frameworks.some(name => sectionId(name) === active))) ||
    !active ||
    active === 'components' ||
    families.some((family) => sectionId(family.title) === active) ||
    examples.some((item) => `component/${item.id}` === active);
  const home = page === 'components' && (!active || active === 'frameworks');
  const selectedExample = active.startsWith('component/')
    ? examples.find((item) => item.id === active.slice(10))
    : undefined;
  const component = families.find(
    (family) =>
      sectionId(family.title) === active ||
      family.title === selectedExample?.family,
  );
  const params = new URLSearchParams(location.search);
  const included = params.getAll('section'), excluded = params.getAll('exclude');
  const inScope = (title: string) => (!included.length || included.includes(sectionId(title))) && !excluded.includes(sectionId(title));
  const scopedChildren = toChildArray(children).filter(child => {
    if (!isValidElement(child) || child.type !== Section) return true;
    return 'title' in child.props && typeof child.props.title === 'string' && inScope(child.props.title);
  });
  const visible = families.filter((family) => inScope(family.title) && matches(family, query));
  useEffect(() => {
    const title = home ? 'Revo UI — Components for Finance, Reporting & Project Management' : `${component?.title ?? (page === 'frameworks' ? (pages.frameworks.find(name => sectionId(name) === active) ? `${pages.frameworks.find(name => sectionId(name) === active)} integration` : 'Framework integration guides') : page === 'colors' ? 'Design system colors' : 'UI components')} · Revo UI`;
    document.title = title;
    const frameworkName = page === 'frameworks' ? pages.frameworks.find(name => sectionId(name) === active) : undefined;
    const description = frameworkName ? `Use Revo UI with ${frameworkName}: installation, component examples, state, callbacks, and styling for financial and reporting applications.` : home ? 'Build financial dashboards, reporting apps, and project workspaces with Revo UI. Explore UI components for React, Vue, Angular, Svelte, Preact, and TypeScript.' : component?.description ?? (page === 'colors' ? 'Explore Revo UI semantic colors, palettes, and theme tokens for consistent application interfaces.' : page === 'frameworks' ? 'Integrate Revo UI with React, Vue, Angular, Svelte, Preact, or vanilla TypeScript. Follow installation and usage guides for your stack.' : 'Browse Revo UI controls, pickers, layouts, and compositions with interactive variants and formatted usage examples.');
    document.querySelector('meta[name="description"]')?.setAttribute('content', description);
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', title);
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', description);
    document.querySelector('meta[name="twitter:title"]')?.setAttribute('content', title);
    document.querySelector('meta[name="twitter:description"]')?.setAttribute('content', description);
    let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.append(canonical); }
    canonical.href = `https://ui.rv-grid.com${location.pathname}`;
    document.querySelector('meta[property="og:url"]')?.setAttribute('content', canonical.href);
    document.querySelector('meta[name="robots"]')?.setAttribute('content', (home || knownRoute) ? 'index, follow, max-image-preview:large' : 'noindex, follow');
  }, [active, home, page, component?.title]);
  return (
    <div class="rv-ui catalog" data-theme={theme} dir={rtl ? 'rtl' : 'ltr'}>
      <a
        class="catalog-skip"
        onClick={(event) => {
          event.preventDefault();
          document.getElementById('components')?.focus();
        }}
        href={page === 'colors' ? '#colors-title' : '#components'}
      >
        {page === 'colors' ? 'Skip to colors' : 'Skip to components'}
      </a>
      <header class="catalog-topbar">
        <div class="catalog-topbar-inner">
          <a href={siteHref()} class="catalog-title">
            <img
              class="catalog-logo"
              src={revogridLogo}
              alt="Revo UI"
              width={24}
              height={24}
            />
            Revo <span>UI</span>
            <small class="catalog-version" aria-label="UI library version">v{__UI_VERSION__}</small>
          </a>
          <nav class="catalog-pages" aria-label="Library pages">
            <a href={siteHref()} aria-current={home ? 'page' : undefined}>
              Overview
            </a>
            <a
              href={componentHref('buttons')}
              aria-current={!home && page === 'components' ? 'page' : undefined}
            >
              Components
            </a>
            <a
              href={siteHref('colors/')}
              aria-current={page === 'colors' ? 'page' : undefined}
            >
              Colors
            </a>
            <a
              href={siteHref('frameworks/')}
              aria-current={page === 'frameworks' ? 'page' : undefined}
            >
              Frameworks
            </a>
          </nav>
          <Toolbar label="Gallery settings">
            <a class="rv-btn rv-btn-ghost rv-btn-icon catalog-github-link" href="https://github.com/revolist/revo-ui" target="_blank" rel="noopener noreferrer" aria-label="Revo UI on GitHub" title="Revo UI on GitHub">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .75a11.25 11.25 0 0 0-3.558 21.923c.563.104.769-.244.769-.543v-2.098c-3.13.68-3.79-1.33-3.79-1.33-.512-1.3-1.25-1.646-1.25-1.646-1.022-.699.078-.685.078-.685 1.13.08 1.725 1.16 1.725 1.16 1.005 1.722 2.636 1.224 3.279.936.102-.728.394-1.224.716-1.506-2.5-.284-5.128-1.25-5.128-5.562 0-1.23.44-2.233 1.16-3.021-.117-.285-.503-1.43.11-2.98 0 0 .946-.303 3.094 1.154A10.79 10.79 0 0 1 12 6.174c.956.005 1.919.129 2.818.378 2.147-1.457 3.09-1.154 3.09-1.154.616 1.55.23 2.695.113 2.98.722.788 1.158 1.791 1.158 3.021 0 4.324-2.633 5.275-5.14 5.554.404.35.764 1.04.764 2.097v3.08c0 .302.203.652.774.542A11.25 11.25 0 0 0 12 .75Z" /></svg>
            </a>
            <Button
              className="rv-btn-icon"
              variant="ghost"
              aria-label="Theme"
              title={
                theme === 'dark'
                  ? 'Switch to light theme'
                  : 'Switch to dark theme'
              }
              aria-pressed={theme === 'dark'}
              onClick={() => {
                const next = theme === 'dark' ? 'light' : 'dark';
                onThemeChange(next);
                document.documentElement.dataset.theme = next;
              }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.75"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                {theme === 'dark' ? (
                  <>
                    <circle cx="12" cy="12" r="4" />
                    <path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" />
                  </>
                ) : (
                  <path d="M20.9 13A9 9 0 0 1 11 3.1 9 9 0 1 0 20.9 13Z" />
                )}
              </svg>
            </Button>
            <Switch
              label="Animations"
              checked={motion !== 'off'}
              onChange={(enabled) => {
                setMotion(enabled ? 'system' : 'off');
                if (enabled)
                  document.documentElement.removeAttribute('data-rv-ui-motion');
                else
                  document.documentElement.setAttribute(
                    'data-rv-ui-motion',
                    'off',
                  );
              }}
            />
            <Switch
              label="Right to left"
              checked={rtl}
              onChange={onRtlChange}
            />
          </Toolbar>
        </div>
      </header>
      <main
        id="components"
        class={`catalog-workspace${page === 'colors' ? ' catalog-workspace--colors' : ''}${home ? ' catalog-workspace--home' : ''}${component ? ' catalog-workspace--component' : ''}`}
        dir={rtl ? 'rtl' : 'ltr'}
        tabIndex={-1}
      >
        {page === 'components' && !home && (
          <Button
            className="catalog-mobile-nav"
            aria-expanded={mobileOpen}
            aria-controls="component-navigation"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? 'Close navigation' : 'Browse components'}
          </Button>
        )}
        {page === 'components' && !home && (
          <aside
            id="component-navigation"
            class="catalog-sidebar"
            data-open={mobileOpen}
          >
            <SearchInput
              aria-label="Find a component"
              placeholder="Find a component…"
              value={query}
              onInput={(event) => setQuery(event.currentTarget.value)}
            />
            <nav aria-label="Component sections">
              <a class="catalog-overview-link" href={siteHref()}>
                Overview
              </a>
              {groups.map((group) => {
                const entries = visible.filter(
                  (family) => family.group === group,
                );
                return (
                  entries.length > 0 && (
                    <div class="catalog-nav-group" key={group}>
                      <p>{group}</p>
                      {entries.map((family) => (
                        <a
                          key={family.title}
                          href={componentHref(sectionId(family.title))}
                          aria-current={
                            active === sectionId(family.title) ||
                            component?.title === family.title
                              ? 'location'
                              : undefined
                          }
                        >
                          {family.title}
                        </a>
                      ))}
                    </div>
                  )
                );
              })}
              {page === 'components' && !home && visible.length === 0 && (
                <p class="catalog-nav-empty">No matching sections.</p>
              )}
            </nav>
            <div class="catalog-sidebar-note">
              <span class="catalog-status-dot" />
              Independent by design
              <p>
                Product behavior stays with its product. Shared presentation
                lives here.
              </p>
            </div>
          </aside>
        )}
        {page === 'frameworks' && (
          <aside class="catalog-sidebar catalog-framework-sidebar">
            <nav aria-label="Framework navigation">
              <div class="catalog-nav-group">
                <p>Frameworks</p>
                <a
                  href={siteHref('frameworks/')}
                  aria-current={!active ? 'page' : undefined}
                >
                  Getting started
                </a>
                {pages.frameworks.map((name) => {
                  const id = name.toLowerCase().replaceAll(' ', '-');
                  return (
                    <a
                      href={frameworkHref(id)}
                      aria-current={active === id ? 'page' : undefined}
                    >
                      {name}
                    </a>
                  );
                })}
              </div>
            </nav>
          </aside>
        )}
        <div class="catalog-content">
          {home ? (
            <GalleryHome />
          ) : (
            <Route.Provider
              value={component ? sectionId(component.title) : active}
            >
              {active === 'components' && <div class="component-intro"><h1>UI components</h1><p>Explore components for finance, reporting, and project management.</p></div>}
              {component && (
                <div class="component-intro">
                  <a href={componentHref('buttons')}>
                    Components
                  </a>
                  <span> / </span>
                  <span>{component.title}</span>
                  <h1>{component.title}</h1>
                  <p>
                    Explore every variant and expand each example’s formatted
                    usage code.
                  </p>
                </div>
              )}
              {active === 'components' ? (
                <nav class="component-directory" aria-label="All components">
                  {families.map(family => <a href={componentHref(sectionId(family.title))}><strong>{family.title}</strong><span>{family.description}</span></a>)}
                </nav>
              ) : knownRoute ? (
                scopedChildren
              ) : (
                <div class="component-intro">
                  <h1>Component not found</h1>
                  <p>Choose a component from the navigation.</p>
                  <a href={componentHref('buttons')}>
                    Browse components
                  </a>
                </div>
              )}
            </Route.Provider>
          )}
          <footer class="catalog-footer">
            <span>Revo UI</span>
            <p>
              A shared foundation for <a href="https://rv-grid.com/">RevoGrid</a>,{' '}
              <a href="https://pro.rv-grid.com/">Grid Pro</a>,{' '}
              <a href="https://rv-grid.com/pivot/">Pivot</a>,{' '}
              <a href="https://rv-grid.com/charts/">Charts</a>,{' '}
              <a href="https://rv-grid.com/gantt/">Gantt</a>,{' '}
              <a href="https://rv-grid.com/jsscheduler/">Scheduler</a> and{' '}
              <a href="https://rv-grid.com/kanban/">Kanban</a>.
            </p>
            <a href={componentHref('buttons')}>
              Explore components
            </a>
          </footer>
        </div>
      </main>
    </div>
  );
}
