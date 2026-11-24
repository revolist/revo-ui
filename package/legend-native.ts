import { renderLegend, type LegendProps } from './legend';

/** Create the shared legend in a native DOM host. */
export function createLegendElement(doc: Document, options: LegendProps): HTMLElement {
  const create = (tag: string, props: Record<string, unknown>, children?: unknown[]) => {
    const node = doc.createElement(tag);
    for (const [key, value] of Object.entries(props)) {
      if (value == null || key === 'key') continue;
      if (key === 'style' && typeof value === 'object') {
        for (const [name, cssValue] of Object.entries(value)) node.style.setProperty(name, String(cssValue));
      } else node.setAttribute(key, String(value));
    }
    for (const child of children ?? []) node.append(child instanceof doc.defaultView!.Node ? child : doc.createTextNode(String(child)));
    return node;
  };
  return renderLegend(create, options) as HTMLElement;
}
