import { expect, it } from 'vitest';
import { htmlRenderNodes, type HtmlRenderNode } from './render-model';
const tags = (nodes: readonly HtmlRenderNode[]): string[] =>
  nodes.flatMap((node) => [
    ...(node.tag ? [node.tag] : []),
    ...tags(node.children ?? []),
  ]);
it('renders supported HTML with allowlisted attributes and caches models, not framework nodes', () => {
  const html =
    '<h1>Title</h1><p><strong>Bold</strong> <em>I</em> <s>S</s> <code>C</code></p><ul><li>L</li></ul><blockquote>Q</blockquote><pre>Code</pre>';
  expect(tags(htmlRenderNodes(html))).toEqual(
    expect.arrayContaining([
      'h1',
      'strong',
      'em',
      's',
      'code',
      'ul',
      'li',
      'blockquote',
      'pre',
    ]),
  );
  expect(htmlRenderNodes(html)).toBe(htmlRenderNodes(html));
});
it('never exposes raw HTML injection, event attributes, images or unsafe links', () => {
  const nodes = htmlRenderNodes(
    '<p onclick="bad()"><script>bad()</script><img src=x><a href="javascript:evil">Plain</a></p>',
  );
  expect(nodes).toEqual([
    { tag: 'p', attrs: {}, children: [{ text: 'Plain' }] },
  ]);
});
