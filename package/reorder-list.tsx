/** @jsxImportSource preact */
import { h, type ComponentChildren, type JSX } from 'preact';
import { fieldDropIndex, fieldListDropIndex } from './field-reorder';
import { ButtonControl } from './native-control';
import gripIcon from '@fortawesome/fontawesome-free/svgs/solid/grip-vertical.svg?raw';
import './reorder-list.scss';

export interface ReorderListProps<T> {
  items: readonly T[];
  itemKey(item: T): string | number;
  renderItem(item: T, index: number): ComponentChildren;
  renderHandle?(item: T, index: number): ComponentChildren;
  itemAttributes?(
    item: T,
    index: number,
  ): JSX.HTMLAttributes<HTMLDivElement> & Record<string, unknown>;
  className?: string;
  rowClassName?: string | ((item: T, index: number) => string);
  endClassName?: string;
  draggedKey?: string | number;
  dropIndex?: number;
  empty?: ComponentChildren;
  onDragOver(event: DragEvent, boundary: number): void;
  onDrop(event: DragEvent, boundary: number): void;
}

/** Shared list geometry, event routing and insertion markers. Consumers own move policy and data. */
export function ReorderList<T>({
  items,
  itemKey,
  renderItem,
  renderHandle,
  itemAttributes,
  className = '',
  rowClassName = '',
  endClassName = '',
  draggedKey,
  dropIndex,
  empty,
  onDragOver,
  onDrop,
}: ReorderListProps<T>) {
  const boundary = (event: DragEvent, index: number) => {
    const bounds = (event.currentTarget as HTMLElement).getBoundingClientRect();
    return fieldDropIndex(
      event.clientY,
      bounds.top,
      bounds.height,
      index,
      dropIndex ?? null,
    );
  };
  const listBoundary = (event: DragEvent) => {
    const list = event.currentTarget as HTMLElement;
    const end = (event.target as Element).closest('.rv-reorder-drop-end');
    if (end?.parentElement === list) return items.length;
    const rows = Array.from(
      list.querySelectorAll<HTMLElement>(':scope > .rv-reorder-row'),
    );
    return fieldListDropIndex(
      event.clientY,
      rows.map((row) => row.getBoundingClientRect()),
      dropIndex ?? null,
      items.length,
    );
  };
  return (
    <div
      class={`rv-reorder-list ${className}${dropIndex === items.length ? ' drop-at-end' : ''}`}
      onDragOver={(event) => {
        const row = (event.target as Element).closest('.rv-reorder-row');
        if (row?.parentElement === event.currentTarget) return;
        event.stopPropagation();
        onDragOver(event, listBoundary(event));
      }}
      onDrop={(event) => {
        const row = (event.target as Element).closest('.rv-reorder-row');
        if (row?.parentElement === event.currentTarget) return;
        event.stopPropagation();
        onDrop(event, listBoundary(event));
      }}
    >
      {!items.length && empty}
      {items.map((item, index) => (
        <div
          {...itemAttributes?.(item, index)}
          key={itemKey(item)}
          class={`rv-reorder-row ${typeof rowClassName === 'function' ? rowClassName(item, index) : rowClassName}${draggedKey === itemKey(item) ? ' dragging' : ''}${dropIndex === index ? ' drop-before' : ''}`}
          onDragOver={(event) => {
            event.stopPropagation();
            onDragOver(event, boundary(event, index));
          }}
          onDrop={(event) => {
            event.stopPropagation();
            onDrop(event, boundary(event, index));
          }}
        >
          {renderHandle?.(item, index)}
          {renderItem(item, index)}
        </div>
      ))}
      <div class={`rv-reorder-drop-end ${endClassName}`} aria-hidden="true" />
    </div>
  );
}

/** Native drag source; product adapters supply stable IDs, announcements and keyboard move policy. */
export function ReorderHandle({
  className = '',
  children,
  ...props
}: JSX.IntrinsicElements['button']) {
  return (
    <ButtonControl
      type="button"
      {...props}
      class={`rv-btn-ghost rv-reorder-handle ${className}`}
    >
      <span aria-hidden="true" dangerouslySetInnerHTML={{ __html: gripIcon }} />
      {children}
    </ButtonControl>
  );
}
