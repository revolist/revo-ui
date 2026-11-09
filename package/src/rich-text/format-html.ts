/** Display-only indentation: keep inline phrases and preformatted content intact. */
export function formatRichTextHtml(
  html: string,
  doc: Document = document,
): string {
  if (!html) return '';
  const template = doc.createElement('template');
  template.innerHTML = html;
  const blocks = new Set([
    'p',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'blockquote',
    'ul',
    'ol',
    'li',
    'pre',
  ]);
  const serialize = (node: Node) => {
    const holder = doc.createElement('div');
    holder.append(node.cloneNode(true));
    return holder.innerHTML;
  };
  const lines = (nodes: Node[], depth: number): string[] => {
    const result: string[] = [];
    const indent = '  '.repeat(depth);
    let inline = '';
    const flush = () => {
      if (inline.trim()) result.push(indent + inline);
      inline = '';
    };
    for (const node of nodes) {
      if (node.nodeType !== 1 || !blocks.has((node as Element).localName)) {
        inline += serialize(node);
        continue;
      }
      flush();
      const element = node as Element;
      const structured = [...element.childNodes].every((child) =>
        child.nodeType === 1
          ? blocks.has((child as Element).localName)
          : child.nodeType === 3 && !child.textContent?.trim(),
      );
      // Indentation in mixed content becomes visible whitespace in the editor.
      if (
        element.localName !== 'pre' &&
        element.children.length &&
        structured
      ) {
        const shell = element.cloneNode(false) as Element;
        const opening = shell.outerHTML.slice(
          0,
          shell.outerHTML.indexOf('>') + 1,
        );
        result.push(
          indent + opening,
          ...lines([...element.childNodes], depth + 1),
          `${indent}</${element.localName}>`,
        );
      } else result.push(indent + element.outerHTML);
    }
    flush();
    return result;
  };
  return lines([...template.content.childNodes], 0).join('\n');
}
