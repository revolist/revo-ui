import {
  GlobalThemePanel,
  readGalleryTheme,
  saveGalleryTheme,
} from './global-theme';
import documentation from './documentation.json';
import { documentationPage } from './documentation';
import { accessibilityArticle } from './accessibility';
import { GallerySettings } from './gallery-settings';
import { ComponentContents } from './component-contents';
import { GalleryHome } from './home';
import {
  PublishedVersion,
  PublishedVersionProvider,
} from './published-version';
import { ApiReference, type ComponentApi } from './component-api';
import { ExampleCode, examples, slug } from './example-source';
import { SvgIcon } from '@revolist/ui/icons/icon';
import codeIcon from '@fortawesome/fontawesome-free/svgs/solid/code.svg?raw';
import arrowDownIcon from '@fortawesome/fontawesome-free/svgs/solid/arrow-right.svg?raw';
import {
  createContext,
  h,
  isValidElement,
  toChildArray,
  type ComponentChildren,
} from 'preact';
import { useContext, useEffect, useRef, useState } from 'preact/hooks';
import {
  Button,
  DialogCloseButton,
  SearchInput,
  Toolbar,
} from '@revolist/ui/preact';

import pages from './pages.json';
import {
  currentRoute,
  componentHref,
  apiHref,
  frameworkHref,
  siteHref,
} from './routing';
const families = pages.components;
const groups = [
  'Actions and navigation',
  'Form controls',
  'Date, time and scheduling',
  'People and collaboration',
  'Data and visualization',
  'Feedback and overlays',
  'Layout and content',
];
const documentationEntries = (category: string) =>
  Object.entries(documentation)
    .filter(([, doc]) => doc.category === category)
    .map(([id, doc]) => ({ id, label: doc.label, href: frameworkHref(id) }));
const documentationGroups = [
  {
    title: 'Essentials',
    entries: [
      { id: '', label: 'Getting started', href: siteHref('frameworks/') },
      ...documentationEntries('Essentials'),
      {
        id: 'customize-workspace',
        label: 'Customize components',
        href: siteHref('customize/'),
      },
      {
        id: 'accessibility',
        label: 'Accessibility',
        href: siteHref('accessibility/'),
      },
    ],
  },
  {
    title: 'Framework adapters',
    entries: pages.frameworks.map((name) => {
      const id = name.toLowerCase().replaceAll(' ', '-');
      return { id, label: name, href: frameworkHref(id) };
    }),
  },
  ...['Server rendering', 'Integrations'].map((title) => ({
    title,
    entries: documentationEntries(title),
  })),
];
const Route = createContext('');
export const sectionId = (title: string) =>
  title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
