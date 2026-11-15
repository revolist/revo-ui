import { h } from 'preact';
import { createPreactElement } from './preact-mount';

/** Presentation-only content for a rich event tooltip. All strings are supplied by the host. */
export interface EventTooltipContent {
  title: string;
  dates: readonly {
    label: string;
    month: string;
    day: string;
    value: string;
  }[];
  description?: string;
  people?: readonly { name: string; avatarUrl?: string }[];
  peopleLabel?: string;
  details?: readonly string[];
}

/** Create safe, reusable tooltip content in the owning document. */
export function createEventTooltipContent(
  doc: Document,
  content: EventTooltipContent,
): HTMLElement {
  return doc.adoptNode(
    createPreactElement<HTMLElement>(
      doc,
      h(
        'div',
        { class: 'rv-event-tooltip' },
        h('div', { class: 'rv-event-tooltip__title' }, content.title),
        content.dates.map((date) =>
          h(
            'div',
            { class: 'rv-event-tooltip__date' },
            h(
              'span',
              { class: 'rv-event-tooltip__badge', 'aria-hidden': 'true' },
              h('span', null, date.month),
              h('strong', null, date.day),
            ),
            h(
              'span',
              { class: 'rv-event-tooltip__date-text' },
              h('span', { class: 'rv-event-tooltip__label' }, date.label),
              h('span', null, date.value),
            ),
          ),
        ),
        content.description &&
          h(
            'p',
            { class: 'rv-event-tooltip__description' },
            content.description,
          ),
        !!(content.people?.length || content.details?.length) &&
          h(
            'div',
            { class: 'rv-event-tooltip__footer' },
            !!content.people?.length &&
              h(
                'span',
                {
                  class: 'rv-event-tooltip__people',
                  'aria-label': content.peopleLabel || undefined,
                },
                content.people.map((person) =>
                  person.avatarUrl
                    ? h('img', { src: person.avatarUrl, alt: person.name })
                    : h('span', null, person.name),
                ),
              ),
            content.details?.map((detail) => h('span', null, detail)),
          ),
      ),
    ),
  );
}
