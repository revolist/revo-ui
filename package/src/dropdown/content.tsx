/** @jsxRuntime automatic */
/** @jsxImportSource preact */
import { Fragment, h, type ComponentChildren, type RefObject } from 'preact';
import { useCallback, useEffect, useLayoutEffect, useRef } from 'preact/compat';
import type { DropdownConfig, DropdownOption } from './dropdown.types';
import { useSelectionListTooltips } from '../core/selection-list-tooltips';
import { useDropdownService } from './dropdown.service';
import { ButtonControl as Button } from '../native-control';
import type { RemoteDropdownState, DropdownRemoteText } from './remote';

// DropdownContent component - Contains the options, search, etc.
type DropdownContentProps<T = any> = {
  options: DropdownOption<T>[];
  filteredOptions: DropdownOption<T>[];
  multiSelect: boolean;
  focusedIndex: number;
  selectedOptions: DropdownOption<T>[];
  onKeyDown: (e: KeyboardEvent) => void;
  onSelect: (option: DropdownOption<T>) => void;
  onFocusChange: (index: number) => void;
  renderOption?: (
    h: any,
    option: DropdownOption<T>,
    isSelected: boolean,
  ) => ComponentChildren;
  renderNoResults?: (h: any) => ComponentChildren;
  dropdownListRef: RefObject<HTMLUListElement>;
  theme?: string | null;
  optionIdPrefix: string;
};
// DropdownPopupContent component that includes the service
export function DropdownPopupContent<T = any>({
  options,
  selectedValues,
  remote,
  value,
  onChange,
  config,
  multiSelect,
  search,
  searchPlaceholder,
  listboxId,
  searchId,
  renderOption,
  renderNoResults,
  onClose,
  onTabNavigation,
  theme,
}: {
  options: DropdownOption<T>[];
  selectedValues?: DropdownOption<T>[];
  remote?: RemoteDropdownState<T> & {
    text: DropdownRemoteText;
    search: (query: string) => void;
    loadMore: () => void;
    retry: () => void;
  };
  value: T | T[] | undefined;
  onChange: (value: T | T[]) => void;
  config: DropdownConfig<T>;
  multiSelect: boolean;
  search: boolean;
  searchPlaceholder: string;
  listboxId: string;
  searchId: string;
  renderOption?: (
    h: any,
    option: DropdownOption<T>,
    isSelected: boolean,
  ) => ComponentChildren;
  renderNoResults?: (h: any) => ComponentChildren;
  onClose: (focusNext?: boolean) => void;
  onTabNavigation?: () => void;
  theme?: string | null;
}) {
  // Refs
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listboxRef = useRef<HTMLDivElement>(null);
  const dropdownListRef = useRef<HTMLUListElement>(null);
  const revealActiveOption = useRef(false);

  // Use the dropdown service
  const {
    searchValue,
    focusedIndex,
    selectedOptions,
    filteredOptions,
    handleSelect,
    handleKeyDown,
    handleSearchChange,
    setFocusedIndex,
  } = useDropdownService(
    options,
    value,
    onChange,
    config,
    onClose,
    remote && { selected: selectedValues ?? [], search: remote.search },
  );
  const activeOptionId =
    focusedIndex >= 0 &&
    focusedIndex < filteredOptions.length &&
    !filteredOptions[focusedIndex].disabled
      ? `${listboxId}-option-${focusedIndex}`
      : undefined;

  useLayoutEffect(() => {
    const list = dropdownListRef.current;
    if (!revealActiveOption.current || !list || !activeOptionId) return;
    revealActiveOption.current = false;
    const option = list.ownerDocument.getElementById(activeOptionId);
    if (!option) return;
    const bounds = list.getBoundingClientRect();
    const { top, bottom } = option.getBoundingClientRect();
    if (top < bounds.top) list.scrollTop += top - bounds.top;
    else if (bottom > bounds.bottom) list.scrollTop += bottom - bounds.bottom;
  });

  const tooltipRef = useSelectionListTooltips();
  const setListboxRef = useCallback(
    (element: HTMLDivElement | null) => {
      listboxRef.current = element;
      tooltipRef(element);
    },
    [tooltipRef],
  );

  // Handle autofocus
  useEffect(() => {
    if (!config.autoFocus) {
      return;
    }

    const focusDropdown = () => {
      if (search && searchInputRef.current) {
        searchInputRef.current.focus({ preventScroll: true });
        return;
      }

      listboxRef.current?.focus({ preventScroll: true });
    };

    const ownerWindow =
      listboxRef.current?.ownerDocument.defaultView ??
      (typeof window !== 'undefined' ? window : undefined);
    if (!ownerWindow) return;

    focusDropdown();
    const timeoutId = ownerWindow.setTimeout(focusDropdown, 0);
    const frameId = ownerWindow.requestAnimationFrame(focusDropdown);
    const delayedTimeoutId = ownerWindow.setTimeout(focusDropdown, 16);

    return () => {
      ownerWindow.clearTimeout(timeoutId);
      ownerWindow.cancelAnimationFrame(frameId);
      ownerWindow.clearTimeout(delayedTimeoutId);
    };
  }, [config.autoFocus, search]);

  return (
    <div
      ref={setListboxRef}
      className={`dropdown-listbox`}
      data-theme={theme ?? 'default'}
      role="listbox"
      id={listboxId}
      aria-multiselectable={multiSelect}
      aria-activedescendant={activeOptionId}
      tabIndex={-1}
      aria-busy={remote?.loading}
      onScrollCapture={(event) => {
        const target = event.target as HTMLElement;
        if (
          remote &&
          target.scrollHeight - target.scrollTop - target.clientHeight < 48
        )
          remote.loadMore();
      }}
      onKeyUp={(event) => event.stopPropagation()}
      onKeyDown={(e) => {
        // Open menus own their keys; the grid must not start another editor.
        e.stopPropagation();
        if (e.key === 'Escape') {
          e.preventDefault();
          e.stopPropagation();
          onClose(false);
        } else if (e.key === 'Tab') {
          if (config.nativeTabNavigation && onTabNavigation) {
            onTabNavigation();
            return;
          }
          e.preventDefault();
          e.stopPropagation();
          if (config.closeOnTab) {
            onClose(true);
          }
        } else if (!(e.key === ' ' && e.target === searchInputRef.current)) {
          revealActiveOption.current =
            e.key === 'ArrowDown' || e.key === 'ArrowUp';
          handleKeyDown(e);
        }
      }}
    >
      {search && (
        <div className="dropdown-search">
          <input
            ref={searchInputRef}
            type="text"
            id={searchId}
            className={`dropdown-search-input ${theme ? `theme-${theme}` : ''}`}
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={handleSearchChange}
            onInput={handleSearchChange}
            aria-label={config.searchAriaLabel ?? 'Search options'}
          />
        </div>
      )}
      {remote?.loading && <div role="status">{remote.text.loading}</div>}
      {remote?.error && (
        <div role="alert">
          {remote.text.error}{' '}
          <Button onClick={remote.retry}>{remote.text.retry}</Button>
        </div>
      )}
      <DropdownContent
        options={options}
        filteredOptions={filteredOptions}
        multiSelect={multiSelect}
        focusedIndex={focusedIndex}
        selectedOptions={selectedOptions}
        onKeyDown={handleKeyDown}
        onSelect={handleSelect}
        onFocusChange={setFocusedIndex}
        renderOption={renderOption}
        renderNoResults={
          remote
            ? () => (remote.loading || remote.error ? null : remote.text.empty)
            : renderNoResults
        }
        dropdownListRef={dropdownListRef}
        theme={theme}
        optionIdPrefix={listboxId}
      />
      {remote?.hasMore && (
        <Button disabled={remote.loading} onClick={remote.loadMore}>
          {remote.text.loadMore}
        </Button>
      )}
    </div>
  );
}
export function DropdownContent<T = any>({
  options,
  filteredOptions,
  multiSelect,
  focusedIndex,
  selectedOptions,
  onKeyDown,
  onSelect,
  onFocusChange,
  renderOption,
  renderNoResults,
  dropdownListRef,
  theme,
  optionIdPrefix,
}: DropdownContentProps<T>) {
  // Check if an option is selected
  const isOptionSelected = useCallback(
    (option: DropdownOption<T>) => {
      return selectedOptions.some(
        (selected) =>
          JSON.stringify(selected.value) === JSON.stringify(option.value),
      );
    },
    [selectedOptions],
  );

  // Render option
  const renderOptionItem = useCallback(
    (option: DropdownOption<T>, index: number) => {
      const isSelected = isOptionSelected(option);
      const isFocused = focusedIndex === index;

      return (
        <li
          key={`${option.label}-${index}`}
          id={`${optionIdPrefix}-option-${index}`}
          role="option"
          data-value={
            typeof option.value === 'string' || typeof option.value === 'number'
              ? String(option.value)
              : undefined
          }
          aria-selected={isSelected}
          aria-disabled={option.disabled}
          tabIndex={-1}
          className={`dropdown-option ${isSelected ? 'selected' : ''} ${isFocused ? 'focused' : ''} ${option.disabled ? 'disabled' : ''} ${theme ? `theme-${theme}` : ''}`}
          onClick={() => onSelect(option)}
          onMouseEnter={() => {
            if (!option.disabled) onFocusChange(index);
          }}
        >
          {renderOption ? (
            renderOption(h, option, isSelected)
          ) : (
            <div className="option-content">
              {multiSelect && (
                <input
                  type="checkbox"
                  checked={isSelected}
                  readOnly
                  disabled={option.disabled}
                  tabIndex={-1}
                  aria-hidden="true"
                />
              )}
              <span>{option.label}</span>
            </div>
          )}
        </li>
      );
    },
    [
      focusedIndex,
      onSelect,
      isOptionSelected,
      multiSelect,
      renderOption,
      onFocusChange,
      theme,
    ],
  );

  return (
    <>
      <ul
        ref={dropdownListRef}
        className="dropdown-options"
        role="presentation"
        tabIndex={-1}
      >
        {filteredOptions.length > 0 ? (
          filteredOptions.map(renderOptionItem)
        ) : (
          <li className="no-results">
            {renderNoResults ? (
              renderNoResults(h)
            ) : (
              <span>No results found</span>
            )}
          </li>
        )}
      </ul>
    </>
  );
}
