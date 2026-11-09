import { richTextFragment } from './model';
export interface HtmlRenderNode {
  tag?: string;
  text?: string;
  attrs?: Record<string, string | number>;
  children?: readonly HtmlRenderNode[];
}
const cache = new Map<string, readonly HtmlRenderNode[]>();
/** Only allowlisted nodes reach a framework renderer; fresh VNodes are created per cell. */
export function htmlRenderNodes(html: string): readonly HtmlRenderNode[] {
  const cached = cache.get(html);
  if (cached) return cached;
  const convert = (node: Node): HtmlRenderNode =>
    node.nodeType === 3
      ? { text: node.textContent ?? '' }
      : {
          tag: (node as Element).localName,
          attrs: Object.fromEntries(
            [...(node as Element).attributes].map((attr) => [
              attr.name,
              attr.value,
            ]),
          ),
          children: [...node.childNodes].map(convert),
        };
  const result = [...richTextFragment(html).childNodes].map(convert);
  if (html.length <= 50000) {
    if (cache.size >= 100) cache.delete(cache.keys().next().value!);
    cache.set(html, result);
  }
  return result;
}
