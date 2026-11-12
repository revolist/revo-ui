import { Marked, Renderer } from 'marked';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

export const documentation = JSON.parse(
  readFileSync(new URL('../src/documentation.json', import.meta.url), 'utf8'),
);
const escape = (text) =>
  String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

/** Repository-authored Markdown compiled during the gallery build, never in the browser. */
export function renderDocumentation(source, base = '/') {
  const used = new Map();
  const parser = new Marked({
    gfm: true,
    renderer: {
      html({ text }) {
        return escape(text);
      },
      heading({ tokens, depth, text }) {
        const slug = text
          .replace(/<[^>]*>|[`*_]/g, '')
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '');
        const count = used.get(slug) ?? 0;
        used.set(slug, count + 1);
        return `<h${depth} id="${slug}${count ? `-${count}` : ''}">${this.parser.parseInline(tokens)}</h${depth}>\n`;
      },
      link({ href, title, tokens }) {
        const label = this.parser.parseInline(tokens);
        const [path, fragment] = href.split('#');
        const local = Object.entries(documentation).find(
          ([, page]) => page.source === path,
        );
        if (local)
          href = `${base}frameworks/${local[0]}/${fragment ? `#${fragment}` : ''}`;
        try {
          if (
            !['https:', 'http:', 'mailto:'].includes(
              new URL(href, 'https://ui.rv-grid.com').protocol,
            )
          )
            return label;
        } catch {
          return label;
        }
        return `<a href="${escape(href)}"${title ? ` title="${escape(title)}"` : ''}>${label}</a>`;
      },
      image({ text }) {
        return escape(text);
      },
      table(token) {
        return `<div class="documentation-table">${Renderer.prototype.table.call(this, token)}</div>`;
      },
    },
  });
  return parser.parse(source, { async: false });
}

export function documentationPlugin() {
  const id = '\0virtual:documentation';
  let base = '/';
  return {
    name: 'gallery-markdown-documentation',
    configResolved(config) {
      base = config.base === './' ? '/' : config.base;
    },
    resolveId(source) {
      if (source === 'virtual:documentation') return id;
    },
    load(source) {
      if (source !== id) return;
      const rendered = Object.fromEntries(
        Object.entries(documentation)
          .filter(([, page]) => page.source)
          .map(([slug, page]) => {
            const file = new URL(`../docs/${page.source}`, import.meta.url);
            this.addWatchFile(fileURLToPath(file));
            return [
              slug,
              renderDocumentation(readFileSync(file, 'utf8'), base),
            ];
          }),
      );
      return `export default ${JSON.stringify(rendered)};`;
    },
  };
}
