import { afterEach, expect, it, vi } from 'vitest';
import { createHtmlEngine } from './engine';
import { sanitizeRichTextHtml } from './model';
const disposers: (() => void)[] = [];
afterEach(() => {
  disposers.splice(0).forEach((dispose) => dispose());
  document.body.replaceChildren();
});
function setup(html = '<p>Hello world</p>') {
  const root = document.createElement('div');
  root.contentEditable = 'true';
  document.body.append(root);
  const values: string[] = [];
  const engine = createHtmlEngine(root, html, (value) => values.push(value));
  disposers.push(() => engine.destroy());
  const select = (
    node: Node,
    start = 0,
    end = node.textContent?.length ?? 0,
  ) => {
    const range = document.createRange();
    range.setStart(node, start);
    range.setEnd(node, end);
    document.getSelection()!.removeAllRanges();
    document.getSelection()!.addRange(range);
  };
  return {
    root,
    engine,
    values,
    select,
    html: () => sanitizeRichTextHtml(root.innerHTML),
  };
}
it('formats selected text and restores local undo/redo independently of grid edits', () => {
  const { root, engine, select, html } = setup();
  select(root.firstChild!.firstChild!, 0, 5);
  engine.format('bold');
  expect(html()).toBe('<p><strong>Hello</strong> world</p>');
  root.dispatchEvent(
    new KeyboardEvent('keydown', { key: 'z', ctrlKey: true, cancelable: true }),
  );
  expect(html()).toBe('<p>Hello world</p>');
  root.dispatchEvent(
    new KeyboardEvent('keydown', {
      key: 'z',
      ctrlKey: true,
      shiftKey: true,
      cancelable: true,
    }),
  );
  expect(html()).toBe('<p><strong>Hello</strong> world</p>');
});
it('unformats only the selected part of an existing inline format', () => {
  const { root, engine, select, html } = setup(
    '<p><strong>Hello world</strong></p>',
  );
  select(root.querySelector('strong')!.firstChild!, 0, 5);
  engine.format('bold');
  expect(html()).toBe('<p>Hello<strong> world</strong></p>');
});
it('preserves selection while adding a link and rejects unsafe links', () => {
  const { root, engine, select, html } = setup();
  select(root.firstChild!.firstChild!, 0, 5);
  engine.captureSelection();
  expect(engine.link('javascript:bad')).toBe(false);
  expect(engine.link('/record/1')).toBe(true);
  expect(html()).toBe(
    '<p><a href="/record/1" rel="noopener noreferrer">Hello</a> world</p>',
  );
});
it('changes a block without changing its content', () => {
  const { root, engine, select, html } = setup();
  select(root.firstChild!.firstChild!, 0, 0);
  engine.block('h1');
  expect(html()).toBe('<h1>Hello world</h1>');
  engine.block('bullet');
  expect(html()).toBe('<ul><li>Hello world</li></ul>');
  engine.block('paragraph');
  expect(html()).toBe('<p>Hello world</p>');
  expect(document.getSelection()!.getRangeAt(0).collapsed).toBe(true);
});
it('does not intercept composition Enter or commit intermediate composition input', () => {
  const { root, values } = setup();
  root.dispatchEvent(new Event('compositionstart'));
  const event = new KeyboardEvent('keydown', {
    key: 'Enter',
    isComposing: true,
    cancelable: true,
  });
  root.dispatchEvent(event);
  expect(event.defaultPrevented).toBe(false);
  root.dispatchEvent(new Event('input'));
  expect(values).toEqual([]);
  root.dispatchEvent(new Event('compositionend'));
  expect(values).toHaveLength(1);
});
it('inserts one paragraph when Enter starts at the editor root', () => {
  const { root, values, select } = setup('<p>Text</p>');
  select(root, 0, 0);
  const createElement = document.createElement.bind(document);
  let paragraphs = 0;
  // Bound a regression so repeated paragraph insertion cannot hang the runner.
  const guard = vi
    .spyOn(document, 'createElement')
    .mockImplementation((tag, options) => {
      if (tag === 'p' && ++paragraphs > 30)
        throw new Error('Repeated paragraph insertion');
      return createElement(tag, options);
    });
  try {
    root.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter', cancelable: true }),
    );
  } finally {
    guard.mockRestore();
  }
  expect(root.children).toHaveLength(2);
  expect(values).toHaveLength(1);
  expect(document.getSelection()!.anchorNode).not.toBe(root);
});
it.each(['list', 'quote'])(
  'preserves sibling blocks when moving a paragraph out of a %s',
  (kind) => {
    const source =
      kind === 'list'
        ? '<ul><li>First</li><li>Second</li><li>Third</li></ul>'
        : '<blockquote><p>First</p><p>Second</p><p>Third</p></blockquote>';
    const { root, engine, select, html } = setup(source);
    select(root.firstElementChild!.children[1].firstChild!, 2, 2);
    engine.block('paragraph');
    expect(html()).toBe(
      kind === 'list'
        ? '<ul><li>First</li></ul><p>Second</p><ul><li>Third</li></ul>'
        : '<blockquote><p>First</p></blockquote><p>Second</p><blockquote><p>Third</p></blockquote>',
    );
  },
);
it.each(['ordered', 'bullet'] as const)(
  'groups contiguous selected paragraphs into one %s list',
  (kind) => {
    const { root, engine, html } = setup(
      '<p>First</p><p>Second</p><p>Third</p>',
    );
    const range = document.createRange();
    range.setStart(root.children[0].firstChild!, 0);
    range.setEnd(root.children[1].firstChild!, 6);
    document.getSelection()!.removeAllRanges();
    document.getSelection()!.addRange(range);
    engine.block(kind);
    const tag = kind === 'ordered' ? 'ol' : 'ul';
    expect(html()).toBe(
      `<${tag}><li>First</li><li>Second</li></${tag}><p>Third</p>`,
    );
    expect(document.getSelection()!.toString()).toBe('FirstSecond');
  },
);
it.each(['bold', 'italic', 'strikethrough', 'code'] as const)(
  'keeps the existing link when typing with %s at a caret',
  (format) => {
    const { root, engine, select, html } = setup(
      '<p><a href="/a">Hello</a></p>',
    );
    select(root.querySelector('a')!.firstChild!, 2, 2);
    engine.format(format);
    root.dispatchEvent(
      new InputEvent('beforeinput', {
        inputType: 'insertText',
        data: 'X',
        cancelable: true,
      }),
    );
    const tag = {
      bold: 'strong',
      italic: 'em',
      strikethrough: 's',
      code: 'code',
    }[format];
    expect(html()).toBe(
      `<p><a href="/a" rel="noopener noreferrer">He<${tag}>X</${tag}>llo</a></p>`,
    );
  },
);

