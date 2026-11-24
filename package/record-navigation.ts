import upIcon from '@fortawesome/fontawesome-free/svgs/solid/chevron-up.svg?raw';
import downIcon from '@fortawesome/fontawesome-free/svgs/solid/chevron-down.svg?raw';

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
export function createRecordNavigation(
  doc: Document,
  options: RecordNavigationOptions,
): HTMLElement {
  const root = doc.createElement('div');
  root.className = ['rv-record-navigation', options.className]
    .filter(Boolean)
    .join(' ');
  root.setAttribute('role', 'group');
  root.setAttribute('aria-label', options.label);
  const createButton = (
    label: string,
    text: string | undefined,
    icon: string,
    disabled: boolean,
    click: () => void,
  ) => {
    const button = doc.createElement('button');
    button.type = 'button';
    button.className = 'rv-btn rv-record-navigation__button';
    if (text !== undefined) button.textContent = text;
    else {
      button.innerHTML = icon;
      button.querySelector('svg')?.setAttribute('aria-hidden', 'true');
    }
    button.setAttribute('aria-label', label);
    button.disabled = disabled;
    button.addEventListener('click', click);
    return button;
  };
  const position = doc.createElement('span');
  position.className = 'rv-record-navigation__position';
  position.textContent = options.label;
  root.append(
    createButton(
      options.previousLabel,
      options.previousText,
      upIcon,
      options.index <= 0,
      options.onPrevious,
    ),
    position,
    createButton(
      options.nextLabel,
      options.nextText,
      downIcon,
      options.index >= options.count - 1,
      options.onNext,
    ),
  );
  return root;
}
