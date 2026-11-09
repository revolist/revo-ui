/** @jsxRuntime automatic */
/** @jsxImportSource preact */
import {
  Fragment,
  isValidElement,
  type ComponentChildren,
  type JSX,
} from 'preact';
import { FormFieldContext } from './form-controls/field-context';
import { useContext, useState } from 'preact/hooks';
import { Dropdown } from './dropdown';
import type {
  DropdownEnvironment,
  DropdownOption,
} from './dropdown/dropdown.types';

export type SelectOptionProps = JSX.IntrinsicElements['option'];
type Attributes = Omit<
  JSX.IntrinsicElements['select'],
  'value' | 'defaultValue' | 'onChange' | 'onInput' | 'multiple' | 'ref'
>;
export type SelectProps = Attributes & {
  /** Optional host integration for portalled popup lifecycle and pointer releases. */
  environment?: DropdownEnvironment;
  value?: string | number | readonly string[];
  defaultValue?: string | number | readonly string[];
  /** Optional domain policy for option descriptors; no native option nodes are mounted. */
  optionPolicy?: (props: SelectOptionProps) => SelectOptionProps;
} & (
    | { multiple?: false; onValueChange?: (value: string) => void }
    | { multiple: true; onValueChange?: (value: string[]) => void }
  );

function text(children: ComponentChildren): string {
  if (Array.isArray(children)) return children.map(text).join('');
  if (isValidElement(children))
    return text((children.props as { children?: ComponentChildren }).children);
  return children == null || typeof children === 'boolean'
    ? ''
    : String(children);
}

/** JSX options are data descriptors for Dropdown, never browser-native controls. */
export function selectOptions(
  children: ComponentChildren,
  policy?: SelectProps['optionPolicy'],
  group = '',
  disabled = false,
): DropdownOption<string>[] {
  if (Array.isArray(children))
    return children.flatMap((child) =>
      selectOptions(child, policy, group, disabled),
    );
  if (!isValidElement(children)) return [];
  const props = children.props as SelectOptionProps & {
    label?: string;
    children?: ComponentChildren;
  };
  if (children.type === Fragment)
    return selectOptions(props.children, policy, group, disabled);
  if (children.type === 'optgroup')
    return selectOptions(
      props.children,
      policy,
      props.label ?? '',
      disabled || !!props.disabled,
    );
  const resolved = policy ? policy(props) : props;
  const option = {
    ...resolved,
    disabled: props.disabled || resolved.disabled,
    hidden: props.hidden || resolved.hidden,
  };
  const label = String(option.label ?? text(option.children)).trim();
  return [
    {
      value: String(option.value ?? label),
      label: group ? `${group}: ${label}` : label,
      disabled: disabled || !!option.disabled,
      hidden: !!option.hidden,
      selected: !!option.selected,
    },
  ];
}

export function Select(props: SelectProps) {
  const {
    children,
    environment,
    value,
    defaultValue,
    onValueChange,
    optionPolicy,
    multiple,
    disabled: ownDisabled,
    name,
    class: nativeClass,
    className,
    style,
    ...attributes
  } = props;
  const field = useContext(FormFieldContext);
  const disabled = field.disabled || !!ownDisabled;
  const source = selectOptions(children, optionPolicy);
  const [draft, setDraft] = useState<string | string[]>(() => {
    const initial =
      defaultValue ??
      (multiple
        ? source
            .filter((option) => option.selected)
            .map((option) => option.value)
        : (source.find((option) => option.selected)?.value ??
          source[0]?.value ??
          ''));
    return Array.isArray(initial) ? [...initial] : String(initial);
  });
  const selected =
    value === undefined
      ? draft
      : Array.isArray(value)
        ? [...value]
        : String(value);
  const values = Array.isArray(selected) ? selected : [selected];
  const visible = source.filter(
    (option) => !option.hidden || values.includes(option.value),
  );
  const classes =
    `rv-select rv-select-control ${typeof nativeClass === 'string' ? nativeClass : ''} ${className ?? ''}`
      .replace(/\brv-control\b/g, '')
      .trim();
  return (
    <>
      <Dropdown
        environment={environment}
        renderOption={(_h, option) => (
          <span data-select-option={option.value}>{option.label}</span>
        )}
        source={visible}
        value={selected}
        disabled={!!disabled}
        className={classes}
        style={style as any}
        triggerAttributes={
          {
            ...attributes,
            'data-select-value': Array.isArray(selected)
              ? JSON.stringify(selected)
              : selected,
          } as unknown as JSX.HTMLAttributes<HTMLDivElement>
        }
        config={{
          nativeTabNavigation: true,
          multiSelect: !!multiple,
          topLayer: true,
          ariaLabel: attributes['aria-label'] as string | undefined,
          ariaLabelledBy:
            (attributes['aria-labelledby'] as string | undefined) ??
            (attributes['aria-label'] ? undefined : field.labelId),
          ariaDescribedBy:
            (attributes['aria-describedby'] as string | undefined) ??
            field.hintId,
        }}
        onChange={(next) => {
          const changed = multiple
            ? Array.isArray(next)
              ? next
              : [next]
            : String(Array.isArray(next) ? (next[0] ?? '') : next);
          if (value === undefined) setDraft(changed);
          if (multiple)
            (onValueChange as ((value: string[]) => void) | undefined)?.(
              changed as string[],
            );
          else
            (onValueChange as ((value: string) => void) | undefined)?.(
              changed as string,
            );
        }}
      />
      {name &&
        values.map((value) => (
          <input
            type="hidden"
            name={name}
            value={value}
            disabled={!!disabled}
          />
        ))}
    </>
  );
}
