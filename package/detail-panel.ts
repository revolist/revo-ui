import { h } from 'preact';
import { createPreactElement } from './preact-mount';
/** Classes supplied by a host composing a detail panel. */
export interface DetailPanelClasses {
  card: string;
  heading: string;
  body: string;
}

/** Create a labelled detail panel with a heading and an application-owned body. */
export function createDetailPanel(
  title: string,
  subtitle: string,
  classes: DetailPanelClasses,
  doc: Document = document,
): { card: HTMLElement; body: HTMLDivElement } {
  let body!: HTMLDivElement;
  const card = createPreactElement<HTMLElement>(doc, h('section', { class: classes.card, 'aria-label': title },
    h('div', { class: classes.heading }, h('strong', null, title), h('small', null, subtitle)),
    h('div', { class: classes.body, ref: (node: HTMLDivElement | null) => { if (node) body = node; } }),
  ));
  return { card, body };
}
