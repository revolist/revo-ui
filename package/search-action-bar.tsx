import { h, type ComponentChildren } from 'preact';
import { SearchInput, type SearchInputProps } from './search-input';
import { createSearchInput } from './search-input/native';
import { createPreactElement, releasePreactElement } from './preact-mount';
import { TooltipController } from './core/popover-controller';

/** Search with caller-owned actions, such as filters, column controls or export. */
export interface SearchActionBarProps extends SearchInputProps {
  actions?: ComponentChildren;
  className?: string;
}
export function SearchActionBar({
  actions,
  className,
  ...search
}: SearchActionBarProps) {
  return (
    <div class={`rv-search-action-bar ${className ?? ''}`}>
      <SearchInput {...search} />
      {actions && <div class="rv-search-action-bar__actions">{actions}</div>}
    </div>
  );
}

export interface NativeSearchActionBarOptions {
  label: string;
  placeholder?: string;
  shortcut?: string;
  className?: string;
}
/** Native adapter retains ownership of supplied action nodes and their handlers. */
export function createSearchActionBar(
  document: Document,
  options: NativeSearchActionBarOptions,
) {
  const search = createSearchInput(document, {
    shortcut: options.shortcut,
    inputAttributes: {
      'aria-label': options.label,
      placeholder: options.placeholder ?? options.label,
    },
  });
  search.root
    .querySelector('.rv-search-input-shortcut')
    ?.setAttribute('aria-hidden', 'true');
  const element = createPreactElement<HTMLDivElement>(document, h('div', {}));
  element.className = ['rv-search-action-bar', options.className]
    .filter(Boolean)
    .join(' ');
  const actions = createPreactElement<HTMLDivElement>(document, h('div', {}));
  let releaseTooltips: (() => void)[] = [];
  const clearTooltips = () => {
    releaseTooltips.forEach((dispose) => dispose());
    releaseTooltips = [];
  };
  actions.className = 'rv-search-action-bar__actions';
  element.append(search.root, actions);
  const onShortcut = (event: KeyboardEvent) => {
    if (
      !options.shortcut ||
      event.key !== options.shortcut ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey ||
      document.querySelector('dialog[open]')
    )
      return;
    const target = event.target as HTMLElement | null;
    if (
      target?.isContentEditable ||
      target?.matches('input, textarea, select') ||
      target?.closest('[role=combobox], [role=listbox]')
    )
      return;
    event.preventDefault();
    search.input.focus();
  };
  if (options.shortcut) document.addEventListener('keydown', onShortcut);
  return {
    element,
    input: search.input,
    setActions(nodes: readonly Element[]) {
      clearTooltips();
      actions.replaceChildren(...nodes);
      actions.hidden = !nodes.length;
      for (const node of nodes) {
        const trigger = node.matches('button[aria-label], summary[aria-label]')
          ? node
          : node.querySelector('summary[aria-label]');
        const label = trigger?.getAttribute('aria-label');
        if (
          !trigger ||
          !label ||
          !(trigger instanceof document.defaultView!.HTMLElement)
        )
          continue;
        const originalTitle = trigger.getAttribute('title');
        trigger.removeAttribute('title');
        const release = new TooltipController().bind(trigger, label, {
          delay: 200,
          focusDelay: 200,
          transitionDuration: 160,
        });
        releaseTooltips.push(() => {
          release();
          if (originalTitle !== null)
            trigger.setAttribute('title', originalTitle);
        });
      }
    },
    destroy() {
      clearTooltips();
      document.removeEventListener('keydown', onShortcut);
      releasePreactElement(search.root);
      element.remove();
    },
  };
}
