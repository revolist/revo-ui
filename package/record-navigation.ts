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
  const root = doc.createElement('div');
  root.className = ['rv-record-navigation', options.className].filter(Boolean).join(' ');
  root.setAttribute('role', 'group');
  root.setAttribute('aria-label', options.label);
  const createButton = (label: string, text: string, disabled: boolean, click: () => void) => {
    const button = doc.createElement('button');
    button.type = 'button';
    button.className = 'rv-btn';
    button.textContent = text;
    button.setAttribute('aria-label', label);
    button.disabled = disabled;
    button.addEventListener('click', click);
    return button;
  };
  const position = doc.createElement('span');
  position.textContent = options.label;
  root.append(
    createButton(options.previousLabel, options.previousText ?? '⌃', options.index <= 0, options.onPrevious),
    position,
    createButton(options.nextLabel, options.nextText ?? '⌄', options.index >= options.count - 1, options.onNext),
  );
  return root;
}
