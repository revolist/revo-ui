import type { JSX } from 'preact';
import type { DropdownDataSource, DropdownRemoteText } from './remote';
export type {
  DropdownDataSource,
  DropdownRemoteText,
  LookupId,
  LookupCursor,
} from './remote';
export type DropdownRenderable = any;
export type DropdownVNode = any;
export type DropdownStyle =
  | string
  | Record<string, string | number | undefined>;

/**
 * An individual dropdown item. Disabled items stay visible with aria-disabled
 * and are skipped by keyboard navigation, including after search or sorting.
 * If all visible items are disabled, the list has no active option. Selected
 * disabled items remain stored; an enabled single-select choice may replace
 * one, while disabled multiselect values cannot be toggled or removed.
 * See the [Dropdown Editor guide](/guides/editors/editor-dropdown/).
 */
export type DropdownOption<T = any> = {
  value: T;
  label: string;
  /**
   * Keep this item visible but prohibit selection, toggling, and chip removal.
   * Defaults to false. Keyboard navigation skips disabled items. A stored
   * disabled value remains displayed and is never removed automatically.
   */
  disabled?: boolean;
  [key: string]: any;
};

export type SortDirection = 'asc' | 'desc' | 'none';

export type FilterFunction<T = any> = (
  option: DropdownOption<T>,
  searchValue: string,
) => boolean;

export type SortFunction<T = any> = (
  a: DropdownOption<T>,
  b: DropdownOption<T>,
  direction: SortDirection,
) => number;

export type DropdownConfig<T = any> = {
  // Search configuration
  search?: boolean;
  searchPlaceholder?: string;
  searchAriaLabel?: string;
  /** Localized title and accessible label for removing a selected chip. */
  removeLabel?: (label: string) => string;
  filterFunction?: FilterFunction<T>;

  // Sorting configuration
  sortDirection?: SortDirection;
  sortFunction?: SortFunction<T>;

  // Behavior configuration
  closeOnClickOutside?: boolean;
  autoFocus?: boolean;
  autoOpen?: boolean;
  multiSelect?: boolean;
  autocomplete?: boolean;
  /** Initial text for searchable dropdowns, used by grid quick-edit. */
  initialSearch?: string;
  /** Close the dropdown when Tab is pressed inside the open popup. */
  closeOnTab?: boolean;
  /** Dismiss then let the browser Tab from the trigger (standalone fields). */
  nativeTabNavigation?: boolean;

  // Portal configuration
  portalTarget?: HTMLElement | null;
  topLayer?: boolean;

  // Accessibility
  ariaLabel?: string;
  ariaLabelledBy?: string;
  ariaDescribedBy?: string;

  // Layout configuration
  maxHeight?: number;
  theme?: string | null;

  // Custom class for popup
  popupClassName?: string;
};

interface HyperFunc<T> {
  (...tag: any[]): T;
}

/**
 * Standalone dropdown properties. `disabled` is boolean-only; per-cell callbacks
 * belong to [DropdownColumnProps](/api/editor-dropdown/). Option-level disabling
 * uses DropdownOption.disabled and does not disable the entire dropdown.
 */
export interface DropdownEnvironment {
  onOpen?: (trigger: HTMLElement, close: () => void) => void | (() => void);
  onPointerRelease?: (event: MouseEvent | TouchEvent) => void;
}

export type DropdownProps<T = any> = {
  environment?: DropdownEnvironment;
  triggerAttributes?: JSX.HTMLAttributes<HTMLDivElement>;
  // Core props
  source: DropdownOption<T>[];
  /** Optional application-owned remote search and ID resolver. Values must be string/number IDs. */
  dataSource?: DropdownDataSource<T>;
  /** Row/application context; changing its identity invalidates the remote session. */
  dataContext?: unknown;
  remoteText?: Partial<DropdownRemoteText>;
  value?: T | T[];
  placeholder?: string;
  /**
   * Disable all dropdown interaction, including autoOpen and chip removal.
   * Defaults to false. Disabling an open dropdown closes it once; re-enabling
   * does not reopen it automatically. For grid callbacks, use DropdownColumnProps.
   * See the [Dropdown Editor guide](/guides/editors/editor-dropdown/).
   */
  disabled?: boolean;
  name?: string;
  id?: string;
  className?: string;
  style?: DropdownStyle;

  // Configuration
  config?: DropdownConfig<T>;

  onChange?: (value: T | T[]) => void;
  onClose?: (focusNext?: boolean) => void;
  /** Validate or save a draft before outside-pointer dismissal. False keeps it open.
   * Escape, selection and programmatic closure never invoke this callback.
   */
  beforeOutsideClose?: () => boolean | void;
  /** Replace the popup body while retaining the shared trigger, tags and positioning.
   * Custom content owns its keyboard navigation and renders a dialog with `id`.
   */
  renderContent?: (props: {
    id: string;
    close: (focusNext?: boolean) => void;
  }) => DropdownRenderable;
  // Templates
  renderOption?: (
    h: HyperFunc<DropdownVNode>,
    option: DropdownOption<T>,
    isSelected: boolean,
  ) => DropdownRenderable;
  /**
   * Render the content of each selected value while preserving the built-in
   * single/multi-select wrappers, remove controls, and expand indicator.
   */
  renderValue?: (
    h: HyperFunc<DropdownVNode>,
    option: DropdownOption<T>,
  ) => DropdownRenderable;
  renderPlaceholder?: (
    h: HyperFunc<DropdownVNode>,
    placeholder: string,
    children: DropdownRenderable,
  ) => DropdownRenderable;
  /**
   * Render the selected value
   */
  renderSelectedValue?: (
    h: HyperFunc<DropdownVNode>,
    selectedOptions: DropdownOption<T>[],
    children: DropdownRenderable,
  ) => DropdownRenderable;
  renderNoResults?: (h: HyperFunc<DropdownVNode>) => DropdownRenderable;
};
