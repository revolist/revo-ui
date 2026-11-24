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
  const card = doc.createElement('section');
  card.className = classes.card;
  card.setAttribute('aria-label', title);
  const heading = doc.createElement('div');
  heading.className = classes.heading;
  const name = doc.createElement('strong');
  name.textContent = title;
  const description = doc.createElement('small');
  description.textContent = subtitle;
  heading.append(name, description);
  const body = doc.createElement('div');
  body.className = classes.body;
  card.append(heading, body);
  return { card, body };
}
