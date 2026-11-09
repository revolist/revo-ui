import {
  flattenCode,
  isSafeRichTextLink,
  richTextFragment,
  sanitizeRichTextHtml,
} from './model';
export type HtmlFormat = 'bold' | 'italic' | 'strikethrough' | 'code';
export type HtmlBlock =
  | 'paragraph'
  | 'h1'
  | 'h2'
  | 'quote'
  | 'code'
  | 'bullet'
  | 'ordered';
export interface HtmlSelection {
  formats: HtmlFormat[];
  block: HtmlBlock | null;
  link: boolean;
}
export const emptyHtmlSelection: HtmlSelection = {
  formats: [],
  block: null,
  link: false,
};
const inline: Record<HtmlFormat, string> = {
  bold: 'strong',
  italic: 'em',
  strikethrough: 's',
  code: 'code',
};
const blockSelector = 'p,h1,h2,h3,h4,h5,h6,li,pre';
interface Point {
  path: number[];
  offset: number;
}
interface Bookmark {
  start: Point;
  end: Point;
}
interface Snapshot {
  html: string;
  selection?: Bookmark;
}
/** Native Range editing and bounded local history. No browser execCommand or editor library. */
export function createHtmlEngine(
  root: HTMLElement,
  html: string,
  onChange: (html: string) => void,
  onSelectionChange: (selection: HtmlSelection) => void = () => {},
) {
  const doc = root.ownerDocument;
  let savedRange: Range | undefined, pending: Set<HtmlFormat> | undefined;
  let composing = false,
    history: Snapshot[] = [],
    historyIndex = -1,
    lastInput = 0;
  const elementAt = (node: Node) =>
    node.nodeType === 1 ? (node as Element) : node.parentElement;
  const blockAt = (node: Node) => {
    const block = elementAt(node)?.closest<HTMLElement>(blockSelector);
    return block?.localName === 'p'
      ? (block.closest<HTMLElement>('li') ?? block)
      : block;
  };
  const owned = (range: Range) =>
    root.contains(range.startContainer) && root.contains(range.endContainer);
  const range = () => {
    const selected = doc.getSelection();
    if (selected?.rangeCount && owned(selected.getRangeAt(0)))
      return selected.getRangeAt(0).cloneRange();
    if (savedRange && owned(savedRange)) return savedRange.cloneRange();
    const next = doc.createRange();
    next.selectNodeContents(root);
    next.collapse(false);
    return next;
  };
  const select = (value: Range) => {
    root.focus({ preventScroll: true });
    const selection = doc.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(value);
    savedRange = value.cloneRange();
  };
  const path = (node: Node): number[] => {
    const result: number[] = [];
    while (node !== root && node.parentNode) {
      result.unshift(
        [...node.parentNode.childNodes].indexOf(node as ChildNode),
      );
      node = node.parentNode;
    }
    return result;
  };
  const bookmark = (): Bookmark => {
    const current = range();
    return {
      start: {
        path: path(current.startContainer),
        offset: current.startOffset,
      },
      end: { path: path(current.endContainer), offset: current.endOffset },
    };
  };
  const restore = (mark?: Bookmark) => {
    const resolve = (point: Point) => {
      let node: Node = root;
      for (const index of point.path) {
        if (!node.childNodes[index]) break;
        node = node.childNodes[index];
      }
      return {
        node,
        offset: Math.min(
          point.offset,
          node.nodeType === 3
            ? (node.textContent?.length ?? 0)
            : node.childNodes.length,
        ),
      };
    };
    const next = doc.createRange();
    if (mark) {
      const a = resolve(mark.start),
        b = resolve(mark.end);
      next.setStart(a.node, a.offset);
      next.setEnd(b.node, b.offset);
    } else {
      next.selectNodeContents(root);
      next.collapse(false);
    }
    select(next);
  };
  const snapshot = (): Snapshot => ({
    html: root.innerHTML,
    selection: bookmark(),
  });
  const readSelection = () => {
    const current = range(),
      anchor = elementAt(current.startContainer);
    const nearest = anchor?.closest('pre,li,h1,h2,h3,h4,h5,h6,blockquote');
    const tag = nearest?.localName;
    const block: HtmlBlock =
      tag === 'pre'
        ? 'code'
        : tag === 'li'
          ? nearest!.parentElement?.localName === 'ol'
            ? 'ordered'
            : 'bullet'
          : tag === 'h1'
            ? 'h1'
            : tag?.startsWith('h')
              ? 'h2'
              : tag === 'blockquote' || anchor?.closest('blockquote')
                ? 'quote'
                : 'paragraph';
    const formats =
      tag === 'pre'
        ? []
        : pending
          ? [...pending]
          : (Object.keys(inline) as HtmlFormat[]).filter((format) => {
              const start = anchor?.closest(inline[format]);
              return (
                !!start &&
                root.contains(start) &&
                (current.collapsed || start.contains(current.endContainer))
              );
            });
    onSelectionChange({
      formats,
      block,
      link: !!anchor?.closest('a') && root.contains(anchor.closest('a')),
    });
  };
  const remember = (group = false) => {
    const next = snapshot(),
      now = Date.now();
    if (history[historyIndex]?.html !== next.html) {
      history = history.slice(0, historyIndex + 1);
      if (group && now - lastInput < 500 && historyIndex > 0)
        history[historyIndex] = next;
      else {
        history.push(next);
        if (history.length > 100) history.shift();
        historyIndex = history.length - 1;
      }
    } else if (history[historyIndex])
      history[historyIndex].selection = next.selection;
    lastInput = group ? now : 0;
    onChange(sanitizeRichTextHtml(root.innerHTML, doc));
    readSelection();
  };
  const beforeEdit = () => {
    if (history[historyIndex]?.html === root.innerHTML)
      history[historyIndex].selection = bookmark();
  };
  const ensureBlock = () => {
    if (!root.firstChild) {
      const p = doc.createElement('p');
      p.appendChild(doc.createElement('br'));
      root.appendChild(p);
    }
  };
  const setHtml = (value: string) => {
    root.replaceChildren(richTextFragment(value, doc));
    ensureBlock();
    savedRange = undefined;
    pending = undefined;
    history = [{ html: root.innerHTML }];
    historyIndex = 0;
    lastInput = 0;
    readSelection();
  };
  const historyMove = (direction: number) => {
    const index = historyIndex + direction;
    if (index < 0 || index >= history.length) return;
    historyIndex = index;
    const item = history[index];
    root.replaceChildren(richTextFragment(item.html, doc));
    ensureBlock();
    pending = undefined;
    restore(item.selection);
    lastInput = 0;
    onChange(sanitizeRichTextHtml(root.innerHTML, doc));
    readSelection();
  };
  /** Split inline ancestors at a marker so a selected part can be unformatted independently. */
  const lift = (marker: Comment) => {
    while (
      marker.parentElement &&
      marker.parentElement !== root &&
      !marker.parentElement.matches(blockSelector + ',blockquote,ul,ol')
    ) {
      const parent = marker.parentElement,
        right = parent.cloneNode(false);
      while (marker.nextSibling) right.appendChild(marker.nextSibling);
      parent.after(marker, right);
      if (!parent.hasChildNodes()) parent.remove();
      if (!right.hasChildNodes()) right.parentNode?.removeChild(right);
    }
  };
  const marked = (current: Range, change: (selected: Range) => void) => {
    const end = doc.createComment('end'),
      start = doc.createComment('start');
    const endRange = current.cloneRange();
    endRange.collapse(false);
    endRange.insertNode(end);
    current.collapse(true);
    current.insertNode(start);
    lift(start);
    lift(end);
    const selected = doc.createRange();
    selected.setStartAfter(start);
    selected.setEndBefore(end);
    change(selected);
    const result = doc.createRange();
    result.setStartAfter(start);
    result.setEndBefore(end);
    start.remove();
    end.remove();
    select(result);
  };
  const unwrap = (element: Element) =>
    element.replaceWith(...element.childNodes);
  // Lift one block out of a list or quote without moving its siblings.
  const moveOut = (element: Element) => {
    const parent = element.parentElement!,
      tail = parent.cloneNode(false);
    while (element.nextSibling) tail.appendChild(element.nextSibling);
    parent.after(element, tail);
    if (!parent.hasChildNodes()) parent.remove();
    if (!tail.hasChildNodes()) tail.parentNode?.removeChild(tail);
  };
  const formatSelection = (
    current: Range,
    tag: string,
    remove: boolean,
    attrs?: Record<string, string>,
  ) => {
    marked(current, (selected) => {
      for (const node of [...root.querySelectorAll(tag)])
        if (selected.intersectsNode(node) && !node.closest('pre')) unwrap(node);
      if (!remove) {
        const walker = doc.createTreeWalker(root, NodeFilter.SHOW_TEXT),
          nodes: Text[] = [];
        let node: Node | null;
        while ((node = walker.nextNode()))
          if (
            node.textContent &&
            selected.intersectsNode(node) &&
            !node.parentElement?.closest('pre')
          )
            nodes.push(node as Text);
        for (const text of nodes) {
          const wrapper = doc.createElement(tag);
          for (const [key, value] of Object.entries(attrs ?? {}))
            wrapper.setAttribute(key, value);
          text.replaceWith(wrapper);
          wrapper.appendChild(text);
        }
      }
    });
  };
  const format = (mark: HtmlFormat) => {
    if (!(mark in inline)) return;
    if (elementAt(range().startContainer)?.closest('pre')) return;
    beforeEdit();
    lastInput = 0;
    const current = range();
    if (current.collapsed) {
      if (!pending)
        pending = new Set(
          (Object.keys(inline) as HtmlFormat[]).filter((key) =>
            elementAt(current.startContainer)?.closest(inline[key]),
          ),
        );
      if (pending.has(mark)) pending.delete(mark);
      else pending.add(mark);
      savedRange = current.cloneRange();
      root.focus({ preventScroll: true });
      readSelection();
      return;
    }
    const remove =
      !!elementAt(current.startContainer)?.closest(inline[mark]) &&
      !!elementAt(current.endContainer)?.closest(inline[mark]);
    pending = undefined;
    formatSelection(current, inline[mark], remove);
    remember();
  };
  const block = (value: HtmlBlock) => {
    beforeEdit();
    pending = undefined;
    const current = range(),
      collapsed = current.collapsed;
    const candidates = [
      ...root.querySelectorAll<HTMLElement>(blockSelector),
    ].filter((node) => current.intersectsNode(node));
    // Prefer the enclosing item, unless the entire selection is in a nested block.
    let elements = candidates.filter(
      (node) =>
        !candidates.some(
          (other) =>
            other !== node &&
            ((node.contains(other) &&
              other.contains(current.startContainer) &&
              other.contains(current.endContainer)) ||
              (other.contains(node) &&
                !(
                  node.contains(current.startContainer) &&
                  node.contains(current.endContainer)
                ))),
        ),
    );
    // A caret on a boundary must affect only its containing block.
    if (current.collapsed) {
      const node = blockAt(current.startContainer);
      elements = node && root.contains(node) ? [node] : [];
    }
    if (!elements.length) {
      const p = doc.createElement('p');
      p.appendChild(doc.createElement('br'));
      current.insertNode(p);
      elements = [p];
    }
    const start = doc.createComment('block-start'),
      end = doc.createComment('block-end');
    const last = current.cloneRange();
    last.collapse(false);
    last.insertNode(end);
    current.collapse(true);
    current.insertNode(start);
    let listGroup: HTMLElement | undefined;
    let codeGroup: HTMLElement | undefined;
    for (const element of elements) {
      if (!element.isConnected) continue;
      if (value === 'bullet' || value === 'ordered') {
        const tag = value === 'bullet' ? 'ul' : 'ol';
        if (element.localName === 'li') {
          const list = element.parentElement!;
          if (list.localName !== tag) {
            const replacement = doc.createElement(tag);
            replacement.append(...list.childNodes);
            list.replaceWith(replacement);
            listGroup = replacement;
          } else listGroup = list;
        } else {
          if (listGroup?.nextSibling !== element) {
            listGroup = doc.createElement(tag);
            element.before(listGroup);
          }
          const li = doc.createElement('li');
          li.append(...element.childNodes);
          listGroup.appendChild(li);
          element.remove();
        }
      } else {
        const replacement = doc.createElement(
          value === 'h1' || value === 'h2'
            ? value
            : value === 'code'
              ? 'pre'
              : 'p',
        );
        replacement.append(...element.childNodes);
        if (value === 'code') flattenCode(replacement);
        else
          for (const child of [...replacement.children]) {
            if (child.localName === 'p') {
              if (child.nextSibling) child.after(doc.createElement('br'));
              unwrap(child);
            }
          }
        if (element.localName === 'li') {
          moveOut(element);
          element.replaceWith(replacement);
        } else element.replaceWith(replacement);
        if (value === 'quote') {
          const quote = doc.createElement('blockquote');
          replacement.replaceWith(quote);
          quote.appendChild(replacement);
        } else if (replacement.parentElement?.localName === 'blockquote') {
          moveOut(replacement);
        }
        if (value === 'code') {
          if (codeGroup?.nextSibling === replacement) {
            codeGroup.append('\n', ...replacement.childNodes);
            replacement.remove();
          } else codeGroup = replacement;
        }
      }
    }
    const next = doc.createRange();
    next.setStartBefore(start);
    next.setEndBefore(end);
    start.remove();
    end.remove();
    if (collapsed) next.collapse(true);
    select(next);
    remember();
  };
  const insertText = (text: string, group = false) => {
    beforeEdit();
    const current = range();
    current.deleteContents();
    const link = pending
      ? elementAt(current.startContainer)?.closest('a')
      : undefined;
    const anchor =
      link && root.contains(link) ? link.cloneNode(false) : undefined;
    const marker = doc.createComment('caret');
    current.insertNode(marker);
    if (pending) lift(marker);
    const fragment = doc.createDocumentFragment();
    const inCode = !!elementAt(marker)?.closest('pre');
    const lines = inCode
      ? [text.replace(/\r\n?/g, '\n')]
      : text.replace(/\r\n?/g, '\n').split('\n');
    let last: Node | undefined;
    for (let i = 0; i < lines.length; i++) {
      if (i) {
        last = doc.createElement('br');
        fragment.appendChild(last);
      }
      if (!lines[i]) continue;
      const textNode = doc.createTextNode(lines[i]);
      let node: Node = textNode;
      for (const mark of pending ?? []) {
        const wrapper = doc.createElement(inline[mark]);
        wrapper.appendChild(node);
        node = wrapper;
      }
      if (anchor) {
        const wrapper = anchor.cloneNode(false);
        wrapper.appendChild(node);
        node = wrapper;
      }
      fragment.appendChild(node);
      last = textNode;
    }
    marker.before(fragment);
    // A final break needs a non-content caret line in contenteditable.
    let following = marker.nextSibling;
    while (following?.nodeType === 3 && !following.textContent)
      following = following.nextSibling;
    if (
      (last?.nodeName === 'BR' || (inCode && text.endsWith('\n'))) &&
      !following
    ) {
      const placeholder = doc.createElement('br');
      placeholder.setAttribute('data-rv-placeholder', '');
      marker.after(placeholder);
    }
    const next = doc.createRange();
    if (last) {
      next.setStartAfter(last);
      next.collapse(true);
    } else {
      next.setStartBefore(marker);
      next.collapse(true);
    }
    marker.remove();
    select(next);
    remember(group);
  };
  const paragraphBeside = (
    element: Element,
    before: boolean,
    reuse = false,
  ) => {
    let next = reuse
      ? before
        ? element.previousElementSibling
        : element.nextElementSibling
      : null;
    if (!next) {
      next = doc.createElement('p');
      next.appendChild(doc.createElement('br'));
      if (before) element.before(next);
      else element.after(next);
    }
    const target = doc.createRange();
    target.selectNodeContents(next);
    target.collapse(!before);
    select(target);
  };
  const atEdge = (current: Range, element: Element, start: boolean) => {
    if (!current.collapsed) return false;
    const side = current.cloneRange();
    side.selectNodeContents(element);
    if (start) side.setEnd(current.startContainer, current.startOffset);
    else side.setStart(current.endContainer, current.endOffset);
    return !side.toString();
  };
  const enter = (soft: boolean): void => {
    beforeEdit();
    const current = range();
    current.deleteContents();
    const element = blockAt(current.startContainer);
    if (element?.localName === 'pre') {
      const before = current.cloneRange();
      before.selectNodeContents(element);
      before.setEnd(current.startContainer, current.startOffset);
      const after = current.cloneRange();
      after.setEnd(element, element.childNodes.length);
      if (!soft && !after.toString() && before.toString().endsWith('\n\n')) {
        const length = before.toString().length;
        element.textContent = before.toString().slice(0, length - 2);
        pending = undefined;
        paragraphBeside(element, false);
        remember();
        return;
      }
      pending = undefined;
      insertText('\n');
      return;
    }
    if (soft) {
      insertText('\n');
      return;
    }
    if (!element) {
      const paragraph = doc.createElement('p');
      paragraph.appendChild(doc.createElement('br'));
      current.insertNode(paragraph);
      current.selectNodeContents(paragraph);
      current.collapse(true);
      select(current);
      remember();
      return;
    }
    if (!element.textContent?.trim()) {
      if (element.localName === 'li') {
        indent(true);
        return;
      }
      if (element.closest('blockquote')) {
        block('paragraph');
        return;
      }
    }
    pending = undefined;
    const tail = current.cloneRange();
    tail.setEnd(element, element.childNodes.length);
    const tag =
      /^h[1-6]$/.test(element.localName) && !tail.toString()
        ? 'p'
        : element.localName;
    const nextBlock = doc.createElement(tag);
    nextBlock.appendChild(tail.extractContents());
    if (!element.textContent && !element.querySelector('br'))
      element.appendChild(doc.createElement('br'));
    if (!nextBlock.textContent && !nextBlock.querySelector('br'))
      nextBlock.appendChild(doc.createElement('br'));
    element.after(nextBlock);
    const next = doc.createRange();
    next.selectNodeContents(nextBlock);
    next.collapse(true);
    select(next);
    remember();
  };
  const indent = (out: boolean) => {
    const current = range(),
      li = elementAt(current.startContainer)?.closest('li');
    if (!li || !root.contains(li)) return false;
    beforeEdit();
    const list = li.parentElement!;
    // Ranges are live: reparenting a list item relocates their endpoints in browsers.
    const start = { node: current.startContainer, offset: current.startOffset };
    const end = { node: current.endContainer, offset: current.endOffset };
    if (out) {
      const parent = list.parentElement;
      if (parent?.localName !== 'li') {
        block('paragraph');
        return true;
      }
      // Following nested items remain children of the lifted item, in order.
      const tail = list.cloneNode(false) as Element;
      while (li.nextSibling) tail.appendChild(li.nextSibling);
      if (tail.hasChildNodes()) li.appendChild(tail);
      parent.after(li);
      if (!list.children.length) list.remove();
    } else {
      const previous = li.previousElementSibling;
      if (!previous) return false;
      let nested = previous.lastElementChild;
      if (nested?.localName !== list.localName) {
        nested = doc.createElement(list.localName);
        previous.appendChild(nested);
      }
      nested.appendChild(li);
    }
    const restored = doc.createRange();
    restored.setStart(start.node, start.offset);
    restored.setEnd(end.node, end.offset);
    select(restored);
    remember();
    return true;
  };
  const keydown = (event: KeyboardEvent) => {
    if (event.isComposing || composing) return;
    const mod = event.ctrlKey || event.metaKey;
    if (mod && !event.altKey) {
      const key = event.key.toLowerCase();
      if (key === 'z' || key === 'y') {
        event.preventDefault();
        event.stopPropagation();
        historyMove(key === 'y' || event.shiftKey ? 1 : -1);
        return;
      }
      const mark =
        key === 'b'
          ? 'bold'
          : key === 'i'
            ? 'italic'
            : key === '`'
              ? 'code'
              : key === 'x' && event.shiftKey
                ? 'strikethrough'
                : undefined;
      if (mark) {
        event.preventDefault();
        event.stopPropagation();
        format(mark);
        return;
      }
    }
    const current = range(),
      anchor = elementAt(current.startContainer);
    const code = anchor?.closest('pre');
    if (
      !mod &&
      !event.altKey &&
      !event.shiftKey &&
      code &&
      ((event.key === 'ArrowDown' && atEdge(current, code, false)) ||
        (event.key === 'ArrowUp' && atEdge(current, code, true)))
    ) {
      event.preventDefault();
      event.stopPropagation();
      beforeEdit();
      pending = undefined;
      paragraphBeside(code, event.key === 'ArrowUp', true);
      remember();
      return;
    }
    if (
      !mod &&
      !event.altKey &&
      !event.shiftKey &&
      event.key === 'ArrowRight' &&
      !code
    ) {
      const inlineEnd = anchor?.closest('a,code');
      if (inlineEnd && atEdge(current, inlineEnd, false)) {
        event.preventDefault();
        event.stopPropagation();
        current.setStartAfter(inlineEnd);
        current.collapse(true);
        select(current);
        pending = new Set(
          (Object.keys(inline) as HtmlFormat[]).filter(
            (mark) =>
              mark !== 'code' &&
              elementAt(current.startContainer)?.closest(inline[mark]),
          ),
        );
        readSelection();
        return;
      }
    }
    if (!mod && !event.altKey && event.key === 'Backspace') {
      const element = blockAt(current.startContainer);
      if (
        element &&
        atEdge(current, element, true) &&
        (element.matches('pre,li,h1,h2,h3,h4,h5,h6') ||
          element.closest('blockquote'))
      ) {
        event.preventDefault();
        event.stopPropagation();
        if (element.localName === 'li') indent(true);
        else block('paragraph');
        return;
      }
    }
    if (event.key === 'Enter' && !mod && !event.altKey) {
      event.preventDefault();
      event.stopPropagation();
      enter(event.shiftKey);
    }
    if (
      event.key === 'Tab' &&
      !mod &&
      !event.altKey &&
      indent(event.shiftKey)
    ) {
      event.preventDefault();
      event.stopPropagation();
    }
    if (/^(Arrow|Home|End)/.test(event.key)) {
      pending = undefined;
      lastInput = 0;
    }
  };
  const beforeInput = (event: InputEvent) => {
    if (composing || event.isComposing) return;
    beforeEdit();
    if (
      event.inputType === 'historyUndo' ||
      event.inputType === 'historyRedo'
    ) {
      event.preventDefault();
      historyMove(event.inputType === 'historyUndo' ? -1 : 1);
    } else if (event.inputType.startsWith('format')) {
      event.preventDefault();
      const mark = (
        {
          formatBold: 'bold',
          formatItalic: 'italic',
          formatStrikeThrough: 'strikethrough',
        } as Record<string, HtmlFormat>
      )[event.inputType];
      if (mark) format(mark);
    } else if (
      event.inputType === 'insertParagraph' ||
      event.inputType === 'insertLineBreak'
    ) {
      event.preventDefault();
      enter(event.inputType === 'insertLineBreak');
    } else if (event.inputType === 'insertText' && pending && event.data) {
      event.preventDefault();
      insertText(event.data, true);
    }
  };
  const input = () => {
    if (!composing) {
      ensureBlock();
      remember(true);
    }
  };
  const selectionChange = () => {
    const selected = doc.getSelection();
    if (!selected?.rangeCount || !owned(selected.getRangeAt(0))) return;
    savedRange = selected.getRangeAt(0).cloneRange();
    if (history[historyIndex]?.html === root.innerHTML)
      history[historyIndex].selection = bookmark();
    readSelection();
  };
  const pointer = () => {
    pending = undefined;
    lastInput = 0;
  };
  const paste = (event: ClipboardEvent) => {
    event.preventDefault();
    event.stopPropagation();
    pending = undefined;
    const text = event.clipboardData?.getData('text/plain');
    if (text) insertText(text);
  };
  const drop = (event: DragEvent) => {
    event.preventDefault();
    pending = undefined;
    const text = event.dataTransfer?.getData('text/plain');
    if (text) insertText(text);
  };
  const compositionStart = () => {
    beforeEdit();
    composing = true;
  };
  const compositionEnd = () => {
    composing = false;
    ensureBlock();
    remember();
  };
  const listeners = {
    keydown,
    beforeinput: beforeInput,
    input,
    pointerdown: pointer,
    paste,
    drop,
    compositionstart: compositionStart,
    compositionend: compositionEnd,
  };
  for (const [type, listener] of Object.entries(listeners))
    root.addEventListener(type, listener as EventListener);
  doc.addEventListener('selectionchange', selectionChange);
  setHtml(html);
  return {
    setHtml,
    format,
    block,
    focus: () => select(range()),
    captureSelection: () => {
      savedRange = range();
    },
    link: (value: string) => {
      if (
        !isSafeRichTextLink(value) ||
        elementAt(range().startContainer)?.closest('pre')
      )
        return false;
      beforeEdit();
      const current = range();
      pending = undefined;
      if (current.collapsed) {
        const anchor = elementAt(current.startContainer)?.closest('a');
        if (anchor && root.contains(anchor)) anchor.setAttribute('href', value);
        else {
          const a = doc.createElement('a');
          a.setAttribute('href', value);
          a.setAttribute('rel', 'noopener noreferrer');
          a.textContent = value;
          current.insertNode(a);
          current.selectNodeContents(a);
          current.collapse(false);
          select(current);
        }
      } else
        formatSelection(current, 'a', false, {
          href: value,
          rel: 'noopener noreferrer',
        });
      remember();
      return true;
    },
    destroy: () => {
      for (const [type, listener] of Object.entries(listeners))
        root.removeEventListener(type, listener as EventListener);
      doc.removeEventListener('selectionchange', selectionChange);
      savedRange = undefined;
      history = [];
    },
  };
}
export type HtmlEngine = ReturnType<typeof createHtmlEngine>;
