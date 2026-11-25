import { h } from 'preact';
import upIcon from '@fortawesome/fontawesome-free/svgs/solid/chevron-up.svg?raw';
import downIcon from '@fortawesome/fontawesome-free/svgs/solid/chevron-down.svg?raw';
import { createPreactElement } from './preact-mount';
import { renderControl } from './control-presentation';
import { SvgIcon } from './icons/icon';

/** Presentation and callbacks supplied by the record detail host. */
export interface RecordNavigationOptions {
  index: number;
  count: number;
  label: string;
  previousLabel: string;
  nextLabel: string;
  previousText?: string;
  nextText?: string;
  className?: string;
  onPrevious: () => void;
  onNext: () => void;
}

/** Create a bounded previous/next control for navigating records. */
export function createRecordNavigation(doc: Document, options: RecordNavigationOptions): HTMLElement {
  return createPreactElement(doc, h('div', { class: ['rv-record-navigation', options.className].filter(Boolean).join(' '), role: 'group', 'aria-label': options.label },
    renderControl(h, 'button', { class: 'rv-record-navigation__button', 'aria-label': options.previousLabel, disabled: options.index <= 0, onClick: options.onPrevious }, options.previousText ?? h(SvgIcon, { svg: upIcon.replace('<svg ', '<svg aria-hidden="true" ') })),
    h('span', { class: 'rv-record-navigation__position' }, options.label),
    renderControl(h, 'button', { class: 'rv-record-navigation__button', 'aria-label': options.nextLabel, disabled: options.index >= options.count - 1, onClick: options.onNext }, options.nextText ?? h(SvgIcon, { svg: downIcon.replace('<svg ', '<svg aria-hidden="true" ') })),
  ));
}
