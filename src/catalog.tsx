import { GalleryHome } from './home';
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

const families = [

  {
    title: 'AI assistant',
    group: 'Advanced',
    description:
      'Prompt inputs, suggestions, action status and result summaries.',
    keywords:
      'ai assistant chat messages reasoning tasks prompt input suggestions status tool result restore',
  },
  {
    title: 'Activity messages',
    group: 'Compositions',
    description:
      'Chat-style messages with an avatar, timestamp, content and actions.',
    keywords: 'activity chat message audit feed history card user time',
  },
  {
    title: 'Buttons',
    group: 'Controls',
    description: 'Actions, variants, icon buttons and grouped commands.',
    keywords:
      'button icon toggle group primary solid neutral add plus outline ghost danger delete disabled compact',
  },
  {
    title: 'Selection controls',
    group: 'Controls',
    description: 'Independent checkboxes, switches and single-choice controls.',
    keywords: 'checkbox switch radio choice chips option rows',
  },
  {
    title: 'Tabs and lists',
    group: 'Controls',
    description:
      'Switch linked content or choose items with plain, icon, description and grouped selection lists.',
    keywords: 'segmented tabs listbox option navigation',
  },
  {
    title: 'Inputs and forms',
    group: 'Controls',
    description:
      'Text, messages, search, numbers and clear field presentation.',
    keywords:
      'text textarea message search number stepper counter field error validation readonly highlighted inline dimensions',
  },
  {
    title: 'Selects, chips and resources',
    group: 'Controls',
    description: 'Find options, manage selections and choose people.',
    keywords: 'combobox multiselect dropdown avatar picker tag',
  },
  {
    title: 'Sliders',
    group: 'Controls',
    description: 'Adjust a value or define an interval.',
    keywords: 'range scalar numeric timeline track move resize events',
  },
  { title: 'Timeline track', group: 'Controls', description: 'Move and resize timeline events with per-event colors and weighted phases.', keywords: 'timeline track event phase color move resize project' },
  {
    title: 'PDF viewer',
    group: 'Advanced',
    description: 'Read, search, navigate, print and download PDF documents.',
    keywords:
      'pdf document viewer file upload zoom rotate search print download',
  },
  {
    title: 'Calendar and dates',
    group: 'Pickers',
    description: 'Independent calendars, date inputs, ranges and time slots.',
    keywords:
      'date time datetime calendar picker availability weekly grid legend',
  },
  {
    title: 'Color',
    group: 'Pickers',
    description: 'Choose a color from a picker or palette.',
    keywords: 'palette picker swatches',
  },
  {
    title: 'Field configurators',
    group: 'Compositions',
    description:
      'Shared field layout and actions. Product field browsers keep their Pro tree.',
    keywords: 'field library search group ordered reorder measures checkbox',
  },
  {
    title: 'Formatting controls',
    group: 'Compositions',
    description:
      'Typography, icon choices, inspector sections and before/after previews.',
    keywords:
      'format font size bold italic underline strike alignment inspector disclosure comparison preview',
  },
  {
    title: 'Charts and range selection',
    group: 'Compositions',
    description: 'Standalone chart primitives and a composed range brush.',
    keywords: 'distribution bar line area brush chart range',
  },
  {
    title: 'Dialogs and floating surfaces',
    group: 'Compositions',
    description: 'Focused tasks, confirmations and contextual details.',
    keywords: 'dialog confirmation popover tooltip overlay',
  },
  {
    title: 'Menus and toolbars',
    group: 'Compositions',
    description: 'Commands with feedback scoped to their own example.',
    keywords: 'menu submenu toolbar undo redo export history',
  },
  {
    title: 'Status and feedback',
    group: 'Compositions',
    description: 'Badges, alerts, loading states and helpful empty content.',
    keywords: 'badge alert spinner loading empty feedback',
  },
  {
    title: 'Layout',
    group: 'Compositions',
    description: 'Panes and an interactive resize divider.',
    keywords: 'split pane resize panel disclosure',
  },
  {
    title: 'Pagination',
    group: 'Compositions',
    description: 'Numbered pages, selectors and compact navigation.',
    keywords: 'page selector first last next previous',
  },
  {
    title: 'Progress and rating',
    group: 'Compositions',
    description: 'Show completion or collect a rating.',
    keywords: 'bar circular progress rating stars',
  },
];
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
          href={`#${id}`}
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
            href={`${/^(colors|built-in-palettes)\.tsx$/.test(examples.find((item) => item.title === title)?.file ?? '') ? '?page=colors' : ''}#${sectionId(examples.find((item) => item.title === title)?.family ?? title)}`}
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
  const [active, setActive] = useState(location.hash.slice(1));
  useEffect(() => {
    const update = () => {
      setActive(location.hash.slice(1));
      setMobileOpen(false);
      if (location.hash === '#frameworks') requestAnimationFrame(() => document.getElementById('frameworks')?.scrollIntoView({ behavior: 'smooth' }));
      else window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', update);
    return () => window.removeEventListener('hashchange', update);
  }, []);
  const knownRoute =
    page === 'frameworks' ||
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
    document.title = `${component?.title ?? (home ? 'Overview' : page === 'frameworks' ? 'Frameworks' : page === 'colors' ? 'Colors' : (families.find((family) => sectionId(family.title) === active)?.title ?? 'Components'))} · Revo UI`;
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
          <a href="./" class="catalog-title">
            <img
              class="catalog-logo"
              src={revogridLogo}
              alt="Revo UI"
              width={24}
              height={24}
            />
            Revo <span>UI</span>
          </a>
          <nav class="catalog-pages" aria-label="Library pages">
            <a href="./" aria-current={home ? 'page' : undefined}>
              Overview
            </a>
            <a
              href={page !== 'components' ? './#buttons' : '#buttons'}
              aria-current={!home && page === 'components' ? 'page' : undefined}
            >
              Components
            </a>
            <a
              href="?page=colors"
              aria-current={page === 'colors' ? 'page' : undefined}
            >
              Colors
            </a>
            <a
              href="?page=frameworks"
              aria-current={page === 'frameworks' ? 'page' : undefined}
            >
              Frameworks
            </a>
          </nav>
          <Toolbar label="Gallery settings">
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
              <a class="catalog-overview-link" href="./">
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
                          href={`#${sectionId(family.title)}`}
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
                  href="?page=frameworks"
                  aria-current={!active ? 'page' : undefined}
                >
                  Getting started
                </a>
                {[
                  'React',
                  'Vue',
                  'Angular',
                  'Svelte',
                  'Preact',
                  'Vanilla TypeScript',
                ].map((name) => {
                  const id = name.toLowerCase().replaceAll(' ', '-');
                  return (
                    <a
                      href={`?page=frameworks#${id}`}
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
              {component && (
                <div class="component-intro">
                  <a href={page !== 'components' ? './#buttons' : '#buttons'}>
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
              {knownRoute ? (
                scopedChildren
              ) : (
                <div class="component-intro">
                  <h1>Component not found</h1>
                  <p>Choose a component from the navigation.</p>
                  <a href={page !== 'components' ? './#buttons' : '#buttons'}>
                    Browse components
                  </a>
                </div>
              )}
            </Route.Provider>
          )}
          <footer class="catalog-footer">
            <span>Revo UI</span>
            <p>
              A shared foundation for Grid Pro, Pivot, Charts, Gantt, Scheduler
              and Kanban.
            </p>
            <a href={page !== 'components' ? './#buttons' : '#buttons'}>
              Explore components
            </a>
          </footer>
        </div>
      </main>
    </div>
  );
}
