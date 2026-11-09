import { expect, it } from 'vitest';
import { isSafeRichTextLink, sanitizeRichTextHtml } from './model';
it('retains the supported HTML formatting and canonicalizes aliases', () => {
  expect(
    sanitizeRichTextHtml(
      '<h1>Title</h1><p><b>B</b><i>I</i><strike>S</strike><code>C</code></p><blockquote><p>Q</p></blockquote><ul><li>L</li></ul><ol start="3"><li>N</li></ol><pre>code</pre>',
    ),
  ).toBe(
    '<h1>Title</h1><p><strong>B</strong><em>I</em><s>S</s><code>C</code></p><blockquote><p>Q</p></blockquote><ul><li>L</li></ul><ol start="3"><li>N</li></ol><pre>code</pre>',
  );
});
it('rebuilds an allowlist without handlers, styles, foreign content or active subtrees', () => {
  const value = sanitizeRichTextHtml(
    '<script>alert(1)</script><style>bad</style><iframe>bad</iframe><svg><a href="javascript:evil">bad</a></svg><p onclick="evil()" style="color:red"><img src=x onerror="evil()">Safe <span>text</span></p>',
  );
  expect(value).toBe('<p>Safe text</p>');
});
it('rejects encoded and control-character URL schemes after HTML parsing', () => {
  for (const url of [
    'javascript:evil',
    'jav&#97;script&#58;evil',
    'java&#10;script:evil',
    'data:text/html,bad',
  ])
    expect(sanitizeRichTextHtml(`<p><a href="${url}">Link</a></p>`)).toBe(
      '<p>Link</p>',
    );
  expect(isSafeRichTextLink('https://example.com')).toBe(true);
  expect(isSafeRichTextLink('/record/1')).toBe(true);
  expect(isSafeRichTextLink('javascript:evil')).toBe(false);
  expect(
    sanitizeRichTextHtml('<a href="/record/1" target="_blank">Link</a>'),
  ).toBe('<p><a href="/record/1" rel="noopener noreferrer">Link</a></p>');
});
it('recognizes empty formatting as empty, wraps plain text, and is idempotent', () => {
  expect(sanitizeRichTextHtml('<p><br></p>')).toBe('');
  expect(sanitizeRichTextHtml('<p>&nbsp;</p>')).toBe('');
  expect(sanitizeRichTextHtml('**plain**')).toBe('<p>**plain**</p>');
  const html = sanitizeRichTextHtml(
    '<div><h2>Title</h2><div>Content &amp; text</div></div>',
  );
  expect(sanitizeRichTextHtml(html)).toBe(html);
});
it('stores code as literal text and preserves real line breaks without rich marks', () => {
  expect(
    sanitizeRichTextHtml(
      '<pre><strong>const</strong> <s>x</s><br>next &lt;tag&gt;</pre>',
    ),
  ).toBe('<pre>const x\nnext &lt;tag&gt;</pre>');
});
it('ignores source indentation between blocks without inserting blank paragraphs', () => {
  expect(sanitizeRichTextHtml('\n  <h2>Title</h2>\n  <p>Text</p>\n')).toBe(
    '<h2>Title</h2><p>Text</p>',
  );
});
