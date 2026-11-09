import { render } from 'preact';
import { act } from 'preact/test-utils';
import { afterEach, expect, it } from 'vitest';
import { HtmlSyntax } from './syntax';
const host = document.createElement('div');
afterEach(() => act(() => render(null, host)));
it('highlights HTML tags, attributes, quoted values and comments without changing source', () => {
  const code =
    '<!-- Notes -->\n<p class="note"><a href="/x?a=1>b">Link</a></p>';
  act(() => render(<HtmlSyntax code={code} />, host));
  expect(host.textContent).toBe(code);
  expect(host.querySelector('.rv-html-syntax__comment')!.textContent).toBe(
    '<!-- Notes -->',
  );
  expect(
    [...host.querySelectorAll('.rv-html-syntax__attribute')].map(
      (el) => el.textContent,
    ),
  ).toEqual(['class', 'href']);
  expect(
    [...host.querySelectorAll('.rv-html-syntax__string')].map(
      (el) => el.textContent,
    ),
  ).toEqual(['"note"', '"/x?a=1>b"']);
  expect(host.querySelectorAll('.rv-html-syntax__tag').length).toBeGreaterThan(
    0,
  );
});
it('renders dangerous HTML only as escaped source text', () => {
  const code = '<script>alert(1)</script><img src=x onerror="bad()">';
  act(() => render(<HtmlSyntax code={code} />, host));
  expect(host.textContent).toBe(code);
  expect(host.querySelector('script,img,[onerror]')).toBeNull();
});
it.each(['<p', '<a href="unfinished', '<!-- unfinished', '  code\n\n', ''])(
  'preserves incomplete source and whitespace: %s',
  (code) => {
    act(() => render(<HtmlSyntax code={code} />, host));
    expect(host.textContent).toBe(code);
  },
);
