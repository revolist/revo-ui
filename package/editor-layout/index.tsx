/** @jsxImportSource preact */
import type { ClassPreset } from '../presets/types';
import { h, type ComponentChildren, type JSX, type Ref } from 'preact';
import './style.scss';
import { useSelectionListTooltips } from '../core/selection-list-tooltips';
import { useCallback } from 'preact/hooks';

type ShellProps = {
  readonly children: ComponentChildren;
  readonly className?: string;
  readonly preset?: ClassPreset;
};
/** Shared editor geometry. Consumers supply column widths and feature policy. */
export function EditorSplitLayout({
  children,
  className = '',
  preset,
}: ShellProps) {
  return (
    <div
      class={`rv-editor-split ${preset?.className ?? ''} ${className}`}
      data-part="root"
    >
      {children}
    </div>
  );
}
export function EditorPane({
  children,
  preset,
  className = '',
  scrollable = false,
}: ShellProps & { readonly scrollable?: boolean }) {
  return (
    <section
      class={`rv-editor-pane${scrollable ? ' rv-editor-pane--scrollable' : ''} ${preset?.className ?? ''} ${className}`}
      data-part="root"
    >
      {children}
    </section>
  );
}
export interface EditorListProps extends ShellProps {
  readonly label: string;
  readonly onSelect: (value: string) => void;
  readonly listRef?: Ref<HTMLDivElement>;
  /** Omit the inner frame when the list sits inside an editor pane. */
  readonly variant?: 'default' | 'plain';
  /** Additional room around icon/description rows. */
  readonly spacing?: 'default' | 'comfortable';
}
/** Single-selection listbox with one keyboard/focus owner across editors. */
export function EditorList({
  children,
  preset,
  className = '',
  label,
  onSelect,
  listRef,
  variant = 'default',
  spacing = 'default',
}: EditorListProps) {
  const tooltipRef = useSelectionListTooltips();
  const ref = useCallback(
    (element: HTMLDivElement | null) => {
      tooltipRef(element);
      if (typeof listRef === 'function') listRef(element);
      else if (listRef) listRef.current = element;
    },
    [tooltipRef, listRef],
  );
  return (
    <div
      ref={ref}
      class={`rv-editor-list${variant === 'plain' ? ' rv-editor-list--plain' : ''}${spacing === 'comfortable' ? ' rv-editor-list--comfortable' : ''} ${preset?.className ?? ''} ${className}`}
      data-part="root"
      role="listbox"
      aria-label={label}
      onKeyDown={(event) => {
        if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key))
          return;
        const items = Array.from(
          event.currentTarget.querySelectorAll<HTMLButtonElement>(
            '[data-editor-value]:not(:disabled)',
          ),
        );
        if (!items.length) return;
        const current = Math.max(
          0,
          items.indexOf(event.target as HTMLButtonElement),
        );
        const index =
          event.key === 'Home'
            ? 0
            : event.key === 'End'
              ? items.length - 1
              : (current +
                  (event.key === 'ArrowDown' ? 1 : -1) +
                  items.length) %
                items.length;
        event.preventDefault();
        items[index].focus();
        onSelect(items[index].dataset.editorValue!);
      }}
    >
      {children}
    </div>
  );
}
export type EditorListItemProps = Omit<
  JSX.IntrinsicElements['button'],
  'value' | 'className'
> & {
  readonly preset?: ClassPreset;
  readonly value: string;
  readonly selected: boolean;
  readonly className?: string;
  readonly icon?: ComponentChildren;
  readonly label?: ComponentChildren;
  readonly description?: ComponentChildren;
  readonly contentClassNames?: EditorListItemContentProps['classNames'];
};
export function EditorListItem({
  preset,
  value,
  selected,
  icon,
  label,
  description,
  contentClassNames,
  children,
  className = '',
  ...props
}: EditorListItemProps) {
  return (
    <button
      {...props}
      type="button"
      role="option"
      data-editor-value={value}
      aria-selected={selected}
      tabIndex={props.tabIndex ?? (selected ? 0 : -1)}
      class={`rv-editor-list__item${selected ? ' rv-editor-list__item--selected' : ''} ${preset?.className ?? ''} ${className}`}
      data-part="root"
      data-state={selected ? 'selected' : 'unselected'}
    >
      {label !== undefined ? (
        <EditorListItemContent
          inheritPresetScope
          icon={icon}
          label={label}
          description={description}
          classNames={contentClassNames}
        />
      ) : (
        children
      )}
    </button>
  );
}

export interface EditorListItemContentProps {
  /** Internal composition hook for EditorListItem. */
  readonly inheritPresetScope?: boolean;
  readonly preset?: ClassPreset;
  readonly className?: string;
  readonly icon?: ComponentChildren;
  readonly label: ComponentChildren;
  readonly description?: ComponentChildren;
  readonly classNames?: {
    readonly icon?: string;
    readonly copy?: string;
    readonly label?: string;
    readonly description?: string;
  };
}
/** Reusable row presentation; the enclosing list item owns selection and focus. */
export function EditorListItemContent({
  inheritPresetScope,
  preset,
  className = '',
  icon,
  label,
  description,
  classNames = {},
}: EditorListItemContentProps) {
  return (
    <span
      class={`rv-editor-list__content${icon ? '' : ' rv-editor-list__content--text'} ${preset?.className ?? ''} ${className}`}
      data-part="root"
      data-preset-scope={inheritPresetScope ? 'inherit' : undefined}
    >
      {icon && (
        <span
          class={`rv-editor-list__icon ${classNames.icon ?? ''}`}
          aria-hidden="true"
          data-part="icon"
        >
          {icon}
        </span>
      )}
      <span
        class={`rv-editor-list__copy ${classNames.copy ?? ''}`}
        data-part="copy"
      >
        <span
          class={`rv-editor-list__label ${classNames.label ?? ''}`}
          data-part="label"
        >
          {label}
        </span>
        {description !== undefined && (
          <span
            class={`rv-editor-list__description ${classNames.description ?? ''}`}
            data-part="description"
          >
            {description}
          </span>
        )}
      </span>
    </span>
  );
}
export function EditorListGroup({
  preset,
  label,
  children,
  className = '',
  labelClassName = '',
}: ShellProps & { readonly label: string; readonly labelClassName?: string }) {
  return (
    <div
      class={`rv-editor-list__group ${preset?.className ?? ''} ${className}`}
      data-part="root"
      role="group"
      aria-label={label}
    >
      <div
        class={`rv-editor-list__group-label ${labelClassName}`}
        data-part="label"
      >
        {label}
      </div>
      {children}
    </div>
  );
}
