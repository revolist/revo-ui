/** @jsxImportSource preact */
import { h } from 'preact';
import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'preact/hooks';
import { ownsPopupTarget } from '../core/popup-ownership';
import { useTitleTooltip } from '../core/title-tooltip';
import { useSelectionListTooltips } from '../core/selection-list-tooltips';
import { chevronDownIcon } from '../icons';
import { DropdownPopup } from './popup';
import {
  DropdownContent,
  DropdownRemoteMore,
  DropdownRemoteStatus,
  revealDropdownOption,
} from './content';
import { getSelectedOptions, useDropdownService } from './dropdown.service';
import { useRemoteDropdown } from './remote-hook';
import { MultiselectValue } from './values';
import type { DropdownOption, DropdownProps } from './dropdown.types';

/** Editable field adapter; the shared service owns filtering, selection and tags. */
export function AutocompleteDropdown<T>(props: DropdownProps<T>) {
  const {
    source,
    config = {},
    value,
    disabled = false,
    onChange,
    onCreateOption,
    environment,
  } = props;
  const currentProps = useRef(props);
  currentProps.current = props;
  const multiSelect = !!config.multiSelect;
  const { title, ...triggerAttributes } = props.triggerAttributes ?? {};
  const trigger = useTitleTooltip<HTMLDivElement>(
    typeof title === 'string' ? title : undefined,
  );
  const input = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const revealActive = useRef(false);
  const tooltips = useSelectionListTooltips();
  const [generatedId] = useState(
    () => `dropdown-${Math.random().toString(36).slice(2, 9)}`,
  );
  const id = props.id ?? generatedId;
  const listboxId = `${id}-listbox`;
  const menuId = `${id}-menu`;
  const [open, setOpen] = useState(!!config.autoOpen && !disabled);
  const openRef = useRef(open);
  const previousAutoOpen = useRef(config.autoOpen);
  const initialQuery = useRef(config.initialSearch ?? '');
  const [created, setCreated] = useState<DropdownOption<T>[]>([]);
  useLayoutEffect(() => setCreated([]), [props.dataContext, props.dataSource]);
  // Once the host owns a created option, its source also owns later removal.
  useLayoutEffect(() => {
    setCreated((current) => {
      const pending = current.filter(
        (option) =>
          !source.some(
            (item) =>
              JSON.stringify(item.value) === JSON.stringify(option.value),
          ),
      );
      return pending.length === current.length ? current : pending;
    });
  }, [source]);
  const knownSource = useMemo(
    () => [
      ...source,
      ...created.filter(
        (option) =>
          !source.some(
            (item) =>
              JSON.stringify(item.value) === JSON.stringify(option.value),
          ),
      ),
    ],
    [source, created],
  );
  const remote = useRemoteDropdown({
    ...props,
    source: knownSource,
    open,
    initialQuery: initialQuery.current,
  });
  const remoteSelection = useMemo(
    () =>
      getSelectedOptions(
        [
          ...remote.selected,
          ...knownSource.filter(
            (option) =>
              !remote.selected.some(
                (item) =>
                  JSON.stringify(item.value) === JSON.stringify(option.value),
              ),
          ),
        ],
        value,
        multiSelect,
      ),
    [remote.selected, knownSource, value, multiSelect],
  );
  const options = props.dataSource ? remote.items : knownSource;
  const close = (focusNext = false) => {
    if (!openRef.current) return;
    openRef.current = false;
    setOpen(false);
    currentProps.current.onClose?.(focusNext);
  };
  const service = useDropdownService(
    options,
    value,
    (next) => {
      if (!disabled) onChange?.(next);
    },
    { ...config, search: true, autocomplete: true },
    close,
    props.dataSource ? { ...remote, selected: remoteSelection } : undefined,
    (option) => {
      setCreated((current) => [...current, option]);
      onCreateOption?.(option);
    },
  );
  const activeId =
    open &&
    !disabled &&
    service.focusedIndex >= 0 &&
    service.focusedIndex < service.filteredOptions.length &&
    !service.filteredOptions[service.focusedIndex]?.disabled
      ? `${listboxId}-option-${service.focusedIndex}`
      : undefined;
  const selectedLabel = service.selectedOptions[0]?.label ?? '';
  const openInput = (query = multiSelect ? '' : selectedLabel) => {
    if (disabled || openRef.current) return;
    initialQuery.current = query;
    service.setSearchQuery(query);
    openRef.current = true;
    setOpen(true);
  };
  useEffect(() => {
    if (disabled) close();
    else if (config.autoOpen && !previousAutoOpen.current)
      openInput(config.initialSearch ?? '');
    previousAutoOpen.current = config.autoOpen;
  }, [disabled, config.autoOpen]);
  useLayoutEffect(() => {
    if (open && !disabled) input.current?.focus({ preventScroll: true });
  }, [open, disabled]);
  useLayoutEffect(() => {
    if (!revealActive.current) return;
    revealActive.current = false;
    revealDropdownOption(list.current, activeId);
  });
  useEffect(() => {
    if (open && trigger.current)
      return environment?.onOpen?.(trigger.current, close);
  }, [open]);
  useEffect(() => {
    if (!open || config.closeOnClickOutside === false) return;
    const document = trigger.current!.ownerDocument;
    const outside = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (
        trigger.current?.contains(target) ||
        ownsPopupTarget(document.getElementById(menuId), target)
      )
        return;
      if (props.beforeOutsideClose?.() === false) {
        event.preventDefault();
        event.stopImmediatePropagation();
        return;
      }
      close();
    };
    const capture = !!props.beforeOutsideClose;
    document.addEventListener('pointerdown', outside, capture);
    return () => document.removeEventListener('pointerdown', outside, capture);
  }, [open, config.closeOnClickOutside, props.beforeOutsideClose]);
  const portalTarget =
    config.portalTarget ??
    (config.topLayer
      ? trigger.current?.closest<HTMLElement>(
          'dialog[open], [role=dialog], revo-grid',
        )
      : undefined) ??
    input.current?.ownerDocument.body ??
    (typeof document !== 'undefined' ? document.body : undefined);

  return (
    <div
      className={`dropdown-container ${props.className ?? ''} ${disabled ? 'disabled' : ''}`}
      style={props.style}
    >
      <div
        {...triggerAttributes}
        ref={trigger}
        className={`dropdown-trigger dropdown-trigger--editable ${open ? 'open' : ''}`}
        onClick={() => {
          openInput();
          input.current?.focus({ preventScroll: true });
        }}
      >
        {multiSelect && service.selectedOptions.length > 0 && (
          <MultiselectValue
            options={service.selectedOptions}
            renderValue={props.renderValue}
            removeOption={(option) => {
              service.handleSelect(option);
              input.current?.focus({ preventScroll: true });
            }}
            disabled={disabled}
            removeLabel={config.removeLabel}
          />
        )}
        <input
          ref={input}
          id={id}
          className="dropdown-autocomplete-input"
          type="text"
          autoComplete="off"
          role="combobox"
          aria-autocomplete="list"
          aria-haspopup="listbox"
          aria-expanded={open && !disabled}
          aria-controls={open && !disabled ? listboxId : undefined}
          aria-activedescendant={activeId}
          aria-label={config.ariaLabel ?? config.searchAriaLabel}
          aria-labelledby={config.ariaLabelledBy}
          aria-describedby={config.ariaDescribedBy}
          disabled={disabled}
          placeholder={props.placeholder ?? config.searchPlaceholder}
          value={open ? service.searchValue : multiSelect ? '' : selectedLabel}
          onInput={(event) => {
            if (disabled) return;
            if (!openRef.current) openInput(event.currentTarget.value);
            else service.handleSearchChange(event);
          }}
          onKeyDown={(event) => {
            if (disabled) return;
            event.stopPropagation();
            if (event.isComposing || event.keyCode === 229) return;
            if (event.key === 'Escape') {
              if (open) event.preventDefault();
              close();
            } else if (event.key === 'Tab') close(true);
            else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
              event.preventDefault();
              if (!open) openInput();
              else {
                revealActive.current = true;
                service.handleKeyDown(event);
              }
            } else if (open && event.key === 'Enter')
              service.handleKeyDown(event);
          }}
          onBlur={(event) => {
            if (config.closeOnClickOutside === false) return;
            const popup =
              event.currentTarget.ownerDocument.getElementById(menuId);
            if (!ownsPopupTarget(popup, event.relatedTarget as Node | null))
              close();
          }}
        />
        <span
          className="dropdown-arrow"
          aria-hidden="true"
          dangerouslySetInnerHTML={{ __html: chevronDownIcon }}
          onMouseDown={(event) => event.preventDefault()}
          onClick={(event) => {
            event.stopPropagation();
            if (open) close();
            else openInput();
            input.current?.focus({ preventScroll: true });
          }}
        />
      </div>
      {open && !disabled && (
        <DropdownPopup
          triggerRef={trigger}
          portalTarget={portalTarget}
          topLayer={config.topLayer}
          dropdownMenuId={menuId}
          popupClassName={config.popupClassName}
          theme={config.theme}
          maxHeight={config.maxHeight}
          matchTriggerWidth
          onPointerRelease={environment?.onPointerRelease}
        >
          <div
            className="dropdown-listbox"
            ref={tooltips}
            onMouseDown={(event) => {
              if ((event.target as Element).closest('[role="option"]'))
                event.preventDefault();
            }}
            onKeyDown={(event) => {
              event.stopPropagation();
              if (event.key === 'Escape') {
                event.preventDefault();
                close();
                input.current?.focus({ preventScroll: true });
              }
            }}
            onScrollCapture={(event) => {
              const target = event.target as HTMLElement;
              if (
                props.dataSource &&
                target.scrollHeight - target.scrollTop - target.clientHeight <
                  48
              )
                remote.loadMore();
            }}
          >
            <DropdownRemoteStatus
              remote={props.dataSource ? remote : undefined}
            />
            <DropdownContent
              options={options}
              filteredOptions={service.filteredOptions}
              multiSelect={multiSelect}
              focusedIndex={service.focusedIndex}
              selectedOptions={service.selectedOptions}
              onKeyDown={service.handleKeyDown}
              onSelect={service.handleSelect}
              onFocusChange={service.setFocusedIndex}
              renderOption={props.renderOption}
              renderNoResults={
                props.dataSource
                  ? () =>
                      remote.loading || remote.error ? null : remote.text.empty
                  : props.renderNoResults
              }
              dropdownListRef={list}
              theme={config.theme}
              optionIdPrefix={listboxId}
              listboxLabel={config.ariaLabel ?? config.searchAriaLabel}
              loading={props.dataSource ? remote.loading : undefined}
              createOption={service.createOption}
            />
            <DropdownRemoteMore
              remote={props.dataSource ? remote : undefined}
            />
          </div>
        </DropdownPopup>
      )}
      {props.name && (
        <input
          type="hidden"
          name={props.name}
          value={JSON.stringify(
            multiSelect
              ? service.selectedOptions.map((option) => option.value)
              : (service.selectedOptions[0]?.value ?? ''),
          )}
        />
      )}
    </div>
  );
}
