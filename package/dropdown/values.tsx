/** @jsxImportSource preact */
import { h } from 'preact';
import { RemoveButton } from '../buttons/remove-button';
import type { DropdownOption, DropdownProps } from './dropdown.types';

/**
 * Multiselect value component
 * @param options - The options to display
 * @param removeOption - The function to remove an option
 * @param className - The class name to apply to the component
 * @returns The multiselect value component
 */
export const MultiselectValue = ({
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
