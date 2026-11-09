import { useSelectionListTooltips } from '../core/selection-list-tooltips';
import { createControlId } from '../core/control-id';
/** @jsxImportSource preact */
import chevronDownIcon from '@fortawesome/fontawesome-free/svgs/solid/chevron-down.svg?raw';
import xmarkIcon from '@fortawesome/fontawesome-free/svgs/solid/xmark.svg?raw';
import { h } from 'preact';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'preact/hooks';

import { SearchInput } from '../search-input';
import { ResourcePickerAvatar } from './resource-picker-avatar';
import { ResourcePickerOption } from './resource-picker-option';
import { ResourcePickerPopup } from './resource-picker-popup';
import type {
  ResourcePickerId,
  ResourcePickerItem,
  SharedResourcePickerProps,
} from './resource-picker.types';
import {
  resourcePickerClasses,
  resourcePickerDataAttribute,
  resourcePickerIdKey,
} from './resource-picker.utils';
import './resource-picker.scss';

export function SharedResourcePicker<
  Id extends ResourcePickerId,
  Resource extends ResourcePickerItem<Id>,
>({
  resources,
  selectedResourceIds,
  text,
  onChange,
  classNames,
  disabled = false,
  readOnly = false,
  presentation = 'inline',
  multiple = true,
  preserveOrder = false,
  unassigned,
  resourceDataAttribute,
  isResourceDisabled,
  getAvatarColor,
}: SharedResourcePickerProps<Id, Resource>) {
  const rootRef = useRef<HTMLDivElement>(null);
  const controlRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useSelectionListTooltips('.rv-resource-picker__option');
  const keyboardFocusActiveRef = useRef(false);
  const [listboxId] = useState(() => createControlId('rv-resource-list'));
  const popupId = `${listboxId}-popup`;
  const dropdown = presentation === 'dropdown';
  const [open, setOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [focusedIndex, setFocusedIndex] = useState(0);
  const closeDropdown = useCallback(() => {
    setOpen(false);
    setSearchText('');
  }, []);
  const selectedKeys = new Set(selectedResourceIds.map(resourcePickerIdKey));
  const orderedResources = useMemo(
    () =>
      preserveOrder
        ? [...resources]
        : [...resources].sort((left, right) =>
            left.name.localeCompare(right.name, undefined, {
              numeric: true,
              sensitivity: 'base',
            }),
          ),
    [preserveOrder, resources],
  );
  const filteredResources = useMemo(() => {
    const query = searchText.trim().toLocaleLowerCase();
    if (!query) {
      return orderedResources;
    }
    return orderedResources.filter((resource) =>
      `${resource.name} ${resource.role ?? ''}`
        .toLocaleLowerCase()
        .includes(query),
    );
  }, [searchText, orderedResources]);
  const selectedResources = useMemo(() => {
    const resourcesById = new Map(
      resources.map((resource) => [resourcePickerIdKey(resource.id), resource]),
    );
    return selectedResourceIds
      .map((resourceId) => resourcesById.get(resourcePickerIdKey(resourceId)))
      .filter((resource): resource is Resource => !!resource);
  }, [resources, selectedResourceIds]);
  const activeOptionId =
    dropdown && focusedIndex >= 0 && focusedIndex < filteredResources.length
      ? `${listboxId}-option-${focusedIndex}`
      : undefined;

  useEffect(() => {
    if (!dropdown || !open) return;
    const handleOutsidePointer = (event: PointerEvent) => {
      const target = event.target as Node;
      const popup = rootRef.current?.ownerDocument.getElementById(popupId);
      if (!rootRef.current?.contains(target) && !popup?.contains(target)) {
        closeDropdown();
      }
    };
    const handleAncestorScroll = (event: Event) => {
      const popup = rootRef.current?.ownerDocument.getElementById(popupId);
      const target = event.target;
      if (target instanceof Node && popup?.contains(target)) return;
      closeDropdown();
    };
    const handleViewportResize = () => closeDropdown();
    document.addEventListener('pointerdown', handleOutsidePointer);
    document.addEventListener('scroll', handleAncestorScroll, true);
    window.addEventListener('resize', handleViewportResize);
    const frame = window.requestAnimationFrame(() =>
      searchRef.current?.focus(),
    );
    return () => {
      document.removeEventListener('pointerdown', handleOutsidePointer);
      document.removeEventListener('scroll', handleAncestorScroll, true);
      window.removeEventListener('resize', handleViewportResize);
      window.cancelAnimationFrame(frame);
    };
  }, [closeDropdown, dropdown, open, popupId]);

  useEffect(() => {
    setFocusedIndex(filteredResources.length > 0 ? 0 : -1);
  }, [filteredResources]);

  useEffect(() => {
    if (
      !open ||
      !activeOptionId ||
      !listRef.current ||
      !keyboardFocusActiveRef.current
    )
      return;
    const activeOption =
      listRef.current.ownerDocument.getElementById(activeOptionId);
    if (!activeOption || !listRef.current.contains(activeOption)) return;
    activeOption
      .closest<HTMLElement>('.rv-resource-picker__option')
      ?.scrollIntoView?.({ block: 'nearest' });
  }, [activeOptionId, open]);

  const updateSelection = (resourceIds: readonly Id[]) => {
    if (readOnly) return;
    onChange(resourceIds);
    if (!multiple && dropdown) {
      closeDropdown();
    }
  };
  const toggleFocusedResource = () => {
    const resource = filteredResources[focusedIndex];
    if (!resource) return;
    const key = resourcePickerIdKey(resource.id);
    if (isResourceDisabled?.(resource) && !selectedKeys.has(key)) return;
    updateSelection(
      selectedKeys.has(key)
        ? selectedResourceIds.filter((id) => resourcePickerIdKey(id) !== key)
        : multiple
          ? uniqueIds([...selectedResourceIds, resource.id])
          : [resource.id],
    );
  };
  const handleDropdownKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      closeDropdown();
      controlRef.current?.focus();
      return;
    }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      event.stopPropagation();
      if (!filteredResources.length) return;
      keyboardFocusActiveRef.current = true;
      setFocusedIndex((current) =>
        event.key === 'ArrowDown'
          ? current >= filteredResources.length - 1
            ? 0
            : current + 1
          : current <= 0
            ? filteredResources.length - 1
            : current - 1,
      );
      return;
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      event.stopPropagation();
      toggleFocusedResource();
    }
  };
  const popupPortalTarget =
    typeof document === 'undefined'
      ? null
      : (rootRef.current?.closest<HTMLElement>('dialog, .rv-dialog-overlay') ??
        document.body);
  const popover = (
    <div
      ref={tooltipRef}
      class="rv-resource-picker__popover"
      onKeyDown={dropdown ? handleDropdownKeyDown : undefined}
    >
      <SearchInput
        inputRef={searchRef}
        rootClassName="rv-resource-picker__search-control"
        inputClassName={resourcePickerClasses(
          'rv-resource-picker__search',
          classNames?.search,
        )}
        value={searchText}
        disabled={disabled}
        placeholder={text.searchPlaceholder}
        aria-label={text.searchAriaLabel}
        onValueChange={setSearchText}
      />
      <div
        ref={listRef}
        class={resourcePickerClasses(
          'rv-resource-picker__list',
          classNames?.list,
        )}
        role={dropdown ? 'listbox' : 'group'}
        id={dropdown ? listboxId : undefined}
        aria-multiselectable={dropdown ? multiple : undefined}
        aria-activedescendant={activeOptionId}
        aria-label={text.groupAriaLabel}
      >
        {unassigned && !readOnly ? (
          <label
            class={resourcePickerClasses(
              'rv-resource-picker__option rv-resource-picker__option--unassigned',
              classNames?.option,
            )}
          >
            <input
              type="checkbox"
              checked={selectedResourceIds.length === 0}
              disabled={disabled}
              {...resourcePickerDataAttribute(unassigned.dataAttribute, '')}
              onChange={() => onChange([])}
            />
            <span
              class="rv-resource-picker__avatar-spacer"
              aria-hidden="true"
            />
            <span
              class={resourcePickerClasses(
                'rv-resource-picker__details',
                classNames?.details,
              )}
            >
              <strong>{unassigned.label}</strong>
            </span>
          </label>
        ) : null}
        {resources.length === 0 ? (
          <ResourcePickerEmpty
            className={classNames?.muted}
            text={text.emptyResources}
          />
        ) : filteredResources.length === 0 ? (
          <ResourcePickerEmpty
            className={classNames?.muted}
            text={text.emptySearch}
          />
        ) : (
          filteredResources.map((resource, index) => (
            <ResourcePickerOption
              key={resourcePickerIdKey(resource.id)}
              resource={resource}
              selected={selectedKeys.has(resourcePickerIdKey(resource.id))}
              selectedResourceIds={selectedResourceIds}
              disabled={disabled}
              readOnly={readOnly}
              multiple={multiple}
              resourceDataAttribute={resourceDataAttribute}
              classNames={classNames}
              isResourceDisabled={isResourceDisabled}
              getAvatarColor={getAvatarColor}
              optionId={dropdown ? `${listboxId}-option-${index}` : undefined}
              focused={dropdown && focusedIndex === index}
              onFocus={() => {
                keyboardFocusActiveRef.current = false;
                setFocusedIndex(index);
              }}
              onChange={updateSelection}
            />
          ))
        )}
      </div>
    </div>
  );

  return (
    <div
      ref={rootRef}
      class={resourcePickerClasses(
        'rv-resource-picker',
        dropdown ? 'rv-resource-picker--dropdown' : undefined,
        open ? 'rv-resource-picker--open' : undefined,
        classNames?.root,
      )}
    >
      {dropdown ? (
        <div
          ref={controlRef}
          class="rv-resource-picker__control"
          role="combobox"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-haspopup="listbox"
          aria-label={text.groupAriaLabel}
          tabIndex={disabled ? -1 : 0}
          onClick={(event) => {
            if (disabled) return;
            // Consumers may wrap the picker in a label. Own the click so the
            // label cannot forward it to the first chip remove button.
            event.preventDefault();
            if (open) {
              closeDropdown();
              return;
            }
            setOpen(true);
          }}
          onKeyDown={(event) => {
            if (disabled || event.target !== event.currentTarget) return;
            if (
              event.key === 'Enter' ||
              event.key === ' ' ||
              event.key === 'ArrowDown'
            ) {
              event.preventDefault();
              setOpen(true);
            }
          }}
        >
          <div class="rv-resource-picker__chips">
            {selectedResources.length ? (
              selectedResources.map((resource) => (
                <span
                  class="rv-resource-picker__chip"
                  key={resourcePickerIdKey(resource.id)}
                >
                  <ResourcePickerAvatar
                    resource={resource}
                    className={classNames?.avatar}
                    color={getAvatarColor?.(resource)}
                  />
                  <span class="rv-resource-picker__chip-label">
                    {resource.name}
                  </span>
                  {!disabled && !readOnly ? (
                    <button
                      type="button"
                      class="rv-resource-picker__chip-remove"
                      aria-label={`Remove ${resource.name}`}
                      onClick={(event) => {
                        event.stopPropagation();
                        onChange(
                          selectedResourceIds.filter(
                            (id) =>
                              resourcePickerIdKey(id) !==
                              resourcePickerIdKey(resource.id),
                          ),
                        );
                      }}
                    >
                      <span
                        aria-hidden="true"
                        dangerouslySetInnerHTML={{ __html: xmarkIcon }}
                      />
                    </button>
                  ) : null}
                </span>
              ))
            ) : (
              <span class="rv-resource-picker__placeholder">
                {text.searchPlaceholder}
              </span>
            )}
          </div>
          <span
            class="rv-resource-picker__chevron"
            aria-hidden="true"
            dangerouslySetInnerHTML={{ __html: chevronDownIcon }}
          />
        </div>
      ) : null}
      {!dropdown ? (
        popover
      ) : open && popupPortalTarget ? (
        <ResourcePickerPopup
          triggerRef={controlRef}
          portalTarget={popupPortalTarget}
          popupId={popupId}
        >
          {popover}
        </ResourcePickerPopup>
      ) : null}
    </div>
  );
}

function uniqueIds<Id extends ResourcePickerId>(
  ids: readonly Id[],
): readonly Id[] {
  return [...new Map(ids.map((id) => [resourcePickerIdKey(id), id])).values()];
}

function ResourcePickerEmpty({
  className,
  text,
}: {
  readonly className?: string;
  readonly text: string;
}) {
  return (
    <span class={resourcePickerClasses('rv-resource-picker__empty', className)}>
      {text}
    </span>
  );
}
