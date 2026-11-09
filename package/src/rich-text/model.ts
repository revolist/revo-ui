/** The one allowlist used by the editor, commits and cell renderers. */
const tags = new Set([
  'p',
  'br',
  'strong',
  'em',
  's',
  'code',
  'pre',
  'blockquote',
  'ul',
  'ol',
  'li',
  'a',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
]);
const discard = new Set([
  'script',
  'style',
  'iframe',
  'object',
  'embed',
  'svg',
  'math',
  'template',
  'noscript',
  'head',
  'link',
  'meta',
  'base',
  'input',
  'button',
  'textarea',
  'select',
]);
const aliases: Record<string, string> = {
  b: 'strong',
  i: 'em',
  strike: 's',
  del: 's',
  div: 'p',
};
const blocks = new Set([
  'p',
  'pre',
  'blockquote',
  'ul',
  'ol',
  'li',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
]);
export function isSafeRichTextLink(value: string): boolean {
  if (!value || /[\u0000-\u0020\u007f]/.test(value)) return false;
  try {
    return ['http:', 'https:', 'mailto:'].includes(
      new URL(value, 'https://editor.invalid/').protocol,
    );
  } catch {
    return false;
  }
}
/** Remove rich marks inside code while preserving line breaks and selection markers. */
export function flattenCode(element: Element) {
  for (const child of [...element.children]) {
    if (child.localName === 'br') {
      child.replaceWith(child.hasAttribute('data-rv-placeholder') ? '' : '\n');
    } else {
      flattenCode(child);
      if (blocks.has(child.localName) && child.nextSibling) child.after('\n');
      child.replaceWith(...child.childNodes);
    }
  }
}
/** Parse inertly, then rebuild nodes; never mount user-provided HTML or attributes. */
export function richTextFragment(
  html: string,
  doc: Document = document,
): DocumentFragment {
  const parsed = doc.createElement('template');
  parsed.innerHTML = html;
  const fragment = doc.createDocumentFragment();
  const copy = (source: Node, parent: Node) => {
    if (source.nodeType === 3) {
      if (
        !source.textContent?.trim() &&
        ['ul', 'ol', 'blockquote'].includes(
          source.parentElement?.localName ?? '',
        )
      )
        return;
      if (source.textContent)
        parent.appendChild(doc.createTextNode(source.textContent));
      return;
    }
    if (source.nodeType !== 1) return;
    const element = source as Element;
    const original = element.localName.toLowerCase();
    if (original === 'br' && element.hasAttribute('data-rv-placeholder'))
      return;
    if (
      element.namespaceURI !== 'http://www.w3.org/1999/xhtml' ||
      discard.has(original)
    )
      return;
    const tag = aliases[original] ?? original;
    if (
      !tags.has(tag) ||
      (tag === 'a' && !isSafeRichTextLink(element.getAttribute('href') ?? ''))
    ) {
      for (const child of element.childNodes) copy(child, parent);
      return;
    }
    // Avoid invalid nested paragraphs from browser-created div containers.
    if (
      tag === 'p' &&
      [...element.children].some((child) =>
        blocks.has(aliases[child.localName] ?? child.localName),
      )
    ) {
      for (const child of element.childNodes) copy(child, parent);
      return;
    }
    const result = doc.createElement(tag);
    if (tag === 'a') {
      result.setAttribute('href', element.getAttribute('href')!);
      result.setAttribute('rel', 'noopener noreferrer');
    }
    if (tag === 'ol' && /^\d{1,9}$/.test(element.getAttribute('start') ?? ''))
      result.setAttribute('start', element.getAttribute('start')!);
    for (const child of element.childNodes) copy(child, result);
    if (tag === 'pre') flattenCode(result);
    if (
      !blocks.has(tag) &&
      tag !== 'br' &&
      !result.textContent &&
      !result.querySelector('br')
    )
      return;
    const previous = parent.lastChild;
    if (
      ['strong', 'em', 's', 'code', 'a'].includes(tag) &&
      previous?.nodeType === 1 &&
      previous.cloneNode(false).isEqualNode(result.cloneNode(false))
    ) {
      while (result.firstChild) previous.appendChild(result.firstChild);
    } else parent.appendChild(result);
  };
  for (const child of parsed.content.childNodes) copy(child, fragment);
  // The root always contains blocks, including when the stored value was plain text.
  let paragraph: HTMLParagraphElement | undefined;
  const hasBlocks = [...fragment.children].some((child) =>
    blocks.has(child.localName),
  );
  for (const child of [...fragment.childNodes]) {
    if (
      hasBlocks &&
      !paragraph &&
      child.nodeType === 3 &&
      !child.textContent?.trim()
    ) {
      child.remove();
      continue;
    }
    if (child.nodeType === 1 && blocks.has((child as Element).localName)) {
      paragraph = undefined;
      continue;
    }
    if (!paragraph) {
      paragraph = doc.createElement('p');
      fragment.insertBefore(paragraph, child);
    }
    paragraph.appendChild(child);
  }
  return fragment;
}
export function sanitizeRichTextHtml(
  html: string,
  doc: Document = document,
): string {
  const host = doc.createElement('div');
  host.appendChild(richTextFragment(html, doc));
  return host.textContent?.replace(/\u00a0/g, ' ').trim() ? host.innerHTML : '';
}
