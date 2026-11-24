import { h } from 'preact';
import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { Dialog, SearchInput } from '@revolist/ui/preact';
import pages from './pages.json';
import documentation from './documentation.json';
import { examples, slug } from './example-source';
import { apiHref, componentHref, frameworkHref, siteHref } from './routing';
import { searchEntries, type SearchEntry } from './global-search-index';
import type { ComponentApi } from './api-types';

const staticEntries: SearchEntry[] = [
  ...pages.components.map((family) => ({
    id: `family:${family.title}`,
    label: family.title,
    description: family.description,
    keywords: family.keywords,
    href: componentHref(slug(family.title)),
    kind: 'Components',
  })),
  ...examples
    .filter((example) => example.family)
    .map((example) => ({
      id: `example:${example.family}:${example.id}`,
      label: example.title,
      description: example.family!,
      href: `${componentHref(slug(example.family!))}#example-${example.id}`,
      kind: 'Example',
    })),
  ...Object.entries(documentation).map(([id, doc]) => ({
    id: `doc:${id}`,
    label: doc.title,
    description: doc.description,
    keywords: `${doc.label} ${id === 'bundle-size' ? 'tree shaking tree shaking styles' : ''}`,
    href: frameworkHref(id),
    kind: 'Guide',
  })),
  ...pages.frameworks.map((name) => ({
    id: `framework:${name}`,
    label: `${name} integration`,
    description: 'Framework setup',
    href: frameworkHref(slug(name)),
    kind: 'Guide',
  })),
  {
    id: 'accessibility',
    label: 'Accessibility',
    description: 'Keyboard navigation and accessible controls',
    href: siteHref('accessibility/'),
    kind: 'Guide',
  },
  {
    id: 'customize',
    label: 'Customize components',
    description: 'Theme, colors and appearance',
    href: siteHref('customize/'),
    kind: 'Guide',
  },
];

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const [api, setApi] = useState<ComponentApi[]>([]);
  const launcher = useRef<HTMLInputElement>(null);
  const returnFocus = useRef<HTMLElement>();
  const list = useRef<HTMLDivElement>(null);
  const focusSearch = (element: HTMLInputElement | null) => {
    if (element)
      requestAnimationFrame(() => {
        if (element.isConnected) element.focus();
      });
  };
  useEffect(() => {
    if (!open || api.length) return;
    let mounted = true;
    import('virtual:component-api').then(({ default: data }) => {
      if (mounted) setApi(data);
    });
    return () => {
      mounted = false;
    };
  }, [open, api.length]);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (
        event.key.toLowerCase() !== 'k' ||
        !(event.metaKey || event.ctrlKey) ||
        event.altKey ||
        event.isComposing
      )
        return;
      if (!open && document.querySelector('[role="dialog"]')) return;
      event.preventDefault();
      if (!open)
        returnFocus.current =
          document.activeElement instanceof HTMLElement
            ? document.activeElement
            : undefined;
      setOpen((value) => !value);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);
  useEffect(() => {
    if (!open) {
      setQuery('');
      setActive(0);
    }
  }, [open]);
  const entries = useMemo(
    () => [
      ...api.map((item) => ({
        id: `api:${item.name}`,
        label: item.name,
        description: item.families.join(' · '),
        href: apiHref(item.name),
        kind: 'API',
      })),
      ...staticEntries,
    ],
    [api],
  );
  const results = useMemo(
    () => searchEntries(entries, query),
    [entries, query],
  );
  const selected = Math.min(active, Math.max(results.length - 1, 0));
  useEffect(() => {
    list.current
      ?.querySelector<HTMLElement>('[aria-selected="true"]')
      ?.scrollIntoView({ block: 'nearest' });
  }, [selected]);
  const execute = (entry: SearchEntry) => {
    setOpen(false);
    location.href = entry.href;
  };
  return (
    <>
      <SearchInput
        rootClassName="global-search-trigger"
        inputRef={launcher}
        aria-label="Search the site"
        aria-haspopup="dialog"
        placeholder="Search"
        shortcut={
          /Mac|iPhone|iPad|iPod/i.test(navigator.platform) ? '⌘ K' : 'Ctrl K'
        }
        readOnly
        onClick={() => {
          returnFocus.current = launcher.current ?? undefined;
          setOpen(true);
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            returnFocus.current = launcher.current ?? undefined;
            setOpen(true);
          }
        }}
      />
      <Dialog
        open={open}
        title="Search Revo UI"
        closeLabel="Close search"
        onClose={() => setOpen(false)}
        returnFocus={returnFocus.current}
        preset={{ className: 'global-search-dialog' }}
        footer={
          <p class="global-search-status" role="status">
            {results.length
              ? `${results.length === 12 ? 'Top ' : ''}${results.length} results`
              : 'No results found. Try another search.'}
          </p>
        }
      >
        <div class="global-search">
          <SearchInput
            aria-label="Search controls, examples, and guides"
            placeholder="Search controls, examples, and guides…"
            role="combobox"
            aria-autocomplete="list"
            aria-controls="global-search-results"
            aria-expanded={results.length > 0}
            aria-activedescendant={
              results[selected] ? `global-search-option-${selected}` : undefined
            }
            inputRef={focusSearch}
            value={query}
            onValueChange={(value) => {
              setQuery(value);
              setActive(0);
            }}
            onKeyDown={(event) => {
              if (event.isComposing) return;
              if (event.key === 'ArrowDown' && results.length) {
                event.preventDefault();
                setActive((selected + 1) % results.length);
              } else if (event.key === 'ArrowUp' && results.length) {
                event.preventDefault();
                setActive((selected - 1 + results.length) % results.length);
              } else if (event.key === 'Enter' && results[selected]) {
                event.preventDefault();
                execute(results[selected]);
              }
            }}
          />
          <div
            class="global-search-results"
            role="listbox"
            id="global-search-results"
            aria-label="Search results"
            ref={list}
          >
            {results.map((entry, index) => (
              <button
                id={`global-search-option-${index}`}
                type="button"
                role="option"
                aria-selected={index === selected}
                key={entry.id}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => execute(entry)}
              >
                <span>
                  <strong>{entry.label}</strong>
                  <small>{entry.description}</small>
                </span>
                <span class="global-search-kind">{entry.kind}</span>
              </button>
            ))}
          </div>
        </div>
      </Dialog>
    </>
  );
}
