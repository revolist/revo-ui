import pages from './pages.json';
import { examples } from './example-source';

const slug = (title: string) => title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
const base = import.meta.env.BASE_URL === './' ? '/' : import.meta.env.BASE_URL;
export const siteHref = (path = '') => `${base}${path}`;
export const componentHref = (id: string) => siteHref(`components/${id}/`);
export const apiHref = (name = '') =>
  siteHref(`api/${name ? `${name.toLowerCase()}/` : ''}`);
export const frameworkHref = (id: string) => siteHref(`frameworks/${id}/`);
const pathParts = () =>
  location.pathname.slice(base.length).split('/').filter(Boolean);
export function pageKind() {
  if (pathParts()[0] === 'accessibility') return 'accessibility';
  if (pathParts()[0] === 'api') return 'api';
  return pathParts()[0] === 'frameworks'
    ? 'frameworks'
    : pathParts()[0] === 'colors'
      ? 'colors'
      : 'components';
}
export function currentRoute() {
  const [kind, id] = pathParts();
  if (kind === 'accessibility') return id ? 'not-found' : '';
  if (kind === 'api') return id ?? '';
  if (kind === 'components') return id ?? 'components';
  if (kind === 'frameworks') return id ?? '';
  if (kind === 'colors') return '';
  return kind ? 'not-found' : location.hash.slice(1);
}
/** Preserve published hash/query links without leaving duplicate indexable views. */
export function redirectLegacyRoute() {
  const redirect = () => {
    const query = new URLSearchParams(location.search);
    const hash = location.hash.slice(1);
    let target: string | undefined;
    if (
      (pathParts()[0] === 'components' && pathParts()[1] === 'editors') ||
      hash === 'editors'
    )
      target = componentHref('html-editor');
    else if (query.get('page') === 'colors') target = siteHref('colors/');
    else if (query.get('page') === 'frameworks')
      target = pages.frameworks.some((name) => slug(name) === hash)
        ? frameworkHref(hash)
        : siteHref('frameworks/');
    else if (hash === 'components') target = siteHref('components/');
    else if (pages.components.some((page) => slug(page.title) === hash))
      target = componentHref(hash);
    else if (hash.startsWith('component/')) {
      const example = examples.find((example) => example.id === hash.slice(10));
      if (example?.family)
        target = `${componentHref(slug(example.family))}#example-${example.id}`;
    }
    if (target) {
      query.delete('page');
      const url = new URL(target, location.origin);
      url.search = query.toString();
      location.replace(url.href);
    }
  };
  redirect();
  window.addEventListener('hashchange', redirect);
}
