import { render, hydrate, type ComponentChildren, type VNode } from 'preact';

const mounts = new WeakMap<Element, DocumentFragment>();

/** Compatibility boundary for hosts that accept an element instead of a VNode.
 * All markup is rendered by Preact; the fragment supplies the owning document. */
export function createPreactElement<T extends Element = HTMLElement>(
  document: Document,
  view: VNode<any>,
  existing?: Element,
): T {
  const container = document.createDocumentFragment();
  if (
    typeof view.type === 'string' &&
    [
      'g',
      'rect',
      'line',
      'text',
      'title',
      'path',
      'circle',
      'polyline',
    ].includes(view.type)
  )
    Object.defineProperty(container, 'namespaceURI', {
      value: 'http://www.w3.org/2000/svg',
    });
  if (existing) container.append(existing);
  // Browser DOM insertion adopts nodes into this fragment's owner document.
  // Only isolated server renders need a temporary ambient document for Preact.
  withOwnerDocument(document, () => {
    if (existing) hydrate(view, container);
    else render(view, container);
  });
  const element = container.firstChild as T;
  if (!element || element.nodeType !== 1)
    throw new Error('Expected one Preact element root');
  mounts.set(element, container);
  return element;
}

/** Reattach a detached root before unmounting so Preact can release refs/effects. */
export function releasePreactElement(element: Element): void {
  const container = mounts.get(element);
  if (!container) return;
  container.append(element);
  withOwnerDocument(element.ownerDocument, () => render(null, container));
  mounts.delete(element);
}

/** Renders into an existing native host, including isolated owner documents. */
export function renderPreactInto(host: Element, view: ComponentChildren): void {
  withOwnerDocument(host.ownerDocument, () => render(view, host));
}

function withOwnerDocument(document: Document, callback: () => void): void {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'document');
  const replaceDocument = typeof globalThis.document === 'undefined';
  if (replaceDocument)
    Object.defineProperty(globalThis, 'document', {
      configurable: true,
      value: document,
    });
  try {
    callback();
  } finally {
    if (replaceDocument) {
      if (descriptor) Object.defineProperty(globalThis, 'document', descriptor);
      else Reflect.deleteProperty(globalThis, 'document');
    }
  }
}
