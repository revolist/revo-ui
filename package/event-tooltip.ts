/** Presentation-only content for a rich event tooltip. All strings are supplied by the host. */
export interface EventTooltipContent {
  title: string;
  dates: readonly { label: string; month: string; day: string; value: string }[];
  description?: string;
  people?: readonly { name: string; avatarUrl?: string }[];
  peopleLabel?: string;
  details?: readonly string[];
}

/** Create safe, reusable tooltip content in the owning document. */
export function createEventTooltipContent(doc: Document, content: EventTooltipContent): HTMLElement {
  const node = (tag: string, className: string, text?: string) => {
    const element = doc.createElement(tag);
    element.className = className;
    if (text) element.textContent = text;
    return element;
  };
  const root = node('div', 'rv-event-tooltip');
  root.append(node('div', 'rv-event-tooltip__title', content.title));
  for (const date of content.dates) {
    const row = node('div', 'rv-event-tooltip__date');
    const badge = node('span', 'rv-event-tooltip__badge');
    badge.setAttribute('aria-hidden', 'true');
    badge.append(node('span', '', date.month), node('strong', '', date.day));
    const text = node('span', 'rv-event-tooltip__date-text');
    text.append(node('span', 'rv-event-tooltip__label', date.label), node('span', '', date.value));
    row.append(badge, text);
    root.append(row);
  }
  if (content.description) root.append(node('p', 'rv-event-tooltip__description', content.description));
  if (content.people?.length || content.details?.length) {
    const footer = node('div', 'rv-event-tooltip__footer');
    if (content.people?.length) {
      const people = node('span', 'rv-event-tooltip__people');
      if (content.peopleLabel) people.setAttribute('aria-label', content.peopleLabel);
      for (const person of content.people) {
        if (person.avatarUrl) {
          const image = doc.createElement('img');
          image.src = person.avatarUrl;
          image.alt = person.name;
          people.append(image);
        } else people.append(node('span', '', person.name));
      }
      footer.append(people);
    }
    for (const detail of content.details ?? []) footer.append(node('span', '', detail));
    root.append(footer);
  }
  return root;
}
