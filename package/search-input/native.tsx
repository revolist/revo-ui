import { h } from 'preact';
import { createPreactElement } from '../preact-mount';
import { controlClassName, renderControl } from '../control-presentation';

/** Shared outlined search icon for all search field adapters. */
export function renderDefaultSearchIcon<H extends (...args: any[]) => any>(
  h: H,
): ReturnType<H> {
  return h(
    'svg',
    {
      width: '13',
      height: '13',
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': '2',
    },
    h('circle', { cx: '11', cy: '11', r: '8' }),
    h('line', { x1: '21', y1: '21', x2: '16.65', y2: '16.65' }),
  );
}

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
      'data-part': 'root',
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
          'data-part': 'icon',
          'aria-hidden': 'true',
        },
        options.icon,
      ),
    options.leading,
    renderControl(h, 'input', {
      type: 'search',
      'data-part': 'input',
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
          'data-part': 'shortcut',
        },
        shortcut,
      ),
    options.trailing,
  );
}
export function createSearchInput(
  document: Document,
  options: Omit<SearchPresentation, 'icon'> & { iconSvg?: string },
) {
  const root = createPreactElement(
    document,
    renderSearchInput(h, {
      ...options,
      icon:
        options.iconSvg === undefined ? (
          renderDefaultSearchIcon(h)
        ) : (
          <span dangerouslySetInnerHTML={{ __html: options.iconSvg }} />
        ),
    }),
  );
  return { root, input: root.querySelector<HTMLInputElement>('input')! };
}
