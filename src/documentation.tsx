import pages from './documentation.json';
import rendered from 'virtual:documentation';

export function documentationPage(id: string) {
  return Object.hasOwn(pages, id) ? pages[id as keyof typeof pages] : undefined;
}

export function DocumentationPage({ id }: { id: string }) {
  return (
    <article
      class="framework-guide markdown-guide"
      dangerouslySetInnerHTML={{ __html: rendered[id] }}
    />
  );
}
