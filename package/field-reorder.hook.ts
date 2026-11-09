import { useLayoutEffect, useRef, useState } from 'preact/hooks';
import {
  fieldDropIndex,
  fieldListDropIndex,
  reorderFields,
} from './field-reorder';

type FieldDropOptions = {
  enabled?: boolean;
  active?: boolean;
  canDrop?: (event: DragEvent) => boolean;
  onDragOver?: (event: DragEvent) => void;
  onDrop: (boundary: number, event: DragEvent) => void;
};

/** One owner for list/row hit testing, gap drops, insertion feedback and cleanup. */
export function useFieldDropTarget(count: number, options: FieldDropOptions) {
  const current = useRef({ count, ...options });
  current.current = { count, ...options };
  const source = useRef<number | null>(null);
  const boundaryRef = useRef<number | null>(null);
  const [boundary, setBoundary] = useState<number | null>(null);
  const clear = () => {
    source.current = null;
    boundaryRef.current = null;
    setBoundary(null);
  };
  useLayoutEffect(() => {
    if (options.enabled === false || options.active === false) clear();
  }, [options.enabled, options.active]);
  const accepts = (event: DragEvent) =>
    current.current.enabled !== false &&
    (current.current.canDrop?.(event) ?? true);
  const resolve = (event: DragEvent, index?: number) => {
    const element = event.currentTarget as HTMLElement;
    if (index !== undefined) {
      const rect = element.getBoundingClientRect();
      return fieldDropIndex(
        event.clientY,
        rect.top,
        rect.height,
        index,
        boundaryRef.current,
      );
    }
    const rows = Array.from(
      element.querySelectorAll(
        ':scope > .rv-configurator-field-row, :scope > .rv-configurator-field-list > .rv-configurator-field-row',
      ),
    );
    return fieldListDropIndex(
      event.clientY,
      rows.map((row) => row.getBoundingClientRect()),
      boundaryRef.current,
      current.current.count,
    );
  };
  const over = (
    event: DragEvent,
    index?: number,
    resolvedBoundary?: number,
  ) => {
    if (!accepts(event)) {
      boundaryRef.current = null;
      setBoundary(null);
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    boundaryRef.current = resolvedBoundary ?? resolve(event, index);
    setBoundary(boundaryRef.current);
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
    current.current.onDragOver?.(event);
  };
  const drop = (
    event: DragEvent,
    index?: number,
    resolvedBoundary?: number,
  ) => {
    if (!accepts(event)) {
      clear();
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
    const next = resolvedBoundary ?? resolve(event, index);
    // Clear feedback before committing, without losing the consumer's drag source.
    boundaryRef.current = null;
    setBoundary(null);
    current.current.onDrop(next, event);
    source.current = null;
  };
  const position = (index: number): 'before' | 'after' | undefined => {
    if (
      boundary === null ||
      (source.current !== null &&
        (boundary === source.current || boundary === source.current + 1))
    )
      return;
    if (boundary === index) return 'before';
    if (boundary === count && index === count - 1) return 'after';
  };
  return {
    clear,
    start(index: number) {
      source.current = index;
    },
    boundary,
    overBoundary: (event: DragEvent, boundary: number) =>
      over(event, undefined, boundary),
    dropBoundary: (event: DragEvent, boundary: number) =>
      drop(event, undefined, boundary),
    position,
    isOver: boundary !== null,
    list: {
      onDragOver: (event: DragEvent) => over(event),
      onDrop: (event: DragEvent) => drop(event),
      onDragLeave(event: DragEvent) {
        const next = event.relatedTarget;
        if (
          !(next instanceof Node) ||
          !(event.currentTarget as HTMLElement).contains(next)
        ) {
          boundaryRef.current = null;
          setBoundary(null);
        }
      },
    },
    row(index: number) {
      return {
        dropPosition: position(index),
        onDragOver: (event: DragEvent) => over(event, index),
        onDrop: (event: DragEvent) => drop(event, index),
      };
    },
  };
}

/** Same-section adapter; consumers own ordered values, policy and the commit. */
export function useFieldReorder<T>(
  items: readonly T[],
  onChange: (next: T[]) => void,
  enabled = true,
  options: { onMove?: (item: T) => void; dragPreview?: 'row' } = {},
) {
  const current = useRef({ items, onChange, enabled, ...options });
  current.current = { items, onChange, enabled, ...options };
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const drag = useRef<{ items: readonly T[]; from: number } | null>(null);
  const valid = () => {
    const state = drag.current,
      now = current.current;
    if (
      !state ||
      !now.enabled ||
      state.items.length !== now.items.length ||
      state.items.some((item, index) => item !== now.items[index])
    ) {
      drag.current = null;
      return null;
    }
    return state;
  };
  const target = useFieldDropTarget(items.length, {
    enabled,
    canDrop: () => !!valid(),
    onDrop(boundary) {
      const state = valid();
      if (!state) return;
      drag.current = null;
      setDraggedIndex(null);
      const next = reorderFields(current.current.items, state.from, boundary);
      if (next !== current.current.items) {
        current.current.onChange(next);
        current.current.onMove?.(state.items[state.from]);
      }
    },
  });
  useLayoutEffect(() => {
    if (!valid()) {
      target.clear();
      setDraggedIndex(null);
    }
  }, [items, enabled]);
  const move = (from: number, boundary: number) => {
    const now = current.current;
    if (!now.enabled) return;
    const next = reorderFields(now.items, from, boundary);
    if (next !== now.items) {
      now.onChange(next);
      now.onMove?.(now.items[from]);
    }
  };
  const dropIndex =
    target.boundary !== null &&
    draggedIndex !== null &&
    target.boundary !== draggedIndex &&
    target.boundary !== draggedIndex + 1
      ? target.boundary
      : undefined;
  return {
    move,
    draggedIndex,
    dropIndex,
    overBoundary: target.overBoundary,
    dropBoundary: target.dropBoundary,
    list: target.list,
    row(index: number) {
      return {
        ...target.row(index),
        draggable: enabled,
        onDragStart(event: DragEvent) {
          if (!current.current.enabled) {
            event.preventDefault();
            return;
          }
          drag.current = { items: current.current.items, from: index };
          setDraggedIndex(index);
          target.start(index);
          event.dataTransfer?.setData('text/plain', String(index));
          if (event.dataTransfer) {
            event.dataTransfer.effectAllowed = 'move';
            if (current.current.dragPreview === 'row') {
              const row = (
                event.currentTarget as HTMLElement
              ).closest?.<HTMLElement>(
                '.rv-reorder-row, .rv-configurator-field-row',
              );
              if (row) {
                const bounds = row.getBoundingClientRect();
                event.dataTransfer.setDragImage(
                  row,
                  Math.min(
                    bounds.width,
                    Math.max(0, event.clientX - bounds.left),
                  ),
                  Math.min(
                    bounds.height,
                    Math.max(0, event.clientY - bounds.top),
                  ),
                );
              }
            }
          }
        },
        onDragEnd() {
          drag.current = null;
          setDraggedIndex(null);
          target.clear();
        },
        onKeyDown(event: KeyboardEvent) {
          if (
            !current.current.enabled ||
            !event.altKey ||
            !['ArrowUp', 'ArrowDown'].includes(event.key)
          )
            return;
          event.preventDefault();
          const trigger = event.currentTarget as HTMLElement;
          move(index, event.key === 'ArrowUp' ? index - 1 : index + 2);
          queueMicrotask(() => {
            if (trigger.isConnected) trigger.focus();
          });
        },
      };
    },
  };
}
