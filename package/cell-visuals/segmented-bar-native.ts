import { renderSegmentedBar, type SegmentedBarOptions } from './segmented-bar';

/** Create the shared segmented bar for a native DOM host. */
export function createSegmentedBarElement(doc: Document, options: SegmentedBarOptions): HTMLElement {
  const create = (tag: string, props: Record<string, unknown>, children?: HTMLElement[]) => {
    const element = doc.createElement(tag);
    for (const [key, value] of Object.entries(props)) {
      if (key === 'style' && value && typeof value === 'object') Object.assign(element.style, value);
      else if (value != null) element.setAttribute(key, String(value));
    }
    element.append(...(children ?? []));
    return element;
  };
  return renderSegmentedBar(create, options) as HTMLElement;
}
