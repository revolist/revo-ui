import { useTitleTooltip } from '../core/title-tooltip';
/** @jsxImportSource preact */
import { ownsPopupTarget } from '../core/popup-ownership';
import { useRemoteDropdown } from './remote-hook';
import { h } from 'preact';
import { renderPreactInto } from '../preact-mount';

import './editor-dropdown.style.scss';
import { useEffect, useRef, useMemo, useState } from 'preact/hooks';
import { DropdownPopup } from './popup';
import { DropdownPopupContent } from './content';
import type { DropdownOption, DropdownProps } from './dropdown.types';
import { RemoveButton } from '../buttons/remove-button';
import { chevronDownIcon } from '../icons';

export * from './dropdown.types';
export { DropdownPopup } from './popup';
export { DropdownPopupContent } from './content';
export type { DropdownPopupProps } from './popup';

/**
 * Single select value component
 * @param options - The options to display
 * @param className - The class name to apply to the component
 * @returns The single select value component
 */
const SingleSelectValue = ({
  options,
  className,
  renderValue,
}: {
  options: DropdownOption[];
  className?: string;
  renderValue?: NonNullable<DropdownProps['renderValue']>;
}) => {
  return (
    <span className={`selected-value ${className}`}>
      {renderValue ? renderValue(h, options[0]) : options[0].label}
    </span>
  );
};

/**
 * Multiselect value component
 * @param options - The options to display
 * @param removeOption - The function to remove an option
 * @param className - The class name to apply to the component
 * @returns The multiselect value component
 */
const MultiselectValue = ({
  options,
  removeOption,
  className,
  renderValue,
  disabled,
  removeLabel,
}: {
  options: DropdownOption[];
  removeOption: (option: DropdownOption) => void;
  className?: string;
  renderValue?: NonNullable<DropdownProps['renderValue']>;
  disabled?: boolean;
  removeLabel?: (label: string) => string;
}) => {
  return (
    <div className={`selected-values ${className}`}>
      {options.map((option, index) => (
        <span key={index} className="selected-tag">
          {renderValue ? renderValue(h, option) : option.label}
          {!disabled && !option.disabled && (
            <RemoveButton
              compact
              onClick={(e) => {
                e.stopPropagation();
                removeOption(option);
              }}
              locale={{
                title: removeLabel?.(option.label) ?? `Remove ${option.label}`,
                ariaLabel:
                  removeLabel?.(option.label) ?? `Remove ${option.label}`,
              }}
            />
          )}
        </span>
      ))}
    </div>
  );
};

/**
 * Arrow component
 * @param className - The class name to apply to the component
 * @returns The arrow component
 */
const Arrow = ({ className }: { className?: string }) => (
  <span
    className={`dropdown-arrow ${className}`}
    aria-hidden="true"
    dangerouslySetInnerHTML={{ __html: chevronDownIcon }}
  />
);

/**
 * Placeholder value component
 * @param placeholder - The placeholder text
 * @param className - The class name to apply to the component
 * @returns The placeholder value component
 */
const PlaceholderValue = ({
  placeholder,
  className,
}: {
  placeholder: string;
  className?: string;
}) => {
  return [
    <span className={`placeholder px-2 ${className}`}>{placeholder}</span>,
    <Arrow className="mr-2" />,
  ];
};

/**
 * Dropdown component
 */
