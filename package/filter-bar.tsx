import { h, type ComponentChildren } from 'preact';
import { useLayoutEffect, useRef } from 'preact/hooks';
import type { ClassPreset } from './presets/types';
import { FilterChip } from './form-controls/presentation';
import { SearchInput } from './search-input';
import { Button } from './controls';
/** One host-owned active filter. */
export interface ActiveFilter {
  id: string;
  label: string;
  value: string;
}
export interface FilterBarProps {
  /** Accessible name for the filter toolbar. */ label: string;
  /** Active filters in display order. */ filters: readonly ActiveFilter[];
  /** Localized removal label for each filter. */ removeLabel: (
    filter: ActiveFilter,
  ) => string;
  /** Called when a filter is removed. */ onRemove?: (id: string) => void;
  /** Optional controlled search text. */ search?: string;
  /** Localized search name; defaults to 'Search filters'. */ searchLabel?: string;
  /** Called when search text changes. */ onSearchChange?: (
    value: string,
  ) => void;
  /** Localized clear action label; defaults to 'Clear filters'. */ clearLabel?: string;
  /** Called when all filters should be cleared. */ onClear?: () => void;
  /** Optional host-owned filter creation controls. */ children?: ComponentChildren;
  /** Optional presentation preset. */ preset?: ClassPreset;
  /** Additional root class names. */ className?: string;
}
/** Search and active filters, with application-owned filter behavior. */
export function FilterBar({
  label,
  filters,
  removeLabel,
  onRemove,
  search,
  searchLabel,
  onSearchChange,
  clearLabel,
  onClear,
  children,
  preset,
  className = '',
}: FilterBarProps) {
  const root = useRef<HTMLDivElement>(null);
  const removedFocus = useRef<HTMLElement>();
  const rememberFocus = () => {
    const active = root.current?.ownerDocument.activeElement;
    if (active instanceof HTMLElement && root.current?.contains(active)) {
      removedFocus.current = active;
    }
  };
  useLayoutEffect(() => {
    const previous = removedFocus.current;
    if (!previous || previous.isConnected || !root.current) return;
    removedFocus.current = undefined;
    const document = root.current.ownerDocument;
    if (
      document.activeElement !== document.body &&
      document.activeElement !== document.documentElement
    )
      return;
    const target = root.current.querySelector<HTMLElement>(
      'input:not(:disabled), button:not(:disabled)',
    );
    (target ?? root.current).focus();
  });
  return (
    <div
      class={`rv-filter-bar ${preset?.className ?? ''} ${className}`}
      ref={root}
      tabIndex={-1}
      role="group"
      aria-label={label}
      data-part="root"
    >
      {onSearchChange && (
        <SearchInput
          aria-label={searchLabel ?? 'Search filters'}
          placeholder={searchLabel ?? 'Search filters'}
          value={search ?? ''}
          onValueChange={onSearchChange}
        />
      )}
      <div class="rv-filter-bar-items" data-part="filters">
        {filters.map((filter) => (
          <FilterChip
            key={filter.id}
            removeLabel={removeLabel(filter)}
            onRemove={
              onRemove
                ? () => {
                    rememberFocus();
                    onRemove(filter.id);
                  }
                : undefined
            }
          >
            {filter.label}: {filter.value}
          </FilterChip>
        ))}
      </div>
      {children}
      {onClear && filters.length > 0 && (
        <Button
          variant="ghost"
          onClick={() => {
            rememberFocus();
            onClear();
          }}
        >
          {clearLabel ?? 'Clear filters'}
        </Button>
      )}
    </div>
  );
}
