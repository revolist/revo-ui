import { render } from 'preact';
import { act } from 'preact/test-utils';
import { afterEach, expect, it, vi } from 'vitest';
import { HtmlEditor } from './index';
import { mountEditorPopup } from '../core/editor-popup';
const host = document.createElement('div');
document.body.append(host);
afterEach(() => act(() => render(null, host)));
const button = (label: string) =>
  [...host.querySelectorAll('button')].find(
    (item) => item.textContent === label,
  )!;
const source = (value: string) => {
  act(() => button('HTML').click());
  act(() => {
    const field = host.querySelector('textarea')!;
    field.value = value;
    field.dispatchEvent(new Event('input', { bubbles: true }));
  });
};
it('commits sanitized HTML and never mounts raw source', () => {
  const save = vi.fn();
  act(() =>
    render(
      <HtmlEditor
        autoApply={false}
        value="<p>Original</p>"
        onApply={save}
        onCancel={() => {}}
      />,
      host,
    ),
  );
  source('<p onclick="bad()"><b>Changed</b><script>bad()</script></p>');
  expect(host.querySelector('script')).toBeNull();
  act(() => button('Visual').click());
  expect(host.querySelector('strong')?.textContent).toBe('Changed');
  act(() => button('Apply').click());
  expect(save).toHaveBeenCalledExactlyOnceWith(
    '<p><strong>Changed</strong></p>',
  );
});
it('keeps the small accessible toolbar and HTML source labels', () => {
  act(() =>
    render(
      <HtmlEditor
        autoApply={false}
        value="<p>Text</p>"
        onApply={() => {}}
        onCancel={() => {}}
      />,
      host,
    ),
  );
  expect(
    [...host.querySelectorAll('[role="toolbar"] [role="button"]')].map((item) =>
      item.getAttribute('aria-label'),
    ),
  ).toEqual([
    'Bold',
    'Italic',
    'Strike',
    'Code',
    'H1',
    'H2',
    'Bullets',
    'Numbered list',
    'Quote',
    'Code block',
    'Add link',
  ]);
  expect(host.querySelectorAll('[role="toolbar"] [role="group"]')).toHaveLength(
    4,
  );
  expect(host.querySelectorAll('[role="toolbar"] [aria-pressed]')).toHaveLength(
    11,
  );
  expect(button('HTML')).toBeTruthy();
});
it('validates visible content for required fields and serialized length for maxLength', () => {
  const save = vi.fn();
  act(() =>
    render(
      <HtmlEditor
        autoApply={false}
        value="<p>Text</p>"
        required
        maxLength={20}
        onApply={save}
        onCancel={() => {}}
      />,
      host,
    ),
  );
  source('<p><br></p>');
  expect(button('Apply').disabled).toBe(true);
  act(() => {
    const field = host.querySelector('textarea')!;
    field.value = '<p>Too much content for this field</p>';
    field.dispatchEvent(new Event('input', { bubbles: true }));
  });
  expect(button('Apply').disabled).toBe(true);
  expect(save).not.toHaveBeenCalled();
  expect(button('Clear')).toBeUndefined();
});
it('cancels drafts and supports localized source and action labels', () => {
  const save = vi.fn(),
    cancel = vi.fn();
  act(() =>
    render(
      <HtmlEditor
        autoApply={false}
        value="<p>Original</p>"
        text={{ source: 'Código', bold: 'Negrita' }}
        actions={{ apply: 'Guardar', cancel: 'Cancelar' }}
        onApply={save}
        onCancel={cancel}
      />,
      host,
    ),
  );
  expect(button('Código')).toBeTruthy();
  expect(host.querySelector('[aria-label="Negrita"]')).toBeTruthy();
  act(() => button('Cancelar').click());
  expect(cancel).toHaveBeenCalledOnce();
  expect(save).not.toHaveBeenCalled();
});
it('hides confirmation by default and saves a source draft once on dismissal', () => {
  const save = vi.fn();
  let popup: ReturnType<typeof mountEditorPopup>;
  act(() => {
    popup = mountEditorPopup(
      host,
      () => (
        <HtmlEditor
          value="<p>Original</p>"
          onApply={save}
          onCancel={() => {}}
        />
      ),
      { label: 'HTML' },
    );
  });
  const panel = document.querySelector('.rv-rich-text-editor')!;
  expect(
    [...panel.querySelectorAll('button')].some(
      (item) => item.textContent === 'Apply',
    ),
  ).toBe(false);
  act(() => {
    [...panel.querySelectorAll('button')]
      .find((item) => item.textContent === 'HTML')!
      .click();
  });
  act(() => {
    const field = panel.querySelector('textarea')!;
    field.value = '<p>Changed</p>';
    field.dispatchEvent(new Event('input', { bubbles: true }));
  });
  act(() =>
    document.body.dispatchEvent(new Event('pointerdown', { bubbles: true })),
  );
  expect(save).toHaveBeenCalledExactlyOnceWith('<p>Changed</p>');
});
it('keeps required validation independent of translated error text', () => {
  act(() =>
    render(
      <HtmlEditor
        autoApply={false}
        required
        value=""
        text={{ requiredValue: '' }}
        onApply={() => {}}
        onCancel={() => {}}
      />,
      host,
    ),
  );
  expect(button('Apply').disabled).toBe(true);
});
it('replaces the draft when the parent supplies a different saved value', () => {
  const props = { autoApply: false, onApply: vi.fn(), onCancel: vi.fn() };
  act(() => render(<HtmlEditor {...props} value="<p>First</p>" />, host));
  source('<p>Unsaved</p>');
  act(() => render(<HtmlEditor {...props} value="<p>Second</p>" />, host));
  expect(host.querySelector('textarea')!.value).toBe('<p>Second</p>');
  act(() => button('Visual').click());
  expect(host.querySelector('[contenteditable]')!.textContent).toBe('Second');
});
it('uses the supplied source formatter on entry and leaves typing untouched', () => {
  const save = vi.fn(),
    format = vi.fn(() => '<p>First</p>\n<p>Second</p>');
  act(() =>
    render(
      <HtmlEditor
        autoApply={false}
        value="<p>First</p><p>Second</p>"
        formatSource={format}
        onApply={save}
        onCancel={() => {}}
      />,
      host,
    ),
  );
  act(() => button('HTML').click());
  expect(format).toHaveBeenCalledExactlyOnceWith('<p>First</p><p>Second</p>');
  expect(host.querySelector('textarea')!.value).toBe(
    '<p>First</p>\n<p>Second</p>',
  );
  act(() => {
    const field = host.querySelector('textarea')!;
    field.value = '<p>Typing</p>\n';
    field.dispatchEvent(new Event('input', { bubbles: true }));
  });
  expect(format).toHaveBeenCalledOnce();
  expect(host.querySelector('textarea')!.value).toBe('<p>Typing</p>\n');
  act(() => button('Apply').click());
  expect(save).toHaveBeenCalledExactlyOnceWith('<p>Typing</p>');
});
it('formats the HTML tab by default and commits the original semantic value', () => {
  const value =
    '<p>Notes</p><blockquote><p>Quote</p></blockquote><pre>  code\nnext</pre>';
  const save = vi.fn();
  act(() =>
    render(
      <HtmlEditor
        autoApply={false}
        value={value}
        onApply={save}
        onCancel={() => {}}
      />,
      host,
    ),
  );
  act(() => button('HTML').click());
  expect(host.querySelector('textarea')!.value).toBe(
    '<p>Notes</p>\n<blockquote>\n  <p>Quote</p>\n</blockquote>\n<pre>  code\nnext</pre>',
  );
  act(() => button('Apply').click());
  expect(save).toHaveBeenCalledExactlyOnceWith(value);
});
