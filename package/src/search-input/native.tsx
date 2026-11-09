import { h } from 'preact';
import { createPreactElement } from '../preact-mount';
import { controlClassName, renderControl } from '../control-presentation';

export interface SearchPresentation {
  rootClassName?: string;
  inputClassName?: string;
  iconClassName?: string;
  shortcutClassName?: string;
  hideIcon?: boolean;
  icon?: any;
  shortcut?: any;
  leading?: any;
  trailing?: any;
  testId?: string;
  inputAttributes?: Record<string, any>;
}
/** One search composition for native, grid and Preact rendering. */
export function renderSearchInput<H extends (...args: any[]) => any>(
  h: H,
  options: SearchPresentation,
): ReturnType<H> {
  const { shortcut, hideIcon, inputAttributes = {} } = options;
  return h(
    'div',
    {
      class: controlClassName(
        'rv-search-input',
        hideIcon && 'rv-search-input--no-icon',
        shortcut === undefined && 'rv-search-input--no-shortcut',
        options.rootClassName,
      ),
      'data-testid': options.testId,
    },
    !hideIcon &&
      h(
        'span',
        {
          class: controlClassName(
            'rv-search-input-icon',
            options.iconClassName,
          ),
          'aria-hidden': 'true',
        },
        options.icon,
      ),
    options.leading,
    renderControl(h, 'input', {
      type: 'search',
      ...inputAttributes,
      class: controlClassName(options.inputClassName, inputAttributes.class),
    }),
    shortcut !== undefined &&
      h(
        'span',
        {
          class: controlClassName(
            'rv-search-input-shortcut',
            options.shortcutClassName,
          ),
        },
        shortcut,
      ),
    options.trailing,
  );
}
export function createSearchInput(
  document: Document,
  options: Omit<SearchPresentation, 'icon'> & { iconSvg: string },
) {
  const root = createPreactElement(
    document,
    renderSearchInput(h, {
      ...options,
      icon: <span dangerouslySetInnerHTML={{ __html: options.iconSvg }} />,
    }),
  );
  return { root, input: root.querySelector<HTMLInputElement>('input')! };
}
