import { expect, it } from 'vitest';
import { formatRichTextHtml } from './format-html';
import { sanitizeRichTextHtml } from './model';

it('indents nested blocks and separates siblings while preserving inline phrases', () => {
  const source =
    '<h2>Notes</h2><blockquote><p>Keep <strong>notes</strong> simple.</p></blockquote><ul><li>First</li><li><em>Second</em></li></ul>';
  expect(formatRichTextHtml(source)).toBe(
    '<h2>Notes</h2>\n<blockquote>\n  <p>Keep <strong>notes</strong> simple.</p>\n</blockquote>\n<ul>\n  <li>First</li>\n  <li><em>Second</em></li>\n</ul>',
  );
});
it.each([
  '<blockquote><pre>  const x = 1;\n\n  next();\n</pre></blockquote>',
  '<ul><li>Parent<ul><li>Child</li></ul></li><li>Other</li></ul>',
  '<p>Keep <a href="/notes?a=1&amp;b=2">this link</a> and <code> a  b </code>.</p>',
])(
  'preserves code, mixed-content whitespace and saved semantics: %s',
  (source) => {
    const formatted = formatRichTextHtml(source);
    expect(sanitizeRichTextHtml(formatted)).toBe(sanitizeRichTextHtml(source));
    expect(formatRichTextHtml(formatted)).toBe(formatted);
  },
);
it('leaves an empty source empty', () => {
  expect(formatRichTextHtml('')).toBe('');
});
