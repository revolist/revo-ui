import { h, type ComponentChildren, type JSX } from 'preact';
import { useRef } from 'preact/hooks';
import { ButtonControl, TextArea } from './native-control';

/** A selected action with a trailing, caller-formatted summary. */
export function OptionButton({
  label,
  detail,
  selected,
  className = '',
  detailClassName = '',
  ...props
}: Omit<JSX.IntrinsicElements['button'], 'className' | 'children'> & {
  label: ComponentChildren;
  detail?: ComponentChildren;
  selected?: boolean;
  className?: string;
  detailClassName?: string;
}) {
  return (
    <ButtonControl
      {...props}
      class={`rv-option-button ${className}`}
      aria-pressed={selected}
    >
      <strong>{label}</strong>
      <span class={`rv-option-button__detail ${detailClassName}`}>
        {detail}
      </span>
    </ButtonControl>
  );
}

/** Caller supplies highlighting; UI owns overlay geometry and scroll synchronization. */
export function HighlightedTextInput({
  highlight,
  className = '',
  inputClassName = '',
  highlightClassName = '',
  ...props
}: Omit<JSX.IntrinsicElements['textarea'], 'className'> & {
  highlight: ComponentChildren;
  className?: string;
  inputClassName?: string;
  highlightClassName?: string;
}) {
  const highlightRef = useRef<HTMLPreElement>(null);
  return (
    <div
      class={`rv-highlighted-input ${className}`}
      data-invalid={props['aria-invalid'] || undefined}
    >
      <pre
        class={`rv-highlighted-input__highlight ${highlightClassName}`}
        aria-hidden="true"
        ref={highlightRef}
      >
        {highlight}
      </pre>
      <TextArea
        {...props}
        class={`rv-highlighted-input__input ${inputClassName}`}
        spellcheck={props.spellcheck ?? false}
        onScroll={(event) => {
          if (highlightRef.current) {
            highlightRef.current.scrollTop = event.currentTarget.scrollTop;
            highlightRef.current.scrollLeft = event.currentTarget.scrollLeft;
          }
          props.onScroll?.(event);
        }}
      />
    </div>
  );
}

export function InlineFieldGroup({
  children,
  className = '',
  label,
}: {
  children: ComponentChildren;
  className?: string;
  label?: string;
}) {
  return (
    <div
      role="group"
      aria-label={label}
      class={`rv-inline-field-group ${className}`}
    >
      {children}
    </div>
  );
}
