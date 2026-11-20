import { renderSearchInput } from './native';
import { h, type JSX } from 'preact';

export type SearchInputRenderable = any;
export type SearchInputRef<T> =
  | { current: T | null }
  | ((instance: T | null) => void)
  | null;
export type SearchInputEvent<T extends EventTarget> = Event & {
  currentTarget: T;
};

export type SearchInputPreset = {
  className?: string;
  props?: {
    hideIcon?: boolean;
    type?: 'search' | 'text';
    disabled?: boolean;
    readOnly?: boolean;
  };
};

export type SearchInputProps = Omit<
  JSX.InputHTMLAttributes<HTMLInputElement>,
  'value' | 'onInput' | 'type' | 'ref'
> & {
  preset?: SearchInputPreset;
  value?: string;
  inputRef?: SearchInputRef<HTMLInputElement>;
  rootClassName?: string;
  inputClassName?: string;
  iconClassName?: string;
  shortcutClassName?: string;
  shortcut?: SearchInputRenderable;
  icon?: SearchInputRenderable;
  leading?: SearchInputRenderable;
  hideIcon?: boolean;
  trailing?: SearchInputRenderable;
  testId?: string;
  onValueChange?: (
    value: string,
    event: SearchInputEvent<HTMLInputElement>,
  ) => void;
  onInput?: (event: SearchInputEvent<HTMLInputElement>) => void;
  type?: 'search' | 'text';
  [attribute: string]: any;
};

function DefaultSearchIcon(): any {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

export function SearchInput({
  preset,
  value = '',
  inputRef,
  rootClassName = '',
  inputClassName = '',
  iconClassName = '',
  shortcutClassName = '',
  shortcut,
  icon,
  leading,
  hideIcon,
  trailing,
  testId,
  onValueChange,
  onInput,
  type,
  ...inputProps
}: SearchInputProps): any {
  const handleInput = (event: SearchInputEvent<HTMLInputElement>) => {
    onInput?.(event);
    onValueChange?.(event.currentTarget.value, event);
  };
  return renderSearchInput(h, {
    rootClassName: [preset?.className, rootClassName].filter(Boolean).join(' '),
    inputClassName,
    iconClassName,
    shortcutClassName,
    shortcut,
    icon: icon ?? <DefaultSearchIcon />,
    hideIcon: hideIcon ?? preset?.props?.hideIcon ?? false,
    leading,
    trailing,
    testId,
    inputAttributes: {
      disabled: preset?.props?.disabled,
      readOnly: preset?.props?.readOnly,
      ...inputProps,
      ref: inputRef,
      type: type ?? preset?.props?.type ?? 'search',
      value,
      onInput: handleInput,
    },
  });
}
