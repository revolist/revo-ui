import { FormFieldContext } from './field-context';
import { nativeControlTag } from '../control-presentation';
import {
  cloneElement,
  Fragment,
  h,
  isValidElement,
  type ComponentChildren,
  type JSX,
  type VNode,
} from 'preact';
import { useContext, useState } from 'preact/hooks';
import { createControlId } from '../core/control-id';

export type FilterChipProps = {
  readonly children: ComponentChildren;
  readonly removeLabel?: string;
  readonly onRemove?: () => void;
  readonly className?: string;
  readonly removeClassName?: string;
  readonly role?: 'listitem';
};

/** Removable chip shell; consumers retain filter policy and label/detail slots. */
export function FilterChip({
  children,
  removeLabel,
  onRemove,
  className = '',
  removeClassName = '',
  role,
}: FilterChipProps) {
  return (
    <span class={`rv-btn-pill ${className}`.trim()} role={role}>
      {children}
      {onRemove && (
        <button
          type="button"
          class={`rv-chip-remove ${removeClassName}`.trim()}
          aria-label={removeLabel}
          onClick={onRemove}
        >
          ×
        </button>
      )}
    </span>
  );
}

export interface FormFieldContentOptions {
  readonly label: ComponentChildren;
  readonly children: ComponentChildren;
  readonly hint?: ComponentChildren;
  /** Supply an instance-unique ID when rendering a hint through the native helper. */
  readonly hintId?: string;
  readonly labelId?: string;
}

/** Native VNodes keep controls visible to consumer-owned policy/render adapters. */
export function renderFormFieldContent({
  label,
  children,
  hint,
  hintId,
  labelId = hintId ? `${hintId}-label` : undefined,
}: FormFieldContentOptions): ComponentChildren {
  const hasHint = hint !== undefined && hint !== null && hint !== false;
  return [
    <span class="rv-field__label" id={labelId}>
      {label}
    </span>,
    hasHint && hintId
      ? describeNativeControls(children, hintId, labelId)
      : children,
    hasHint ? (
      <span class="rv-field__hint" id={hintId}>
        {hint}
      </span>
    ) : null,
  ];
}

export type FormFieldProps = FormFieldContentOptions &
  Omit<JSX.IntrinsicElements['label'], 'children' | 'className'> & {
    readonly className?: string;
    /** Associates a separately identified control; implicit labels need no ID. */
    readonly controlId?: string;
  };

/** Preact adapter over the existing framework-neutral form presentation. */
export function FormField({
  label,
  children,
  hint,
  hintId,
  labelId,
  controlId,
  className = '',
  class: nativeClass,
  ...attributes
}: FormFieldProps) {
  const [instanceId] = useState(() => createControlId('rv-field'));
  const inherited = useContext(FormFieldContext);
  const resolvedHintId = hintId ?? `rv-field-hint-${instanceId}`;
  const resolvedLabelId = labelId ?? `${resolvedHintId}-label`;
  return (
    <FormFieldContext.Provider
      value={{
        disabled: inherited.disabled,
        labelId: resolvedLabelId,
        hintId: hint == null || hint === false ? undefined : resolvedHintId,
      }}
    >
      <label
        {...attributes}
        htmlFor={controlId ?? attributes.htmlFor}
        class={['rv-field', className, nativeClass].filter(Boolean).join(' ')}
      >
        {renderFormFieldContent({
          label,
          children,
          hint,
          labelId: resolvedLabelId,
          hintId: resolvedHintId,
        })}
      </label>
    </FormFieldContext.Provider>
  );
}

function describeNativeControls(
  children: ComponentChildren,
  hintId: string,
  labelId?: string,
): ComponentChildren {
  if (Array.isArray(children))
    return children.map((child) =>
      describeNativeControls(child, hintId, labelId),
    );
  if (!isValidElement(children)) return children;
  if (children.type === Fragment) {
    return cloneElement(children, {
      children: describeNativeControls(
        children.props.children,
        hintId,
        labelId,
      ),
    });
  }
  const tag = nativeControlTag(children.type);
  if (!tag) return children;
  const node = children as VNode<JSX.HTMLAttributes<HTMLElement>>;
  if (['input', 'select', 'textarea'].includes(tag)) {
    const ids = new Set(
      `${node.props['aria-describedby'] ?? ''} ${hintId}`.trim().split(/\s+/),
    );
    return cloneElement(node, {
      'aria-describedby': [...ids].join(' '),
      'aria-labelledby':
        node.props['aria-labelledby'] ??
        (node.props['aria-label'] ? undefined : labelId),
    });
  }
  return cloneElement(node, {
    children: describeNativeControls(node.props.children, hintId, labelId),
  });
}

export type DisclosureSummaryProps = Omit<
  JSX.IntrinsicElements['summary'],
  'children' | 'className'
> & {
  readonly children: ComponentChildren;
  readonly className?: string;
  readonly icon?: ComponentChildren;
  readonly iconClassName?: string;
  readonly iconPosition?: 'before' | 'after';
};

/** Presentation only: native details remains the open-state and keyboard owner. */
export function DisclosureSummary({
  children,
  icon,
  iconClassName = '',
  iconPosition = 'before',
  className = '',
  class: nativeClass,
  ...attributes
}: DisclosureSummaryProps) {
  const decoration =
    icon == null ? null : (
      <span
        class={['rv-disclosure-summary__icon', iconClassName]
          .filter(Boolean)
          .join(' ')}
        aria-hidden="true"
      >
        {icon}
      </span>
    );
  return (
    <summary
      {...attributes}
      class={['rv-disclosure-summary', className, nativeClass]
        .filter(Boolean)
        .join(' ')}
    >
      {iconPosition === 'before' && decoration}
      <span class="rv-disclosure-summary__label">{children}</span>
      {iconPosition === 'after' && decoration}
    </summary>
  );
}