const key = (
  root: HTMLElement,
  key: string,
  options: KeyboardEventInit = {},
) => {
  const event = new KeyboardEvent('keydown', {
    key,
    bubbles: true,
    cancelable: true,
    ...options,
  });
  root.dispatchEvent(event);
  return event;
};
it('exits code after three Enters and undoes the exit as one operation', () => {
  const { root, select, html } = setup('<pre>code</pre>');
  select(root.firstChild!.firstChild!, 4, 4);
  key(root, 'Enter');
  key(root, 'Enter');
  key(root, 'Enter');
  expect(root.lastElementChild!.localName).toBe('p');
  expect(root.querySelector('pre')!.textContent).toBe('code');
  key(root, 'z', { ctrlKey: true });
  expect(root.children).toHaveLength(1);
  expect(root.firstChild!.textContent).toBe('code\n\n');
  expect(html()).toContain('<pre>');
});
it.each(['ArrowDown', 'ArrowUp'])(
  'escapes terminal code with %s without duplicating paragraphs',
  (arrow) => {
    const { root, select } = setup('<pre>code</pre>');
    const offset = arrow === 'ArrowUp' ? 0 : 4;
    select(root.firstChild!.firstChild!, offset, offset);
    key(root, arrow);
    expect(root.children).toHaveLength(2);
    expect((document.getSelection()!.anchorNode as Element).localName).toBe(
      'p',
    );
  },
);
it('keeps Shift+Enter inside code and creates literal newlines', () => {
  const { root, select } = setup('<pre>code</pre>');
  select(root.firstChild!.firstChild!, 4, 4);
  for (let i = 0; i < 3; i++) key(root, 'Enter', { shiftKey: true });
  expect(root.children).toHaveLength(1);
  expect(root.firstChild!.textContent).toBe('code\n\n\n');
});
it('converts formatted content to plain code and ignores inline formatting within code', () => {
  const { root, engine, select } = setup(
    '<p><strong>const</strong> <s>ready</s></p>',
  );
  select(root.querySelector('strong')!.firstChild!, 0, 0);
  engine.block('code');
  expect(root.innerHTML).toBe('<pre>const ready</pre>');
  engine.format('bold');
  root.dispatchEvent(
    new InputEvent('beforeinput', {
      inputType: 'insertText',
      data: 'X',
      cancelable: true,
    }),
  );
  expect(root.querySelector('strong')).toBeNull();
});
it('exits an empty quote paragraph preserving its earlier content', () => {
  const { root, select, html } = setup(
    '<blockquote><p>Quote</p><p><br></p></blockquote>',
  );
  select(root.querySelectorAll('p')[1], 0, 0);
  key(root, 'Enter');
  expect(html()).toBe('<blockquote><p>Quote</p></blockquote><p><br></p>');
});
it('outdents an empty nested list item one level on Enter', () => {
  const { root, select } = setup(
    '<ul><li>Parent<ul><li><br></li></ul></li></ul>',
  );
  select(root.querySelector('li li')!, 0, 0);
  key(root, 'Enter');
  expect(root.children).toHaveLength(1);
  expect(root.querySelectorAll(':scope > ul > li')).toHaveLength(2);
  expect(root.querySelector('li ul')).toBeNull();
});
it('allows Tab to leave the first list item when it cannot indent', () => {
  const { root, select } = setup('<ul><li>First</li></ul>');
  select(root.querySelector('li')!.firstChild!, 0, 0);
  expect(key(root, 'Tab').defaultPrevented).toBe(false);
});
it.each(['h2', 'pre', 'blockquote'])(
  'Backspace at the start lifts %s to paragraph',
  (tag) => {
    const { root, select } = setup(
      tag === 'blockquote'
        ? '<blockquote><p>Text</p></blockquote>'
        : `<${tag}>Text</${tag}>`,
    );
    const text =
      root.querySelector('p')?.firstChild ?? root.firstChild!.firstChild!;
    select(text, 0, 0);
    key(root, 'Backspace');
    expect(root.innerHTML).toBe('<p>Text</p>');
  },
);
it('exits inline code with ArrowRight at its end', () => {
  const { root, select } = setup('<p><code>code</code></p>');
  select(root.querySelector('code')!.firstChild!, 4, 4);
  expect(key(root, 'ArrowRight').defaultPrevented).toBe(true);
  root.dispatchEvent(
    new InputEvent('beforeinput', {
      inputType: 'insertText',
      data: 'X',
      cancelable: true,
    }),
  );
  expect(root.querySelector('code')!.textContent).toBe('code');
  expect(root.textContent).toBe('codeX');
});
it('converts selected paragraphs into one plain code block preserving their line boundaries', () => {
  const { root, engine } = setup(
    '<p><strong>First</strong></p><p>Second</p><p>Keep</p>',
  );
  const range = document.createRange();
  range.setStart(root.querySelector('strong')!.firstChild!, 0);
  range.setEnd(root.children[1].firstChild!, 6);
  document.getSelection()!.removeAllRanges();
  document.getSelection()!.addRange(range);
  engine.block('code');
  expect(root.innerHTML).toBe('<pre>First\nSecond</pre><p>Keep</p>');
  expect(document.getSelection()!.toString()).toBe('First\nSecond');
});
it('creates a visible caret line after a terminal soft break and never stores its placeholder', () => {
  const { root, select, html } = setup('<p>Text</p>');
  select(root.firstChild!.firstChild!, 4, 4);
  key(root, 'Enter', { shiftKey: true });
  expect(root.querySelector('[data-rv-placeholder]')).not.toBeNull();
  expect(html()).toBe('<p>Text<br></p>');
});
it('outdenting a nested item retains its following siblings as descendants', () => {
  const { root, select } = setup(
    '<ul><li>Parent<ul><li>First</li><li>Second</li><li>Third</li></ul></li></ul>',
  );
  select(root.querySelectorAll('li li')[1].firstChild!, 2, 2);
  key(root, 'Tab', { shiftKey: true });
  expect(root.innerHTML).toBe(
    '<ul><li>Parent<ul><li>First</li></ul></li><li>Second<ul><li>Third</li></ul></li></ul>',
  );
});
it('moves into an existing paragraph after code without adding another block', () => {
  const { root, select } = setup('<pre>code</pre><p>Next</p>');
  select(root.firstChild!.firstChild!, 4, 4);
  key(root, 'ArrowDown');
  expect(root.children).toHaveLength(2);
  expect(document.getSelection()!.anchorNode).toBe(root.children[1]);
});
it('leaves code plain when inline formatting spans ordinary text and code', () => {
  const { root, engine } = setup('<p>Text</p><pre>code</pre>');
  const range = document.createRange();
  range.setStart(root.firstChild!.firstChild!, 0);
  range.setEnd(root.lastChild!.firstChild!, 4);
  document.getSelection()!.removeAllRanges();
  document.getSelection()!.addRange(range);
  engine.format('bold');
  expect(root.innerHTML).toBe('<p><strong>Text</strong></p><pre>code</pre>');
});
it('inserts pasted text literally without importing clipboard markup', () => {
  const { root, select, html } = setup('<p>Text</p>');
  select(root.firstChild!.firstChild!, 4, 4);
  const event = new Event('paste', { cancelable: true });
  Object.defineProperty(event, 'clipboardData', {
    value: {
      getData: (type: string) =>
        type === 'text/plain' ? '<img src=x>\nNext' : '<b>Rich</b>',
    },
  });
  root.dispatchEvent(event);
  expect(event.defaultPrevented).toBe(true);
  expect(html()).toBe('<p>Text&lt;img src=x&gt;<br>Next</p>');
});
it('exits list items whose text is wrapped in paragraphs', () => {
  const { root, select } = setup(
    '<ul><li><p>First</p></li><li><p><br></p></li></ul>',
  );
  select(root.querySelectorAll('p')[1], 0, 0);
  key(root, 'Enter');
  expect(root.innerHTML).toBe('<ul><li><p>First</p></li></ul><p><br></p>');
});
