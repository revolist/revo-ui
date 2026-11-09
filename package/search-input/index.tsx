import { renderSearchInput } from './native';
import { h } from 'preact';

export type SearchInputRenderable = any;
export type SearchInputRef<T> =
  | { current: T | null }
  | ((instance: T | null) => void)
  | null;
export type SearchInputEvent<T extends EventTarget> = Event & {
  currentTarget: T;
};

export type SearchInputProps = {
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
  value = '',
  inputRef,
  rootClassName = '',
  inputClassName = '',
  iconClassName = '',
  shortcutClassName = '',
  shortcut,
  icon,
  leading,
  hideIcon = false,
  trailing,
  testId,
  onValueChange,
  onInput,
  type = 'search',
  ...inputProps
}: SearchInputProps): any {
  const handleInput = (event: SearchInputEvent<HTMLInputElement>) => {
    onInput?.(event);
    onValueChange?.(event.currentTarget.value, event);
  };
  return renderSearchInput(h, {
    rootClassName,
    inputClassName,
    iconClassName,
    shortcutClassName,
    shortcut,
    icon: icon ?? <DefaultSearchIcon />,
    hideIcon,
    leading,
    trailing,
    testId,
    inputAttributes: {
      ...inputProps,
      ref: inputRef,
      type,
      value,
      onInput: handleInput,
    },
  });
}
