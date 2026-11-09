import { renderControl } from '../control-presentation';
import { h } from 'preact';

import './checkbox.scss';

export const SHARED_CHECKBOX_CLASS = 'rv-checkbox';

export type SharedCheckboxAttributes = Record<string, unknown> & {
  class?: string;
  className?: string;
};

type PreactH = typeof import('preact').h;
type PreactVNode = import('preact').VNode;
type CheckboxRenderer = (nodeName: any, attributes: any) => unknown;

export type CheckboxProps = Omit<SharedCheckboxAttributes, 'onChange'> & {
  checked?: boolean;
  indeterminate?: boolean;
  label?: any;
  description?: any;
  ariaLabel?: string;
  controlClassName?: string;
  inputRef?: (input: HTMLInputElement | null) => void;
  onChange?: (
    checked: boolean,
    event: Event & { currentTarget: HTMLInputElement },
  ) => void;
};

/**
 * Render the shared native checkbox while keeping the caller's renderer and
 * event semantics. This works with both RevoGrid/Stencil templates and Preact.
 */
export function renderCheckbox(
  h: PreactH,
  attributes?: SharedCheckboxAttributes,
): PreactVNode;
export function renderCheckbox<T>(
  h: (nodeName: any, attributes: any) => T,
  attributes?: SharedCheckboxAttributes,
): T;
export function renderCheckbox(
  h: CheckboxRenderer,
  attributes: SharedCheckboxAttributes = {},
): unknown {
  const {
    class: className,
    className: alternateClassName,
    ...inputAttributes
  } = attributes;
  const classes = [SHARED_CHECKBOX_CLASS, className, alternateClassName]
    .filter(Boolean)
    .join(' ');

  return renderControl(h, 'input', {
    ...inputAttributes,
    class: classes,
    type: 'checkbox',
  });
}

/**
 * Preact adapter for the shared checkbox presentation. The native input stays
 * the interaction owner; the adapter only normalizes indeterminate state and
 * optional label/description composition.
 */
export function Checkbox({
  checked,
  indeterminate = false,
  label,
  description,
  ariaLabel,
  controlClassName = '',
  inputRef,
  onChange,
  ...attributes
}: CheckboxProps): any {
  const input = renderCheckbox(h, {
    ...attributes,
    checked,
    'aria-label': ariaLabel,
    'aria-checked': indeterminate ? 'mixed' : !!checked,
    ref: (element: HTMLInputElement | null) => {
      if (element) element.indeterminate = indeterminate;
      inputRef?.(element);
    },
    onChange: (event: Event & { currentTarget: HTMLInputElement }) => {
      onChange?.(event.currentTarget.checked, event);
    },
  });

  if (label === undefined && description === undefined) return input;
  return h(
    'label',
    { class: `rv-checkbox-control ${controlClassName}`.trim() },
    [
      input,
      h('span', { class: 'rv-checkbox-control__copy' }, [
        label !== undefined
          ? h('span', { class: 'rv-checkbox-control__label' }, label)
          : null,
        description !== undefined
          ? h(
              'span',
              { class: 'rv-checkbox-control__description' },
              description,
            )
          : null,
      ]),
    ],
  );
}
