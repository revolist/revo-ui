/** @jsxImportSource preact */
import { h } from 'preact';

/** Paint HTML source as escaped text; source is never interpreted as markup. */
export function HtmlSyntax({ code }: { code: string }) {
  const parts: { text: string; kind?: string }[] = [];
  const tags =
    /<!--[\s\S]*?(?:-->|$)|<\/?[A-Za-z][\w:-]*(?:[^"'<>]|"[^"]*"|'[^']*')*>?/g;
  let position = 0;
  for (const match of code.matchAll(tags)) {
    parts.push({ text: code.slice(position, match.index) });
    const token = match[0];
    if (token.startsWith('<!--')) parts.push({ text: token, kind: 'comment' });
    else {
      for (const text of token.split(
        /("[^"]*"|'[^']*'|^<\/?[\w:-]+|\/?>$|[\w:-]+(?=\s*=))/g,
      )) {
        parts.push({
          text,
          kind: /^["']/.test(text)
            ? 'string'
            : /^<|^\/?>$/.test(text)
              ? 'tag'
              : /^[\w:-]+$/.test(text)
                ? 'attribute'
                : undefined,
        });
      }
    }
    position = match.index! + token.length;
  }
  parts.push({ text: code.slice(position) });
  return (
    <code class="rv-html-syntax">
      {parts.map((part, index) => (
        <span
          key={index}
          class={part.kind ? `rv-html-syntax__${part.kind}` : undefined}
        >
          {part.text}
        </span>
      ))}
    </code>
  );
}
