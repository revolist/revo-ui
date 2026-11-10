/** @jsxImportSource preact */
import { h } from 'preact';
import {
  useState,
  useCallback,
  useMemo,
  useEffect,
  useLayoutEffect,
  useRef,
} from 'preact/hooks';
import type {
  DropdownConfig,
  DropdownOption,
  FilterFunction,
  SortFunction,
} from './dropdown.types';

type DropdownInputEvent = Event & { currentTarget: HTMLInputElement };

// Default filter function
const defaultFilterFunction: FilterFunction = (option, searchValue) => {
  return option.label.toLowerCase().includes(searchValue.toLowerCase());
};

// Default sort function
const defaultSortFunction: SortFunction = (a, b, direction) => {
  if (direction === 'none') return 0;

  const comparison = a.label.localeCompare(b.label);
  return direction === 'asc' ? comparison : -comparison;
};

function getSelectedOptions<T>(
  options: DropdownOption<T>[],
  value: T | T[] | undefined,
  multiSelect: boolean,
) {
  if (value === undefined) {
    return [];
  }

  if (multiSelect && Array.isArray(value)) {
    return options.filter((option) =>
      (value as T[]).some(
        (v) => JSON.stringify(v) === JSON.stringify(option.value),
      ),
    );
  }

  const selected = options.find(
    (option) => JSON.stringify(option.value) === JSON.stringify(value),
  );
  return selected ? [selected] : [];
}

export function useDropdownService<T = any>(
  options: DropdownOption<T>[],
  value: T | T[] | undefined,
  onChange: (value: T | T[]) => void,
  config: DropdownConfig<T> = {},
  onClose?: () => void,
  remote?: { selected: DropdownOption<T>[]; search: (query: string) => void },
) {
  // Default configuration
  const {
    search = false,
    filterFunction = defaultFilterFunction,
    sortDirection = 'none',
    sortFunction = defaultSortFunction,
    multiSelect = false,
    autocomplete = false,
    initialSearch = '',
  } = config;

  // State
  const [searchValue, setSearchValue] = useState(initialSearch);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [selectedOptions, setSelectedOptions] = useState<DropdownOption<T>[]>(
    () => getSelectedOptions(options, value, multiSelect),
  );
  const userNavigatedRef = useRef(false);

  // Find selected options based on value
  useEffect(() => {
    setSelectedOptions(
      remote?.selected ?? getSelectedOptions(options, value, multiSelect),
    );
  }, [value, options, multiSelect, remote?.selected]);

  // Filter and sort options
  const filteredOptions = useMemo(() => {
    if (remote) return options;
    let result = [...options];

    // Apply filtering if search is enabled and there's a search value
    if (search && searchValue) {
      result = result.filter((option) => filterFunction(option, searchValue));
    }

    // Apply sorting
    if (sortDirection !== 'none') {
      result.sort((a, b) => sortFunction(a, b, sortDirection));
    }

    return result;
  }, [
    options,
    search,
    searchValue,
    filterFunction,
    sortDirection,
    sortFunction,
    !!remote,
  ]);

  // Reset before the mounted search field can receive its first input.
  useLayoutEffect(() => {
    userNavigatedRef.current = false;
    setSearchValue(initialSearch);
  }, [initialSearch]);

  useEffect(() => {
    if (!filteredOptions.length) {
      setFocusedIndex(-1);
      return;
    }

    setFocusedIndex((currentIndex) => {
      if (
        userNavigatedRef.current &&
        currentIndex >= 0 &&
        currentIndex < filteredOptions.length &&
        !filteredOptions[currentIndex].disabled
      ) {
        return currentIndex;
      }

      const selectedIndex = filteredOptions.findIndex(
        (option) =>
          !option.disabled &&
          selectedOptions.some(
            (selected) =>
              JSON.stringify(selected.value) === JSON.stringify(option.value),
          ),
      );
      if (selectedIndex >= 0) {
        const currentOption = filteredOptions[currentIndex];
        const currentIsSelected = selectedOptions.some(
          (selected) =>
            JSON.stringify(selected.value) ===
            JSON.stringify(currentOption?.value),
        );
        if (!currentIsSelected) {
          return selectedIndex;
        }
      }

      if (
        currentIndex >= 0 &&
        currentIndex < filteredOptions.length &&
        !filteredOptions[currentIndex].disabled
      ) {
        return currentIndex;
      }

      return selectedIndex >= 0
        ? selectedIndex
        : filteredOptions.findIndex((option) => !option.disabled);
    });
  }, [filteredOptions, selectedOptions]);

  // Handle option selection
  const handleSelect = useCallback(
    (option: DropdownOption<T>) => {
      if (option.disabled) return;

      if (multiSelect) {
        const isSelected = selectedOptions.some(
          (selected) =>
            JSON.stringify(selected.value) === JSON.stringify(option.value),
        );

        let newSelectedOptions: DropdownOption<T>[];

        if (isSelected) {
          newSelectedOptions = selectedOptions.filter(
            (selected) =>
              JSON.stringify(selected.value) !== JSON.stringify(option.value),
          );
        } else {
          newSelectedOptions = [...selectedOptions, option];
        }

        setSelectedOptions(newSelectedOptions);
        onChange(newSelectedOptions.map((opt) => opt.value));

        // Don't close dropdown in multiselect mode
        if (autocomplete) {
          setSearchValue('');
        }
      } else {
        setSelectedOptions([option]);
        onChange(option.value);
        // Close dropdown for single select mode
        if (onClose) {
          onClose();
        }
      }
    },
    [multiSelect, selectedOptions, onChange, autocomplete, onClose],
  );

  // Handle keyboard navigation
  const nextEnabledIndex = (start: number, direction: 1 | -1) => {
    const count = filteredOptions.length;
    const origin = start < 0 ? (direction === 1 ? -1 : count) : start;
    for (let step = 1; step <= count; step++) {
      const index = (((origin + direction * step) % count) + count) % count;
      if (!filteredOptions[index].disabled) return index;
    }
    return -1;
  };

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          e.preventDefault();
          e.stopPropagation();
          break;

        case 'ArrowDown':
          e.preventDefault();
          e.stopPropagation();
          userNavigatedRef.current = true;
          setFocusedIndex((prev) => nextEnabledIndex(prev, 1));
          break;

        case 'ArrowUp':
          e.preventDefault();
          e.stopPropagation();
          userNavigatedRef.current = true;
          setFocusedIndex((prev) => nextEnabledIndex(prev, -1));
          break;

        case 'Enter':
        case ' ':
          e.preventDefault();
          e.stopPropagation();
          if (focusedIndex >= 0 && focusedIndex < filteredOptions.length) {
            handleSelect(filteredOptions[focusedIndex]);
          }
          break;

        default:
          break;
      }
    },
    [filteredOptions, focusedIndex, handleSelect],
  );

  // Handle search input change
  const handleSearchChange = useCallback(
    (e: DropdownInputEvent) => {
      const value = e.currentTarget.value;
      // Native change can repeat the last input on Enter/blur. Keep the active
      // result and remote query intact when the text has not changed.
      if (value === searchValue) return;
      userNavigatedRef.current = false;
      setSearchValue(value);
      remote?.search(value);
      setFocusedIndex(-1);
    },
    [remote, searchValue],
  );

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

  return {
    // State
    searchValue,
    focusedIndex,
    selectedOptions,
    filteredOptions,

    // Actions
    handleSelect,
    handleKeyDown,
    handleSearchChange,
    isOptionSelected,
    setFocusedIndex,
  };
}