export function Dropdown<T = any>({
  source: localSource,
  triggerAttributes,
  dataSource,
  dataContext,
  remoteText,
  value,
  onChange,
  placeholder = 'Select an option',
  disabled = false,
  name,
  id,
  className = '',
  style,
  config = {},
  renderContent,
  renderOption,
  renderValue,
  renderPlaceholder,
  renderSelectedValue,
  renderNoResults,
  onClose,
  beforeOutsideClose,
  environment,
}: DropdownProps<T>): any {
  // Default configuration
  const {
    search = false,
    searchPlaceholder = 'Search...',
    closeOnClickOutside = true,
    autoOpen = false,
    multiSelect = false,
    portalTarget: requestedPortalTarget,
    ariaLabel,
    ariaLabelledBy,
    ariaDescribedBy,
    popupClassName,
    maxHeight,
  } = config;

  // Refs
  const { title: hintTitle, ...triggerProps } = triggerAttributes ?? {};
  const triggerRef = useTitleTooltip<HTMLDivElement>(
    typeof hintTitle === 'string' ? hintTitle : undefined,
  );
  const portalTarget =
    requestedPortalTarget ??
    (config.topLayer
      ? (triggerRef.current?.closest(
          'dialog[open], [role=dialog], revo-grid',
        ) as HTMLElement | undefined)
      : undefined) ??
    (typeof document !== 'undefined' ? document.body : null);

  // Generate a unique ID for accessibility
  const uniqueId = useMemo(
    () => id || `dropdown-${Math.random().toString(36).substring(2, 9)}`,
    [id],
  );
  const listboxId = `${uniqueId}-listbox`;
  const searchId = `${uniqueId}-search`;
  const dropdownMenuId = `${uniqueId}-menu`;

  // Simple state for closed dropdown
  const [isOpen, setIsOpen] = useState(autoOpen && !disabled);
  const [focusOnOpen, setFocusOnOpen] = useState(
    !disabled && (autoOpen || !!config.autoFocus),
  );
  const previousAutoOpen = useRef(autoOpen);
  const theme = config.theme ?? 'default';

  useEffect(() => {
    if (autoOpen && !previousAutoOpen.current && !disabled) {
      setFocusOnOpen(true);
      setIsOpen(true);
    }
    previousAutoOpen.current = autoOpen;
  }, [autoOpen, disabled]);

  useEffect(() => {
    if (disabled && isOpen) {
      setIsOpen(false);
      onClose?.(false);
    }
  }, [disabled, isOpen]);

  const remote = useRemoteDropdown({
    dataSource,
    dataContext,
    remoteText,
    value,
    disabled,
    source: localSource,
    open: isOpen,
    initialQuery: config.initialSearch ?? '',
  });
  const source = dataSource
    ? [
        ...new Map(
          [...remote.selected, ...remote.items].map((option) => [
            option.value,
            option,
          ]),
        ).values(),
      ]
    : localSource;

  // Find selected options based on value (for closed state)
  const selectedOptions = useMemo(() => {
    if (value === undefined) {
      return [];
    }

    if (multiSelect && Array.isArray(value)) {
      return source.filter((option) =>
        (value as T[]).some(
          (v) => JSON.stringify(v) === JSON.stringify(option.value),
        ),
      );
    } else {
      const selected = source.find(
        (option) => JSON.stringify(option.value) === JSON.stringify(value),
      );
      return selected ? [selected] : [];
    }
  }, [value, source, multiSelect]);

  // Toggle dropdown
  const toggleDropdown = () => {
    if (disabled) return;
    setIsOpen((prev) => {
      const nextOpen = !prev;
      if (nextOpen) {
        setFocusOnOpen(true);
      }
      return nextOpen;
    });
  };

  // Close dropdown
  const closeDropdown = (focusNext = false) => {
    setIsOpen((wasOpen) => {
      if (wasOpen) {
        onClose?.(focusNext);
      }
      return false;
    });
  };

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const trigger = triggerRef.current;
    if (trigger) return environment?.onOpen?.(trigger, closeDropdown);
  }, [isOpen]);

  // Handle option selection directly (for when dropdown is closed)
  const handleOptionSelect = (option: DropdownOption<T>) => {
    if (disabled || option.disabled) return;

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

      if (onChange) {
        onChange(newSelectedOptions.map((opt) => opt.value));
      }
    } else {
      if (onChange) {
        onChange(option.value);
      }
      closeDropdown();
    }
  };

  // Handle click outside
  useEffect(() => {
    if (!closeOnClickOutside || !isOpen) return;

    const ownerDocument =
      portalTarget?.ownerDocument ??
      triggerRef.current?.ownerDocument ??
      (typeof document !== 'undefined' ? document : undefined);
    if (!ownerDocument) return;

    const handleClickOutside = (event: PointerEvent) => {
      const dropdownElement = ownerDocument.getElementById(dropdownMenuId);
      const target = event.target as Node | null;
      if (
        dropdownElement &&
        target &&
        !ownsPopupTarget(dropdownElement, target) &&
        triggerRef.current &&
        !triggerRef.current.contains(target)
      ) {
        if (beforeOutsideClose?.() === false) {
          event.preventDefault();
          event.stopImmediatePropagation();
          return;
        }
        closeDropdown();
      }
    };

    // Draft validation runs before the outside target can start another edit.
    const capture = !!beforeOutsideClose;
    ownerDocument.addEventListener('pointerdown', handleClickOutside, capture);
    return () => {
      ownerDocument.removeEventListener(
        'pointerdown',
        handleClickOutside,
        capture,
      );
    };
  }, [
    closeOnClickOutside,
    isOpen,
    dropdownMenuId,
    portalTarget,
    beforeOutsideClose,
  ]);

  // Render selected value or placeholder
  const renderTriggerContent = () => {
    const children = [Arrow({})];
    if (renderSelectedValue) {
      return renderSelectedValue(h, selectedOptions, children);
    }
    if (selectedOptions.length > 0) {
      if (multiSelect) {
        return [
          <MultiselectValue
            options={selectedOptions}
            removeOption={handleOptionSelect}
            renderValue={renderValue}
            disabled={disabled}
            removeLabel={config.removeLabel}
          />,
          <Arrow className="mr-2" />,
        ];
      }

      return [
        <SingleSelectValue
          options={selectedOptions}
          renderValue={renderValue}
        />,
        <Arrow className="mr-2" />,
      ];
    }

    return renderPlaceholder ? (
      renderPlaceholder(h, placeholder, children)
    ) : (
      <PlaceholderValue placeholder={placeholder} />
    );
  };

  // Render the popup only when open
  const renderPopup = () => {
    return (
      <DropdownPopup
        onPointerRelease={environment?.onPointerRelease}
        topLayer={config.topLayer}
        triggerRef={triggerRef}
        portalTarget={portalTarget}
        theme={theme}
        dropdownMenuId={dropdownMenuId}
        popupClassName={popupClassName}
        maxHeight={maxHeight}
      >
        {renderContent ? (
          renderContent({ id: listboxId, close: closeDropdown })
        ) : (
          <DropdownPopupContent
            options={dataSource ? remote.items : source}
            selectedValues={dataSource ? remote.selected : undefined}
            remote={dataSource ? remote : undefined}
            value={value}
            onChange={(nextValue) => {
              if (disabled) return;
              onChange?.(nextValue);
              if (!multiSelect) {
                const trigger = triggerRef.current;
                trigger?.ownerDocument.defaultView?.requestAnimationFrame(
                  () => {
                    const focused = trigger.ownerDocument.activeElement;
                    if (
                      trigger.isConnected &&
                      (!focused ||
                        focused === trigger.ownerDocument.body ||
                        ownsPopupTarget(trigger, focused))
                    )
                      trigger.focus({ preventScroll: true });
                  },
                );
              }
            }}
            config={{
              ...config,
              autoFocus: config.autoFocus || focusOnOpen,
            }}
            multiSelect={multiSelect}
            search={!!dataSource || search}
            searchPlaceholder={searchPlaceholder}
            listboxId={listboxId}
            searchId={searchId}
            renderOption={renderOption}
            renderNoResults={renderNoResults}
            onClose={closeDropdown}
            onTabNavigation={() => {
              closeDropdown();
              triggerRef.current?.focus();
            }}
            theme={theme}
          />
        )}
      </DropdownPopup>
    );
  };

  return (
    <div
      className={`dropdown-container ${className} ${disabled ? 'disabled' : ''}`}
      style={style}
    >
      <div
        {...triggerProps}
        ref={triggerRef}
        className={`dropdown-trigger ${isOpen ? 'open' : ''}`}
        role="combobox"
        data-value={
          Array.isArray(value)
            ? JSON.stringify(value)
            : value == null
              ? ''
              : String(value)
        }
        aria-haspopup={renderContent ? 'dialog' : 'listbox'}
        aria-expanded={isOpen && !disabled}
        aria-disabled={disabled}
        aria-owns={isOpen && !disabled ? listboxId : undefined}
        aria-controls={isOpen && !disabled ? listboxId : undefined}
        data-rv-popup-controls={dropdownMenuId}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-describedby={ariaDescribedBy}
        tabIndex={disabled ? -1 : 0}
        onClick={disabled ? undefined : toggleDropdown}
        onKeyDown={(e) => {
          // Embedded remove buttons retain their native keyboard activation.
          if (disabled || e.target !== e.currentTarget) return;

          if (isOpen && e.key === 'Tab' && config.nativeTabNavigation) {
            e.stopPropagation();
            closeDropdown();
            return;
          }

          if (isOpen && e.key === 'Escape') {
            e.preventDefault();
            e.stopPropagation();
            closeDropdown();
            return;
          }
          if (
            !isOpen &&
            (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown')
          ) {
            e.preventDefault();
            e.stopPropagation();
            toggleDropdown();
          }
        }}
      >
        {renderTriggerContent()}
      </div>

      {isOpen && !disabled && renderPopup()}

      {name && (
        <input
          type="hidden"
          name={name}
          value={
            multiSelect
              ? JSON.stringify(selectedOptions.map((opt) => opt.value))
              : JSON.stringify(selectedOptions[0]?.value || '')
          }
        />
      )}
    </div>
  );
}

/**
 * Define the dropdown component
 * @param el - The element to render the dropdown
 * @param props - The props of the dropdown
 */
export const defineDropdown = (el: HTMLElement, props: DropdownProps) => {
  renderPreactInto(el, <Dropdown {...props} />);
};

export const destroyDropdown = (el: HTMLElement) => {
  renderPreactInto(el, null);
};