const normalizeSearch = (value: string) =>
  value
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
const matchesExample = (example: (typeof examples)[number], query: string) => {
  const componentNames = [...example.code.matchAll(/<([A-Z][A-Za-z0-9.]*)/g)]
    .map((match) => match[1])
    .join(' ');
  return normalizeSearch(`${example.title} ${componentNames}`).includes(query);
};
const matches = (family: (typeof families)[number], query: string) =>
  normalizeSearch(
    `${family.title} ${family.description} ${family.keywords}`,
  ).includes(query) ||
  examples.some(
    (example) =>
      example.family === family.title && matchesExample(example, query),
  );

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
            href={
              /^(colors|built-in-palettes)\.tsx$/.test(
                examples.find((item) => item.title === title)?.file ?? '',
              )
                ? siteHref('customize/')
                : componentHref(
                    sectionId(
                      examples.find((item) => item.title === title)?.family ??
                        title,
                    ),
                  )
            }
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
  page?: 'components' | 'customize' | 'frameworks' | 'api' | 'accessibility';
  theme: string;
  rtl: boolean;
  onThemeChange: (value: string) => void;
  onRtlChange: (value: boolean) => void;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  const [galleryTheme, setGalleryTheme] = useState(readGalleryTheme);
  useEffect(() => {
    const style = document.documentElement.style;
    if (galleryTheme.radius === undefined)
      style.removeProperty('--rv-gallery-preview-radius');
    else
      style.setProperty(
        '--rv-gallery-preview-radius',
        `${galleryTheme.radius}px`,
      );
    return () => style.removeProperty('--rv-gallery-preview-radius');
  }, [galleryTheme.radius]);
  useEffect(() => {
    const style = document.documentElement.style;
    if (galleryTheme.accent)
      style.setProperty('--rv-gallery-preview-accent', galleryTheme.accent);
    else style.removeProperty('--rv-gallery-preview-accent');
    return () => style.removeProperty('--rv-gallery-preview-accent');
  }, [galleryTheme.accent]);
  const customizeButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!themeOpen) return;
    const dismiss = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setThemeOpen(false);
        customizeButton.current?.focus();
      }
    };
    window.addEventListener('keydown', dismiss);
    return () => window.removeEventListener('keydown', dismiss);
  }, [themeOpen]);
  const mobileNavButton = useRef<HTMLButtonElement>(null);
  const [motion, setMotion] = useState('system');
  const content = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState('');
  const [apiComponents, setApiComponents] = useState<ComponentApi[]>([]);
  useEffect(() => {
    if (page === 'components')
      import('virtual:component-api').then(({ default: api }) =>
        setApiComponents(api),
      );
  }, [page]);
  const [active, setActive] = useState(currentRoute());
  const [anchor, setAnchor] = useState(location.hash);
  useEffect(() => {
    const update = () => {
      setActive(currentRoute());
      setAnchor(location.hash);
      setMobileOpen(false);
      if (
        location.hash &&
        (location.pathname.includes('/components/') ||
          page === 'api' ||
          page === 'accessibility' ||
          page === 'frameworks')
      )
        return;
      if (location.hash === '#frameworks')
        requestAnimationFrame(() =>
          document
            .getElementById('frameworks')
            ?.scrollIntoView({ behavior: 'smooth' }),
        );
      else window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', update);
    return () => window.removeEventListener('hashchange', update);
  }, []);
  const knownRoute =
    page === 'api' ||
    (page === 'frameworks' &&
      (!active ||
        pages.frameworks.some((name) => sectionId(name) === active) ||
        !!documentationPage(active))) ||
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
  const included = params.getAll('section'),
    excluded = params.getAll('exclude');
  const inScope = (title: string) =>
    (!included.length || included.includes(sectionId(title))) &&
    !excluded.includes(sectionId(title));
  const scopedChildren = toChildArray(children).filter((child) => {
    if (!isValidElement(child) || child.type !== Section) return true;
    return (
      'title' in child.props &&
      typeof child.props.title === 'string' &&
      inScope(child.props.title)
    );
  });
  const normalizedQuery = normalizeSearch(query);
  const visible = families.filter(
    (family) =>
      inScope(family.title) &&
      (matches(family, normalizedQuery) ||
        apiComponents.some(
          (item) =>
            item.families.includes(family.title) &&
            normalizeSearch(item.name).includes(normalizedQuery),
        )),
  );
  const frameworkName =
    page === 'frameworks'
      ? pages.frameworks.find((name) => sectionId(name) === active)
      : undefined;
  useEffect(() => {
    const doc = page === 'frameworks' ? documentationPage(active) : undefined;
    const title = doc
      ? `${doc.seoTitle} · Revo UI`
      : page === 'accessibility'
        ? accessibilityArticle.title
        : home
          ? 'Revo UI — Components for Data-Rich Applications'
          : `${component?.title ?? (page === 'frameworks' ? (frameworkName ? `${frameworkName} UI components and integration` : 'Getting started') : page === 'customize' ? 'Customize components' : 'UI components')} · Revo UI`;
    document.title = title;
    document
      .querySelector('meta[property="og:type"]')
      ?.setAttribute(
        'content',
        page === 'accessibility' ||
          (page === 'frameworks' && knownRoute && !!active)
          ? 'article'
          : 'website',
      );
    const description = doc
      ? doc.description
      : page === 'accessibility'
        ? accessibilityArticle.description
        : frameworkName
          ? `Integrate Revo UI components with ${frameworkName}. Start with a small typed example, then follow the linked SSR, styling and bundle-size guides.`
          : home
            ? 'Build data-rich applications with charts, AI chat, PDF viewing, timelines and date controls for React, Vue, Angular, Svelte, Preact and TypeScript.'
            : (component?.description ??
              (page === 'customize'
                ? 'Create and share reusable component presets with live previews.'
                : page === 'frameworks'
                  ? 'Integrate Revo UI with React, Vue, Angular, Svelte, Preact, or vanilla TypeScript. Follow installation and usage guides for your stack.'
                  : 'Browse Revo UI controls, pickers, layouts, and compositions with interactive variants and formatted usage examples.'));
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute('content', description);
    document
      .querySelector('meta[property="og:title"]')
      ?.setAttribute('content', title);
    document
      .querySelector('meta[property="og:description"]')
      ?.setAttribute('content', description);
    document
      .querySelector('meta[name="twitter:title"]')
      ?.setAttribute('content', title);
    document
      .querySelector('meta[name="twitter:description"]')
      ?.setAttribute('content', description);
    let canonical = document.querySelector<HTMLLinkElement>(
      'link[rel="canonical"]',
    );
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.append(canonical);
    }
    canonical.href = `https://ui.rv-grid.com${location.pathname}`;
    document
      .querySelector('meta[property="og:url"]')
      ?.setAttribute('content', canonical.href);
    document
      .querySelector('meta[name="robots"]')
      ?.setAttribute(
        'content',
        home || knownRoute
          ? 'index, follow, max-image-preview:large'
          : 'noindex, follow',
      );
    document.getElementById('documentation-schema')?.remove();
    if (
      page === 'frameworks' &&
      active &&
      knownRoute &&
      (doc || frameworkName)
    ) {
      const structured = document.createElement('script');
      structured.id = 'documentation-schema';
      structured.type = 'application/ld+json';
      structured.textContent = JSON.stringify({
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'TechArticle',
            '@id': `${canonical.href}#article`,
            url: canonical.href,
            headline: doc?.title ?? `${frameworkName} integration`,
            description,
            inLanguage: 'en',
            mainEntityOfPage: canonical.href,
            articleSection: doc?.category ?? 'Framework adapters',
            author: {
              '@type': 'Organization',
              name: 'Revo UI team',
              url: 'https://github.com/revolist/revo-ui',
            },
            publisher: {
              '@type': 'Organization',
              name: 'Revolist',
              url: 'https://ui.rv-grid.com/',
            },
            image: 'https://ui.rv-grid.com/og-image.png',
          },
          {
            '@type': 'BreadcrumbList',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: 'Docs',
                item: `https://ui.rv-grid.com${siteHref('frameworks/')}`,
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: doc?.label ?? frameworkName,
                item: canonical.href,
              },
            ],
          },
        ],
      });
      document.head.append(structured);
    }
    document.getElementById('accessibility-article-schema')?.remove();
    if (page === 'accessibility' && knownRoute) {
      const structured = document.createElement('script');
      structured.id = 'accessibility-article-schema';
      structured.type = 'application/ld+json';
      structured.textContent = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'TechArticle',
        '@id': `${canonical.href}#article`,
        url: canonical.href,
        headline: accessibilityArticle.headline,
        description: accessibilityArticle.description,
        datePublished: accessibilityArticle.published,
        dateModified: accessibilityArticle.published,
        inLanguage: 'en',
        mainEntityOfPage: canonical.href,
        author: {
          '@type': 'Organization',
          name: 'Revo UI team',
          url: 'https://github.com/revolist/revo-ui',
        },
        publisher: {
          '@type': 'Organization',
          name: 'Revolist',
          url: 'https://ui.rv-grid.com/',
        },
        image: 'https://ui.rv-grid.com/og-image.png',
      });
      document.head.append(structured);
    }
  }, [active, home, page, component?.title]);
  return (
    <PublishedVersionProvider>
      <div
        class="rv-ui catalog"
        dir={rtl ? 'rtl' : 'ltr'}
        data-rv-style={galleryTheme.style ?? 'standard'}
        data-custom-accent={galleryTheme.accent ? '' : undefined}
        data-custom-radius={galleryTheme.radius !== undefined ? '' : undefined}
        style={{
          ...(galleryTheme.accent
            ? {
                '--rv-ui-accent': galleryTheme.accent,
                '--gallery-accent-fg': [
                  '#0891b2',
                  '#059669',
                  '#65a30d',
                  '#d97706',
                ].includes(galleryTheme.accent)
                  ? '#111'
                  : '#fff',
              }
            : {}),
          ...(galleryTheme.radius !== undefined
            ? {
                '--rv-ui-radius': `${galleryTheme.radius}px`,
                '--rv-control-radius': `${galleryTheme.radius}px`,
                '--rv-ui-checkbox-radius': `${galleryTheme.radius / 2}px`,
              }
            : {}),
        }}
      >
        <a
          class="catalog-skip"
          onClick={(event) => {
            event.preventDefault();
            document.getElementById('components')?.focus();
          }}
          href={page === 'customize' ? '#customize-title' : '#components'}
        >
          {page === 'accessibility'
            ? 'Skip to accessibility guide'
            : page === 'customize'
              ? 'Skip to customization'
              : 'Skip to components'}
        </a>
        <header class="catalog-topbar">
          <div class="catalog-topbar-inner">
            <a href={siteHref()} class="catalog-title">
              <img
                class="catalog-logo"
                src={siteHref('logo-mark.svg')}
                alt=""
                aria-hidden="true"
                width={24}
                height={24}
              />
              <span class="catalog-wordmark">
                Revo<span>UI</span>
              </span>
              <PublishedVersion />
            </a>
            <nav class="catalog-pages" aria-label="Library pages">
              <a href={siteHref()} aria-current={home ? 'page' : undefined}>
                Overview
              </a>
              <a
                href={componentHref('buttons')}
                aria-current={
                  !home && page === 'components' ? 'page' : undefined
                }
              >
                Components
              </a>
              <a
                href={siteHref('frameworks/')}
                aria-current={
                  page === 'frameworks' || page === 'accessibility'
                    ? 'page'
                    : undefined
                }
              >
                Docs
              </a>
              <a
                href={siteHref('api/')}
                aria-current={page === 'api' ? 'page' : undefined}
              >
                API
              </a>
              <button
                ref={customizeButton}
                class="catalog-customize-trigger"
                type="button"
                aria-expanded={themeOpen}
                aria-controls="global-theme-panel"
                onClick={() => setThemeOpen(!themeOpen)}
              >
                Customize
              </button>
            </nav>
            <GallerySettings>
              <Toolbar label="Gallery settings">
                <a
                  class="rv-btn rv-btn-ghost rv-btn-icon catalog-github-link"
                  href="https://github.com/revolist/revo-ui"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Revo UI on GitHub"
                  title="Revo UI on GitHub"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M12 .75a11.25 11.25 0 0 0-3.558 21.923c.563.104.769-.244.769-.543v-2.098c-3.13.68-3.79-1.33-3.79-1.33-.512-1.3-1.25-1.646-1.25-1.646-1.022-.699.078-.685.078-.685 1.13.08 1.725 1.16 1.725 1.16 1.005 1.722 2.636 1.224 3.279.936.102-.728.394-1.224.716-1.506-2.5-.284-5.128-1.25-5.128-5.562 0-1.23.44-2.233 1.16-3.021-.117-.285-.503-1.43.11-2.98 0 0 .946-.303 3.094 1.154A10.79 10.79 0 0 1 12 6.174c.956.005 1.919.129 2.818.378 2.147-1.457 3.09-1.154 3.09-1.154.616 1.55.23 2.695.113 2.98.722.788 1.158 1.791 1.158 3.021 0 4.324-2.633 5.275-5.14 5.554.404.35.764 1.04.764 2.097v3.08c0 .302.203.652.774.542A11.25 11.25 0 0 0 12 .75Z" />
                  </svg>
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
                    try {
                      localStorage.setItem('revo-ui-theme', next);
                    } catch {
                      // Keep theme changes usable when storage is blocked or full.
                    }
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
              </Toolbar>
            </GallerySettings>
          </div>
          {themeOpen && (
            <GlobalThemePanel
              value={galleryTheme}
              onChange={(value) => {
                setGalleryTheme(value);
                saveGalleryTheme(value);
              }}
              motion={motion !== 'off'}
              onMotionChange={(enabled) => {
                setMotion(enabled ? 'system' : 'off');
                if (enabled)
                  document.documentElement.removeAttribute('data-rv-ui-motion');
                else
                  document.documentElement.setAttribute(
                    'data-rv-ui-motion',
                    'off',
                  );
              }}
              rtl={rtl}
              onRtlChange={onRtlChange}
            />
          )}
        </header>
        <main
          id="components"
          class={`catalog-workspace${page === 'api' ? ' catalog-workspace--api' : ''}${page === 'customize' || page === 'accessibility' ? ' catalog-workspace--colors' : ''}${home ? ' catalog-workspace--home' : ''}${component ? ' catalog-workspace--component' : ''}`}
          dir={rtl ? 'rtl' : 'ltr'}
          tabIndex={-1}
        >
          {page === 'components' && !home && !mobileOpen && (
            <Button
              ref={mobileNavButton}
              className="catalog-mobile-nav"
              aria-expanded={mobileOpen}
              aria-controls="component-navigation"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              Browse components
            </Button>
          )}
          {page === 'components' && !home && (
            <aside
              id="component-navigation"
              class="catalog-sidebar"
              data-open={mobileOpen}
            >
              <div class="catalog-navigation-tools">
                <SearchInput
                  aria-label="Find a component"
                  placeholder="Find a component…"
                  value={query}
                  onInput={(event) => setQuery(event.currentTarget.value)}
                />
                <DialogCloseButton
                  class="catalog-navigation-close"
                  aria-label="Close navigation"
                  onClick={() => {
                    setMobileOpen(false);
                    requestAnimationFrame(() =>
                      mobileNavButton.current?.focus(),
                    );
                  }}
                />
              </div>
              <nav aria-label="Component sections">
                <a class="catalog-overview-link" href={siteHref()}>
                  Overview
                </a>
                {groups.map((group) => {
                  const entries = visible
                    .filter((family) => family.group === group)
                    .sort((a, b) => a.title.localeCompare(b.title));
                  return (
                    entries.length > 0 && (
                      <div class="catalog-nav-group" key={group}>
                        <p>{group}</p>
                        {entries.map((family) => {
                          const familyExamples = examples.filter(
                            (example) =>
                              example.family === family.title &&
                              (!normalizedQuery ||
                                matchesExample(example, normalizedQuery)),
                          );
                          const familyControls = apiComponents
                            .filter(
                              (item) =>
                                item.families.includes(family.title) &&
                                (!normalizedQuery ||
                                  normalizeSearch(item.name).includes(
                                    normalizedQuery,
                                  )),
                            )
                            .sort((a, b) => a.name.localeCompare(b.name));
                          return (
                            <div class="catalog-nav-family" key={family.title}>
                              <a
                                class="catalog-nav-family-link"
                                href={componentHref(sectionId(family.title))}
                                aria-current={
                                  component?.title === family.title && !anchor
                                    ? 'location'
                                    : undefined
                                }
                              >
                                {family.title}
                              </a>
                              {(familyExamples.length > 0 ||
                                familyControls.length > 0) && (
                                <ul
                                  class="catalog-nav-examples"
                                  aria-label={`${family.title} controls and examples`}
                                >
                                  {familyControls.map((item) => (
                                    <li key={`api-${item.name}`}>
                                      <a href={apiHref(item.name)}>
                                        {item.name}
                                      </a>
                                    </li>
                                  ))}
                                  {familyExamples.map((example) => (
                                    <li key={`${example.file}-${example.id}`}>
                                      <a
                                        href={`${componentHref(sectionId(family.title))}#example-${example.id}`}
                                        aria-current={
                                          component?.title === family.title &&
                                          anchor === `#example-${example.id}`
                                            ? 'location'
                                            : undefined
                                        }
                                      >
                                        {example.title}
                                      </a>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )
                  );
                })}
                {page === 'components' && !home && visible.length === 0 && (
                  <p class="catalog-nav-empty">
                    No matching components or examples.
                  </p>
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
              <nav aria-label="Documentation navigation">
                {documentationGroups.map(({ title, entries }) => (
                  <div
                    class="catalog-nav-group"
                    role="group"
                    aria-labelledby={`docs-${sectionId(title)}`}
                    key={title}
                  >
                    <p id={`docs-${sectionId(title)}`}>{title}</p>
                    {entries.map(({ id, label, href }) => (
                      <a
                        key={id}
                        href={href}
                        aria-current={active === id ? 'page' : undefined}
                      >
                        {label}
                      </a>
                    ))}
                  </div>
                ))}
              </nav>
            </aside>
          )}
          <div class="catalog-content">
            {page === 'frameworks' && active && knownRoute && (
              <nav class="framework-breadcrumb" aria-label="Breadcrumb">
                <a href={siteHref('frameworks/')}>Docs</a>
                <span aria-hidden="true">/</span>
                <span aria-current="page">
                  {documentationPage(active)?.label ?? frameworkName}
                </span>
              </nav>
            )}
            {page === 'api' ? (
              children
            ) : home ? (
              <GalleryHome theme={theme} motion={motion} />
            ) : (
              <div class={component ? 'component-document-layout' : undefined}>
                <div class="component-document-main" ref={content}>
                  <Route.Provider
                    value={component ? sectionId(component.title) : active}
                  >
                    {active === 'components' && (
                      <div class="component-intro">
                        <h1>UI components</h1>
                        <p>
                          Explore charts, AI chat, PDF viewing, timelines, date
                          controls, and more.
                        </p>
                      </div>
                    )}
                    {component && (
                      <div class="component-intro">
                        <a href={componentHref('buttons')}>Components</a>
                        <span> / </span>
                        <span>{component.title}</span>
                        <h1>{component.title}</h1>
                        <p>
                          Explore every variant and expand each example’s
                          formatted usage code.
                        </p>
                        <div class="component-intro-actions">
                          <Button
                            href={`${siteHref('api/')}?family=${encodeURIComponent(component.title)}`}
                            size="compact"
                            className="component-api-link"
                          >
                            <SvgIcon svg={codeIcon} size={14} />
                            API reference
                            <SvgIcon svg={arrowDownIcon} size={11} />
                          </Button>
                        </div>
                      </div>
                    )}
                    {/* Explicit section queries retain focused specimen links. */}
                    {active === 'components' && !included.length ? (
                      <nav
                        class="component-directory"
                        aria-label="All components"
                      >
                        {families.map((family) => (
                          <a href={componentHref(sectionId(family.title))}>
                            <strong>{family.title}</strong>
                            <span>{family.description}</span>
                          </a>
                        ))}
                      </nav>
                    ) : knownRoute ? (
                      scopedChildren
                    ) : (
                      <div class="component-intro">
                        <h1>Component not found</h1>
                        <p>Choose a component from the navigation.</p>
                        <a href={componentHref('buttons')}>Browse components</a>
                      </div>
                    )}
                  </Route.Provider>
                </div>
                {component && (
                  <ComponentContents
                    family={component.title}
                    content={content}
                  />
                )}
              </div>
            )}
            <footer class="catalog-footer">
              <span>Revo UI</span>
              <p>
                A shared foundation for{' '}
                <a href="https://rv-grid.com/">RevoGrid</a>,{' '}
                <a href="https://pro.rv-grid.com/">Grid Pro</a>,{' '}
                <a href="https://rv-grid.com/pivot/">Pivot</a>,{' '}
                <a href="https://rv-grid.com/charts/">Charts</a>,{' '}
                <a href="https://rv-grid.com/gantt/">Gantt</a>,{' '}
                <a href="https://rv-grid.com/jsscheduler/">Scheduler</a> and{' '}
                <a href="https://rv-grid.com/kanban/">Kanban</a>.
              </p>
              <a href={componentHref('buttons')}>Explore components</a>
            </footer>
          </div>
        </main>
      </div>
    </PublishedVersionProvider>
  );
}
